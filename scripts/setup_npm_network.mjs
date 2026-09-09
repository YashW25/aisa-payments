import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    // 1. Connect aisa-payments-app container to NPM's web-network
    console.log('Connecting aisa-payments-app container to NPM web-network...');
    await ssh.execCommand('echo "12345678" | sudo -S docker network connect web-network aisa-payments-app 2>/dev/null || true');

    // 2. Configure server block to route via docker container name "aisa-payments-app:3000"
    const customServerBlock = `
server {
    listen 80;
    listen [::]:80;
    server_name payments.isbmcoe.in;

    include conf.d/include/block-exploits.conf;
    include conf.d/include/letsencrypt-acme-challenge.conf;

    location / {
        proxy_pass http://aisa-payments-app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
`;

    console.log('Updating NPM custom server block...');
    await ssh.execCommand(`echo "12345678" | sudo -S docker exec nginx-proxy-manager sh -c 'cat << "EOF" > /data/nginx/custom/server_proxy.conf\n${customServerBlock}\nEOF'`);

    console.log('Testing & Reloading NPM...');
    await ssh.execCommand('echo "12345678" | sudo -S docker exec nginx-proxy-manager nginx -t');
    await ssh.execCommand('echo "12345678" | sudo -S docker exec nginx-proxy-manager nginx -s reload');

    // 3. Test HTTP routing locally with Host header
    console.log('\nTesting HTTP routing for payments.isbmcoe.in via Nginx Proxy Manager...');
    const testRoute = await ssh.execCommand('curl -i -H "Host: payments.isbmcoe.in" http://127.0.0.1:80/');
    console.log('--- NPM PROXY ROUTING RESULT ---');
    console.log(testRoute.stdout.split('\n').slice(0, 15).join('\n'));

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
