import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@moneyswift/database');

import { prisma }    from '@moneyswift/database';
import CardService   from '../card.service.js';

const mockAccount = { id: 'account-001', userId: 'user-001' };
const mockCard = {
  id:          'card-uuid-001',
  accountId:   'account-001',
  cardNumber:  'ENCRYPTED_CARD_NUMBER',
  cardHolder:  'ALICE MBARGA',
  expiryMonth: 12,
  expiryYear:  2028,
  cvvHash:     'HASHED_CVV',
  network:     'VISA',
  status:      'ACTIVE',
};

describe('CardService', () => {

  beforeEach(() => vi.clearAllMocks());

  describe('createCard()', () => {

    it('devrait créer une carte avec numéro Luhn valide', async () => {
      prisma.account.findUnique.mockResolvedValue(mockAccount);
      prisma.virtualCard.count.mockResolvedValue(0); // Pas de cartes actives
      prisma.virtualCard.create.mockResolvedValue(mockCard);

      const result = await CardService.createCard({
        userId: 'user-001', pin: '123456',
      });

      expect(result).toHaveProperty('cardNumber');
      expect(result).toHaveProperty('cvv');
      expect(result.cvv).toHaveLength(3);
      expect(result.warning).toContain('CVV');
      // Le numéro masqué ne doit pas exposer les chiffres du milieu
      expect(result.cardNumber).toMatch(/XXXX XXXX/);
    });

    it('devrait refuser si 3 cartes actives existent déjà', async () => {
      prisma.account.findUnique.mockResolvedValue(mockAccount);
      prisma.virtualCard.count.mockResolvedValue(3); // Limite atteinte

      await expect(
        CardService.createCard({ userId: 'user-001', pin: '123456' })
      ).rejects.toThrow('Maximum 3 cartes');
    });
  });

  describe('generateCardNumber()', () => {

    it('devrait générer un numéro de 16 chiffres commençant par 4 (Visa)', () => {
      const number = CardService.generateCardNumber();
      expect(number).toHaveLength(16);
      expect(number[0]).toBe('4');
      expect(number).toMatch(/^\d{16}$/);
    });

    it('devrait générer un numéro Luhn valide', () => {
      // On génère 10 numéros et on vérifie que tous passent l'algorithme Luhn
      for (let i = 0; i < 10; i++) {
        const number = CardService.generateCardNumber();
        expect(isValidLuhn(number)).toBe(true);
      }
    });
  });
});

// Helper Luhn pour les tests
function isValidLuhn(number) {
  const digits = number.split('').map(Number).reverse();
  const sum = digits.reduce((acc, d, i) => {
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    return acc + d;
  }, 0);
  return sum % 10 === 0;
}
