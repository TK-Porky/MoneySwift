const express = require('express');
const router = express.Router();
const cardController = require('../controllers/card.controller');
const { authenticate, requirePin, validate } = require('@moneyswift/middleware');
const { 
  createCardSchema, 
  limitSchema, 
  revealCardSchema,
  cancelCardSchema
} = require('../validators/card.validators');

router.use(authenticate);

router.post('/', validate(createCardSchema), requirePin, cardController.createCard);
router.get('/', cardController.getCards);
router.get('/:id', cardController.getCard);
router.get('/:id/reveal', validate(revealCardSchema), requirePin, cardController.revealCard);
router.patch('/:id/freeze', cardController.toggleFreeze);
router.patch('/:id/limit', validate(limitSchema), cardController.updateLimit);
router.delete('/:id', validate(cancelCardSchema), requirePin, cardController.cancelCard);

module.exports = router;
