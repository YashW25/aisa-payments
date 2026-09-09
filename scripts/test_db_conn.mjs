import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('Testing outbound DB connectivity from container and server...');

    // 1. Check direct connection from server
    const directTest = await ssh.execCommand('nc -zv db.uyqcffnqunymjzlakyho.supabase.co 5432 2>&1');
    console.log('Direct Port 5432 result:', directTest.stdout.trim());

    // 2. Check Pooler connection (Port 6543) from server
    const poolerTest = await ssh.execCommand('nc -zv aws-0-ap-south-1.pooler.supabase.com 6543 2>&1 || nc -zv db.uyqcffnqunymjzlakyho.supabase.co 6543 2>&1');
    console.log('Pooler Port 6543 result:', poolerTest.stdout.trim());

    // 3. Resolve IP for Supabase hostname
    const nsTest = await ssh.execCommand('nslookup db.uyqcffnqunymjzlakyho.supabase.co');
    console.log('DNS resolution:', nsTest.stdout.trim());

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
