const bcrypt = require('bcrypt');
const AppError = require('@moneyswift/errors/AppError');

const requirePin = async (req, res, next) => {
  const { pin } = req.body;
  const user = req.user;

  if (!user) {
    return next(new AppError('Utilisateur non authentifié', 401));
  }

  if (!pin) {
    return next(new AppError('PIN requis pour cette opération', 400));
  }

  const isMatch = await bcrypt.compare(pin.toString(), user.pinHash);
  if (!isMatch) {
    return next(new AppError('PIN incorrect', 401));
  }

  // Ne pas propager le PIN
  delete req.body.pin;
  next();
};

module.exports = requirePin;
