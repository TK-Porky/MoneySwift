const accountService = require('../services/account.service');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

exports.getMyAccount = asyncHandler(async (req, res) => {
  const result = await accountService.getMyAccount(req.user.id);
  res.status(200).json({ success: true, data: result });
});

exports.updateAccount = asyncHandler(async (req, res) => {
  const result = await accountService.updateAccount(req.user.id, req.body);
  res.status(200).json({ success: true, data: result });
});

exports.submitKyc = asyncHandler(async (req, res) => {
  const result = await accountService.submitKyc(req.user.id, req.body);
  res.status(200).json({ success: true, data: result });
});
