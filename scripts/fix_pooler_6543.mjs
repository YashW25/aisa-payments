import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('Testing username format postgres.uyqcffnqunymjzlakyho on port 6543...');

    // Supabase transaction/session pooler uses port 6543 with pgbouncer=true
    const poolerUrl = 'postgresql://postgres.uyqcffnqunymjzlakyho:ASDFGHJKLasdfghjkl%21%40%23%24%25%5E%26%2A%28%291234567890@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

    await ssh.execCommand(`sed -i 's|DATABASE_URL=.*|DATABASE_URL="${poolerUrl}"|g' /opt/aisa-payments/.env`);
    await ssh.execCommand('cd /opt/aisa-payments && docker compose up -d --force-recreate');

    await new Promise(r => setTimeout(r, 4000));

    const testLogin = await ssh.execCommand('curl -i -X POST -H "Content-Type: application/json" -d \'{"email":"admin@isbm.co.in","password":"wrongpassword"}\' http://127.0.0.1:3000/api/admin/login');
    console.log('Response for 6543 pooler:\n', testLogin.stdout);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
