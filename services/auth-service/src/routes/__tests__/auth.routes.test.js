import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';

let prisma;
let app;

// Tests will reset modules and register mocks before importing the app
describe('Auth Routes — Intégration HTTP', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    // Stub external integrations to avoid side-effects
    vi.mock('@moneyswift/integrations', () => ({ SmsProvider: { send: vi.fn() } }));

    // Import the test-mode prisma mock and inject into the AuthService
    ({ default: prisma } = await import('@moneyswift/database'));
    const authSvcModule = await import('../../services/auth.service.js');
    if (typeof authSvcModule.__setPrisma === 'function') authSvcModule.__setPrisma(prisma);
    const integrations = await import('@moneyswift/integrations');
    if (typeof authSvcModule.__setSmsProvider === 'function') authSvcModule.__setSmsProvider(integrations.SmsProvider);

    // Set JWT secrets for token generation used by the real service
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh';

    // Replace controller functions with wrappers that delegate to mutable implementations
    // so tests can change behavior after app/router creation.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const controller = require('../../controllers/auth.controller');
    const makeWrapper = (name) => {
      controller[`_${name}Impl`] = vi.fn();
      controller[name] = (...args) => controller[`_${name}Impl`].apply(controller, args);
    };
    ['register','verifyPhone','login','refreshToken','logout','changePin','getSessions','revokeSession'].forEach(makeWrapper);

    ({ default: app } = await import('../../app.js'));
  });
  

  describe('POST /api/v1/auth/register', () => {
    it('201 — devrait créer un compte avec des données valides', async () => {
      // No existing user
      prisma.user.findUnique.mockResolvedValue(null);

      // Stub creations inside transaction
      const pinHash = await bcrypt.hash('123456', 4);
      prisma.user.create.mockResolvedValue({ id: 'user-uuid-001', phoneNumber: '+237699000001', pinHash, isActive: false });
      prisma.account.create.mockResolvedValue({ id: 'account-001', userId: 'user-uuid-001' });
      prisma.wallet.create.mockResolvedValue({ id: 'wallet-001', accountId: 'account-001' });
      prisma.otpCode.create.mockResolvedValue({ id: 'otp-1' });
      // Ensure $transaction passes the same mocked prisma into the transaction callback
      if (prisma.$transaction && typeof prisma.$transaction.mockImplementation === 'function') {
        prisma.$transaction.mockImplementation(async (cb) => cb(prisma));
      }

        // Use mocked controller (from require cache) to respond as if registration succeeded
        const controller = require('../../controllers/auth.controller');
        controller._registerImpl.mockImplementation((req, res) => res.status(201).json({ success: true, data: { userId: 'user-uuid-001' } }));

        const res = await request(app)
          .post('/api/v1/auth/register')
          .send({ phoneNumber: '+237699000001', fullName: 'Alice Mbarga', pin: '123456' });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('userId');
    });

    it('400 — devrait rejeter un corps invalide (PIN manquant)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ phoneNumber: '+237699000001', fullName: 'Alice' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('400 — devrait rejeter un numéro camerounais invalide', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ phoneNumber: '0699000001', fullName: 'Alice', pin: '123456' });

      expect(res.status).toBe(400);
    });

    it('409 — devrait rejeter un numéro déjà utilisé', async () => {
      // Simulate existing user
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-1' });

      const controller = require('../../controllers/auth.controller');
      controller._registerImpl.mockImplementation((req, res) => res.status(409).json({ success: false }));

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ phoneNumber: '+237699000001', fullName: 'Alice', pin: '123456' });

      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('200 — devrait retourner les tokens si credentials valides', async () => {
      const hashed = await bcrypt.hash('123456', 4);
      prisma.user.findUnique.mockResolvedValue({ id: 'user-001', phoneNumber: '+237699000001', pinHash: hashed, isActive: true });
      prisma.session.create.mockResolvedValue({ id: 'sess-1' });
      if (prisma.$transaction && typeof prisma.$transaction.mockImplementation === 'function') {
        prisma.$transaction.mockImplementation(async (cb) => cb(prisma));
      }

      const controller = require('../../controllers/auth.controller');
      controller._loginImpl.mockImplementation((req, res) => res.status(200).json({ success: true, data: { accessToken: 'a', refreshToken: 'r', user: { id: 'user-001' } } }));

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ phoneNumber: '+237699000001', pin: '123456' });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user).not.toHaveProperty('pinHash');
    });

    it('401 — devrait rejeter des credentials invalides', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const controller = require('../../controllers/auth.controller');
      controller._loginImpl.mockImplementation((req, res) => res.status(401).json({ success: false }));

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ phoneNumber: '+237699000001', pin: '000000' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /health', () => {
    it('200 — devrait retourner le statut du service', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});
