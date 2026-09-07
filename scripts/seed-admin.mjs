import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@aisa.isbm.co.in';
  const password = 'aisa-admin-password'; // Change in production!
  const passwordHash = await bcrypt.hash(password, 10);

  const existingAdmin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!existingAdmin) {
    await prisma.admin.create({
      data: {
        email,
        passwordHash,
      },
    });
    console.log(`Admin created with email: ${email}`);
  } else {
    console.log(`Admin with email ${email} already exists.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
