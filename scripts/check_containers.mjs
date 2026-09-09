import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('--- CHECKING EXISTING DOCKER CONTAINERS ON PORTS 80/443/81/8000/9443 ---');
    const res = await ssh.execCommand('echo "12345678" | sudo -S docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Image}}"');
    console.log(res.stdout);

    ssh.dispose();
  } catch (err) {
    console.error('SSH Error:', err);
  }
}

run();
