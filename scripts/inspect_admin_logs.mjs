import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('--- FETCHING LAST 100 LOG LINES FROM aisa-payments-app ---');
    const logs = await ssh.execCommand('cd /opt/aisa-payments && docker compose logs --tail=100 app');
    console.log(logs.stdout);
    console.log(logs.stderr);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
