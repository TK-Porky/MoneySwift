// Écoute les événements Redis et dispatche les notifications

const EventBus = require('@moneyswift/events');
const prisma   = require('@moneyswift/database');
const { SmsProvider }  = require('../providers/sms.provider');    // Twilio / SMS CM
const { PushProvider } = require('../providers/push.provider');   // Firebase FCM

class NotificationService {

  async initialize() {
    // Abonnements aux événements métier
    await EventBus.subscribe('transaction.success', this.onTransactionSuccess.bind(this));
    await EventBus.subscribe('transaction.failed',  this.onTransactionFailed.bind(this));
    await EventBus.subscribe('card.created',        this.onCardCreated.bind(this));
    console.log('Notification service listening on EventBus...');
  }

  async onTransactionSuccess({ userId, receiverId, type, amount }) {
    const templates = {
      DEPOSIT:   { title: 'Dépôt reçu ✅', body: `${amount.toLocaleString()} XAF crédité sur votre compte.` },
      WITHDRAWAL:{ title: 'Retrait effectué', body: `${amount.toLocaleString()} XAF retiré avec succès.` },
      TRANSFER:  { title: 'Argent envoyé ✅', body: `Transfert de ${amount.toLocaleString()} XAF effectué.` },
    };

    const tpl = templates[type];

    // Notifier l'expéditeur
    if (userId) await this.dispatch(userId, tpl, 'TRANSACTION');

    // Notifier le destinataire (si transfert)
    if (receiverId && type === 'TRANSFER') {
      await this.dispatch(receiverId, {
        title: 'Argent reçu 💰',
        body:  `Vous avez reçu ${amount.toLocaleString()} XAF.`,
      }, 'TRANSACTION');
    }
  }

  async dispatch(userId, { title, body }, type) {
    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: { id: true, phoneNumber: true, fcmToken: true },
    });
    if (!user) return;

    // Sauvegarder en DB (centre de notifications in-app)
    await prisma.notification.create({
      data: { userId, type, title, body, channel: 'IN_APP' },
    });

    // Push notification (si token FCM disponible)
    if (user.fcmToken) {
      await PushProvider.send({ token: user.fcmToken, title, body });
    }

    // SMS (pour les transactions importantes)
    await SmsProvider.send(user.phoneNumber, `${title}: ${body}`);
  }
}

module.exports = new NotificationService();