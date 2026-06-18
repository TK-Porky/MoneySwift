let prisma = require('@moneyswift/database');
const AppError = require('@moneyswift/errors');

class AccountService {
  async getMyAccount(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        account: {
          include: {
            wallets: true
          }
        }
      }
    });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    const { pinHash, ...safeUser } = user;
    return safeUser;
  }

  async updateAccount(userId, data) {
    const { fullName, email, profilePhoto } = data;
    
    return prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        email,
        profilePhoto
      },
      select: {
        id: true,
        phoneNumber: true,
        email: true,
        fullName: true,
        profilePhoto: true,
        kycStatus: true,
        isActive: true,
        updatedAt: true
      }
    });
  }

  async submitKyc(userId, kycData) {
    // Dans une app réelle, on gérerait l'upload de fichiers
    return prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: 'PENDING'
      },
      select: {
        id: true,
        kycStatus: true,
        updatedAt: true
      }
    });
  }
}

const instance = new AccountService();
module.exports = instance;
module.exports.__setPrisma = (p) => { prisma = p; };
