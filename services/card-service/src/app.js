const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { errorHandler } = require('@moneyswift/middleware');
const cardRoutes = require('./routes/card.routes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*'
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'card-service',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

app.use('/api/v1/cards', cardRoutes);

app.use(errorHandler);

module.exports = app;
