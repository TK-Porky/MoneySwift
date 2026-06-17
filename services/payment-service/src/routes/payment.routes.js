const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate, validate } = require('@moneyswift/middleware');
const { initiatePaymentSchema } = require('../validators/payment.validators');

// Routes publiques (Webhooks)
router.post('/webhooks/angara-pay', paymentController.handleAngaraWebhook);
router.post('/webhooks/mtn-momo', paymentController.handleMtnWebhook);
router.post('/webhooks/orange-money', paymentController.handleOrangeWebhook);

// Routes protégées
router.post('/initiate', authenticate, validate(initiatePaymentSchema), paymentController.initiate);
router.get('/:ref/status', authenticate, paymentController.getStatus);

module.exports = router;
