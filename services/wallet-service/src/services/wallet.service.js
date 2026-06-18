let prisma = require('@moneyswift/database');
const AppError = require('@moneyswift/errors/AppError');

class WalletService {
  async getWallets(userId) {
    const account = await this.getUserAccount(userId);
    return prisma.wallet.findMany({
      where: { accountId: account.id }
    });
  }

  async getBalance(userId) {
    const account = await this.getUserAccount(userId);
    const wallets = await prisma.wallet.findMany({
      where: { accountId: account.id }
    });

    const totalBalance = wallets.reduce((acc, wallet) => acc + wallet.balance.toNumber(), 0);
    const primaryWallet = wallets.find(w => w.isPrimary);

    return {
      totalBalance,
      currency: 'XAF',
      primaryBalance: primaryWallet ? primaryWallet.balance.toNumber() : 0,
      wallets: wallets.map(w => ({
        id: w.id,
        provider: w.provider,
        balance: w.balance.toNumber(),
        isPrimary: w.isPrimary
      }))
    };
  }

  async linkOperator({ userId, provider, providerPhone }) {
    const account = await this.getUserAccount(userId);
    
    // Vérifier si un wallet pour ce provider existe déjà
    const existing = await prisma.wallet.findFirst({
      where: { accountId: account.id, provider }
    });

    if (existing) {
      throw new AppError(`Un portefeuille ${provider} est déjà lié à ce compte`, 400);
    }

    return prisma.wallet.create({
      data: {
        accountId: account.id,
        provider,
        providerPhone,
        balance: 0,
        isPrimary: false
      }
    });
  }

  async unlinkOperator({ userId, walletId }) {
    const account = await this.getUserAccount(userId);
    const wallet = await prisma.wallet.findFirst({
      where: { id: walletId, accountId: account.id }
    });

    if (!wallet) throw new AppError('Portefeuille non trouvé', 404);
    if (wallet.isPrimary) throw new AppError('Impossible de délier le portefeuille principal', 400);

    await prisma.wallet.delete({ where: { id: walletId } });
    return { message: 'Portefeuille délié avec succès' };
  }

  async getUserAccount(userId) {
    const account = await prisma.account.findUnique({ where: { userId } });
    if (!account) throw new AppError('Compte non trouvé', 404);
    return account;
  }
}

const instance = new WalletService();
module.exports = instance;
module.exports.__setPrisma = (p) => { prisma = p; };
