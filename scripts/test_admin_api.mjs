import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('Testing admin login API with Supabase pooler...');
    const testLogin = await ssh.execCommand('curl -i -X POST -H "Content-Type: application/json" -d \'{"username":"admin@isbm.co.in","password":"wrongpassword"}\' http://127.0.0.1:3000/api/admin/login');
    console.log(testLogin.stdout);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
