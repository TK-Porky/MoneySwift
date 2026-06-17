const paymentService = require('../services/payment.service');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

exports.initiate = asyncHandler(async (req, res) => {
  const result = await paymentService.initiate({
    userId: req.user.id,
    ...req.body
  });
  res.status(200).json({ success: true, data: result });
});

exports.getStatus = asyncHandler(async (req, res) => {
  const result = await paymentService.getStatus(req.params.ref);
  res.status(200).json({ success: true, data: result });
});

exports.handleAngaraWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-angara-signature'];
  const result = await paymentService.handleAngaraWebhook(req.body, signature);
  res.status(200).json(result);
});

exports.handleMtnWebhook = asyncHandler(async (req, res) => {
  // Logique spécifique MTN
  res.status(200).json({ success: true });
});

exports.handleOrangeWebhook = asyncHandler(async (req, res) => {
  // Logique spécifique Orange
  res.status(200).json({ success: true });
});
