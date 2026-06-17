function generateRef(prefix = 'TXN') {
  const date = new Date().toISOString().slice(0,10).replace(/-/g,'');
  const rand  = Math.random().toString(36).slice(2,7).toUpperCase();
  return `${prefix}-${date}-${rand}`;   // Ex: TRF-20251217-X4K9P
}

module.exports = { generateRef };