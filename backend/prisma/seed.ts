// prisma/seed.ts
// Seed script to initialize KMI-30 with sample data

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const KMI30_COMPANIES = [
  {
    symbol: 'PSEL',
    name: 'Pakistan Stock Exchange Limited',
    sector: 'Financial Services',
  },
  {
    symbol: 'UNITY',
    name: 'Unilever Pakistan Limited',
    sector: 'Consumer Goods',
  },
  {
    symbol: 'HBL',
    name: 'HBL - The Hongkong and Shanghai Banking Corporation Limited',
    sector: 'Banking',
  },
  {
    symbol: 'SBL',
    name: 'Soneri Bank Limited',
    sector: 'Banking',
  },
  {
    symbol: 'TRG',
    name: 'Tariq Glass Limited',
    sector: 'Manufacturing',
  },
  {
    symbol: 'LUCK',
    name: 'Lucky Cement Limited',
    sector: 'Cement',
  },
  {
    symbol: 'PPL',
    name: 'Pakistan Petroleum Limited',
    sector: 'Oil & Gas',
  },
  {
    symbol: 'OGDC',
    name: 'Oil and Gas Development Company Limited',
    sector: 'Oil & Gas',
  },
  {
    symbol: 'MCB',
    name: 'MCB Bank Limited',
    sector: 'Banking',
  },
  {
    symbol: 'SNGPL',
    name: 'Sui Northern Gas Pipelines Limited',
    sector: 'Energy',
  },
];

async function main() {
  console.log('🌱 Seeding KMI-30 companies...');

  for (const company of KMI30_COMPANIES) {
    const created = await prisma.company.upsert({
      where: { symbol: company.symbol },
      update: {},
      create: {
        symbol: company.symbol,
        name: company.name,
        sector: company.sector,
        shortName: company.symbol,
      },
    });

    console.log(`✓ Created ${created.symbol}`);
  }

  // Add some to KMI-30 index
  console.log('\n📈 Adding to KMI-30 index...');
  for (let i = 0; i < Math.min(10, KMI30_COMPANIES.length); i++) {
    const company = await prisma.company.findUnique({
      where: { symbol: KMI30_COMPANIES[i].symbol },
    });

    if (company) {
      await prisma.kMI30Index.upsert({
        where: { companyId: company.id },
        update: {},
        create: {
          companyId: company.id,
          ranking: i + 1,
          weight: 100 / 30,
        },
      });
      console.log(`✓ Added ${company.symbol} to KMI-30 (rank ${i + 1})`);
    }
  }

  // Create a test user
  console.log('\n👤 Creating test user...');
  const user = await prisma.user.upsert({
    where: { email: 'admin@kmi30.local' },
    update: {},
    create: {
      email: 'admin@kmi30.local',
      password: 'hashed_password_here', // In production, use bcrypt
      name: 'Admin User',
      role: 'ADMIN',
      tier: 'INSTITUTIONAL',
      subscription: {
        create: {
          tier: 'INSTITUTIONAL',
          maxMemos: 1000,
          maxAlerts: 100,
          features: ['all'],
        },
      },
    },
  });

  console.log(`✓ Created user: ${user.email}`);

  console.log('\n✅ Seeding complete!');
  console.log(
    'Test credentials: admin@kmi30.local (update password in database)',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
