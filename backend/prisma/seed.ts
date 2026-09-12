import { AgreementType, DayOfWeek, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;
const prisma = new PrismaClient();

const DEMO_PATIENT_EMAIL = 'patient@example.com';
const DEMO_PATIENT_PASSWORD = 'password123';
const DEMO_DOCTOR_PASSWORD = 'password123';

const DOCTORS = [
  {
    email: 'dr.thanda@example.com',
    fullName: 'Dr. Thanda Aung',
    specialization: 'Cardiology',
    hospitalDepartment: 'Cardiology Department',
    medicalLicenseNumber: 'MMC-10001',
    schedules: [
      {
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '09:00',
        endTime: '12:00',
        consultationFees: 25000,
        maximumPatientSession: 12,
      },
      {
        dayOfWeek: DayOfWeek.WEDNESDAY,
        startTime: '13:00',
        endTime: '17:00',
        consultationFees: 25000,
        maximumPatientSession: 15,
      },
    ],
  },
  {
    email: 'dr.zawmin@example.com',
    fullName: 'Dr. Zaw Min Htet',
    specialization: 'Dermatology',
    hospitalDepartment: 'Skin & Cosmetic Department',
    medicalLicenseNumber: 'MMC-10002',
    schedules: [
      {
        dayOfWeek: DayOfWeek.TUESDAY,
        startTime: '10:00',
        endTime: '14:00',
        consultationFees: 18000,
        maximumPatientSession: 10,
      },
      {
        dayOfWeek: DayOfWeek.THURSDAY,
        startTime: '10:00',
        endTime: '14:00',
        consultationFees: 18000,
        maximumPatientSession: 10,
      },
    ],
  },
  {
    email: 'dr.hninwai@example.com',
    fullName: 'Dr. Hnin Wai Yan',
    specialization: 'Pediatrics',
    hospitalDepartment: 'Child Health Department',
    medicalLicenseNumber: 'MMC-10003',
    schedules: [
      {
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '14:00',
        endTime: '17:00',
        consultationFees: 15000,
        maximumPatientSession: 20,
      },
      {
        dayOfWeek: DayOfWeek.FRIDAY,
        startTime: '09:00',
        endTime: '12:00',
        consultationFees: 15000,
        maximumPatientSession: 20,
      },
    ],
  },
  {
    email: 'dr.kyawswar@example.com',
    fullName: 'Dr. Kyaw Swar Oo',
    specialization: 'Orthopedics',
    hospitalDepartment: 'Bone & Joint Department',
    medicalLicenseNumber: 'MMC-10004',
    schedules: [
      {
        dayOfWeek: DayOfWeek.WEDNESDAY,
        startTime: '09:00',
        endTime: '12:00',
        consultationFees: 30000,
        maximumPatientSession: 8,
      },
      {
        dayOfWeek: DayOfWeek.SATURDAY,
        startTime: '09:00',
        endTime: '13:00',
        consultationFees: 30000,
        maximumPatientSession: 12,
      },
    ],
  },
];

const PROVIDERS = [
  {
    name: 'AYA Sompo Insurance',
    coveragePercentage: 30,
    agreementType: AgreementType.PERCENTAGE,
  },
  {
    name: 'Grand Guardian Insurance',
    coveragePercentage: 20,
    agreementType: AgreementType.PERCENTAGE,
  },
  {
    name: 'IKBZ Insurance',
    coveragePercentage: 15,
    agreementType: AgreementType.PERCENTAGE,
  },
];

/**
 * Standalone seed script wired up via the "prisma.seed" field in
 * package.json. Runs automatically after `prisma migrate dev` (and can be
 * re-run manually with `npx prisma db seed`). Idempotent - safe to re-run.
 */
async function main() {
  let patient = await prisma.user.findUnique({
    where: { email: DEMO_PATIENT_EMAIL },
  });
  if (!patient) {
    const password = await bcrypt.hash(DEMO_PATIENT_PASSWORD, SALT_ROUNDS);
    patient = await prisma.user.create({
      data: {
        email: DEMO_PATIENT_EMAIL,
        password,
        fullName: 'Demo Patient',
        role: 'PATIENT',
      },
    });
    console.log(
      `Seeded demo patient: ${DEMO_PATIENT_EMAIL} / ${DEMO_PATIENT_PASSWORD}`,
    );
  }

  for (const provider of PROVIDERS) {
    await prisma.provider.upsert({
      where: { name: provider.name },
      update: {},
      create: provider,
    });
  }
  console.log(`Seeded ${PROVIDERS.length} insurance providers`);

  for (const doctor of DOCTORS) {
    const existing = await prisma.doctor.findUnique({
      where: { medicalLicenseNumber: doctor.medicalLicenseNumber },
    });
    if (existing) {
      continue;
    }

    const password = await bcrypt.hash(DEMO_DOCTOR_PASSWORD, SALT_ROUNDS);
    const user = await prisma.user.upsert({
      where: { email: doctor.email },
      update: {},
      create: {
        email: doctor.email,
        password,
        fullName: doctor.fullName,
        role: 'DOCTOR',
      },
    });

    await prisma.doctor.create({
      data: {
        userId: user.id,
        specialization: doctor.specialization,
        hospitalDepartment: doctor.hospitalDepartment,
        medicalLicenseNumber: doctor.medicalLicenseNumber,
        schedules: { create: doctor.schedules },
      },
    });
    console.log(`Seeded doctor: ${doctor.fullName}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
