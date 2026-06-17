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

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Dépôts, retraits, transferts d'argent
 */

router.use(authenticate);

/**
 * @swagger
 * /transactions/deposit:
 *   post:
 *     summary: Déposer de l'argent depuis MTN ou Orange Money
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [provider, providerPhone, amount, pin]
 *             properties:
 *               provider:
 *                 type: string
 *                 enum: [MTN, ORANGE]
 *                 example: "MTN"
 *               providerPhone:
 *                 type: string
 *                 example: "+237699000001"
 *               amount:
 *                 type: number
 *                 minimum: 100
 *                 maximum: 5000000
 *                 example: 10000
 *               pin:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       202:
 *         description: Dépôt initié — confirmation requise sur le téléphone
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
 *                         reference: { type: string, example: "DEP-20251217-A8K2P" }
 *                         status:    { type: string, example: "PENDING" }
 *                         message:   { type: string, example: "Confirmez sur votre téléphone" }
 *       400:
 *         description: Montant invalide ou provider non reconnu
 *       401:
 *         description: PIN incorrect
 */
router.post('/deposit', validate(depositSchema), transactionController.deposit);

/**
 * @swagger
 * /transactions/withdraw:
 *   post:
 *     summary: Retirer de l'argent vers MTN ou Orange Money
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [provider, providerPhone, amount, pin]
 *             properties:
 *               provider:      { type: string, enum: [MTN, ORANGE] }
 *               providerPhone: { type: string, example: "+237699000001" }
 *               amount:        { type: number, minimum: 100, example: 5000 }
 *               pin:           { type: string, example: "123456" }
 *     responses:
 *       202:
 *         description: Retrait initié
 *       400:
 *         description: Solde insuffisant ou montant invalide
 *       401:
 *         description: PIN incorrect
 */
router.post('/withdraw', validate(withdrawSchema), requirePin, transactionController.withdraw);

/**
 * @swagger
 * /transactions/transfer:
 *   post:
 *     summary: Envoyer de l'argent à un autre utilisateur MoneySwift
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [toPhone, amount, pin]
 *             properties:
 *               toPhone:
 *                 type: string
 *                 example: "+237677000002"
 *                 description: "Numéro du destinataire (doit avoir un compte MoneySwift)"
 *               amount:
 *                 type: number
 *                 minimum: 100
 *                 example: 5000
 *               pin:         { type: string, example: "123456" }
 *               description: { type: string, example: "Remboursement déjeuner", nullable: true }
 *     responses:
 *       200:
 *         description: Transfert effectué avec succès
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
 *                         reference: { type: string, example: "TRF-20251217-X4K9P" }
 *                         status:    { type: string, example: "SUCCESS" }
 *       400:
 *         description: Solde insuffisant ou destinataire introuvable
 *       401:
 *         description: PIN incorrect
 */
router.post('/transfer', validate(transferSchema), requirePin, transactionController.transfer);

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Historique des transactions (paginé)
 *     tags: [Transactions]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [DEPOSIT, WITHDRAWAL, TRANSFER, PAYMENT] }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date, example: "2025-01-01" }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date, example: "2025-12-31" }
 *     responses:
 *       200:
 *         description: Liste des transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Transaction' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/', transactionController.getHistory);

router.get('/stats', transactionController.getStats);

/**
 * @swagger
 * /transactions/{reference}:
 *   get:
 *     summary: Détail d'une transaction par référence
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema: { type: string, example: "TRF-20251217-X4K9P" }
 *     responses:
 *       200:
 *         description: Détail de la transaction
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/Transaction' }
 *       404:
 *         description: Transaction introuvable
 */
router.get('/:ref', transactionController.getOne);

module.exports = router;
