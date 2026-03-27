import 'dotenv/config';
import {
  ChildStatus,
  PaymentStatus,
  PlanCategory,
  PlanStatus,
  PlanType,
  PrismaClient,
  Role,
  ValidationStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = 'password123';

const demoUsers = {
  sponsor: {
    email: 'sponsor@demo.com',
    role: Role.SPONSOR,
    sponsor: {
      impactScore: 240,
      weeklyImpactScore: 85,
      leaderboardRank: 1,
    },
  },
  volunteer: {
    email: 'volunteer@demo.com',
    role: Role.VOLUNTEER,
    volunteer: {
      assignedRegion: 'Nairobi',
      impactScore: 90,
    },
  },
  ngo: {
    email: 'ngo@demo.com',
    role: Role.NGO,
    ngo: {
      name: 'Demo Impact Foundation',
      region: 'Nairobi',
      verifiedStatus: true,
    },
  },
};

const demoChildren = [
  {
    name: 'Maya Njeri',
    dob: '2014-02-11',
    talentCategory: 'Robotics',
    city: 'Nairobi',
    location: 'Kilimani',
    pleaVideoUrl: 'https://example.com/maya-plea.mp4',
    mediaUrls: ['https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80'],
    status: ChildStatus.VERIFIED,
  },
  {
    name: 'Ethan Otieno',
    dob: '2013-08-22',
    talentCategory: 'Piano Performance',
    city: 'Nairobi',
    location: 'Westlands',
    pleaVideoUrl: 'https://example.com/ethan-plea.mp4',
    mediaUrls: ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80'],
    status: ChildStatus.VERIFIED,
  },
  {
    name: 'Aisha Mwangi',
    dob: '2015-01-05',
    talentCategory: 'Mathematics',
    city: 'Nairobi',
    location: 'South B',
    pleaVideoUrl: 'https://example.com/aisha-plea.mp4',
    mediaUrls: ['https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80'],
    status: ChildStatus.VERIFIED,
  },
  {
    name: 'Noah Kiptoo',
    dob: '2014-06-14',
    talentCategory: 'Athletics',
    city: 'Nairobi',
    location: 'Kasarani',
    pleaVideoUrl: 'https://example.com/noah-plea.mp4',
    mediaUrls: ['https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80'],
    status: ChildStatus.PENDING,
  },
  {
    name: 'Zuri Hassan',
    dob: '2012-11-28',
    talentCategory: 'Creative Writing',
    city: 'Nairobi',
    location: 'Embakasi',
    pleaVideoUrl: 'https://example.com/zuri-plea.mp4',
    mediaUrls: ['https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80'],
    status: ChildStatus.PENDING,
  },
];

async function upsertUser(email: string, role: Role, passwordHash: string) {
  return prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role,
    },
    create: {
      email,
      passwordHash,
      role,
    },
  });
}

async function ensureChild(ngoId: string, child: (typeof demoChildren)[number]) {
  const existing = await prisma.child.findFirst({
    where: {
      ngoId,
      name: child.name,
    },
  });

  if (existing) {
    return prisma.child.update({
      where: { id: existing.id },
      data: {
        dob: new Date(child.dob),
        talentCategory: child.talentCategory,
        city: child.city,
        location: child.location,
        pleaVideoUrl: child.pleaVideoUrl,
        mediaUrls: child.mediaUrls,
        status: child.status,
        isActive: true,
      },
    });
  }

  return prisma.child.create({
    data: {
      name: child.name,
      dob: new Date(child.dob),
      talentCategory: child.talentCategory,
      city: child.city,
      location: child.location,
      pleaVideoUrl: child.pleaVideoUrl,
      mediaUrls: child.mediaUrls,
      status: child.status,
      ngoId,
      isActive: true,
    },
  });
}

async function ensureReport({
  childId,
  uploadedById,
  description,
  aiSummary,
  validationStatus,
}: {
  childId: string;
  uploadedById: string;
  description: string;
  aiSummary: string;
  validationStatus: ValidationStatus;
}) {
  const existing = await prisma.progressReport.findFirst({
    where: {
      childId,
      uploadedById,
      description,
    },
  });

  if (existing) {
    return prisma.progressReport.update({
      where: { id: existing.id },
      data: {
        aiSummary,
        validationStatus,
      },
    });
  }

  return prisma.progressReport.create({
    data: {
      childId,
      uploadedById,
      description,
      aiSummary,
      validationStatus,
    },
  });
}

