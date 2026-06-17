const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { authenticate, validate } = require('@moneyswift/middleware');
const { linkOperatorSchema } = require('../validators/wallet.validators');

router.use(authenticate);

router.get('/', walletController.getWallets);
router.get('/balance', walletController.getBalance);
router.post('/link', validate(linkOperatorSchema), walletController.linkOperator);
router.delete('/:id/unlink', walletController.unlinkOperator);

module.exports = router;
