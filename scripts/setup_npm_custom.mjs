import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('--- CHECKING NPM NETWORKS & CONTAINER CONNECTIONS ---');
    const res = await ssh.execCommand('echo "12345678" | sudo -S docker inspect nginx-proxy-manager --format "{{json .NetworkSettings.Networks}}"');
    console.log('NPM Networks:', res.stdout);

    // Let's create a proxy host file in /data/nginx/custom/server_proxy.conf so NPM loads it globally
    const customServerBlock = `
server {
    listen 80;
    listen [::]:80;
    server_name payments.isbmcoe.in;

    include conf.d/include/block-exploits.conf;
    include conf.d/include/letsencrypt-acme-challenge.conf;

    location / {
        proxy_pass http://100.103.218.118:3000;
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

    console.log('Writing custom server block to NPM custom config...');
    await ssh.execCommand(`echo "12345678" | sudo -S docker exec nginx-proxy-manager sh -c 'cat << "EOF" > /data/nginx/custom/server_proxy.conf\n${customServerBlock}\nEOF'`);

    console.log('Testing NPM nginx config...');
    const testRes = await ssh.execCommand('echo "12345678" | sudo -S docker exec nginx-proxy-manager nginx -t');
    console.log('NPM nginx -t output:', testRes.stdout, testRes.stderr);

    console.log('Reloading NPM...');
    await ssh.execCommand('echo "12345678" | sudo -S docker exec nginx-proxy-manager nginx -s reload');

    // Test request
    console.log('\nTesting routing for payments.isbmcoe.in...');
    const testRoute = await ssh.execCommand('curl -i -H "Host: payments.isbmcoe.in" http://127.0.0.1:80/');
    console.log('--- Proxy Response ---');
    console.log(testRoute.stdout.split('\n').slice(0, 15).join('\n'));

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
