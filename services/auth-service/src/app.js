const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { errorHandler } = require('@moneyswift/middleware');
const authRoutes = require('./routes/auth.routes');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*'
}));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'auth-service',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// Routes
app.use('/api/v1/auth', authRoutes);

// Error Handler
app.use(errorHandler);

module.exports = app;
