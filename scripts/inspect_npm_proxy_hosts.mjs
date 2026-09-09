import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('=== CHECKING NPM DATA DIRECTORY FOR PROXY HOST CONFIGS ===');
    const res = await ssh.execCommand('echo "12345678" | sudo -S docker exec nginx-proxy-manager ls -la /data/nginx/proxy_host');
    console.log(res.stdout);

    const res2 = await ssh.execCommand('echo "12345678" | sudo -S docker exec nginx-proxy-manager sh -c "cat /data/nginx/proxy_host/*.conf 2>/dev/null || true"');
    console.log('--- CUSTOM PROXY HOSTS ---');
    console.log(res2.stdout);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