async function main() {
  console.log('Seeding demo data for NextGenius...');

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  const sponsorUser = await upsertUser(
    demoUsers.sponsor.email,
    demoUsers.sponsor.role,
    hashedPassword,
  );
  await prisma.sponsor.upsert({
    where: { userId: sponsorUser.id },
    update: demoUsers.sponsor.sponsor,
    create: {
      userId: sponsorUser.id,
      ...demoUsers.sponsor.sponsor,
    },
  });

  const volunteerUser = await upsertUser(
    demoUsers.volunteer.email,
    demoUsers.volunteer.role,
    hashedPassword,
  );
  await prisma.volunteer.upsert({
    where: { userId: volunteerUser.id },
    update: demoUsers.volunteer.volunteer,
    create: {
      userId: volunteerUser.id,
      ...demoUsers.volunteer.volunteer,
    },
  });

  const ngoUser = await upsertUser(
    demoUsers.ngo.email,
    demoUsers.ngo.role,
    hashedPassword,
  );
  const ngoProfile = await prisma.nGO.upsert({
    where: { userId: ngoUser.id },
    update: demoUsers.ngo.ngo,
    create: {
      userId: ngoUser.id,
      ...demoUsers.ngo.ngo,
    },
  });

  const children = [];
  for (const child of demoChildren) {
    const record = await ensureChild(ngoProfile.id, child);
    children.push(record);
  }

  await ensureReport({
    childId: children[0].id,
    uploadedById: ngoUser.id,
    description:
      'Maya completed a robotics showcase and now needs competition travel support plus advanced kits.',
    aiSummary:
      'Robotics performance is verified and accelerating. Funding would directly unlock regional competition access.',
    validationStatus: ValidationStatus.VERIFIED,
  });

  await ensureReport({
    childId: children[3].id,
    uploadedById: ngoUser.id,
    description:
      'Noah has begun structured athletics coaching and awaits field review before being published to sponsors.',
    aiSummary:
      'Athletics potential looks promising, but the profile still needs volunteer review before public discovery.',
    validationStatus: ValidationStatus.PENDING,
  });

  await ensureReport({
    childId: children[4].id,
    uploadedById: ngoUser.id,
    description:
      'Zuri submitted a writing portfolio and mentor references for validation in the Nairobi region.',
    aiSummary:
      'Creative writing indicators are strong. A volunteer review is pending before the profile becomes sponsor-visible.',
    validationStatus: ValidationStatus.PENDING,
  });

  const sponsorProfile = await prisma.sponsor.findUnique({
    where: { userId: sponsorUser.id },
  });

  if (sponsorProfile) {
    const existingPlan = await prisma.sponsorshipPlan.findFirst({
      where: {
        sponsorId: sponsorProfile.id,
        childId: children[0].id,
        category: PlanCategory.EDUCATION,
      },
    });

    const plan =
      existingPlan ??
      (await prisma.sponsorshipPlan.create({
        data: {
          childId: children[0].id,
          sponsorId: sponsorProfile.id,
          category: PlanCategory.EDUCATION,
          type: PlanType.MONTHLY,
          amount: 75,
          status: PlanStatus.ACTIVE,
        },
      }));

    const existingPayment = await prisma.payment.findFirst({
      where: {
        planId: plan.id,
        sponsorId: sponsorProfile.id,
        amount: 75,
      },
    });

    if (!existingPayment) {
      await prisma.payment.create({
        data: {
          planId: plan.id,
          sponsorId: sponsorProfile.id,
          amount: 75,
          currency: 'USD',
          status: PaymentStatus.COMPLETED,
        },
      });
    }
  }

  console.log('Demo users ready: sponsor@demo.com, volunteer@demo.com, ngo@demo.com');
  console.log('Demo password: password123');
  console.log('Demo child inventory: 3 VERIFIED, 2 PENDING');
  console.log('Seeding complete');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
