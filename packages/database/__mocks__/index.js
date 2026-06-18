const { vi } = require('vitest');

const prisma = {
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
    delete:      vi.fn(),
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
  $transaction: vi.fn((callback) => callback(prisma)),
};

// Compatible require et import
module.exports = prisma;
module.exports.default = prisma;
module.exports.prisma = prisma;