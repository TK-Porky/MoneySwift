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

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentification et gestion des sessions
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Créer un nouveau compte MoneySwift
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phoneNumber, fullName, pin]
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+237699000001"
 *                 description: "Format camerounais : +237XXXXXXXXX"
 *               fullName:
 *                 type: string
 *                 example: "Alice Mbarga"
 *               pin:
 *                 type: string
 *                 example: "123456"
 *                 description: "PIN à 6 chiffres"
 *               email:
 *                 type: string
 *                 format: email
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Compte créé, OTP envoyé par SMS
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         userId:  { type: string, format: uuid }
 *                         message: { type: string, example: "Code de vérification envoyé" }
 *       409:
 *         description: Numéro déjà utilisé
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @swagger
 * /auth/verify-phone:
 *   post:
 *     summary: Vérifier le numéro de téléphone via OTP SMS
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, code]
 *             properties:
 *               userId: { type: string, format: uuid }
 *               code:   { type: string, example: "847291" }
 *     responses:
 *       200:
 *         description: Téléphone vérifié avec succès
 *       400:
 *         description: Code invalide ou expiré
 */
router.post('/verify-phone', validate(verifyPhoneSchema), authController.verifyPhone);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion avec numéro de téléphone et PIN
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phoneNumber, pin]
 *             properties:
 *               phoneNumber: { type: string, example: "+237699000001" }
 *               pin:         { type: string, example: "123456" }
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         accessToken:  { type: string }
 *                         refreshToken: { type: string }
 *                         user:         { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Identifiants incorrects
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renouveler le token d'accès via refresh token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Nouveau accessToken généré
 *       401:
 *         description: Refresh token invalide ou expiré
 */
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);

// Routes protégées

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Déconnexion et révocation de la session
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Session révoquée
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @swagger
 * /auth/pin/change:
 *   post:
 *     summary: Changer le PIN (ancien PIN requis)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPin, newPin]
 *             properties:
 *               currentPin: { type: string, example: "123456" }
 *               newPin:     { type: string, example: "654321" }
 *     responses:
 *       200:
 *         description: PIN modifié avec succès
 *       401:
 *         description: PIN actuel incorrect
 */
router.post('/pin/change', authenticate, validate(changePinSchema), authController.changePin);

/**
 * @swagger
 * /auth/sessions:
 *   get:
 *     summary: Lister toutes les sessions actives
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Liste des sessions
 */
router.get('/sessions', authenticate, authController.getSessions);

/**
 * @swagger
 * /auth/sessions/{id}:
 *   delete:
 *     summary: Révoquer une session spécifique
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Session révoquée
 *       404:
 *         description: Session introuvable
 */
router.delete('/sessions/:id', authenticate, authController.revokeSession);

module.exports = router;
