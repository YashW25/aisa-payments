import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
      readyTimeout: 10000,
    });

    console.log('SSH Connected Successfully!');

    const res1 = await ssh.execCommand('lsb_release -a; uname -a');
    console.log('--- OS INFO ---');
    console.log(res1.stdout);

    const res2 = await ssh.execCommand('free -h; df -h /');
    console.log('--- RESOURCES ---');
    console.log(res2.stdout);

    const res3 = await ssh.execCommand('curl -s -4 ifconfig.me; echo ""');
    console.log('--- PUBLIC IP ---');
    console.log(res3.stdout);

    const res4 = await ssh.execCommand('docker --version; docker compose version');
    console.log('--- DOCKER ---');
    console.log(res4.stdout);

    const res5 = await ssh.execCommand('echo "12345678" | sudo -S ss -tulpn');
    console.log('--- LISTENING PORTS ---');
    console.log(res5.stdout);

    const res6 = await ssh.execCommand('echo "12345678" | sudo -S ufw status');
    console.log('--- UFW STATUS ---');
    console.log(res6.stdout);

    ssh.dispose();
  } catch (err) {
    console.error('SSH Error:', err);
    process.exit(1);
  }
}

run();
