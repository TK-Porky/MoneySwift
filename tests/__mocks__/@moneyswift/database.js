import { vi } from 'vitest';

console.log('LOADING PRISMA MOCK');

// Mock complet du client Prisma
// Chaque test redéfinit les valeurs de retour via vi.mocked(prisma.xxx.yyy).mockResolvedValue(...)
export const prisma = {
  user: {
    findUnique:  vi.fn(),
    findFirst:   vi.fn(),
    findMany:    vi.fn(),
    create:      vi.fn(),
    update:      vi.fn(),
    delete:      vi.fn(),
    count:       vi.fn(),
  },
  session: {
    findUnique:  vi.fn(),
    findFirst:   vi.fn(),
    findMany:    vi.fn(),
    create:      vi.fn(),
    update:      vi.fn(),
    delete:      vi.fn(),
    deleteMany:  vi.fn(),
  },
  account: {
    findUnique:  vi.fn(),
    findFirst:   vi.fn(),
    create:      vi.fn(),
    update:      vi.fn(),
  },
  wallet: {
    findUnique:  vi.fn(),
    findFirst:   vi.fn(),
    findMany:    vi.fn(),
    create:      vi.fn(),
    update:      vi.fn(),
  },
  transaction: {
    findUnique:  vi.fn(),
    findFirst:   vi.fn(),
    findMany:    vi.fn(),
    create:      vi.fn(),
    update:      vi.fn(),
    count:       vi.fn(),
  },
  virtualCard: {
    findUnique:  vi.fn(),
    findFirst:   vi.fn(),
    findMany:    vi.fn(),
    create:      vi.fn(),
    update:      vi.fn(),
    count:       vi.fn(),
  },
  otpCode: {
    findFirst:   vi.fn(),
    create:      vi.fn(),
    update:      vi.fn(),
    deleteMany:  vi.fn(),
  },
  notification: {
    findMany:    vi.fn(),
    create:      vi.fn(),
    update:      vi.fn(),
    updateMany:  vi.fn(),
    delete:      vi.fn(),
    count:       vi.fn(),
  },
  // Transaction DB atomique
  $transaction: vi.fn((callback) => callback(prisma)),
};

export default prisma;
