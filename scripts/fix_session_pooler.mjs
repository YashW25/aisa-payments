import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('Testing username format postgres.uyqcffnqunymjzlakyho on db.uyqcffnqunymjzlakyho.supabase.co port 5432...');

    // On Supabase, the default direct connection URL format is:
    // postgresql://postgres:PASSWORD@db.uyqcffnqunymjzlakyho.supabase.co:5432/postgres
    // Or Pooler URL format on port 6543:
    // postgresql://postgres.uyqcffnqunymjzlakyho:PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
    
    // Let's test with: postgres.uyqcffnqunymjzlakyho:PASSWORD on pooler port 5432 (Session pooler mode)
    const url1 = 'postgresql://postgres.uyqcffnqunymjzlakyho:ASDFGHJKLasdfghjkl%21%40%23%24%25%5E%26%2A%28%291234567890@aws-0-ap-south-1.pooler.supabase.com:5432/postgres';

    await ssh.execCommand(`sed -i 's|DATABASE_URL=.*|DATABASE_URL="${url1}"|g' /opt/aisa-payments/.env`);
    await ssh.execCommand('cd /opt/aisa-payments && docker compose up -d --force-recreate');

    await new Promise(r => setTimeout(r, 4000));

    const res = await ssh.execCommand(`echo "12345678" | sudo -S docker exec aisa-payments-app node -e '
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      prisma.admin.findMany().then(res => console.log("SUCCESS DB CONNECTED! count:", res.length)).catch(err => console.error("DB ERR:", err.message));
    '`);

    console.log('Session Pooler Port 5432 result:\n', res.stdout, res.stderr);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
