import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('Testing username format postgres.uyqcffnqunymjzlakyho on pooler port 6543 with pgbouncer query string...');

    // Exact format for Supabase IPv4 Pooler:
    const poolerUrl = 'postgresql://postgres.uyqcffnqunymjzlakyho:ASDFGHJKLasdfghjkl%21%40%23%24%25%5E%26%2A%28%291234567890@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

    await ssh.execCommand(`sed -i 's|DATABASE_URL=.*|DATABASE_URL="${poolerUrl}"|g' /opt/aisa-payments/.env`);
    await ssh.execCommand('cd /opt/aisa-payments && docker compose up -d --force-recreate');

    await new Promise(r => setTimeout(r, 4000));

    // Test pg node module
    const pgTest = await ssh.execCommand(`echo "12345678" | sudo -S docker exec aisa-payments-app node -e '
      const { Client } = require("pg");
      const client = new Client({ connectionString: "${poolerUrl}" });
      client.connect().then(() => console.log("PG DIRECT SUCCESS!")).catch(e => console.error("PG ERR:", e.message));
    '`);

    console.log('PG Test Result:\n', pgTest.stdout, pgTest.stderr);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
