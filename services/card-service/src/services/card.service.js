const crypto  = require('crypto');
const bcrypt  = require('bcrypt');
const prisma  = require('@moneyswift/database');
const { encrypt, decrypt } = require('@moneyswift/utils');
const AppError = require('@moneyswift/errors/AppError');

class CardService {

  async createCard({ userId, cardHolder, spendingLimit, pin }) {
    // Vérifier le PIN
    await this.verifyPin(userId, pin);

    const account = await prisma.account.findUnique({ where: { userId } });
    if (!account) throw new AppError('Compte introuvable', 404);

    // Limiter à 3 cartes actives par compte
    const activeCount = await prisma.virtualCard.count({
      where: { accountId: account.id, status: { in: ['ACTIVE', 'FROZEN'] } },
    });
    if (activeCount >= 3) {
      throw new AppError('Maximum 3 cartes actives autorisées', 400);
    }

    // Générer les données de la carte
    const cardNumber = this.generateCardNumber(); // 16 chiffres Luhn-valid
    const cvv        = this.generateCvv();         // 3 chiffres
    const expiry     = this.generateExpiry();       // +3 ans

    const card = await prisma.virtualCard.create({
      data: {
        accountId:    account.id,
        cardNumber:   encrypt(cardNumber),           // Chiffré AES-256
        cardHolder:   cardHolder || account.user?.fullName,
        expiryMonth:  expiry.month,
        expiryYear:   expiry.year,
        cvvHash:      await bcrypt.hash(cvv, 12),   // Hashé bcrypt
        network:      'VISA',
        spendingLimit,
        status:       'ACTIVE',
      },
    });

    // On retourne le CVV une seule fois à la création — jamais stocké en clair
    return {
      id:           card.id,
      cardNumber:   this.maskCardNumber(cardNumber), // XXXX XXXX XXXX 1234
      cvv,                                           // Affiché une seule fois
      expiryMonth:  expiry.month,
      expiryYear:   expiry.year,
      cardHolder:   card.cardHolder,
      spendingLimit: card.spendingLimit,
      status:       'ACTIVE',
      warning:      'Notez votre CVV. Il ne sera plus affiché.',
    };
  }

  async revealCard({ cardId, userId, pin }) {
    // Vérification du PIN obligatoire pour voir les données sensibles
    await this.verifyPin(userId, pin);

    const card = await prisma.virtualCard.findFirst({
      where: { id: cardId, account: { userId }, status: 'ACTIVE' },
    });
    if (!card) throw new AppError('Carte introuvable', 404);

    return {
      cardNumber: decrypt(card.cardNumber),       // Déchiffrement AES-256
      expiryMonth: card.expiryMonth,
      expiryYear:  card.expiryYear,
      cardHolder:  card.cardHolder,
      // CVV non retourné (hashé — irrecouvrable)
      note: 'CVV non disponible. Contactez le support si nécessaire.',
    };
  }

  generateCardNumber() {
    // Luhn algorithm valid Visa (commence par 4)
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