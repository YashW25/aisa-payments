import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('--- SETTING CLEAN DATABASE_URL IN /opt/aisa-payments/.env ---');

    // Remove connection_limit & ensure clean URL string
    const cleanPoolerUrl = 'postgresql://postgres.uyqcffnqunymjzlakyho:AISA%4020230987654321@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';

    await ssh.execCommand(`sed -i 's|DATABASE_URL=.*|DATABASE_URL="${cleanPoolerUrl}"|g' /opt/aisa-payments/.env`);
    
    console.log('Recreating container with updated .env...');
    await ssh.execCommand('cd /opt/aisa-payments && docker compose up -d --force-recreate');

    await new Promise(r => setTimeout(r, 4000));

    console.log('\nTesting Admin Login API again...');
    const loginTest = await ssh.execCommand('curl -i -X POST -H "Content-Type: application/json" -d \'{"email":"admin@isbm.co.in","password":"invalidpassword"}\' http://127.0.0.1:3000/api/admin/login');
    console.log('Admin Login API Output:\n', loginTest.stdout);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
