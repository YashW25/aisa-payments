import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const link = await prisma.paymentLink.findUnique({
    where: { slug: 'badges-2026' }
  });
  console.log("LINK DATA:", link);
}

check().catch(console.error).finally(() => prisma.$disconnect());
