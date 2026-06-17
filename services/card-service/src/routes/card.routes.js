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

/**
 * @swagger
 * tags:
 *   name: Cards
 *   description: Création et gestion des cartes virtuelles
 */

router.use(authenticate);

/**
 * @swagger
 * /cards:
 *   post:
 *     summary: Créer une carte virtuelle Visa
 *     tags: [Cards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pin]
 *             properties:
 *               cardHolder:
 *                 type: string
 *                 example: "ALICE MBARGA"
 *                 description: "Optionnel — utilise le nom du compte par défaut"
 *               spendingLimit:
 *                 type: number
 *                 example: 100000
 *                 nullable: true
 *               pin: { type: string, example: "123456" }
 *     responses:
 *       201:
 *         description: Carte créée. CVV affiché une seule fois.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/VirtualCard'
 *                         - type: object
 *                           properties:
 *                             cvv:     { type: string, example: "847" }
 *                             warning: { type: string, example: "Notez votre CVV. Il ne sera plus affiché." }
 *       400:
 *         description: Maximum 3 cartes actives atteint
 */
router.post('/', validate(createCardSchema), requirePin, cardController.createCard);

/**
 * @swagger
 * /cards:
 *   get:
 *     summary: Lister mes cartes virtuelles
 *     tags: [Cards]
 *     responses:
 *       200:
 *         description: Liste des cartes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/VirtualCard' }
 */
router.get('/', cardController.getCards);

router.get('/:id', cardController.getCard);

/**
 * @swagger
 * /cards/{id}/reveal:
 *   get:
 *     summary: Afficher le numéro complet de la carte (PIN requis)
 *     tags: [Cards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: pin
 *         required: true
 *         schema: { type: string, example: "123456" }
 *     responses:
 *       200:
 *         description: Numéro de carte déchiffré
 *       401:
 *         description: PIN incorrect
 */
router.get('/:id/reveal', validate(revealCardSchema), requirePin, cardController.revealCard);

/**
 * @swagger
 * /cards/{id}/freeze:
 *   patch:
 *     summary: Geler ou dégeler une carte
 *     tags: [Cards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Statut de la carte mis à jour
 */
router.patch('/:id/freeze', cardController.toggleFreeze);

router.patch('/:id/limit', validate(limitSchema), cardController.updateLimit);
router.delete('/:id', validate(cancelCardSchema), requirePin, cardController.cancelCard);

module.exports = router;
