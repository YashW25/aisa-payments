import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('=== PHASE 1 & 6: INSPECTING EXISTING NGINX PROXY MANAGER PROXY HOSTS ===');

    // 1. List files in Nginx Proxy Manager data directory
    const npmFiles = await ssh.execCommand('echo "12345678" | sudo -S docker exec nginx-proxy-manager ls -la /etc/nginx/conf.d');
    console.log('--- NPM /etc/nginx/conf.d ---');
    console.log(npmFiles.stdout);

    // 2. Read proxy host config files if any exist
    const npmHosts = await ssh.execCommand('echo "12345678" | sudo -S docker exec nginx-proxy-manager sh -c "cat /etc/nginx/conf.d/*.conf 2>/dev/null || true"');
    console.log('--- NPM EXISTING PROXY HOST CONFIGS ---');
    console.log(npmHosts.stdout);

    // 3. Check DNS resolution for payments.isbmcoe.in & isbmcoe.in
    const dns1 = await ssh.execCommand('dig +short payments.isbmcoe.in || nslookup payments.isbmcoe.in');
    console.log('--- DNS Lookup: payments.isbmcoe.in ---');
    console.log(dns1.stdout);

    const dns2 = await ssh.execCommand('dig +short isbmcoe.in || nslookup isbmcoe.in');
    console.log('--- DNS Lookup: isbmcoe.in ---');
    console.log(dns2.stdout);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
