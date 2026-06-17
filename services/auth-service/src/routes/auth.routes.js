const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate, validate } = require('@moneyswift/middleware');
const { 
  registerSchema, 
  verifyPhoneSchema, 
  loginSchema, 
  changePinSchema, 
  refreshTokenSchema 
} = require('../validators/auth.validators');

router.post('/register', validate(registerSchema), authController.register);
router.post('/verify-phone', validate(verifyPhoneSchema), authController.verifyPhone);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);

// Routes protégées
router.post('/logout', authenticate, authController.logout);
router.post('/pin/change', authenticate, validate(changePinSchema), authController.changePin);
router.get('/sessions', authenticate, authController.getSessions);
router.delete('/sessions/:id', authenticate, authController.revokeSession);

module.exports = router;
