const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi   = require('swagger-ui-express');
const swaggerSpec = require('@moneyswift/swagger');
const { errorHandler } = require('@moneyswift/middleware');
const accountRoutes = require('./routes/account.routes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*'
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'account-service',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

app.use('/api/v1/accounts', accountRoutes);

// Documentation API — accessible sur /api-docs de chaque service
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'MoneySwift API Docs',
  customCss: '.swagger-ui .topbar { background-color: #1a1a2e; }',
  swaggerOptions: {
    persistAuthorization: true,  // Garde le token JWT entre les requêtes
  },
}));

app.use(errorHandler);

module.exports = app;
