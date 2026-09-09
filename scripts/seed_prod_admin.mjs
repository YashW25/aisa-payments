import { NodeSSH } from 'node-ssh';
import bcrypt from 'bcryptjs';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('--- CREATING PROD ADMIN ACCOUNT (admin@isbmcoe.in / admin123) ---');
    
    // Hash password 'admin123'
    const newHash = await bcrypt.hash('admin123', 10);
    const newEmail = 'admin@isbmcoe.in';

    const seedCmd = `echo "12345678" | sudo -S docker exec aisa-payments-app node -e '
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      prisma.admin.upsert({
        where: { email: "${newEmail}" },
        update: { passwordHash: "${newHash}" },
        create: { email: "${newEmail}", passwordHash: "${newHash}" }
      }).then(res => console.log("ADMIN CREATED/UPDATED SUCCESS:", res.email)).catch(err => console.error(err));
    '`;

    const res = await ssh.execCommand(seedCmd);
    console.log('Result:\n', res.stdout, res.stderr);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
