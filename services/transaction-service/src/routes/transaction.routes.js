const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { authenticate, requirePin, validate } = require('@moneyswift/middleware');
const { 
  depositSchema, 
  withdrawSchema, 
  transferSchema, 
  historySchema 
} = require('../validators/transaction.validators');

router.use(authenticate);

router.post('/deposit', validate(depositSchema), transactionController.deposit);
router.post('/withdraw', validate(withdrawSchema), requirePin, transactionController.withdraw);
router.post('/transfer', validate(transferSchema), requirePin, transactionController.transfer);

router.get('/', transactionController.getHistory);
router.get('/stats', transactionController.getStats);
router.get('/:ref', transactionController.getOne);

module.exports = router;
