import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('Testing pooler host resolution on server...');
    const nsRes = await ssh.execCommand('nslookup aws-0-ap-south-1.pooler.supabase.com || nslookup aws-0-us-east-1.pooler.supabase.com');
    console.log('Pooler NSLOOKUP:\n', nsRes.stdout);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
