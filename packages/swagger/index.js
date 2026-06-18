const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MoneySwift API',
      version: '1.0.0',
      description: `
        API de transactions bancaires MoneySwift.
        Opère avec MTN Mobile Money et Orange Money au Cameroun.
        Devise : XAF (Franc CFA).
      `,
      contact: {
        name: 'MoneySwift Support',
        email: 'support@moneyswift.cm',
      },
    },
    servers: [
      { url: '/api/v1',                      description: 'Gateway (Relative)' },
      { url: 'http://localhost:80/api/v1',  description: 'Gateway local (dev)' },
      { url: 'http://localhost:3001',        description: 'Auth Service direct' },
      { url: 'http://localhost:3002',        description: 'Account Service direct' },
      { url: 'http://localhost:3003',        description: 'Wallet Service direct' },
      { url: 'http://localhost:3004',        description: 'Transaction Service direct' },
      { url: 'http://localhost:3005',        description: 'Payment Service direct' },
      { url: 'http://localhost:3006',        description: 'Card Service direct' },
      { url: 'http://localhost:3007',        description: 'Notification Service direct' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenu via POST /auth/login',
        },
      },
      schemas: {
        // ── Réponses standard ──────────────────────────
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data:    { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error:   { type: 'string',  example: 'Message d\'erreur' },
            code:    { type: 'string',  example: 'INVALID_PIN' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page:       { type: 'integer', example: 1 },
            limit:      { type: 'integer', example: 20 },
            total:      { type: 'integer', example: 150 },
            totalPages: { type: 'integer', example: 8 },
          },
        },

        // ── User ──────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            id:          { type: 'string', format: 'uuid' },
            phoneNumber: { type: 'string', example: '+237699000001' },
            email:       { type: 'string', format: 'email', nullable: true },
            fullName:    { type: 'string', example: 'Alice Mbarga' },
            kycStatus:   { type: 'string', enum: ['PENDING','VERIFIED','REJECTED'] },
            isActive:    { type: 'boolean' },
            createdAt:   { type: 'string', format: 'date-time' },
          },
        },

        // ── Account ───────────────────────────────────
        Account: {
          type: 'object',
          properties: {
            id:            { type: 'string', format: 'uuid' },
            accountNumber: { type: 'string', example: 'MS-2025-000001' },
            accountType:   { type: 'string', enum: ['PERSONAL','BUSINESS'] },
            status:        { type: 'string', enum: ['ACTIVE','FROZEN','CLOSED'] },
            createdAt:     { type: 'string', format: 'date-time' },
          },
        },

        // ── Wallet ────────────────────────────────────
        Wallet: {
          type: 'object',
          properties: {
            id:           { type: 'string', format: 'uuid' },
            provider:     { type: 'string', enum: ['MTN','ORANGE','MONEYSWIFT'] },
            providerPhone:{ type: 'string', example: '+237699000001', nullable: true },
            balance:      { type: 'number', example: 50000.00 },
            currency:     { type: 'string', example: 'XAF' },
            isPrimary:    { type: 'boolean' },
          },
        },

        // ── Transaction ───────────────────────────────
        Transaction: {
          type: 'object',
          properties: {
            id:          { type: 'string', format: 'uuid' },
            reference:   { type: 'string', example: 'TRF-20251217-X4K9P' },
            type:        { type: 'string', enum: ['DEPOSIT','WITHDRAWAL','TRANSFER','PAYMENT'] },
            status:      { type: 'string', enum: ['PENDING','PROCESSING','SUCCESS','FAILED','REVERSED'] },
            amount:      { type: 'number', example: 5000.00 },
            fee:         { type: 'number', example: 50.00 },
            currency:    { type: 'string', example: 'XAF' },
            description: { type: 'string', nullable: true },
            provider:    { type: 'string', enum: ['MTN_MOMO','ORANGE_MONEY','ANGARA_PAY'], nullable: true },
            initiatedAt: { type: 'string', format: 'date-time' },
            completedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },

        // ── VirtualCard ───────────────────────────────
        VirtualCard: {
          type: 'object',
          properties: {
            id:           { type: 'string', format: 'uuid' },
            cardNumber:   { type: 'string', example: '4XXX XXXX XXXX 1234',
                           description: 'Masqué — utilisez /reveal pour le numéro complet' },
            cardHolder:   { type: 'string', example: 'ALICE MBARGA' },
            expiryMonth:  { type: 'integer', example: 12 },
            expiryYear:   { type: 'integer', example: 2028 },
            network:      { type: 'string', enum: ['VISA','MASTERCARD'] },
            spendingLimit:{ type: 'number', example: 100000, nullable: true },
            status:       { type: 'string', enum: ['ACTIVE','FROZEN','EXPIRED','CANCELLED'] },
          },
        },

        // ── Notification ──────────────────────────────
        Notification: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid' },
            type:      { type: 'string', enum: ['TRANSACTION','SECURITY','PROMOTION','SYSTEM'] },
            title:     { type: 'string', example: 'Transfert reçu ✅' },
            body:      { type: 'string', example: 'Vous avez reçu 5 000 XAF.' },
            channel:   { type: 'string', enum: ['PUSH','SMS','EMAIL','IN_APP'] },
            isRead:    { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // Chemins vers les fichiers contenant les annotations JSDoc
  apis: [
    path.join(__dirname, '../../services/*/src/routes/*.routes.js').replace(/\\/g, '/'),
    path.join(__dirname, '../../services/*/src/routes/*.router.js').replace(/\\/g, '/'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
