import 'dotenv/config';
import { prisma } from '../src/db.js';
import { hashPassword } from '../src/utils/password.js';

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.winner.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.raffle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organisation.deleteMany();
  await prisma.setting.deleteMany();

  // Create organisations
  const springfield = await prisma.organisation.create({
    data: {
      name: 'Springfield Elementary School',
      slug: 'springfield-school',
      primaryColour: '#2563EB',
      secondaryColour: '#16A34A',
      customText: JSON.stringify({
        welcomeTitle: 'Welcome to Springfield School Raffles!',
        welcomeMessage: 'Support our school by entering our exciting raffles.',
      }),
    },
  });

  const shelbyville = await prisma.organisation.create({
    data: {
      name: 'Shelbyville Sports Club',
      slug: 'shelbyville-sports',
      primaryColour: '#DC2626',
      secondaryColour: '#F59E0B',
      customText: JSON.stringify({
        welcomeTitle: 'Shelbyville Sports Club Raffles',
        welcomeMessage: 'Win amazing prizes and support local sports!',
      }),
    },
  });

  // Create users
  const superAdminHash = await hashPassword('admin123');
  const orgAdminHash = await hashPassword('orgadmin123');

  await prisma.user.create({
    data: {
      email: 'admin@raffletickets.com',
      passwordHash: superAdminHash,
      name: 'Super Admin',
      role: 'super_admin',
    },
  });

  await prisma.user.create({
    data: {
      email: 'principal@springfield.edu',
      passwordHash: orgAdminHash,
      name: 'Principal Skinner',
      role: 'org_admin',
      organisationId: springfield.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'coach@shelbyville.com',
      passwordHash: orgAdminHash,
      name: 'Coach Johnson',
      role: 'org_admin',
      organisationId: shelbyville.id,
    },
  });

  // Create raffles
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const summerRaffle = await prisma.raffle.create({
    data: {
      organisationId: springfield.id,
      title: 'Summer Fete Grand Raffle',
      description: 'Our annual summer raffle with amazing prizes donated by local businesses. All proceeds go towards new playground equipment.',
      prizeInfo: '1st: iPad Air, 2nd: £100 Amazon Voucher, 3rd: Hamper of Treats',
      ticketPrice: 2.50,
      maxTickets: 500,
      drawDate: nextMonth,
      status: 'active',
    },
  });

  await prisma.raffle.create({
    data: {
      organisationId: springfield.id,
      title: 'Christmas Hamper Draw',
      description: 'Win a luxury Christmas hamper filled with festive goodies!',
      prizeInfo: '1st: Luxury Christmas Hamper worth £150',
      ticketPrice: 1.00,
      maxTickets: 200,
      drawDate: nextWeek,
      status: 'draft',
    },
  });

  await prisma.raffle.create({
    data: {
      organisationId: shelbyville.id,
      title: 'Match Day Raffle',
      description: 'Enter our match day raffle for a chance to win signed memorabilia and exclusive experiences.',
      prizeInfo: '1st: Signed Jersey, 2nd: VIP Match Day Experience, 3rd: Club Shop Voucher',
      ticketPrice: 5.00,
      maxTickets: 300,
      drawDate: nextMonth,
      status: 'active',
    },
  });

  // Create some sample tickets for the summer raffle
  const ticketBuyers = [
    { name: 'Homer Simpson', email: 'homer@example.com', qty: 5 },
    { name: 'Marge Simpson', email: 'marge@example.com', qty: 3 },
    { name: 'Ned Flanders', email: 'ned@example.com', qty: 10 },
    { name: 'Apu Nahasapeemapetilon', email: 'apu@example.com', qty: 2 },
  ];

  let ticketNum = 1;
  for (const buyer of ticketBuyers) {
    for (let i = 0; i < buyer.qty; i++) {
      await prisma.ticket.create({
        data: {
          raffleId: summerRaffle.id,
          ticketNumber: String(ticketNum).padStart(5, '0'),
          buyerName: buyer.name,
          buyerEmail: buyer.email,
        },
      });
      ticketNum++;
    }
  }

  // Create default settings
  await prisma.setting.createMany({
    data: [
      { key: 'siteName', value: 'Raffle Tickets' },
      { key: 'supportEmail', value: 'support@raffletickets.com' },
      { key: 'maxTicketsPerPurchase', value: '50' },
    ],
  });

  console.log('Seed complete!');
  console.log('');
  console.log('Login credentials:');
  console.log('  Super Admin: admin@raffletickets.com / admin123');
  console.log('  Springfield Admin: principal@springfield.edu / orgadmin123');
  console.log('  Shelbyville Admin: coach@shelbyville.com / orgadmin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
