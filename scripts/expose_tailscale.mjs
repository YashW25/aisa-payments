import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('Exposing port 3000 temporarily to server Tailscale IP for direct public testing...');
    
    // Bind port 3000 to 0.0.0.0 in docker-compose.yml so Tailscale IP 100.103.218.118 can reach it directly
    await ssh.execCommand("sed -i 's|127.0.0.1:3000:3000|0.0.0.0:3000:3000|g' /opt/aisa-payments/docker-compose.yml");
    await ssh.execCommand('cd /opt/aisa-payments && docker compose up -d --force-recreate');

    await new Promise(r => setTimeout(r, 3000));

    console.log('Testing direct HTTP access on server Tailscale IP http://100.103.218.118:3000/api/health...');
    const res = await ssh.execCommand('curl -i http://100.103.218.118:3000/api/health');
    console.log(res.stdout);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
