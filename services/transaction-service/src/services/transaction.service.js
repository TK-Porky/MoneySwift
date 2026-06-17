// services/transaction-service/src/services/transaction.service.js

const prisma      = require('@moneyswift/database');
const { calculateFee, generateRef } = require('@moneyswift/utils');
const { MtnMomoClient, OrangeMoneyClient } = require('@moneyswift/integrations');
const EventBus    = require('@moneyswift/events');
const AppError    = require('@moneyswift/errors/AppError');

class TransactionService {

  // ── DÉPÔT : Opérateur mobile → Wallet MoneySwift ──────────
  async deposit({ userId, provider, providerPhone, amount, idempotencyKey }) {
    const wallet = await this.getUserPrimaryWallet(userId);
    const fee    = calculateFee(amount, 'DEPOSIT');
    const ref    = generateRef('DEP');

    // Idempotence
    if (idempotencyKey) {
      const existing = await prisma.transaction.findUnique({ where: { idempotencyKey } });
      if (existing) return existing;
    }

    const txn = await prisma.transaction.create({
      data: {
        reference:        ref,
        type:             'DEPOSIT',
        status:           'PENDING',
        amount,
        fee,
        receiverWalletId: wallet.id,
        provider:         provider === 'MTN' ? 'MTN_MOMO' : 'ORANGE_MONEY',
        idempotencyKey:   idempotencyKey || `${userId}-${ref}`,
        receiverBalanceBefore: wallet.balance,
      },
    });

    this.processDepositAsync(txn, provider, providerPhone, amount, wallet);

    return { reference: ref, status: 'PENDING', message: 'Confirmez sur votre téléphone' };
  }

  // ── RETRAIT : Wallet MoneySwift → Opérateur mobile ─────────
  async withdraw({ userId, provider, providerPhone, amount }) {
    const wallet = await this.getUserPrimaryWallet(userId);
    const fee    = calculateFee(amount, 'WITHDRAWAL');
    const ref    = generateRef('WTH');

    if (wallet.balance.toNumber() < amount + fee) {
      throw new AppError('Solde insuffisant', 400);
    }

    const txn = await prisma.$transaction(async (tx) => {
      // Débit immédiat (provisioning)
      await tx.wallet.update({
        where: { id: wallet.id },
        data:  { balance: { decrement: amount + fee } },
      });

      return tx.transaction.create({
        data: {
          reference:        ref,
          type:             'WITHDRAWAL',
          status:           'PROCESSING',
          amount,
          fee,
          senderWalletId:   wallet.id,
          provider:         provider === 'MTN' ? 'MTN_MOMO' : 'ORANGE_MONEY',
          senderBalanceBefore: wallet.balance,
          senderBalanceAfter:  wallet.balance.toNumber() - amount - fee,
        },
      });
    });

    this.processWithdrawAsync(txn, provider, providerPhone, amount, wallet);

    return { reference: ref, status: 'PROCESSING', message: 'Retrait en cours de traitement' };
  }

  // ── TRANSFERT : User → User (interne MoneySwift) ───────────
  async transfer({ senderId, toPhone, amount, description }) {
    const senderWallet   = await this.getUserPrimaryWallet(senderId);
    const receiverWallet = await this.getWalletByPhone(toPhone);
    const fee            = calculateFee(amount, 'TRANSFER');

    if (senderWallet.balance.toNumber() < amount + fee) {
      throw new AppError('Solde insuffisant', 400);
    }
    if (senderWallet.id === receiverWallet.id) {
      throw new AppError('Impossible d\'envoyer à soi-même', 400);
    }

    const ref = generateRef('TRF');

    const txn = await prisma.$transaction(async (tx) => {
      const sBalBefore = senderWallet.balance.toNumber();
      const rBalBefore = receiverWallet.balance.toNumber();

      await tx.wallet.update({
        where: { id: senderWallet.id },
        data:  { balance: { decrement: amount + fee } },
      });

      await tx.wallet.update({
        where: { id: receiverWallet.id },
        data:  { balance: { increment: amount } },
      });

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

    await EventBus.publish('transaction.success', {
      senderId,
      receiverId: receiverWallet.accountId,
      txnId:      txn.id,
      type:       'TRANSFER',
      amount,
    });

    return { reference: ref, status: 'SUCCESS' };
  }

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
        where, skip, take: limit,
        orderBy: { initiatedAt: 'desc' },
        include: {
          senderWallet: { include: { account: { include: { user: true } } } },
          receiverWallet: { include: { account: { include: { user: true } } } },
        }
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getStats(userId) {
    const wallet = await this.getUserPrimaryWallet(userId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        OR: [{ senderWalletId: wallet.id }, { receiverWalletId: wallet.id }],
        status: 'SUCCESS',
        initiatedAt: { gte: startOfMonth }
      },
      _sum: { amount: true }
    });

    return stats;
  }

