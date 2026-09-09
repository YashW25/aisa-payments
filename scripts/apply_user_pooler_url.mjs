import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('=== UPDATING SERVER .env WITH SUPABASE POOLER URL ===');

    // Password contains special character @ -> URL encoded %40
    // AISA@20230987654321 -> AISA%4020230987654321
    const rawUrl = 'postgresql://postgres.uyqcffnqunymjzlakyho:AISA%4020230987654321@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1';

    await ssh.execCommand(`sed -i 's|DATABASE_URL=.*|DATABASE_URL="${rawUrl}"|g' /opt/aisa-payments/.env`);
    await ssh.execCommand('cd /opt/aisa-payments && docker compose up -d --force-recreate');

    console.log('Waiting 3s for container restart...');
    await new Promise(r => setTimeout(r, 3000));

    console.log('Testing Prisma database query inside container...');
    const testQuery = await ssh.execCommand(`echo "12345678" | sudo -S docker exec aisa-payments-app node -e '
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      prisma.admin.findMany().then(res => console.log("SUCCESS! Connected to Supabase DB. Admin count:", res.length)).catch(err => console.error("DB ERR:", err.message));
    '`);
    console.log('Database Query Result:\n', testQuery.stdout, testQuery.stderr);

    console.log('Testing Admin Login API...');
    const loginTest = await ssh.execCommand('curl -i -X POST -H "Content-Type: application/json" -d \'{"email":"admin@isbm.co.in","password":"wrongpassword"}\' http://127.0.0.1:3000/api/admin/login');
    console.log('Login API Status (expect 401 Invalid credentials, NOT 500):\n', loginTest.stdout.split('\n').slice(0, 10).join('\n'));

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
