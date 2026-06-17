// services/transaction-service/src/services/transaction.service.js

const prisma      = require('@moneyswift/database');
const { calculateFee, generateRef } = require('@moneyswift/utils');
const EventBus    = require('@moneyswift/events');
const AppError    = require('@moneyswift/errors/AppError');
const MtnMomoClient    = require('../integrations/mtn-momo.client');
const OrangeMoneyClient = require('../integrations/orange-money.client');

class TransactionService {

  // ── DÉPÔT : Opérateur mobile → Wallet MoneySwift ──────────
  async deposit({ userId, provider, providerPhone, amount, pin }) {
    const wallet = await this.getUserPrimaryWallet(userId);
    const fee    = calculateFee(amount, 'DEPOSIT');
    const ref    = generateRef('DEP');

    // 1. Créer la transaction en PENDING (avec idempotency key)
    const txn = await prisma.transaction.create({
      data: {
        reference:        ref,
        type:             'DEPOSIT',
        status:           'PENDING',
        amount,
        fee,
        receiverWalletId: wallet.id,
        provider:         provider === 'MTN' ? 'MTN_MOMO' : 'ORANGE_MONEY',
        idempotencyKey:   `${userId}-${ref}`,
        receiverBalanceBefore: wallet.balance,
      },
    });

    // 2. Déclencher le paiement chez l'opérateur (asynchrone)
    this.processDepositAsync(txn, provider, providerPhone, amount, wallet);

    return { reference: ref, status: 'PENDING', message: 'Confirmez sur votre téléphone' };
  }

  async processDepositAsync(txn, provider, providerPhone, amount, wallet) {
    try {
      // Appel MTN MoMo ou Orange Money
      const client   = provider === 'MTN' ? MtnMomoClient : OrangeMoneyClient;
      const response = await client.requestToPay({
        amount,
        phone:      providerPhone,
        externalId: txn.reference,
        note:       `Dépôt MoneySwift - ${txn.reference}`,
      });

      // Polling du statut (max 3 tentatives × 10s)
      const finalStatus = await this.pollProviderStatus(client, txn.reference, 3, 10_000);

      if (finalStatus === 'SUCCESSFUL') {
        await prisma.$transaction(async (tx) => {
          // Créditer le wallet
          await tx.wallet.update({
            where: { id: wallet.id },
            data:  { balance: { increment: amount } },
          });

          await tx.transaction.update({
            where: { id: txn.id },
            data: {
              status:             'SUCCESS',
              providerRef:        response.externalId,
              completedAt:        new Date(),
              receiverBalanceAfter: wallet.balance.toNumber() + amount,
            },
          });
        });

        // Notifier l'utilisateur
        await EventBus.publish('transaction.success', {
          userId: wallet.account?.userId,
          txnId:  txn.id,
          type:   'DEPOSIT',
          amount,
        });

      } else {
        await prisma.transaction.update({
          where: { id: txn.id },
          data:  { status: 'FAILED' },
        });

        await EventBus.publish('transaction.failed', { txnId: txn.id });
      }

    } catch (error) {
      await prisma.transaction.update({
        where: { id: txn.id },
        data:  { status: 'FAILED', metadata: { error: error.message } },
      });
    }
  }

  // ── TRANSFERT : User → User (interne MoneySwift) ───────────
  async transfer({ senderId, toPhone, amount, pin, description }) {
    // Validation du PIN avant toute opération financière
    await this.verifyUserPin(senderId, pin);

    const senderWallet   = await this.getUserPrimaryWallet(senderId);
    const receiverWallet = await this.getWalletByPhone(toPhone);
    const fee            = calculateFee(amount, 'TRANSFER');

    if (senderWallet.balance.toNumber() < amount + fee) {
      throw new AppError('Solde insuffisant', 400);
    }
    if (senderWallet.id === receiverWallet.id) {
      throw new AppError('Vous ne pouvez pas vous envoyer de l\'argent', 400);
    }

    const ref = generateRef('TRF');

    // Transaction DB atomique (ACID garanti par PostgreSQL)
    const txn = await prisma.$transaction(async (tx) => {
      const sBalBefore = senderWallet.balance.toNumber();
      const rBalBefore = receiverWallet.balance.toNumber();

      // Débit expéditeur
      await tx.wallet.update({
        where: { id: senderWallet.id },
        data:  { balance: { decrement: amount + fee } },
      });

      // Crédit destinataire
      await tx.wallet.update({
        where: { id: receiverWallet.id },
        data:  { balance: { increment: amount } },
      });

      // Enregistrement de la transaction
      return tx.transaction.create({
        data: {
          reference:            ref,
          type:                 'TRANSFER',
          status:               'SUCCESS',
          amount,
          fee,
          description,
          senderWalletId:       senderWallet.id,
          receiverWalletId:     receiverWallet.id,
          completedAt:          new Date(),
          senderBalanceBefore:  sBalBefore,
          senderBalanceAfter:   sBalBefore - amount - fee,
          receiverBalanceBefore: rBalBefore,
          receiverBalanceAfter: rBalBefore + amount,
        },
      });
    });

    // Événements post-transaction (notifications, analytics)
    await EventBus.publish('transaction.success', {
      senderId,
      receiverId: receiverWallet.accountId,
      txnId:      txn.id,
      type:       'TRANSFER',
      amount,
    });

    return { reference: ref, status: 'SUCCESS' };
  }

  // ── HISTORIQUE paginé ──────────────────────────────────────
  async getHistory({ userId, page = 1, limit = 20, type, startDate, endDate }) {
    const wallet = await this.getUserPrimaryWallet(userId);
    const skip   = (page - 1) * limit;

    const where = {
      OR: [
        { senderWalletId: wallet.id },
        { receiverWalletId: wallet.id },
      ],
      ...(type && { type }),
      ...(startDate && endDate && {
        initiatedAt: { gte: new Date(startDate), lte: new Date(endDate) },
      }),
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take:    limit,
        orderBy: { initiatedAt: 'desc' },
        select: {
          id: true, reference: true, type: true, status: true,
          amount: true, fee: true, description: true,
          initiatedAt: true, completedAt: true,
          senderWallet:   { select: { providerPhone: true, provider: true } },
          receiverWallet: { select: { providerPhone: true, provider: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async pollProviderStatus(client, ref, maxRetries, delay) {
    for (let i = 0; i < maxRetries; i++) {
      await new Promise(r => setTimeout(r, delay));
      const result = await client.checkStatus(ref);
      if (result.status !== 'PENDING') return result.status;
    }
    return 'PENDING';
  }

  async getUserPrimaryWallet(userId) {
    const wallet = await prisma.wallet.findFirst({
      where:   { account: { userId }, isPrimary: true },
      include: { account: true },
    });
    if (!wallet) throw new AppError('Wallet introuvable', 404);
    return wallet;
  }

  async getWalletByPhone(phone) {
    const wallet = await prisma.wallet.findFirst({
      where: { account: { user: { phoneNumber: phone } }, isPrimary: true },
    });
    if (!wallet) throw new AppError(`Aucun compte associé au numéro ${phone}`, 404);
    return wallet;
  }
}

module.exports = new TransactionService();