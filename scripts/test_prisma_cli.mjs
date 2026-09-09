import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('Testing psql CLI or node connection to Supabase pooler...');

    const poolerUrl = 'postgresql://postgres.uyqcffnqunymjzlakyho:ASDFGHJKLasdfghjkl%21%40%23%24%25%5E%26%2A%28%291234567890@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

    // Test with psql or npx prisma db pull
    const testPrisma = await ssh.execCommand(`echo "12345678" | sudo -S docker exec -e DATABASE_URL="${poolerUrl}" aisa-payments-app npx prisma db pull 2>&1`);
    console.log('Prisma output:\n', testPrisma.stdout);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
