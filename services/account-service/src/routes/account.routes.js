const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const { authenticate, validate } = require('@moneyswift/middleware');
const { updateAccountSchema, submitKycSchema } = require('../validators/account.validators');

router.use(authenticate);

router.get('/me', accountController.getMyAccount);
router.patch('/me', validate(updateAccountSchema), accountController.updateAccount);
router.post('/me/kyc', validate(submitKycSchema), accountController.submitKyc);

module.exports = router;
