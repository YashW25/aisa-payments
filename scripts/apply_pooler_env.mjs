import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('Testing IPv4 direct connection string with force IPv4 flag...');

    // Resolve IPv4 address of db.uyqcffnqunymjzlakyho.supabase.co
    // Or force IPv4 connection using pgbouncer URL
    // Connection string: postgresql://postgres:PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
    
    // User string format on Supabase pooler: postgres.uyqcffnqunymjzlakyho
    const poolerUrl = 'postgresql://postgres.uyqcffnqunymjzlakyho:ASDFGHJKLasdfghjkl%21%40%23%24%25%5E%26%2A%28%291234567890@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

    await ssh.execCommand(`sed -i 's|DATABASE_URL=.*|DATABASE_URL="${poolerUrl}"|g' /opt/aisa-payments/.env`);
    await ssh.execCommand('cd /opt/aisa-payments && docker compose up -d --force-recreate');

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
