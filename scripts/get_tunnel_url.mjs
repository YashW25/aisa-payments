import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    const logs = await ssh.execCommand('echo "12345678" | sudo -S docker logs aisa-test-tunnel 2>&1 | grep -o "https://[a-zA-Z0-9-]*\\.trycloudflare\\.com"');
    console.log('PUBLIC_TEST_URL:', logs.stdout.trim().split('\n')[0]);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
