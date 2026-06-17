// services/notification-service/src/services/notification.service.js

const EventBus = require('@moneyswift/events');
const prisma   = require('@moneyswift/database');
const { SmsProvider } = require('@moneyswift/integrations');
const AppError = require('@moneyswift/errors/AppError');

class NotificationService {

  async initialize() {
    await EventBus.subscribe('transaction.success', this.onTransactionSuccess.bind(this));
    await EventBus.subscribe('transaction.failed',  this.onTransactionFailed.bind(this));
    await EventBus.subscribe('card.created',        this.onCardCreated.bind(this));
    console.log('Notification service listening on EventBus...');
  }

  async getAll(userId) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async markRead(userId, id) {
    const notif = await prisma.notification.findFirst({
      where: { id, userId }
    });
    if (!notif) throw new AppError('Notification non trouvée', 404);

    return prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  }

  async markAllRead(userId) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
    return { message: 'Toutes les notifications marquées comme lues' };
  }

  async delete(userId, id) {
    const notif = await prisma.notification.findFirst({
      where: { id, userId }
    });
    if (!notif) throw new AppError('Notification non trouvée', 404);

    await prisma.notification.delete({ where: { id } });
    return { message: 'Notification supprimée' };
  }

  async onTransactionSuccess({ userId, receiverId, type, amount }) {
    const templates = {
      DEPOSIT:   { title: 'Dépôt reçu ✅', body: `${amount.toLocaleString()} XAF crédité sur votre compte.` },
      WITHDRAWAL:{ title: 'Retrait effectué', body: `${amount.toLocaleString()} XAF retiré avec succès.` },
      TRANSFER:  { title: 'Argent envoyé ✅', body: `Transfert de ${amount.toLocaleString()} XAF effectué.` },
    };

    const tpl = templates[type];
    if (userId) await this.dispatch(userId, tpl, 'TRANSACTION');

    if (receiverId && type === 'TRANSFER') {
      await this.dispatch(receiverId, {
        title: 'Argent reçu 💰',
        body:  `Vous avez reçu ${amount.toLocaleString()} XAF.`,
      }, 'TRANSACTION');
    }
  }

  async onTransactionFailed({ txnId }) {
    // Logique de notification d'échec
  }

  async onCardCreated({ userId }) {
    await this.dispatch(userId, {
      title: 'Carte virtuelle créée 💳',
      body: 'Votre nouvelle carte est prête à être utilisée.'
    }, 'SECURITY');
  }

  async dispatch(userId, { title, body }, type) {
    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: { id: true, phoneNumber: true },
    });
    if (!user) return;

    await prisma.notification.create({
      data: { userId, type, title, body, channel: 'IN_APP' },
    });

    // Optionnel: Envoyer SMS ou Push
    await SmsProvider.send(user.phoneNumber, `${title}: ${body}`);
  }
}

module.exports = new NotificationService();
