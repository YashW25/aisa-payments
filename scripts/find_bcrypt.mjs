import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH Ready');
  const remoteCmd = `docker exec aisa-payments-app node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); async function run() { const chunk = require('/app/.next/server/chunks/_next-internal_server_app_api_admin_login_route_actions_14e5p02.js'); console.log(Object.keys(chunk)); } run().catch(console.error);"`;
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
