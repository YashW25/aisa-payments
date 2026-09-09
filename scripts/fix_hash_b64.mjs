import { Client } from 'ssh2';
import bcrypt from 'bcryptjs';

const conn = new Client();

async function run() {
  const hash = await bcrypt.hash('admin123', 10);
  console.log("FULL HASH:", hash);

  conn.on('ready', () => {
    console.log('SSH Ready');
    // Using base64 encoding to guarantee 100% exact transfer without shell interpolation
    const b64Hash = Buffer.from(hash).toString('base64');
    const remoteCmd = `docker exec aisa-payments-app node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); const h = Buffer.from('${b64Hash}', 'base64').toString('utf8'); p.admin.update({ where: { email: 'admin@isbmcoe.in' }, data: { passwordHash: h } }).then(() => console.log('UPDATED')).catch(console.error);"`;
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
}

run();
