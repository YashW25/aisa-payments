import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('--- UPDATING DATABASE_URL TO SUPABASE IPV4 POOLER URL ---');
    
    // Replace direct IPv6 hostname on port 5432 with IPv4 pooler URL on port 6543
    const newPoolerUrl = 'postgresql://postgres.uyqcffnqunymjzlakyho:ASDFGHJKLasdfghjkl%21%40%23%24%25%5E%26%2A%28%291234567890@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

    await ssh.execCommand(`sed -i 's|DATABASE_URL=.*|DATABASE_URL="${newPoolerUrl}"|g' /opt/aisa-payments/.env`);

    console.log('Restarting container with updated pooler DATABASE_URL...');
    await ssh.execCommand('cd /opt/aisa-payments && docker compose up -d --force-recreate');

    await new Promise(r => setTimeout(r, 4000));
    console.log('Checking status...');
    const psRes = await ssh.execCommand('cd /opt/aisa-payments && docker compose ps');
    console.log(psRes.stdout);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
