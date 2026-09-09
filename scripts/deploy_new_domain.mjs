import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    console.log('1. Connecting SSH...');
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('2. Syncing updated codebase with NEXT_PUBLIC_SITE_URL=https://payments.isbmcoe.in...');
    const localDir = 'd:/Projects/Codes/Aisa Payments';
    
    // Put updated .env file
    await ssh.putFile(`${localDir}/.env.example`, '/opt/aisa-payments/.env.example');
    
    // Update .env file on server to use new domain
    await ssh.execCommand('sed -i "s|NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=\\"https://payments.isbmcoe.in\\"|g" /opt/aisa-payments/.env');

    console.log('3. Rebuilding Docker image standalone output with updated environment...');
    await ssh.execCommand('cd /opt/aisa-payments && docker compose build', {
      onStdout: (chunk) => process.stdout.write(chunk.toString()),
      onStderr: (chunk) => process.stderr.write(chunk.toString()),
    });

    console.log('4. Restarting container with updated build...');
    await ssh.execCommand('cd /opt/aisa-payments && docker compose up -d');

    console.log('5. Verifying internal health endpoint...');
    await new Promise((r) => setTimeout(r, 4000));
    const healthRes = await ssh.execCommand('curl -i http://127.0.0.1:3000/api/health');
    console.log('--- API HEALTH CHECK ---');
    console.log(healthRes.stdout);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
