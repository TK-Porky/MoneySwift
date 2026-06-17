const FEE_GRID = {
  DEPOSIT: [
    { max: 5_000,   fee: 0 },        // Dépôt gratuit jusqu'à 5000 XAF
    { max: 50_000,  rate: 0.005 },   // 0.5%
    { max: 200_000, rate: 0.003 },   // 0.3%
    { max: Infinity, rate: 0.002 },  // 0.2%
  ],
  WITHDRAWAL: [
    { max: 5_000,   fee: 100 },
    { max: 50_000,  rate: 0.01 },    // 1%
    { max: 200_000, rate: 0.008 },   // 0.8%
    { max: Infinity, rate: 0.005 },  // 0.5%
  ],
  TRANSFER: [
    { max: 5_000,   fee: 50 },
    { max: 50_000,  rate: 0.008 },
    { max: 200_000, rate: 0.005 },
    { max: Infinity, rate: 0.003 },
  ],
};

function calculateFee(amount, type) {
  const grid  = FEE_GRID[type] ?? FEE_GRID.TRANSFER;
  const tier  = grid.find(t => amount <= t.max);
  if (!tier) return 0;
  return tier.fee !== undefined ? tier.fee : Math.ceil(amount * tier.rate);
}

module.exports = { calculateFee, FEE_GRID };