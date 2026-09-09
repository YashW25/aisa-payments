import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('=== CREATING NGINX PROXY MANAGER PROXY HOST FOR payments.isbmcoe.in ===');
    
    // Check if NPM database or config can be updated or if we add custom nginx server block
    // Nginx Proxy Manager supports custom configuration files under /data/nginx/custom/
    // Let's create a dedicated proxy host config directly inside Nginx Proxy Manager's data folder

    const customProxyHostConfig = `
server {
  set $forward_scheme http;
  set $server         "127.0.0.1";
  set $port           3000;

  listen 80;
  listen [::]:80;

  server_name payments.isbmcoe.in;

  # Block Exploits
  include conf.d/include/block-exploits.conf;
  include conf.d/include/letsencrypt-acme-challenge.conf;

  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection $http_connection;
  proxy_http_version 1.1;

  access_log /data/logs/payments-isbmcoe-in_access.log proxy;
  error_log /data/logs/payments-isbmcoe-in_error.log warn;

  location / {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://127.0.0.1:3000;
  }
}
`;

    // Write config to NPM custom directory or proxy_host directory
    await ssh.execCommand(`echo "12345678" | sudo -S sh -c 'cat << "EOF" > /var/lib/docker/volumes/$(docker volume ls -q | grep -i nginx | head -n1)/_data/nginx/proxy_host/5.conf\n${customProxyHostConfig}\nEOF'`);
    
    // Also test inside container directly
    await ssh.execCommand(`echo "12345678" | sudo -S docker exec nginx-proxy-manager sh -c 'cat << "EOF" > /data/nginx/proxy_host/5.conf\n${customProxyHostConfig}\nEOF'`);

    console.log('Reloading Nginx Proxy Manager...');
    const reloadRes = await ssh.execCommand('echo "12345678" | sudo -S docker exec nginx-proxy-manager nginx -s reload');
    console.log('Nginx reload output:', reloadRes.stdout, reloadRes.stderr);

    // Test local resolution using Host header
    console.log('\nTesting HTTP routing via Host header payments.isbmcoe.in...');
    const testRoute = await ssh.execCommand('curl -i -H "Host: payments.isbmcoe.in" http://127.0.0.1:80/');
    console.log('--- NPM Proxy Test Result ---');
    console.log(testRoute.stdout.split('\n').slice(0, 15).join('\n'));

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
