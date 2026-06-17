const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clean DB
  await prisma.notification.deleteMany();
  await prisma.virtualCard.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.user.deleteMany();

  const pinHash = await bcrypt.hash('123456', 12);

  // 1. Users
  const alice = await prisma.user.create({
    data: {
      phoneNumber: '+237699000001',
      fullName: 'Alice Mbarga',
      pinHash,
      email: 'alice@example.com',
      isActive: true,
      kycStatus: 'VERIFIED'
    }
  });

  const bob = await prisma.user.create({
    data: {
      phoneNumber: '+237677000002',
      fullName: 'Bob Tchinda',
      pinHash,
      email: 'bob@example.com',
      isActive: true,
      kycStatus: 'PENDING'
    }
  });

  // 2. Accounts & Wallets
  const aliceAccount = await prisma.account.create({
    data: {
      userId: alice.id,
      accountNumber: 'MS-2026-000001',
      accountType: 'PERSONAL'
    }
  });

  const aliceWallet = await prisma.wallet.create({
    data: {
      accountId: aliceAccount.id,
      provider: 'MONEYSWIFT',
      balance: 50000.00,
      isPrimary: true
    }
  });

  const bobAccount = await prisma.account.create({
    data: {
      userId: bob.id,
      accountNumber: 'MS-2026-000002',
      accountType: 'PERSONAL'
    }
  });

  const bobWallet = await prisma.wallet.create({
    data: {
      accountId: bobAccount.id,
      provider: 'MONEYSWIFT',
      balance: 50000.00,
      isPrimary: true
    }
  });

  // 3. Transactions
  await prisma.transaction.create({
    data: {
      reference: 'DEP-20260617-TEST1',
      type: 'DEPOSIT',
      status: 'SUCCESS',
      amount: 10000.00,
      receiverWalletId: aliceWallet.id,
      completedAt: new Date()
    }
  });

  await prisma.transaction.create({
    data: {
      reference: 'TRF-20260617-TEST2',
      type: 'TRANSFER',
      status: 'SUCCESS',
      amount: 5000.00,
      fee: 50.00,
      senderWalletId: aliceWallet.id,
      receiverWalletId: bobWallet.id,
      completedAt: new Date()
    }
  });

  // 4. Virtual Cards
  await prisma.virtualCard.create({
    data: {
      accountId: aliceAccount.id,
      cardNumber: '4000 0000 0000 1234', // In real it should be encrypted, but for seed it depends if we use decrypt
      cardHolder: 'Alice Mbarga',
      expiryMonth: 6,
      expiryYear: 2029,
      cvvHash: await bcrypt.hash('123', 12),
      status: 'ACTIVE'
    }
  });

  // 5. Notifications
  await prisma.notification.create({
    data: {
      userId: alice.id,
      type: 'TRANSACTION',
      title: 'Argent reçu ✅',
      body: 'Vous avez reçu 10 000 XAF par dépôt.',
      channel: 'IN_APP',
      isRead: false
    }
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
