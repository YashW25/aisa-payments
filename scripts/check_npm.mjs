import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('--- INSPECTING NGINX PROXY MANAGER CONFIGS ---');
    const res = await ssh.execCommand('echo "12345678" | sudo -S docker exec nginx-proxy-manager ls -la /etc/nginx/conf.d');
    console.log(res.stdout);

    ssh.dispose();
  } catch (err) {
    console.error('SSH Error:', err);
  }
}

run();
