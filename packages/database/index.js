const { PrismaClient } = require('@prisma/client');

let prisma;

// Avoid instantiating a real PrismaClient during tests to prevent DB connections
// Tests provide a mock via `vi.mock('@moneyswift/database', ...)` in tests/setup.js
if (process.env.NODE_ENV !== 'test') {
	prisma = new PrismaClient();
} else {
  // In test environment, build a safe mock shape so modules imported
  // before the test setup can still call/mock methods like
  // `prisma.user.findUnique.mockResolvedValue(...)`.
  // Build a lightweight mock factory so tests can call `.mockResolvedValue(...)`,
  // `.mockImplementation(...)` and assertions like `.toHaveBeenCalled()` even if
  // `vitest` helpers are not yet available at module instantiation time.
  function createMockFn() {
    // If Vitest's `vi` is available globally, prefer using it so mocks
    // behave identically across modules and expose full mock APIs.
    if (typeof globalThis.vi === 'function' || typeof globalThis.vi === 'object') {
      return globalThis.vi.fn();
    }

    const fn = function (...args) {
      fn.mock.calls.push(args);
      if (fn._impl) return fn._impl(...args);
      if (fn._queue && fn._queue.length) {
        const item = fn._queue.shift();
        if (item.type === 'resolved') return Promise.resolve(item.value);
        if (item.type === 'return') return item.value;
      }
      if (fn._resolved !== undefined) return Promise.resolve(fn._resolved);
      if (fn._returned !== undefined) return fn._returned;
      return undefined;
    };
    fn.mock = { calls: [] };
    fn.mockResolvedValue = (v) => { fn._resolved = v; return fn; };
    fn.mockResolvedValueOnce = (v) => { fn._queue = fn._queue || []; fn._queue.push({ type: 'resolved', value: v }); return fn; };
    fn.mockReturnValue = (v) => { fn._returned = v; return fn; };
    fn.mockImplementation = (impl) => { fn._impl = impl; return fn; };
    fn.mockClear = () => { fn.mock.calls.length = 0; return fn; };
    return fn;
  }

  const makeFn = createMockFn;

  prisma = {
    user: {
      findUnique:  makeFn(),
      findFirst:   makeFn(),
      findMany:    makeFn(),
      create:      makeFn(),
      update:      makeFn(),
      delete:      makeFn(),
      count:       makeFn(),
    },
    session: {
      findUnique:  makeFn(),
      findFirst:   makeFn(),
      findMany:    makeFn(),
      create:      makeFn(),
      update:      makeFn(),
      delete:      makeFn(),
      deleteMany:  makeFn(),
    },
    account: {
      findUnique:  makeFn(),
      findFirst:   makeFn(),
      create:      makeFn(),
      update:      makeFn(),
    },
    wallet: {
      findUnique:  makeFn(),
      findFirst:   makeFn(),
      findMany:    makeFn(),
      create:      makeFn(),
      update:      makeFn(),
      delete:      makeFn(),
    },
    transaction: {
      findUnique:  makeFn(),
      findFirst:   makeFn(),
      findMany:    makeFn(),
      create:      makeFn(),
      update:      makeFn(),
      count:       makeFn(),
    },
    virtualCard: {
      findUnique:  makeFn(),
      findFirst:   makeFn(),
      findMany:    makeFn(),
      create:      makeFn(),
      update:      makeFn(),
      count:       makeFn(),
    },
    otpCode: {
      findFirst:   makeFn(),
      create:      makeFn(),
      update:      makeFn(),
      deleteMany:  makeFn(),
    },
    notification: {
      findMany:    makeFn(),
      create:      makeFn(),
      update:      makeFn(),
      updateMany:  makeFn(),
      delete:      makeFn(),
      count:       makeFn(),
    },
    $transaction: undefined,
  };

  // Provide a mockable $transaction function with a sensible default
  const txFn = makeFn();
  if (typeof txFn.mockImplementation === 'function') {
    txFn.mockImplementation((callback) => {
      if (typeof callback === 'function') return callback(prisma);
      return Promise.resolve(callback);
    });
  } else {
    txFn._impl = (callback) => {
      if (typeof callback === 'function') return callback(prisma);
      return Promise.resolve(callback);
    };
  }
  prisma.$transaction = txFn;
}

module.exports = prisma;
module.exports.default = prisma;
module.exports.prisma = prisma;
