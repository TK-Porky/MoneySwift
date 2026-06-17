const cardService = require('../services/card.service');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

exports.createCard = asyncHandler(async (req, res) => {
  const result = await cardService.createCard({
    userId: req.user.id,
    ...req.body
  });
  res.status(201).json({ success: true, data: result });
});

exports.getCards = asyncHandler(async (req, res) => {
  const result = await cardService.getCards(req.user.id);
  res.status(200).json({ success: true, data: result });
});

exports.getCard = asyncHandler(async (req, res) => {
  const result = await cardService.getCard(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: result });
});

exports.revealCard = asyncHandler(async (req, res) => {
  const result = await cardService.revealCard({
    userId: req.user.id,
    cardId: req.params.id
  });
  res.status(200).json({ success: true, data: result });
});

exports.toggleFreeze = asyncHandler(async (req, res) => {
  const result = await cardService.toggleFreeze(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: result });
});

exports.updateLimit = asyncHandler(async (req, res) => {
  const result = await cardService.updateLimit(req.user.id, req.params.id, req.body.spendingLimit);
  res.status(200).json({ success: true, data: result });
});

exports.cancelCard = asyncHandler(async (req, res) => {
  const result = await cardService.cancelCard(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: result });
});
