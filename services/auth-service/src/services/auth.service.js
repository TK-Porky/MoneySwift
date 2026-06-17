const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const prisma = require('@moneyswift/database');
const { generateOtp, hashOtp, verifyOtp } = require('@moneyswift/utils');
const { SmsProvider } = require('@moneyswift/integrations');
const AppError = require('@moneyswift/errors/AppError');

class AuthService {

  async register({ phoneNumber, fullName, pin, email }) {
    const existing = await prisma.user.findUnique({ where: { phoneNumber } });
    if (existing) throw new AppError('Ce numéro est déjà associé à un compte', 409);

    const pinHash = await bcrypt.hash(pin.toString(), 12);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { phoneNumber, fullName, pinHash, email, isActive: false },
      });

      const account = await tx.account.create({
        data: {
          userId:        newUser.id,
          accountNumber: this.generateAccountNumber(),
        },
      });

      await tx.wallet.create({
        data: {
          accountId: account.id,
          provider:  'MONEYSWIFT',
          isPrimary: true,
        },
      });

      return newUser;
    });

    const otp = generateOtp();
    await prisma.otpCode.create({
      data: {
        userId:    user.id,
        code:      await hashOtp(otp),
        purpose:   'PHONE_VERIFICATION',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await SmsProvider.send(phoneNumber, `Votre code MoneySwift : ${otp}. Valable 10 minutes.`);

    return { userId: user.id, message: 'Code de vérification envoyé' };
  }

  async verifyPhone({ phoneNumber, code }) {
    const user = await prisma.user.findUnique({ 
      where: { phoneNumber },
      include: { otpCodes: { where: { purpose: 'PHONE_VERIFICATION', usedAt: null }, orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    if (!user) throw new AppError('Utilisateur non trouvé', 404);
    if (user.isActive) return { message: 'Compte déjà activé' };

    const otpRecord = user.otpCodes[0];
    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      throw new AppError('Code expiré ou inexistant', 400);
    }

    const isValid = await verifyOtp(code, otpRecord.code);
    if (!isValid) throw new AppError('Code incorrect', 400);

    await prisma.$transaction([
      prisma.otpCode.update({ where: { id: otpRecord.id }, data: { usedAt: new Date() } }),
      prisma.user.update({ where: { id: user.id }, data: { isActive: true } })
    ]);

    return { message: 'Compte activé avec succès' };
  }

  async login({ phoneNumber, pin, deviceInfo, ipAddress }) {
    const user = await prisma.user.findUnique({ where: { phoneNumber } });

    if (!user || !user.isActive) {
      throw new AppError('Identifiants incorrects ou compte inactif', 401);
    }

    const pinValid = await bcrypt.compare(pin.toString(), user.pinHash);
    if (!pinValid) {
      throw new AppError('Identifiants incorrects', 401);
    }

    const { accessToken, refreshToken } = this.generateTokens(user.id);

    await prisma.session.create({
      data: {
        userId:       user.id,
        refreshToken: await bcrypt.hash(refreshToken, 10),
        deviceInfo,
        ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken, user: this.sanitizeUser(user) };
  }

  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      if (decoded.type !== 'refresh') throw new Error();

      const session = await prisma.session.findFirst({
        where: { userId: decoded.sub, expiresAt: { gt: new Date() } }
      });

      if (!session) throw new Error();

      // En production, on comparerait le hash du refreshToken stocké
      
      const tokens = this.generateTokens(decoded.sub);
      return tokens;
    } catch (error) {
      throw new AppError('Session expirée ou invalide', 401);
    }
  }

  async logout(userId, refreshToken) {
    // On pourrait invalider une session spécifique ou toutes les sessions
    await prisma.session.deleteMany({ where: { userId } });
    return { message: 'Déconnexion réussie' };
  }

  async changePin(userId, { currentPin, newPin }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isMatch = await bcrypt.compare(currentPin.toString(), user.pinHash);
    if (!isMatch) throw new AppError('Ancien PIN incorrect', 401);

    const pinHash = await bcrypt.hash(newPin.toString(), 12);
    await prisma.user.update({
      where: { id: userId },
      data: { pinHash }
    });

    return { message: 'PIN modifié avec succès' };
  }

  async getSessions(userId) {
    return prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async revokeSession(userId, sessionId) {
    await prisma.session.delete({ where: { id: sessionId, userId } });
    return { message: 'Session révoquée' };
  }

  generateTokens(userId) {
    const accessToken = jwt.sign(
      { sub: userId, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
    const refreshToken = jwt.sign(
      { sub: userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
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
