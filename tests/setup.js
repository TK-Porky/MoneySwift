import { vi } from 'vitest';
import path from 'path';

// Mock global de l'EventBus (pas de Redis dans les tests)
vi.mock('@moneyswift/events', () => ({
  default: {
    publish:   vi.fn().mockResolvedValue(true),
    subscribe: vi.fn().mockResolvedValue(true),
  },
}));

// Mock global de Prisma (@moneyswift/database)
// Les variables utilisées dans vi.mock doivent commencer par 'mock'
const mockPrisma = {
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
  $transaction: vi.fn((callback) => callback(mockPrisma)),
};

vi.mock('@moneyswift/database', () => {
  return {
    prisma: mockPrisma,
    default: mockPrisma,
  };
});

// Mock global du SMS provider
vi.mock('@moneyswift/integrations/sms', () => ({
  SmsProvider: {
    send: vi.fn().mockResolvedValue({ success: true, messageId: 'test-msg-id' }),
  },
}));

// Variables d'environnement de test
process.env.NODE_ENV        = 'test';
process.env.JWT_SECRET      = 'test_jwt_secret_min_32_characters_ok';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_min_32_chars_ok';
process.env.ENCRYPTION_KEY  = '4d6f6e65795377696674456e6372797074696f6e4b657931323334353637383930';
process.env.DATABASE_URL    = 'postgresql://ms_user:ms_secret@localhost:5432/moneyswift_test';
