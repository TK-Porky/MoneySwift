import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Decimal } from '@prisma/client/runtime/library';

let prisma;
let TransactionService;
import { resetPrismaMocks } from '../../../../../tests/helper/resetPrismaMocks.js';
import { injectServiceMocks } from '../../../../../tests/helper/injectServiceMocks.js';

// ── Fixtures recréées dans beforeEach ──────────────────────────────
let mockSenderWallet;
let mockReceiverWallet;
let mockTransaction;
let mockAccount;
const mockUserId = 'user-001';

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();

  // Re-import the shared prisma mock and transaction service, then inject
  ({ default: prisma } = await import('@moneyswift/database'));
  const svcModule = await import('../transaction.service.js');
  TransactionService = svcModule.default;
  await injectServiceMocks(svcModule, prisma);

  mockSenderWallet = {
    id:        'wallet-sender-001',
    accountId: 'account-001',
    provider:  'MONEYSWIFT',
    balance:   new Decimal(50000),
    isPrimary: true,
    account:   { userId: 'user-001' },
  };

  mockReceiverWallet = {
    id:        'wallet-receiver-002',
    accountId: 'account-002',
    provider:  'MONEYSWIFT',
    balance:   new Decimal(10000),
    isPrimary: true,
    account:   { userId: 'user-002' },
  };

  mockTransaction = {
    id:        'txn-uuid-001',
    reference: 'TRF-20251217-X4K9P',
    type:      'TRANSFER',
    status:    'SUCCESS',
    amount:    new Decimal(5000),
    fee:       new Decimal(50),
  };
});

describe('TransactionService', () => {

  describe('transfer()', () => {

    it('devrait effectuer un transfert entre deux wallets avec succès', async () => {
      prisma.wallet.findFirst
        .mockResolvedValueOnce(mockSenderWallet)
        .mockResolvedValueOnce(mockReceiverWallet);

      prisma.$transaction.mockImplementation(async (callback) => {
        prisma.wallet.update.mockResolvedValue({});
        prisma.transaction.create.mockResolvedValue(mockTransaction);
        return callback(prisma);
      });

      const result = await TransactionService.transfer({
        senderId:    'user-001',
        toPhone:     '+237677000002',
        amount:      5000,
        pin:         '123456',
        description: 'Test',
      });

      expect(result.status).toBe('SUCCESS');
      expect(result.reference).toMatch(/^TRF-/);
      expect(prisma.wallet.update).toHaveBeenCalledTimes(2);
    });

    it('devrait rejeter si le solde est insuffisant', async () => {
      const poorWallet = { ...mockSenderWallet, balance: new Decimal(100) };
      prisma.wallet.findFirst.mockResolvedValue(poorWallet);

      await expect(
        TransactionService.transfer({ senderId: 'user-001', toPhone: '+237677000002', amount: 5000, pin: '123456' })
      ).rejects.toThrow('Solde insuffisant');
    });

    it('devrait rejeter si le destinataire n\'existe pas', async () => {
      prisma.wallet.findFirst
        .mockResolvedValueOnce(mockSenderWallet)
        .mockResolvedValueOnce(null);

      await expect(
        TransactionService.transfer({ senderId: 'user-001', toPhone: '+237600000000', amount: 1000, pin: '123456' })
      ).rejects.toThrow();
    });

    it('devrait rejeter un montant inférieur à 100 XAF', async () => {
      prisma.wallet.findFirst.mockResolvedValue(mockSenderWallet);

      await expect(
        TransactionService.transfer({ senderId: 'user-001', toPhone: '+237677000002', amount: 50, pin: '123456' })
      ).rejects.toThrow();
    });
  });

  describe('getHistory()', () => {

    it('devrait retourner les transactions paginées', async () => {
      prisma.wallet.findFirst.mockResolvedValue(mockSenderWallet);
      prisma.transaction.findMany.mockResolvedValue([mockTransaction]);
      prisma.transaction.count.mockResolvedValue(1);

      const result = await TransactionService.getHistory({ userId: 'user-001', page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('devrait filtrer par type de transaction', async () => {
      prisma.wallet.findFirst.mockResolvedValue(mockSenderWallet);
      prisma.transaction.findMany.mockResolvedValue([mockTransaction]);
      prisma.transaction.count.mockResolvedValue(1);

      await TransactionService.getHistory({ userId: 'user-001', type: 'TRANSFER' });

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'TRANSFER' }),
        })
      );
    });
  });
});