import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('Testing node-postgres query to Supabase pooler...');

    // Run node one-liner inside aisa-payments-app container using pg package or Prisma client 5.22.0
    const nodeTest = await ssh.execCommand(`echo "12345678" | sudo -S docker exec aisa-payments-app node -e '
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      prisma.admin.findMany().then(res => console.log("SUCCESS DB CONNECTED, count:", res.length)).catch(err => console.error("DB ERR:", err.message));
    '`);

    console.log('Node Execution Result:\n', nodeTest.stdout, nodeTest.stderr);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
