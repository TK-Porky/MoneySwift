const crypto  = require('crypto');
const bcrypt  = require('bcrypt');
const prisma  = require('@moneyswift/database');
const { encrypt, decrypt } = require('@moneyswift/utils');
const AppError = require('@moneyswift/errors/AppError');

class CardService {

  async createCard({ userId, cardHolder, spendingLimit }) {
    const account = await prisma.account.findUnique({ 
      where: { userId },
      include: { user: true }
    });
    if (!account) throw new AppError('Compte introuvable', 404);

    const activeCount = await prisma.virtualCard.count({
      where: { accountId: account.id, status: { in: ['ACTIVE', 'FROZEN'] } },
    });
    if (activeCount >= 3) {
      throw new AppError('Maximum 3 cartes actives autorisées', 400);
    }

    const cardNumber = this.generateCardNumber();
    const cvv        = this.generateCvv();
    const expiry     = this.generateExpiry();

    const card = await prisma.virtualCard.create({
      data: {
        accountId:    account.id,
        cardNumber:   encrypt(cardNumber),
        cardHolder:   cardHolder || account.user.fullName,
        expiryMonth:  expiry.month,
        expiryYear:   expiry.year,
        cvvHash:      await bcrypt.hash(cvv, 12),
        network:      'VISA',
        spendingLimit,
        status:       'ACTIVE',
      },
    });

    return {
      id:           card.id,
      cardNumber:   this.maskCardNumber(cardNumber),
      cvv,
      expiryMonth:  expiry.month,
      expiryYear:   expiry.year,
      cardHolder:   card.cardHolder,
      spendingLimit: card.spendingLimit,
      status:       'ACTIVE',
      warning:      'Notez votre CVV. Il ne sera plus affiché.',
    };
  }

  async getCards(userId) {
    const account = await prisma.account.findUnique({ where: { userId } });
    if (!account) throw new AppError('Compte introuvable', 404);

    const cards = await prisma.virtualCard.findMany({
      where: { accountId: account.id }
    });

    return cards.map(c => ({
      ...c,
      cardNumber: this.maskCardNumber(decrypt(c.cardNumber))
    }));
  }

  async getCard(userId, cardId) {
    const card = await prisma.virtualCard.findFirst({
      where: { id: cardId, account: { userId } }
    });
    if (!card) throw new AppError('Carte introuvable', 404);

    return {
      ...card,
      cardNumber: this.maskCardNumber(decrypt(card.cardNumber))
    };
  }

  async revealCard({ userId, cardId }) {
    const card = await prisma.virtualCard.findFirst({
      where: { id: cardId, account: { userId } },
    });
    if (!card) throw new AppError('Carte introuvable', 404);

    return {
      cardNumber: decrypt(card.cardNumber),
      expiryMonth: card.expiryMonth,
      expiryYear:  card.expiryYear,
      cardHolder:  card.cardHolder,
      note: 'CVV non disponible (hashé).',
    };
  }

  async toggleFreeze(userId, cardId) {
    const card = await prisma.virtualCard.findFirst({
      where: { id: cardId, account: { userId } }
    });
    if (!card) throw new AppError('Carte introuvable', 404);

    const newStatus = card.status === 'ACTIVE' ? 'FROZEN' : 'ACTIVE';
    return prisma.virtualCard.update({
      where: { id: cardId },
      data: { status: newStatus }
    });
  }

  async updateLimit(userId, cardId, spendingLimit) {
    const card = await prisma.virtualCard.findFirst({
      where: { id: cardId, account: { userId } }
    });
    if (!card) throw new AppError('Carte introuvable', 404);

    return prisma.virtualCard.update({
      where: { id: cardId },
      data: { spendingLimit }
    });
  }

  async cancelCard(userId, cardId) {
    const card = await prisma.virtualCard.findFirst({
      where: { id: cardId, account: { userId } }
    });
    if (!card) throw new AppError('Carte introuvable', 404);

    await prisma.virtualCard.update({
      where: { id: cardId },
      data: { status: 'CANCELLED' }
    });

    return { message: 'Carte annulée' };
  }

  generateCardNumber() {
    let number = '4' + Array.from({ length: 14 }, () => Math.floor(Math.random() * 10)).join('');
    const luhnDigit = this.calculateLuhn(number);
    return number + luhnDigit;
  }

  calculateLuhn(partial) {
    const digits = partial.split('').map(Number).reverse();
    const sum = digits.reduce((acc, d, i) => {
      if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
      return acc + d;
    }, 0);
    return (10 - (sum % 10)) % 10;
  }

  generateCvv() {
    return Math.floor(100 + Math.random() * 900).toString();
  }

  generateExpiry() {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 3);
    return { month: d.getMonth() + 1, year: d.getFullYear() };
  }

  maskCardNumber(num) {
    return `${num.slice(0,4)} XXXX XXXX ${num.slice(-4)}`;
  }
}

module.exports = new CardService();
