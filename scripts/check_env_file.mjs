import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH Ready');
  const remoteCmd = `docker exec aisa-payments-app cat /app/.env`;
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
