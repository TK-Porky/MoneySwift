const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { authenticate, validate } = require('@moneyswift/middleware');
const { linkWalletSchema } = require('../validators/wallet.validators');

/**
 * @swagger
 * tags:
 *   name: Wallets
 *   description: Gestion des portefeuilles et des soldes
 */

router.use(authenticate);

/**
 * @swagger
 * /wallets/balance:
 *   get:
 *     summary: Consulter le solde du wallet principal
 *     tags: [Wallets]
 *     responses:
 *       200:
 *         description: Solde actuel
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
 *                         balance:  { type: number, example: 50000 }
 *                         currency: { type: string, example: "XAF" }
 *                         walletId: { type: string, format: uuid }
 */
router.get('/balance', walletController.getBalance);

/**
 * @swagger
 * /wallets:
 *   get:
 *     summary: Lister tous les wallets (MoneySwift + opérateurs liés)
 *     tags: [Wallets]
 *     responses:
 *       200:
 *         description: Liste des wallets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Wallet' }
 */
router.get('/', walletController.getWallets);

/**
 * @swagger
 * /wallets/link:
 *   post:
 *     summary: Lier un numéro MTN ou Orange Money au compte
 *     tags: [Wallets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [provider, providerPhone]
 *             properties:
 *               provider:      { type: string, enum: [MTN, ORANGE] }
 *               providerPhone: { type: string, example: "+237699000001" }
 *     responses:
 *       201:
 *         description: Opérateur lié avec succès
 *       409:
 *         description: Ce numéro est déjà lié
 */
router.post('/link', validate(linkWalletSchema), walletController.linkWallet);

module.exports = router;
