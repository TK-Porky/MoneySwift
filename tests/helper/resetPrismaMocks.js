export async function resetPrismaMocks() {
  const { default: prisma } = await import('@moneyswift/database');

  // Réinitialise toutes les mock functions custom
  const reset = (fn) => {
    if (!fn || typeof fn !== 'function') return;
    if (fn.mock && Array.isArray(fn.mock.calls)) fn.mock.calls.length = 0;
    fn._resolved  = undefined;
    fn._returned  = undefined;
    fn._impl      = undefined;
    fn._queue     = [];
  };

  // Reset $transaction avec son impl par défaut
  reset(prisma.$transaction);
  if (prisma.$transaction) {
    prisma.$transaction._impl = (callback) => {
      if (typeof callback === 'function') return callback(prisma);
      return Promise.resolve(callback);
    };
  }

  Object.values(prisma).forEach((model) => {
    if (model && typeof model === 'object') {
      Object.values(model).forEach(reset);
    }
  });
}