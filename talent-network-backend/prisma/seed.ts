import 'dotenv/config';
import { PrismaClient, Role, ValidationStatus, PlanCategory, PlanStatus, PlanType, PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const ngoSeed = [
  { email: 'nairobi.ngo@talentnetwork.org', name: 'Nairobi Youth Foundation', region: 'Nairobi' },
  { email: 'mombasa.ngo@talentnetwork.org', name: 'Mombasa Coastal Academy', region: 'Mombasa' },
  { email: 'kisumu.ngo@talentnetwork.org', name: 'Lake Region Talent Trust', region: 'Kisumu' },
  { email: 'nakuru.ngo@talentnetwork.org', name: 'Rift Valley Future Lab', region: 'Nakuru' },
  { email: 'eldoret.ngo@talentnetwork.org', name: 'Highlands Prodigy Initiative', region: 'Eldoret' },
];

const volunteerSeed = [
  { email: 'volunteer.nairobi.1@talentnetwork.org', assignedRegion: 'Nairobi', impactScore: 180 },
  { email: 'volunteer.nairobi.2@talentnetwork.org', assignedRegion: 'Nairobi', impactScore: 130 },
  { email: 'volunteer.mombasa.1@talentnetwork.org', assignedRegion: 'Mombasa', impactScore: 170 },
  { email: 'volunteer.mombasa.2@talentnetwork.org', assignedRegion: 'Mombasa', impactScore: 110 },
  { email: 'volunteer.kisumu.1@talentnetwork.org', assignedRegion: 'Kisumu', impactScore: 160 },
  { email: 'volunteer.kisumu.2@talentnetwork.org', assignedRegion: 'Kisumu', impactScore: 95 },
  { email: 'volunteer.nakuru.1@talentnetwork.org', assignedRegion: 'Nakuru', impactScore: 145 },
  { email: 'volunteer.nakuru.2@talentnetwork.org', assignedRegion: 'Nakuru', impactScore: 90 },
  { email: 'volunteer.eldoret.1@talentnetwork.org', assignedRegion: 'Eldoret', impactScore: 155 },
  { email: 'volunteer.eldoret.2@talentnetwork.org', assignedRegion: 'Eldoret', impactScore: 100 },
];

const sponsorSeed = [
  { email: 'sponsor.john@example.com', impactScore: 520, leaderboardRank: 1, weeklyImpactScore: 160 },
  { email: 'sponsor.sarah@example.com', impactScore: 410, leaderboardRank: 2, weeklyImpactScore: 120 },
  { email: 'sponsor.amina@example.com', impactScore: 360, leaderboardRank: 3, weeklyImpactScore: 95 },
  { email: 'sponsor.david@example.com', impactScore: 280, leaderboardRank: 4, weeklyImpactScore: 75 },
  { email: 'sponsor.grace@example.com', impactScore: 215, leaderboardRank: 5, weeklyImpactScore: 55 },
];

const childSeed = [
  { name: 'Samuel Kiprono', dob: '2014-05-15', talentCategory: 'Mathematics', city: 'Nairobi', location: 'Mathare, Nairobi', ngoIndex: 0 },
  { name: 'Amina Ali', dob: '2012-11-20', talentCategory: 'Athletics (Running)', city: 'Nairobi', location: 'Eastleigh, Nairobi', ngoIndex: 0 },
  { name: 'Brian Mwangi', dob: '2013-03-09', talentCategory: 'Robotics', city: 'Nairobi', location: 'Kayole, Nairobi', ngoIndex: 0 },
  { name: 'Joy Wanjiru', dob: '2015-01-24', talentCategory: 'Violin Performance', city: 'Nairobi', location: 'Kibera, Nairobi', ngoIndex: 0 },
  { name: 'Fatuma Hassan', dob: '2013-08-05', talentCategory: 'Fine Arts', city: 'Mombasa', location: 'Kisauni, Mombasa', ngoIndex: 1 },
  { name: 'Yusuf Bakari', dob: '2014-06-11', talentCategory: 'Marine Science', city: 'Mombasa', location: 'Likoni, Mombasa', ngoIndex: 1 },
  { name: 'Leila Omari', dob: '2012-02-18', talentCategory: 'Chess', city: 'Mombasa', location: 'Old Town, Mombasa', ngoIndex: 1 },
  { name: 'Mohamed Juma', dob: '2015-04-22', talentCategory: 'Football', city: 'Mombasa', location: 'Mikindani, Mombasa', ngoIndex: 1 },
  { name: 'David Omondi', dob: '2015-02-10', talentCategory: 'Computer Science', city: 'Kisumu', location: 'Nyalenda, Kisumu', ngoIndex: 2 },
  { name: 'Mercy Atieno', dob: '2013-09-14', talentCategory: 'Creative Writing', city: 'Kisumu', location: 'Manyatta, Kisumu', ngoIndex: 2 },
  { name: 'Kevin Ouma', dob: '2012-07-03', talentCategory: 'Physics', city: 'Kisumu', location: 'Kondele, Kisumu', ngoIndex: 2 },
  { name: 'Sharon Achieng', dob: '2014-12-29', talentCategory: 'Piano', city: 'Kisumu', location: 'Milimani, Kisumu', ngoIndex: 2 },
  { name: 'Esther Njeri', dob: '2013-05-30', talentCategory: 'Biomedical Science', city: 'Nakuru', location: 'Kaptembwo, Nakuru', ngoIndex: 3 },
  { name: 'Peter Kibet', dob: '2014-10-08', talentCategory: 'Long Distance Running', city: 'Nakuru', location: 'Rhonda, Nakuru', ngoIndex: 3 },
  { name: 'Linet Chebet', dob: '2012-04-19', talentCategory: 'Debate', city: 'Nakuru', location: 'Lanet, Nakuru', ngoIndex: 3 },
  { name: 'Mark Kiptoo', dob: '2015-01-11', talentCategory: 'Coding', city: 'Nakuru', location: 'Free Area, Nakuru', ngoIndex: 3 },
  { name: 'Faith Jepchirchir', dob: '2013-06-07', talentCategory: 'Aerospace Dreamer', city: 'Eldoret', location: 'Langas, Eldoret', ngoIndex: 4 },
  { name: 'Collins Cheruiyot', dob: '2014-09-21', talentCategory: 'Engineering Design', city: 'Eldoret', location: 'Huruma, Eldoret', ngoIndex: 4 },
  { name: 'Ruth Chepngeno', dob: '2012-08-13', talentCategory: 'STEM Research', city: 'Eldoret', location: 'Pioneer, Eldoret', ngoIndex: 4 },
  { name: 'Dennis Kiprotich', dob: '2015-03-27', talentCategory: 'Basketball', city: 'Eldoret', location: 'Turbo, Uasin Gishu', ngoIndex: 4 },
];

const reportTemplates = [
  {
    description: 'Demonstrated top percentile performance this month and now needs targeted support to maintain acceleration.',
    aiSummary: 'Verified progress shows exceptional talent growth with urgent funding needs around tools, transport, and advanced learning support.',
  },
  {
    description: 'Reached a new milestone in competition and requires sponsorship for specialist coaching and equipment.',
    aiSummary: 'The child is outperforming peers consistently; the next unlock depends on structured support and continuity.',
  },
  {
    description: 'Teachers and community mentors reported unusual aptitude with measurable improvement across the last review cycle.',
    aiSummary: 'The signal is strong: this profile combines rare ability, disciplined effort, and clear intervention urgency.',
  },
];

async function main() {
  console.log('Seeding the Talent Infrastructure Network Database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.userBadge.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.progressReport.deleteMany();
  await prisma.sponsorshipPlan.deleteMany();
  await prisma.child.deleteMany();
  await prisma.nGO.deleteMany();
  await prisma.volunteer.deleteMany();
  await prisma.sponsor.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      email: 'admin@talentnetwork.org',
      passwordHash,
      role: Role.ADMIN,
    },
  });
  console.log(`Created Admin: ${admin.email}`);

  const ngoUsers = [];
  for (const ngo of ngoSeed) {
    const record = await prisma.user.create({
      data: {
        email: ngo.email,
        passwordHash,
        role: Role.NGO,
        ngo: {
          create: {
            name: ngo.name,
            region: ngo.region,
            verifiedStatus: true,
          },
        },
      },
      include: { ngo: true },
    });
    ngoUsers.push(record);
  }
  console.log(`Created ${ngoUsers.length} NGO profiles.`);

  const volunteerUsers = [];
  for (const volunteer of volunteerSeed) {
    const record = await prisma.user.create({
      data: {
        email: volunteer.email,
        passwordHash,
        role: Role.VOLUNTEER,
        volunteer: {
          create: {
            assignedRegion: volunteer.assignedRegion,
            impactScore: volunteer.impactScore,
          },
        },
      },
      include: { volunteer: true },
    });
    volunteerUsers.push(record);
  }
  console.log(`Created ${volunteerUsers.length} volunteer profiles.`);

  const sponsorUsers = [];
  for (const sponsor of sponsorSeed) {
    const record = await prisma.user.create({
      data: {
        email: sponsor.email,
        passwordHash,
        role: Role.SPONSOR,
        sponsor: {
          create: {
            impactScore: sponsor.impactScore,
            leaderboardRank: sponsor.leaderboardRank,
            weeklyImpactScore: sponsor.weeklyImpactScore,
          },
        },
      },
      include: { sponsor: true },
    });
    sponsorUsers.push(record);
  }
  console.log(`Created ${sponsorUsers.length} sponsor profiles.`);

  const children = [];
  for (const child of childSeed) {
    const ngoUser = ngoUsers[child.ngoIndex];
    const record = await prisma.child.create({
      data: {
        name: child.name,
        dob: new Date(child.dob),
        talentCategory: child.talentCategory,
        ngoId: ngoUser.ngo!.id,
        isActive: true,
        city: child.city,
        location: child.location,
        mediaUrls: [],
      },
    });
    children.push(record);
  }
  console.log(`Created ${children.length} prodigy child profiles.`);

  const volunteerByRegion = new Map<string, typeof volunteerUsers[number][]>();
  for (const volunteer of volunteerUsers) {
    const region = volunteer.volunteer!.assignedRegion;
    volunteerByRegion.set(region, [...(volunteerByRegion.get(region) ?? []), volunteer]);
  }

  for (let i = 0; i < children.length; i += 1) {
    const child = children[i];
    const ngoUser = ngoUsers[childSeed[i].ngoIndex];
    const regionalVolunteers = volunteerByRegion.get(ngoUser.ngo!.region) ?? [];
    const volunteer = regionalVolunteers[i % regionalVolunteers.length];
    const template = reportTemplates[i % reportTemplates.length];

    await prisma.progressReport.create({
      data: {
        childId: child.id,
        uploadedById: ngoUser.id,
        description: `${child.name} - ${template.description}`,
        aiSummary: template.aiSummary,
        validationStatus: ValidationStatus.PENDING,
      },
    });

    if (volunteer) {
      await prisma.progressReport.create({
        data: {
          childId: child.id,
          uploadedById: volunteer.id,
          description: `${child.name} was field-verified by ${volunteer.email.split('@')[0]} with clear evidence of continued progress and strong local endorsement.`,
          aiSummary: `${child.name} has been independently validated in-region; support is likely to compound quickly if funded now.`,
          validationStatus: ValidationStatus.VERIFIED,
        },
      });
    }
  }
  console.log(`Created ${children.length * 2} progress report records.`);

  const sponsorPlans = [
    { sponsorIndex: 0, childIndex: 0, amount: 150, category: PlanCategory.EDUCATION },
    { sponsorIndex: 0, childIndex: 8, amount: 120, category: PlanCategory.SPORTS },
    { sponsorIndex: 1, childIndex: 4, amount: 100, category: PlanCategory.SPECIAL_GIFT },
    { sponsorIndex: 1, childIndex: 12, amount: 140, category: PlanCategory.EDUCATION },
    { sponsorIndex: 2, childIndex: 16, amount: 110, category: PlanCategory.LODGING },
    { sponsorIndex: 3, childIndex: 2, amount: 95, category: PlanCategory.EDUCATION },
    { sponsorIndex: 4, childIndex: 18, amount: 125, category: PlanCategory.SPORTS },
  ];

  for (const [index, plan] of sponsorPlans.entries()) {
    const sponsorUser = sponsorUsers[plan.sponsorIndex];
    const child = children[plan.childIndex];
    const createdPlan = await prisma.sponsorshipPlan.create({
      data: {
        childId: child.id,
        sponsorId: sponsorUser.sponsor!.id,
        category: plan.category,
        type: PlanType.MONTHLY,
        amount: plan.amount,
        status: PlanStatus.ACTIVE,
      },
    });

    await prisma.payment.create({
      data: {
        sponsorId: sponsorUser.sponsor!.id,
        planId: createdPlan.id,
        amount: plan.amount,
        currency: 'USD',
        status: index % 2 === 0 ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
      },
    });
  }
  console.log(`Created ${sponsorPlans.length} sponsorship plans and payment records.`);

  const badges = [
    { id: 'first-pledge', name: 'First Pledge', criteria: 'Complete your first sponsorship pledge' },
    { id: 'bronze-patron', name: 'Bronze Patron', criteria: 'Reach 500 impact score' },
    { id: 'field-verifier', name: 'Field Verifier', criteria: 'Verify multiple child progress reports' },
  ];

  for (const badge of badges) {
    await prisma.badge.create({ data: badge });
  }

  await prisma.userBadge.create({
    data: {
      userId: sponsorUsers[0].id,
      badgeId: 'first-pledge',
    },
  });
  await prisma.userBadge.create({
    data: {
      userId: sponsorUsers[0].id,
      badgeId: 'bronze-patron',
    },
  });
  await prisma.userBadge.create({
    data: {
      userId: volunteerUsers[0].id,
      badgeId: 'field-verifier',
    },
  });

  console.log('Database Seeding Completed Successfully!');
  console.log('Demo accounts available:');
  console.log('- admin@talentnetwork.org / password123');
  console.log('- sponsor.john@example.com / password123');
  console.log('- sponsor.sarah@example.com / password123');
  console.log('- nairobi.ngo@talentnetwork.org / password123');
  console.log('- volunteer.nairobi.1@talentnetwork.org / password123');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
