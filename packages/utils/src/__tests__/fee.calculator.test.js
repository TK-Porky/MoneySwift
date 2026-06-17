import { describe, it, expect } from 'vitest';
import { calculateFee } from '../../fee.calculator.js';

describe('calculateFee()', () => {

  describe('DEPOSIT', () => {
    it('doit être gratuit jusqu\'à 5 000 XAF', () => {
      expect(calculateFee(100,   'DEPOSIT')).toBe(0);
      expect(calculateFee(5000,  'DEPOSIT')).toBe(0);
    });
    it('doit appliquer 0.5% entre 5 001 et 50 000 XAF', () => {
      expect(calculateFee(10000, 'DEPOSIT')).toBe(50);   // 10000 * 0.5%
      expect(calculateFee(50000, 'DEPOSIT')).toBe(250);  // 50000 * 0.5%
    });
    it('doit appliquer 0.3% entre 50 001 et 200 000 XAF', () => {
      expect(calculateFee(100000, 'DEPOSIT')).toBe(300); // 100000 * 0.3%
    });
    it('doit appliquer 0.2% au-delà de 200 000 XAF', () => {
      expect(calculateFee(500000, 'DEPOSIT')).toBe(1000); // 500000 * 0.2%
    });
  });

  describe('WITHDRAWAL', () => {
    it('doit facturer 100 XAF fixe jusqu\'à 5 000 XAF', () => {
      expect(calculateFee(1000, 'WITHDRAWAL')).toBe(100);
      expect(calculateFee(5000, 'WITHDRAWAL')).toBe(100);
    });
    it('doit appliquer 1% entre 5 001 et 50 000 XAF', () => {
      expect(calculateFee(10000, 'WITHDRAWAL')).toBe(100);
      expect(calculateFee(20000, 'WITHDRAWAL')).toBe(200);
    });
  });

  describe('TRANSFER', () => {
    it('doit facturer 50 XAF fixe jusqu\'à 5 000 XAF', () => {
      expect(calculateFee(100,  'TRANSFER')).toBe(50);
      expect(calculateFee(5000, 'TRANSFER')).toBe(50);
    });
    it('doit appliquer 0.8% entre 5 001 et 50 000 XAF', () => {
      expect(calculateFee(10000, 'TRANSFER')).toBe(80);
    });
    it('doit appliquer 0.5% entre 50 001 et 200 000 XAF', () => {
      expect(calculateFee(100000, 'TRANSFER')).toBe(500);
    });
    it('doit appliquer 0.3% au-delà de 200 000 XAF', () => {
      expect(calculateFee(300000, 'TRANSFER')).toBe(900);
    });
  });

  describe('Cas limites', () => {
    it('doit retourner 0 pour un type inconnu', () => {
      expect(calculateFee(10000, 'UNKNOWN')).toBe(0);
    });
    it('doit arrondir à l\'entier supérieur', () => {
      // 7777 * 0.8% = 62.216 → 63
      expect(calculateFee(7777, 'TRANSFER')).toBe(63);
    });
  });
});
