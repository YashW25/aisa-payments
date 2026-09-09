const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.payment.findMany();
  console.log(p.map(x => x.transactionId));
}
main().catch(console.error).finally(() => prisma.$disconnect());
