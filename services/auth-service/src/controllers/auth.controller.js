const authService = require('../services/auth.service');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
});

exports.verifyPhone = asyncHandler(async (req, res) => {
  const result = await authService.verifyPhone(req.body);
  res.status(200).json({ success: true, data: result });
});

exports.login = asyncHandler(async (req, res) => {
  const ipAddress = req.ip;
  const result = await authService.login({ ...req.body, ipAddress });
  res.status(200).json({ success: true, data: result });
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const result = await authService.refreshToken(req.body.refreshToken);
  res.status(200).json({ success: true, data: result });
});

exports.logout = asyncHandler(async (req, res) => {
  const result = await authService.logout(req.user.id, req.body.refreshToken);
  res.status(200).json({ success: true, data: result });
});

exports.changePin = asyncHandler(async (req, res) => {
  const result = await authService.changePin(req.user.id, req.body);
  res.status(200).json({ success: true, data: result });
});

exports.getSessions = asyncHandler(async (req, res) => {
  const result = await authService.getSessions(req.user.id);
  res.status(200).json({ success: true, data: result });
});

exports.revokeSession = asyncHandler(async (req, res) => {
  const result = await authService.revokeSession(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: result });
});
