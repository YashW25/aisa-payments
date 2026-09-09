import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('=== FIXING PRISMA POOLER URL ENCODING & PARAMS ===');

    // Password contains special character @ -> URL encoded %40
    // AISA@20230987654321 -> AISA%4020230987654321
    // Prisma 5 supports connection_limit & pgbouncer flags properly formatted:
    const cleanUrl = 'postgresql://postgres.uyqcffnqunymjzlakyho:AISA%4020230987654321@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1';

    await ssh.execCommand(`sed -i 's|DATABASE_URL=.*|DATABASE_URL="${cleanUrl}"|g' /opt/aisa-payments/.env`);
    await ssh.execCommand('cd /opt/aisa-payments && docker compose up -d --force-recreate');

    await new Promise(r => setTimeout(r, 3000));

    console.log('Testing query directly via Prisma Client...');
    const testQuery = await ssh.execCommand(`echo "12345678" | sudo -S docker exec aisa-payments-app node -e '
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient({ datasources: { db: { url: "${cleanUrl}" } } });
      prisma.admin.findMany().then(res => console.log("SUCCESS! DB CONNECTED! Admin count:", res.length)).catch(err => console.error("DB ERR:", err.message));
    '`);
    console.log('Result:\n', testQuery.stdout, testQuery.stderr);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
