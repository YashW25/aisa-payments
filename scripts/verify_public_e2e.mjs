import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('--- TESTING PUBLIC PREVIEW HTTPS LINK END-TO-END ---');

    // 1. Test Health Check over public Cloudflare Tunnel URL
    const health = await ssh.execCommand('curl -s https://applicants-bubble-powerpoint-watershed.trycloudflare.com/api/health');
    console.log('Public Health API:', health.stdout);

    // 2. Test Admin Login API over public Cloudflare Tunnel URL
    const login = await ssh.execCommand('curl -i -X POST -H "Content-Type: application/json" -d \'{"email":"admin@isbm.co.in","password":"invalidpassword"}\' https://applicants-bubble-powerpoint-watershed.trycloudflare.com/api/admin/login');
    console.log('Public Admin Login API (HTTP 401 Invalid credentials, Database Connected!):\n', login.stdout.split('\n').slice(0, 10).join('\n'));

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
