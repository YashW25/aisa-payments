import { Client } from 'ssh2';

const conn = new Client();

const newEnv = `DATABASE_URL="postgresql://postgres.uyqcffnqunymjzlakyho:AISA%4020230987654321@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
JWT_SECRET="aisa-super-secret-key-change-in-prod"
NEXT_PUBLIC_SITE_URL="https://payments.isbmcoe.in"
UPLOAD_DIR="/app/data/uploads"
`;

conn.on('ready', () => {
  console.log('SSH Ready');
  const remoteCmd = `cat << 'EOF' > /opt/aisa-payments/.env
${newEnv}
EOF
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
