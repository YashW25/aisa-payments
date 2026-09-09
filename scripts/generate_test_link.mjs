import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('=== CREATING TEMPORARY CLOUDFLARE QUICK TUNNEL FOR TESTING ===');
    
    // Download cloudflared if not present or run via docker
    const runTunnel = await ssh.execCommand('echo "12345678" | sudo -S docker run -d --name aisa-test-tunnel --network web-network cloudflare/cloudflared:latest tunnel --url http://aisa-payments-app:3000');
    console.log('Container started:', runTunnel.stdout.trim());

    // Wait 5 seconds for tunnel URL to appear in logs
    await new Promise(r => setTimeout(r, 5000));
    
    const logs = await ssh.execCommand('echo "12345678" | sudo -S docker logs aisa-test-tunnel 2>&1 | grep trycloudflare.com');
    console.log('--- TEMPORARY TEST LINK ---');
    console.log(logs.stdout);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
