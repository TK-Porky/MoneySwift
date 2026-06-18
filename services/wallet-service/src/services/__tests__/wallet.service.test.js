import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Decimal } from '@prisma/client/runtime/library';
import AppError from '@moneyswift/errors';

let prisma;
let WalletService;
import { resetPrismaMocks } from '../../../../../tests/helper/resetPrismaMocks.js';
import { injectServiceMocks } from '../../../../../tests/helper/injectServiceMocks.js';

let mockAccount;

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();
  mockAccount = { id: 'account-001', userId: 'user-001' };

  ({ default: prisma } = await import('@moneyswift/database'));
  // Ensure mock functions are reset to Vitest-backed implementations
  await resetPrismaMocks();
  const svcModule = await import('../wallet.service.js');
  WalletService = svcModule.default;
  await injectServiceMocks(svcModule, prisma);
});

const mockUserId = 'user-001';

describe('WalletService', () => {

  describe('getBalance()', () => {

    it('doit retourner le solde du wallet principal', async () => {
      prisma.account.findUnique.mockResolvedValue(mockAccount);
      prisma.wallet.findMany.mockResolvedValue([
        { id: 'w1', provider: 'MONEYSWIFT', balance: new Decimal(50000), isPrimary: true },
        { id: 'w2', provider: 'MTN',        balance: new Decimal(0),     isPrimary: false },
      ]);

      const result = await WalletService.getBalance(mockUserId);

      expect(result).toHaveProperty('totalBalance');
      expect(result.totalBalance).toBe(50000);
    });

    it('doit lever une erreur si le compte n\'existe pas', async () => {
      prisma.account.findUnique.mockResolvedValue(null);

      await expect(WalletService.getBalance(mockUserId)).rejects.toThrow();
    });
  });

  describe('linkOperator()', () => {

    it('doit créer un wallet si le provider n\'est pas encore lié', async () => {
      prisma.account.findUnique.mockResolvedValue(mockAccount);
      prisma.wallet.findFirst.mockResolvedValue(null);
      prisma.wallet.create.mockResolvedValue({ id: 'w3', provider: 'ORANGE' });

      const result = await WalletService.linkOperator({
        userId: mockUserId, provider: 'ORANGE', providerPhone: '+237655000001',
      });

      expect(prisma.wallet.create).toHaveBeenCalledOnce();
      expect(result.provider).toBe('ORANGE');
    });

    it('doit lever une erreur si le provider est déjà lié', async () => {
      prisma.account.findUnique.mockResolvedValue(mockAccount);
      prisma.wallet.findFirst.mockResolvedValue({ id: 'existing-wallet' });

      await expect(
        WalletService.linkOperator({ userId: mockUserId, provider: 'MTN', providerPhone: '+237699000001' })
      ).rejects.toThrow();
    });
  });

  describe('unlinkOperator()', () => {

    it('doit supprimer le wallet s\'il n\'est pas principal', async () => {
      prisma.account.findUnique.mockResolvedValue(mockAccount);
      prisma.wallet.findFirst.mockResolvedValue({ id: 'w2', isPrimary: false });
      if (!prisma.wallet.delete) prisma.wallet.delete = vi.fn();
      prisma.wallet.delete.mockResolvedValue({ id: 'w2' });

      await WalletService.unlinkOperator({ userId: mockUserId, walletId: 'w2' });

      expect(prisma.wallet.delete).toHaveBeenCalledOnce();
    });

    it('doit lever une erreur si on tente de supprimer le wallet principal', async () => {
      prisma.account.findUnique.mockResolvedValue(mockAccount);
      prisma.wallet.findFirst.mockResolvedValue({ id: 'w1', isPrimary: true });

      await expect(
        WalletService.unlinkOperator({ userId: mockUserId, walletId: 'w1' })
      ).rejects.toThrow();
    });
  });
});