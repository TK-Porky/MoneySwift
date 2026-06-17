const walletService = require('../services/wallet.service');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

exports.getWallets = asyncHandler(async (req, res) => {
  const result = await walletService.getWallets(req.user.id);
  res.status(200).json({ success: true, data: result });
});

exports.getBalance = asyncHandler(async (req, res) => {
  const result = await walletService.getBalance(req.user.id);
  res.status(200).json({ success: true, data: result });
});

exports.linkOperator = asyncHandler(async (req, res) => {
  const result = await walletService.linkOperator(req.user.id, req.body);
  res.status(201).json({ success: true, data: result });
});

exports.unlinkOperator = asyncHandler(async (req, res) => {
  const result = await walletService.unlinkOperator(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: result });
});
