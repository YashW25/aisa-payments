import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('Reading Netlify environment variables if cached or docker env...');
    const catEnv = await ssh.execCommand('cat /opt/aisa-payments/.env');
    console.log('Current .env lines:');
    catEnv.stdout.split('\n').forEach(line => {
      if (line.startsWith('DATABASE_URL=')) console.log('DATABASE_URL host:', line.split('@')[1] || line);
    });

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
