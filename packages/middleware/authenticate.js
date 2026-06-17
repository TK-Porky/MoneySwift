const jwt = require('jsonwebtoken');
const prisma = require('@moneyswift/database');
const AppError = require('@moneyswift/errors/AppError');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Token manquant ou invalide', 401));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'access') {
      return next(new AppError('Type de token invalide', 401));
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, phoneNumber: true, fullName: true, pinHash: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return next(new AppError('Utilisateur non trouvé ou inactif', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expiré', 401));
    }
    next(new AppError('Authentification échouée', 401));
  }
};

module.exports = authenticate;
