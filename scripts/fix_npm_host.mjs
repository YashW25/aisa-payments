import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('Connecting aisa-payments-app container to NPM web-network...');
    await ssh.execCommand('echo "12345678" | sudo -S docker network connect web-network aisa-payments-app 2>/dev/null || true');

    const dedicatedProxyHostConfig = `
server {
  set $forward_scheme http;
  set $server         "aisa-payments-app";
  set $port           3000;

  listen 80;
  listen [::]:80;

  server_name payments.isbmcoe.in;

  include conf.d/include/block-exploits.conf;
  include conf.d/include/letsencrypt-acme-challenge.conf;

  access_log /data/logs/proxy-host-payments_access.log proxy;
  error_log /data/logs/proxy-host-payments_error.log warn;

  location / {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_http_version 1.1;

    proxy_pass http://aisa-payments-app:3000;
  }
}
`;

    // Remove old custom block file if present
    await ssh.execCommand('echo "12345678" | sudo -S docker exec nginx-proxy-manager rm -f /data/nginx/custom/server_proxy.conf');

    // Create host file in /data/nginx/proxy_host/5.conf inside container
    await ssh.execCommand(`echo "12345678" | sudo -S docker exec nginx-proxy-manager sh -c 'cat << "EOF" > /data/nginx/proxy_host/5.conf\n${dedicatedProxyHostConfig}\nEOF'`);

    console.log('Testing & Reloading Nginx Proxy Manager...');
    await ssh.execCommand('echo "12345678" | sudo -S docker exec nginx-proxy-manager nginx -t');
    await ssh.execCommand('echo "12345678" | sudo -S docker exec nginx-proxy-manager nginx -s reload');

    // Test routing
    console.log('\nRetesting route for payments.isbmcoe.in...');
    const testRoute = await ssh.execCommand('curl -s -H "Host: payments.isbmcoe.in" http://127.0.0.1:80/api/health');
    console.log('Health Output:', testRoute.stdout);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
