import { Client } from 'ssh2';
import bcrypt from 'bcryptjs';

const conn = new Client();

async function run() {
  const hash = await bcrypt.hash('admin123', 10);
  console.log("Generated hash local:", hash);

  conn.on('ready', () => {
    console.log('SSH Ready');
    const remoteCmd = `docker exec aisa-payments-app node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); async function run() { await p.admin.upsert({ where: { email: 'admin@isbmcoe.in' }, update: { passwordHash: '${hash}' }, create: { email: 'admin@isbmcoe.in', passwordHash: '${hash}' } }); console.log('PASSWORD_RESET_SUCCESS'); } run().catch(console.error);"`;
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
