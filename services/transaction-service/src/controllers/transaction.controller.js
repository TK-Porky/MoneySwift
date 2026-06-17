const transactionService = require('../services/transaction.service');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

exports.deposit = asyncHandler(async (req, res) => {
  const idempotencyKey = req.headers['idempotency-key'];
  const result = await transactionService.deposit({
    userId: req.user.id,
    ...req.body,
    idempotencyKey
  });
  res.status(202).json({ success: true, data: result });
});

exports.withdraw = asyncHandler(async (req, res) => {
  const result = await transactionService.withdraw({
    userId: req.user.id,
    ...req.body
  });
  res.status(202).json({ success: true, data: result });
});

exports.transfer = asyncHandler(async (req, res) => {
  const result = await transactionService.transfer({
    senderId: req.user.id,
    ...req.body
  });
  res.status(200).json({ success: true, data: result });
});

exports.getHistory = asyncHandler(async (req, res) => {
  const result = await transactionService.getHistory({
    userId: req.user.id,
    ...req.query
  });
  res.status(200).json({ success: true, data: result.data, meta: result.meta });
});

exports.getStats = asyncHandler(async (req, res) => {
  const result = await transactionService.getStats(req.user.id);
  res.status(200).json({ success: true, data: result });
});

exports.getOne = asyncHandler(async (req, res) => {
  const result = await transactionService.getOne(req.user.id, req.params.ref);
  res.status(200).json({ success: true, data: result });
});
