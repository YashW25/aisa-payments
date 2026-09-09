import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('Querying existing admins in database...');
    const adminCheck = await ssh.execCommand(`echo "12345678" | sudo -S docker exec aisa-payments-app node -e '
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      prisma.admin.findMany({ select: { email: true } }).then(admins => console.log("ADMIN_EMAILS:", JSON.stringify(admins))).catch(err => console.error(err));
    '`);

    console.log('Registered Admin Emails in Supabase:\n', adminCheck.stdout);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
