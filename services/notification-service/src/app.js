const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { errorHandler } = require('@moneyswift/middleware');
const notificationRoutes = require('./routes/notification.routes');
const notificationService = require('./services/notification.service');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*'
}));
app.use(express.json());

// Initialisation du service (EventBus)
notificationService.initialize();

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'notification-service',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

app.use('/api/v1/notifications', notificationRoutes);

app.use(errorHandler);

module.exports = app;
