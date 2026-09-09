import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('Fetching logs from aisa-test-tunnel...');
    const logs = await ssh.execCommand('echo "12345678" | sudo -S docker logs aisa-test-tunnel 2>&1');
    console.log(logs.stdout);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
