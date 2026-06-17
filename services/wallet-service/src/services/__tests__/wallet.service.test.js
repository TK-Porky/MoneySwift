import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '@moneyswift/database';
import walletService from '../wallet.service';
import AppError from '@moneyswift/errors/AppError';

console.log('PRISMA TYPE:', typeof prisma);
if (prisma) console.log('PRISMA KEYS:', Object.keys(prisma));

// Le mock de prisma est déjà défini dans tests/setup.js
// On peut y accéder directement via l'import de @moneyswift/database

describe('WalletService', () => {
  const mockUserId = 'user-123';
  const mockAccountId = 'account-456';
  const mockAccount = { id: mockAccountId, userId: mockUserId };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBalance()', () => {
    it('doit calculer le solde total et identifier le wallet principal', async () => {
      prisma.account.findUnique.mockResolvedValue(mockAccount);
      prisma.wallet.findMany.mockResolvedValue([
        { id: 'w1', provider: 'MONEYSWIFT', balance: { toNumber: () => 10000 }, isPrimary: true },
        { id: 'w2', provider: 'MTN', balance: { toNumber: () => 5000 }, isPrimary: false }
      ]);

      const result = await walletService.getBalance(mockUserId);

      expect(result.totalBalance).toBe(15000);
      expect(result.primaryBalance).toBe(10000);
      expect(result.wallets).toHaveLength(2);
      expect(prisma.account.findUnique).toHaveBeenCalledWith({ where: { userId: mockUserId } });
    });

    it('doit lever une erreur si le compte n\'existe pas', async () => {
      prisma.account.findUnique.mockResolvedValue(null);

      await expect(walletService.getBalance(mockUserId)).rejects.toThrow(AppError);
    });
  });

  describe('linkOperator()', () => {
    it('doit créer un nouveau wallet si le provider n\'est pas encore lié', async () => {
      prisma.account.findUnique.mockResolvedValue(mockAccount);
      prisma.wallet.findFirst.mockResolvedValue(null);
      prisma.wallet.create.mockResolvedValue({ id: 'w3', provider: 'ORANGE' });

      const result = await walletService.linkOperator(mockUserId, {
        provider: 'ORANGE',
        providerPhone: '+237699000001'
      });

      expect(result.provider).toBe('ORANGE');
      expect(prisma.wallet.create).toHaveBeenCalled();
    });

    it('doit lever une erreur si le provider est déjà lié', async () => {
      prisma.account.findUnique.mockResolvedValue(mockAccount);
      prisma.wallet.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(walletService.linkOperator(mockUserId, {
        provider: 'MTN',
        providerPhone: '+237677000001'
      })).rejects.toThrow('déjà lié');
    });
  });

  describe('unlinkOperator()', () => {
    it('doit supprimer le wallet s\'il existe et n\'est pas principal', async () => {
      prisma.account.findUnique.mockResolvedValue(mockAccount);
      prisma.wallet.findFirst.mockResolvedValue({ id: 'w2', isPrimary: false });
      prisma.wallet.delete.mockResolvedValue({ id: 'w2' });

      const result = await walletService.unlinkOperator(mockUserId, 'w2');

      expect(result.message).toContain('succès');
      expect(prisma.wallet.delete).toHaveBeenCalledWith({ where: { id: 'w2' } });
    });

    it('doit lever une erreur si on tente de supprimer le wallet principal', async () => {
      prisma.account.findUnique.mockResolvedValue(mockAccount);
      prisma.wallet.findFirst.mockResolvedValue({ id: 'w1', isPrimary: true });

      await expect(walletService.unlinkOperator(mockUserId, 'w1')).rejects.toThrow('Impossible de délier le portefeuille principal');
    });
  });
});
