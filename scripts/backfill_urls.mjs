import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  console.log('Starting backfill of screenshotUrls...');
  const payments = await prisma.payment.findMany({
    where: { screenshotUrl: null }
  });
  
  console.log(`Found ${payments.length} payments missing screenshotUrl.`);
  
  let count = 0;
  for (const payment of payments) {
    const url = `https://payments.isbmcoe.in/api/admin/payments/${payment.id}/proof`;
    await prisma.payment.update({
      where: { id: payment.id },
      data: { screenshotUrl: url }
    });
    console.log(`Updated ${payment.transactionId} -> ${url}`);
    count++;
  }
  console.log(`Backfill complete. Updated ${count} records.`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
