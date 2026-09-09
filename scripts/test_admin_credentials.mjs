import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('Testing admin login with admin@aisa.isbm.co.in / aisa-admin-password...');
    const testLogin = await ssh.execCommand('curl -i -X POST -H "Content-Type: application/json" -d \'{"email":"admin@aisa.isbm.co.in","password":"aisa-admin-password"}\' http://127.0.0.1:3000/api/admin/login');
    console.log(testLogin.stdout);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
