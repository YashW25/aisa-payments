import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('--- RESTARTING CLOUDFLARE TEST TUNNEL WITH HOST HEADER ---');
    
    await ssh.execCommand('echo "12345678" | sudo -S docker rm -f aisa-test-tunnel 2>/dev/null || true');

    // Run quick tunnel with host header override so Next.js standalone handles it properly
    const runTunnel = await ssh.execCommand('echo "12345678" | sudo -S docker run -d --name aisa-test-tunnel --network web-network cloudflare/cloudflared:latest tunnel --url http://aisa-payments-app:3000 --http-host-header payments.isbmcoe.in');
    
    await new Promise(r => setTimeout(r, 6000));

    const logs = await ssh.execCommand('echo "12345678" | sudo -S docker logs aisa-test-tunnel 2>&1 | grep -o "https://[a-zA-Z0-9-]*\\.trycloudflare\\.com"');
    const tunnelUrl = logs.stdout.trim().split('\n')[0];
    console.log('PUBLIC_TEST_URL:', tunnelUrl);

    if (tunnelUrl) {
      const curlRes = await ssh.execCommand(`curl -s -i ${tunnelUrl}/api/health`);
      console.log('Public Health API Response:\n', curlRes.stdout);
    }

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
