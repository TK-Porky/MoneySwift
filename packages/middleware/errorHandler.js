const AppError = require('@moneyswift/errors/AppError');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log de l'erreur
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    service: process.env.SERVICE_NAME || 'unknown',
    level: err.statusCode >= 500 ? 'error' : 'warn',
    message: err.message,
    stack: err.statusCode >= 500 ? err.stack : undefined,
    path: req.path,
    method: req.method
  }));

  // Erreurs Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: `Valeur déjà existante pour le champ: ${err.meta.target}`,
      code: 'ALREADY_EXISTS'
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: 'Ressource non trouvée',
      code: 'NOT_FOUND'
    });
  }

  res.status(err.statusCode).json({
    success: false,
    error: err.message,
    code: err.isOperational ? undefined : 'INTERNAL_SERVER_ERROR'
  });
};

module.exports = errorHandler;