  async getOne(userId, reference) {
    const wallet = await this.getUserPrimaryWallet(userId);
    const txn = await prisma.transaction.findFirst({
      where: {
        reference,
        OR: [{ senderWalletId: wallet.id }, { receiverWalletId: wallet.id }]
      }
    });
    if (!txn) throw new AppError('Transaction non trouvée', 404);
    return txn;
  }

  // Helpers asynchrones
  async processDepositAsync(txn, provider, providerPhone, amount, wallet) {
    try {
      const client = provider === 'MTN' ? MtnMomoClient : OrangeMoneyClient;
      await client.requestToPay({ amount, phone: providerPhone, externalId: txn.reference });
      
      const finalStatus = await this.pollProviderStatus(client, txn.reference, 5, 10000);

      if (finalStatus === 'SUCCESSFUL') {
        await prisma.$transaction(async (tx) => {
          await tx.wallet.update({ where: { id: wallet.id }, data: { balance: { increment: amount } } });
          await tx.transaction.update({
            where: { id: txn.id },
            data: { status: 'SUCCESS', completedAt: new Date(), receiverBalanceAfter: wallet.balance.toNumber() + amount }
          });
        });
        await EventBus.publish('transaction.success', { userId: wallet.accountId, txnId: txn.id, type: 'DEPOSIT', amount });
      } else {
        await prisma.transaction.update({ where: { id: txn.id }, data: { status: 'FAILED' } });
      }
    } catch (error) {
      await prisma.transaction.update({ where: { id: txn.id }, data: { status: 'FAILED', metadata: { error: error.message } } });
    }
  }

  async processWithdrawAsync(txn, provider, providerPhone, amount, wallet) {
    try {
      const client = provider === 'MTN' ? MtnMomoClient : OrangeMoneyClient;
      await client.transfer({ amount, phone: providerPhone, externalId: txn.reference });
      
      const finalStatus = await this.pollProviderStatus(client, txn.reference, 5, 10000);

      if (finalStatus === 'SUCCESSFUL') {
        await prisma.transaction.update({
          where: { id: txn.id },
          data: { status: 'SUCCESS', completedAt: new Date() }
        });
        await EventBus.publish('transaction.success', { userId: wallet.accountId, txnId: txn.id, type: 'WITHDRAWAL', amount });
      } else {
        // Reversement si échec
        await prisma.$transaction([
          prisma.wallet.update({ where: { id: wallet.id }, data: { balance: { increment: amount + txn.fee } } }),
          prisma.transaction.update({ where: { id: txn.id }, data: { status: 'FAILED' } })
        ]);
      }
    } catch (error) {
        // En cas d'erreur API, on laisse en PROCESSING ou on met en FAILED avec reversement
        await prisma.transaction.update({ where: { id: txn.id }, data: { status: 'FAILED', metadata: { error: error.message } } });
    }
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
      include: { account: true }
    });
    if (!wallet) throw new AppError(`Aucun compte associé au numéro ${phone}`, 404);
    return wallet;
  }
}

module.exports = new TransactionService();
