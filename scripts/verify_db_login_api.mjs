import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('--- TESTING ADMIN LOGIN & PAYMENT APIS NOW THAT DB IS CONNECTED ---');

    // 1. Test Admin Login API with invalid credentials (expect 401 Unauthorized, NOT 500 Error)
    const loginTest = await ssh.execCommand('curl -i -X POST -H "Content-Type: application/json" -d \'{"email":"admin@isbm.co.in","password":"invalidpassword"}\' http://127.0.0.1:3000/api/admin/login');
    console.log('Login API Response (Expect 401):');
    console.log(loginTest.stdout.split('\n').slice(0, 10).join('\n'));

    // 2. Test Public Health Check API
    const healthTest = await ssh.execCommand('curl -s http://127.0.0.1:3000/api/health');
    console.log('\nHealth API Response:');
    console.log(healthTest.stdout);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
