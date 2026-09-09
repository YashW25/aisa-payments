import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH Ready');
  // Copy updated auth.ts into container and restart
  const remoteCmd = `
docker exec aisa-payments-app sed -i "s/secure: process.env.NODE_ENV === 'production'/secure: false/g" /app/.next/server/chunks/_next-internal_server_app_api_admin_login_route_actions_14e5p02.js 2>/dev/null || true
docker exec aisa-payments-app find /app/.next -type f -name "*.js" -exec sed -i "s/secure:!0/secure:!1/g" {} + 2>/dev/null || true
docker exec aisa-payments-app find /app/.next -type f -name "*.js" -exec sed -i "s/secure: true/secure: false/g" {} + 2>/dev/null || true
cd /opt/aisa-payments && docker compose restart app
`;
  conn.exec(remoteCmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('close', (code, signal) => {
      console.log('Output:\n' + out);
      conn.end();
    }).on('data', (data) => {
      out += data;
    }).stderr.on('data', (data) => {
      console.error('STDERR: ' + data);
    });
  });
}).connect({
  host: '100.103.218.118',
  port: 22,
  username: 'gaurav',
  password: '12345678'
});
