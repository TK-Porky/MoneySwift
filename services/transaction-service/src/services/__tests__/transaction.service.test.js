import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Decimal } from '@prisma/client/runtime/library';

vi.mock('@moneyswift/database');
vi.mock('@moneyswift/events');

import { prisma }           from '@moneyswift/database';
import TransactionService   from '../transaction.service.js';

// ── Fixtures ───────────────────────────────────────────────
const mockSenderWallet = {
  id:        'wallet-sender-001',
  accountId: 'account-001',
  provider:  'MONEYSWIFT',
  balance:   new Decimal(50000),
  isPrimary: true,
  account:   { userId: 'user-001' },
};

const mockReceiverWallet = {
  id:        'wallet-receiver-002',
  accountId: 'account-002',
  provider:  'MONEYSWIFT',
  balance:   new Decimal(10000),
  isPrimary: true,
  account:   { userId: 'user-002' },
};

const mockTransaction = {
  id:        'txn-uuid-001',
  reference: 'TRF-20251217-X4K9P',
  type:      'TRANSFER',
  status:    'SUCCESS',
  amount:    new Decimal(5000),
  fee:       new Decimal(50),
};

describe('TransactionService', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── transfer() ────────────────────────────────────────────
  describe('transfer()', () => {

    it('devrait effectuer un transfert entre deux wallets avec succès', async () => {
      // Arrange
      prisma.wallet.findFirst
        .mockResolvedValueOnce(mockSenderWallet)   // getUserPrimaryWallet (sender)
        .mockResolvedValueOnce(mockReceiverWallet); // getWalletByPhone (receiver)

      prisma.$transaction.mockImplementation(async (callback) => {
        prisma.wallet.update.mockResolvedValue({});
        prisma.transaction.create.mockResolvedValue(mockTransaction);
        return callback(prisma);
      });

      // Act
      const result = await TransactionService.transfer({
        senderId:    'user-001',
        toPhone:     '+237677000002',
        amount:      5000,
        pin:         '123456',
        description: 'Test transfert',
      });

      // Assert
      expect(result.status).toBe('SUCCESS');
      expect(result.reference).toMatch(/^TRF-/);
      // Vérifier que le wallet a bien été débité ET crédité
      expect(prisma.wallet.update).toHaveBeenCalledTimes(2);
      expect(prisma.transaction.create).toHaveBeenCalledOnce();
    });

    it('devrait rejeter si le solde est insuffisant', async () => {
      // Wallet avec solde insuffisant (100 XAF, transfert de 5000)
      const poorWallet = { ...mockSenderWallet, balance: new Decimal(100) };
      prisma.wallet.findFirst.mockResolvedValue(poorWallet);

      await expect(
        TransactionService.transfer({ senderId: 'user-001', toPhone: '+237677000002',
          amount: 5000, pin: '123456' })
      ).rejects.toThrow('Solde insuffisant');
    });

    it('devrait rejeter si l\'expéditeur et le destinataire sont identiques', async () => {
      // Même wallet pour sender et receiver
      prisma.wallet.findFirst.mockResolvedValue(mockSenderWallet);

      await expect(
        TransactionService.transfer({ senderId: 'user-001', toPhone: '+237699000001',
          amount: 1000, pin: '123456' })
      ).rejects.toThrow('vous ne pouvez pas');
    });

    it('devrait rejeter si le destinataire n\'existe pas', async () => {
      prisma.wallet.findFirst
        .mockResolvedValueOnce(mockSenderWallet)
        .mockResolvedValueOnce(null); // Destinataire introuvable

      await expect(
        TransactionService.transfer({ senderId: 'user-001', toPhone: '+237600000000',
          amount: 1000, pin: '123456' })
      ).rejects.toThrow();
    });

    it('devrait rejeter un montant inférieur à 100 XAF', async () => {
      prisma.wallet.findFirst.mockResolvedValue(mockSenderWallet);

      await expect(
        TransactionService.transfer({ senderId: 'user-001', toPhone: '+237677000002',
          amount: 50, pin: '123456' })
      ).rejects.toThrow();
    });
  });

  // ── getHistory() ──────────────────────────────────────────
  describe('getHistory()', () => {

    it('devrait retourner les transactions paginées', async () => {
      const mockTxns = [mockTransaction, { ...mockTransaction, id: 'txn-002' }];
      prisma.wallet.findFirst.mockResolvedValue(mockSenderWallet);
      prisma.transaction.findMany.mockResolvedValue(mockTxns);
      prisma.transaction.count.mockResolvedValue(2);

      const result = await TransactionService.getHistory({
        userId: 'user-001', page: 1, limit: 20,
      });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('devrait filtrer par type de transaction', async () => {
      prisma.wallet.findFirst.mockResolvedValue(mockSenderWallet);
      prisma.transaction.findMany.mockResolvedValue([mockTransaction]);
      prisma.transaction.count.mockResolvedValue(1);

      await TransactionService.getHistory({
        userId: 'user-001', type: 'TRANSFER'
      });

      // Vérifier que le filtre `type` a été passé à Prisma
      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'TRANSFER' })
        })
      );
    });
  });
});
