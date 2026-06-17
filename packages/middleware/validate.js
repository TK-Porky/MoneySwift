const AppError = require('@moneyswift/errors/AppError');

const validate = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    next(new AppError(message, 400));
  }
};

module.exports = validate;
