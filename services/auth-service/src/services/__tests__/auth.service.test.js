import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import jwt    from 'jsonwebtoken';

// Mock des dépendances avant l'import du service
vi.mock('@moneyswift/utils', () => ({
  generateOtp:  vi.fn().mockReturnValue('847291'),
  hashOtp:      vi.fn().mockResolvedValue('hashed_otp'),
  verifyOtp:    vi.fn().mockResolvedValue(true),
  generateRef:  vi.fn().mockReturnValue('MS-2025-000001'),
}));

import { prisma }   from '@moneyswift/database';
import AuthService  from '../auth.service.js';

// ── Données de test réutilisables ──────────────────────────
const mockUser = {
  id:          'user-uuid-001',
  phoneNumber: '+237699000001',
  fullName:    'Alice Mbarga',
  pinHash:     await bcrypt.hash('123456', 12),
  email:       'alice@test.cm',
  kycStatus:   'PENDING',
  isActive:    true,
  createdAt:   new Date(),
};

const mockAccount = {
  id:            'account-uuid-001',
  userId:        'user-uuid-001',
  accountNumber: 'MS-2025-000001',
  accountType:   'PERSONAL',
  status:        'ACTIVE',
};

const mockWallet = {
  id:        'wallet-uuid-001',
  accountId: 'account-uuid-001',
  provider:  'MONEYSWIFT',
  balance:   0,
  isPrimary: true,
};

// ── Suite de tests ─────────────────────────────────────────
describe('AuthService', () => {

  beforeEach(() => {
    vi.clearAllMocks(); // Réinitialiser tous les mocks entre chaque test
  });

  // ── register() ────────────────────────────────────────────
  describe('register()', () => {

    it('devrait créer un utilisateur avec un compte et un wallet', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue(null); // Numéro disponible
      prisma.$transaction.mockImplementation(async (callback) => {
        prisma.user.create.mockResolvedValue(mockUser);
        prisma.account.create.mockResolvedValue(mockAccount);
        prisma.wallet.create.mockResolvedValue(mockWallet);
        return callback(prisma);
      });
      prisma.otpCode.create.mockResolvedValue({});

      // Act
      const result = await AuthService.register({
        phoneNumber: '+237699000001',
        fullName:    'Alice Mbarga',
        pin:         '123456',
      });

      // Assert
      expect(result).toHaveProperty('userId');
      expect(result.message).toContain('vérification');
      expect(prisma.$transaction).toHaveBeenCalledOnce();
      expect(prisma.otpCode.create).toHaveBeenCalledOnce();
    });

    it('devrait rejeter si le numéro est déjà utilisé', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue(mockUser); // Numéro pris

      // Act & Assert
      await expect(
        AuthService.register({ phoneNumber: '+237699000001', fullName: 'Bob', pin: '123456' })
      ).rejects.toThrow('déjà associé');
    });

    it('devrait rejeter un PIN de moins de 6 chiffres', async () => {
      await expect(
        AuthService.register({ phoneNumber: '+237699000002', fullName: 'Bob', pin: '123' })
      ).rejects.toThrow();
    });
  });

  // ── login() ───────────────────────────────────────────────
  describe('login()', () => {

    it('devrait retourner accessToken et refreshToken si les credentials sont valides', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.session.create.mockResolvedValue({});

      // Act
      const result = await AuthService.login({
        phoneNumber: '+237699000001',
        pin:         '123456',
        deviceInfo:  { os: 'Windows', model: 'PC' },
        ipAddress:   '127.0.0.1',
      });

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).not.toHaveProperty('pinHash'); // Ne jamais exposer le hash
      expect(prisma.session.create).toHaveBeenCalledOnce();
    });

    it('devrait rejeter si le PIN est incorrect', async () => {
      // Arrange — PIN correct est '123456', on teste avec '000000'
      prisma.user.findUnique.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(
        AuthService.login({ phoneNumber: '+237699000001', pin: '000000' })
      ).rejects.toThrow('Identifiants incorrects');
    });

    it('devrait rejeter si le compte est inactif', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(
        AuthService.login({ phoneNumber: '+237699000001', pin: '123456' })
      ).rejects.toThrow('Identifiants incorrects');
    });

    it('devrait rejeter si le numéro n\'existe pas', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        AuthService.login({ phoneNumber: '+237699999999', pin: '123456' })
      ).rejects.toThrow('Identifiants incorrects');
    });
  });

  // ── generateTokens() ──────────────────────────────────────
  describe('generateTokens()', () => {

    it('devrait générer des tokens JWT valides', () => {
      const { accessToken, refreshToken } = AuthService.generateTokens('user-uuid-001');

      // Vérifier que les tokens sont décodables
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      expect(decoded.sub).toBe('user-uuid-001');
      expect(decoded.type).toBe('access');

      expect(accessToken).toBeTruthy();
      expect(refreshToken).toBeTruthy();
      expect(accessToken).not.toBe(refreshToken);
    });
  });

  // ── sanitizeUser() ────────────────────────────────────────
  describe('sanitizeUser()', () => {

    it('ne doit jamais retourner le pinHash', () => {
      const safe = AuthService.sanitizeUser(mockUser);
      expect(safe).not.toHaveProperty('pinHash');
      expect(safe).toHaveProperty('id');
      expect(safe).toHaveProperty('phoneNumber');
    });
  });
});
