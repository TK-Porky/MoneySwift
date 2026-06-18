import { vi, describe, it, expect, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import jwt    from 'jsonwebtoken';

// Import du mock — même forme que le vrai module
let prisma;
let AuthService;
import { resetPrismaMocks } from '../../../../../tests/helper/resetPrismaMocks.js';

// ── Fixtures ───────────────────────────────────────────────────────
// PAS de await au niveau module (CJS) — générer le hash dans beforeEach
let mockUser;
let mockAccount;
const mockUserId = 'user-001';

beforeEach(async () => {
  // Clear mocks and reset module cache so imports resolve to a fresh, shared module instance
  vi.clearAllMocks();
  vi.resetModules();

  // Re-import prisma and service so both see the same mocked object
  ({ default: prisma } = await import('@moneyswift/database'));
  AuthService = (await import('../auth.service.js')).default;
  // Inject mocked prisma into the service instance so it uses the same mock
  const { __setPrisma } = await import('../auth.service.js');
  __setPrisma(prisma);
  // Ensure SmsProvider.send is available as a mock to avoid real provider calls
  const integrations = await import('@moneyswift/integrations');
  if (integrations.SmsProvider) {
    integrations.SmsProvider.send = integrations.SmsProvider.send || vi.fn();
  }
  const { __setSmsProvider } = await import('../auth.service.js');
  __setSmsProvider(integrations.SmsProvider || { send: vi.fn() });

  // Recréer mockUser avec un vrai hash bcrypt avant chaque test
  mockUser = {
    id:          'user-uuid-001',
    phoneNumber: '+237699000001',
    fullName:    'Alice Mbarga',
    pinHash:     await bcrypt.hash('123456', 4), // rounds=4 pour la vitesse en test
    email:       'alice@test.cm',
    kycStatus:   'PENDING',
    isActive:    true,
    createdAt:   new Date(),
  };
});

describe('AuthService', () => {

  describe('register()', () => {

    it('devrait créer un utilisateur avec un compte et un wallet', async () => {
      const createdUser = { id: 'user-uuid-001', phoneNumber: '+237699000001', fullName: 'Alice Mbarga' };

      prisma.user.findUnique.mockResolvedValue(null);

      // Stub create methods and ensure $transaction calls the callback with the mock prisma
      prisma.user.create.mockResolvedValue(createdUser);
      prisma.account.create.mockResolvedValue({ id: 'account-001', userId: createdUser.id });
      prisma.wallet.create.mockResolvedValue({ id: 'wallet-001' });
      prisma.$transaction.mockImplementation(async (cb) => cb(prisma));

      prisma.otpCode.create.mockResolvedValue({});

      const result = await AuthService.register({
        phoneNumber: '+237699000001',
        fullName:    'Alice Mbarga',
        pin:         '123456',
      });

      expect(result).toHaveProperty('userId');
      expect(prisma.$transaction).toHaveBeenCalledOnce();
    });

    it('devrait rejeter si le numéro est déjà utilisé', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(
        AuthService.register({ phoneNumber: '+237699000001', fullName: 'Bob', pin: '123456' })
      ).rejects.toThrow();

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('devrait rejeter un PIN de moins de 6 chiffres', async () => {
      await expect(
        AuthService.register({ phoneNumber: '+237699000002', fullName: 'Bob', pin: '123' })
      ).rejects.toThrow();
    });
  });

  describe('login()', () => {

    it('devrait retourner accessToken et refreshToken si credentials valides', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.session.create.mockResolvedValue({});
      // Ensure transactions execute callbacks normally
      prisma.$transaction.mockImplementation(async (cb) => cb(prisma));

      const result = await AuthService.login({
        phoneNumber: '+237699000001',
        pin:         '123456',
        deviceInfo:  { os: 'Windows' },
        ipAddress:   '127.0.0.1',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).not.toHaveProperty('pinHash');
      expect(prisma.session.create).toHaveBeenCalledOnce();
    });

    it('devrait rejeter si le PIN est incorrect', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        AuthService.login({ phoneNumber: '+237699000001', pin: '000000' })
      ).rejects.toThrow();
    });

    it('devrait rejeter si le compte est inactif', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(
        AuthService.login({ phoneNumber: '+237699000001', pin: '123456' })
      ).rejects.toThrow();
    });

    it('devrait rejeter si le numéro n\'existe pas', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        AuthService.login({ phoneNumber: '+237699999999', pin: '123456' })
      ).rejects.toThrow();
    });
  });

  describe('generateTokens()', () => {
    it('devrait générer des tokens JWT valides', () => {
      const { accessToken, refreshToken } = AuthService.generateTokens('user-uuid-001');
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      expect(decoded.sub).toBe('user-uuid-001');
      expect(accessToken).not.toBe(refreshToken);
    });
  });

  describe('sanitizeUser()', () => {
    it('ne doit jamais retourner le pinHash', () => {
      const safe = AuthService.sanitizeUser({ id: '1', phoneNumber: '+237699000001', pinHash: 'secret' });
      expect(safe).not.toHaveProperty('pinHash');
      expect(safe).toHaveProperty('id');
    });
  });
});