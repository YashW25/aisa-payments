import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('Testing Admin Login Page...');
    const adminRes = await ssh.execCommand('curl -i -H "Host: payments.isbmcoe.in" http://127.0.0.1:80/admin/login');
    console.log(adminRes.stdout.slice(0, 500));

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
