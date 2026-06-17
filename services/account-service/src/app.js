const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
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

app.use(errorHandler);

module.exports = app;
