import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('--- RESTARTING TUNNEL ROUTING TO NGINX PROXY MANAGER ---');
    await ssh.execCommand('echo "12345678" | sudo -S docker rm -f aisa-test-tunnel 2>/dev/null || true');

    // Route tunnel to Nginx Proxy Manager (which handles host headers & ssl proxying properly)
    await ssh.execCommand('echo "12345678" | sudo -S docker run -d --name aisa-test-tunnel --network web-network cloudflare/cloudflared:latest tunnel --url http://nginx-proxy-manager:80 --http-host-header payments.isbmcoe.in');
    
    await new Promise(r => setTimeout(r, 6000));

    const logs = await ssh.execCommand('echo "12345678" | sudo -S docker logs aisa-test-tunnel 2>&1 | grep -o "https://[a-zA-Z0-9-]*\\.trycloudflare\\.com"');
    const url = logs.stdout.trim().split('\n')[0];
    console.log('PUBLIC_WORKING_URL:', url);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
