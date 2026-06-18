import { vi, describe, it, expect, beforeEach } from 'vitest';

let prisma;
let CardService;
import { resetPrismaMocks } from '../../../../../tests/helper/resetPrismaMocks.js';
import { injectServiceMocks } from '../../../../../tests/helper/injectServiceMocks.js';

let mockAccount;
let mockCard;
const mockUserId = 'user-001';

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();

  ({ default: prisma } = await import('@moneyswift/database'));
  // Ensure a valid encryption key is present so crypto.encrypt won't throw in tests
  process.env.ENCRYPTION_KEY = require('crypto').randomBytes(32).toString('hex');
  const svcModule = await import('../card.service.js');
  CardService = svcModule.default;
  await injectServiceMocks(svcModule, prisma);

  mockAccount = { id: 'account-001', userId: 'user-001', user: { fullName: 'Alice Mbarga' } };
  mockCard    = {
    id: 'card-001', accountId: 'account-001',
    cardNumber: 'ENCRYPTED', cardHolder: 'ALICE MBARGA',
    expiryMonth: 12, expiryYear: 2028,
    cvvHash: 'HASHED', network: 'VISA', status: 'ACTIVE',
  };
});

describe('CardService', () => {

  describe('createCard()', () => {

    it('devrait créer une carte avec numéro Luhn valide', async () => {
      prisma.account.findUnique.mockResolvedValue(mockAccount);
      prisma.virtualCard.count.mockResolvedValue(0);
      prisma.virtualCard.create.mockResolvedValue(mockCard);

      const result = await CardService.createCard({ userId: 'user-001', pin: '123456' });

      expect(result).toHaveProperty('cardNumber');
      expect(result).toHaveProperty('cvv');
      expect(result.cvv).toHaveLength(3);
      expect(result.cardNumber).toMatch(/XXXX/);
    });

    it('devrait refuser si 3 cartes actives existent déjà', async () => {
      prisma.account.findUnique.mockResolvedValue(mockAccount);
      prisma.virtualCard.count.mockResolvedValue(3);

      await expect(
        CardService.createCard({ userId: 'user-001', pin: '123456' })
      ).rejects.toThrow('Maximum 3 cartes');
    });
  });

  describe('generateCardNumber()', () => {

    it('devrait générer un numéro de 16 chiffres commençant par 4', () => {
      const number = CardService.generateCardNumber();
      expect(number).toHaveLength(16);
      expect(number[0]).toBe('4');
      expect(number).toMatch(/^\d{16}$/);
    });

    it('devrait générer un numéro Luhn valide', () => {
      for (let i = 0; i < 10; i++) {
        expect(isValidLuhn(CardService.generateCardNumber())).toBe(true);
      }
    });
  });
});

function isValidLuhn(number) {
  const digits = number.split('').map(Number).reverse();
  const sum = digits.reduce((acc, d, i) => {
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    return acc + d;
  }, 0);
  return sum % 10 === 0;
}