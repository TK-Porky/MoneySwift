let prisma = require('@moneyswift/database');
let { AngaraPayClient } = require('@moneyswift/integrations');
const EventBus = require('@moneyswift/events');
const AppError = require('@moneyswift/errors/AppError');

class PaymentService {
  async initiate({ userId, amount, description, callbackUrl }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const reference = `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    // Créer la transaction en PENDING
    await prisma.transaction.create({
      data: {
        reference,
        type: 'PAYMENT',
        status: 'PENDING',
        amount,
        description,
        metadata: { userId }
      }
    });

    const payment = await AngaraPayClient.initiatePayment({
      amount,
      reference,
      callbackUrl,
      customerPhone: user.phoneNumber,
      description
    });

    return payment;
  }

  async getStatus(reference) {
    const txn = await prisma.transaction.findUnique({ where: { reference } });
    if (!txn) throw new AppError('Paiement non trouvé', 404);
    return txn;
  }

  async handleAngaraWebhook(payload, signature) {
    const isValid = AngaraPayClient.verifyWebhookSignature(payload, signature);
    if (!isValid) throw new AppError('Signature invalide', 401);

    const { reference, status } = payload;
    
    if (status === 'SUCCESS') {
      await this.completePayment(reference);
    } else if (status === 'FAILED') {
      await prisma.transaction.update({
        where: { reference },
        data: { status: 'FAILED' }
      });
    }

    return { received: true };
  }

  async completePayment(reference) {
    const txn = await prisma.transaction.findUnique({
      where: { reference },
      include: { senderWallet: true }
    });

    if (!txn || txn.status === 'SUCCESS') return;

    await prisma.transaction.update({
      where: { reference },
      data: { status: 'SUCCESS', completedAt: new Date() }
    });

    await EventBus.publish('transaction.success', {
      userId: txn.metadata?.userId,
      txnId: txn.id,
      type: 'PAYMENT',
      amount: txn.amount
    });
  }
}

const instance = new PaymentService();
module.exports = instance;
module.exports.__setPrisma = (p) => { prisma = p; };
module.exports.__setAngaraPayClient = (c) => { AngaraPayClient = c; };
