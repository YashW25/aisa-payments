import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('Testing username format postgres.uyqcffnqunymjzlakyho on pooler port 6543...');

    // Exact Pooler URL string format for Supabase pooler:
    const poolerUrl = 'postgresql://postgres.uyqcffnqunymjzlakyho:ASDFGHJKLasdfghjkl%21%40%23%24%25%5E%26%2A%28%291234567890@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

    await ssh.execCommand(`sed -i 's|DATABASE_URL=.*|DATABASE_URL="${poolerUrl}"|g' /opt/aisa-payments/.env`);
    await ssh.execCommand('cd /opt/aisa-payments && docker compose up -d --force-recreate');

    await new Promise(r => setTimeout(r, 4000));

    const nodeTest = await ssh.execCommand(`echo "12345678" | sudo -S docker exec aisa-payments-app node -e '
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      prisma.admin.findMany().then(res => console.log("SUCCESS DB CONNECTED! Admin count:", res.length)).catch(err => console.error("DB ERR:", err.message));
    '`);

    console.log('Pooler 6543 test result:\n', nodeTest.stdout, nodeTest.stderr);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
