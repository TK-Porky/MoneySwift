const notificationService = require('../services/notification.service');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

exports.getAll = asyncHandler(async (req, res) => {
  const result = await notificationService.getAll(req.user.id);
  res.status(200).json({ success: true, data: result });
});

exports.markRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markRead(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: result });
});

exports.markAllRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllRead(req.user.id);
  res.status(200).json({ success: true, data: result });
});

exports.delete = asyncHandler(async (req, res) => {
  const result = await notificationService.delete(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: result });
});
