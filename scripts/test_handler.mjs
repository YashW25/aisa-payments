import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH Ready');
  const remoteCmd = `docker exec aisa-payments-app node -e "const route = require('/app/.next/server/app/api/admin/login/route.js'); async function test() { const req = new Request('http://localhost/api/admin/login', { method: 'POST', body: JSON.stringify({ email: 'admin@isbmcoe.in', password: 'admin123' }) }); const res = await route.routeModule.userland.POST(req); console.log('STATUS:', res.status); console.log('BODY:', await res.text()); } test().catch(console.error);"`;
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
