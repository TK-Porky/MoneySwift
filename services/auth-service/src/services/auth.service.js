const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const prisma = require('@moneyswift/database');
const { generateOtp, hashOtp, verifyOtp } = require('@moneyswift/utils');
const { SmsService } = require('../integrations/sms.service');
const AppError = require('@moneyswift/errors/AppError');

class AuthService {

  async register({ phoneNumber, fullName, pin, email }) {
    // 1. Vérifier que le numéro n'est pas déjà pris
    const existing = await prisma.user.findUnique({ where: { phoneNumber } });
    if (existing) throw new AppError('Ce numéro est déjà associé à un compte', 409);

    // 2. Hasher le PIN
    const pinHash = await bcrypt.hash(pin, 12);

    // 3. Créer l'utilisateur + compte + wallet principal (transaction DB)
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { phoneNumber, fullName, pinHash, email },
      });

      const account = await tx.account.create({
        data: {
          userId:        newUser.id,
          accountNumber: this.generateAccountNumber(),
        },
      });

      // Wallet interne MoneySwift (solde applicatif)
      await tx.wallet.create({
        data: {
          accountId: account.id,
          provider:  'MONEYSWIFT',
          isPrimary: true,
        },
      });

      return newUser;
    });

    // 4. Envoyer OTP de vérification
    const otp = generateOtp();
    await prisma.otpCode.create({
      data: {
        userId:    user.id,
        code:      await hashOtp(otp),
        purpose:   'PHONE_VERIFICATION',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    await SmsService.send(phoneNumber, `Votre code MoneySwift : ${otp}. Valable 10 minutes.`);

    return { userId: user.id, message: 'Code de vérification envoyé' };
  }

  async login({ phoneNumber, pin, deviceInfo, ipAddress }) {
    const user = await prisma.user.findUnique({ where: { phoneNumber } });

    if (!user || !user.isActive) {
      throw new AppError('Identifiants incorrects', 401);
    }

    const pinValid = await bcrypt.compare(pin, user.pinHash);
    if (!pinValid) {
      // Log tentative échouée (audit sécurité)
      await this.logFailedAttempt(user.id, ipAddress);
      throw new AppError('Identifiants incorrects', 401);
    }

    // Générer les tokens
    const { accessToken, refreshToken } = this.generateTokens(user.id);

    // Créer la session
    await prisma.session.create({
      data: {
        userId:       user.id,
        refreshToken: await bcrypt.hash(refreshToken, 10),
        deviceInfo,
        ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      },
    });

    return { accessToken, refreshToken, user: this.sanitizeUser(user) };
  }

  generateTokens(userId) {
    const accessToken = jwt.sign(
      { sub: userId, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { sub: userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    return { accessToken, refreshToken };
  }

  generateAccountNumber() {
    const year = new Date().getFullYear();
    const rand = Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0');
    return `MS-${year}-${rand}`;
  }

  sanitizeUser(user) {
    const { pinHash, ...safe } = user;
    return safe;
  }
}

module.exports = new AuthService();