import { NodeSSH } from 'node-ssh';
import fs from 'fs';
import path from 'path';

const ssh = new NodeSSH();

async function run() {
  try {
    console.log('1. Connecting SSH...');
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('2. Creating /opt/aisa-payments directories...');
    await ssh.execCommand('echo "12345678" | sudo -S mkdir -p /opt/aisa-payments/data/uploads /opt/aisa-payments/data/receipts /opt/aisa-payments/backups');
    await ssh.execCommand('echo "12345678" | sudo -S chown -R gaurav:gaurav /opt/aisa-payments');
    await ssh.execCommand('echo "12345678" | sudo -S chown -R 1001:1001 /opt/aisa-payments/data');
    await ssh.execCommand('echo "12345678" | sudo -S chmod -R 777 /opt/aisa-payments/data');

    console.log('3. Syncing application source code...');
    const localDir = 'd:/Projects/Codes/Aisa Payments';
    
    // Upload files to /opt/aisa-payments
    await ssh.putDirectory(localDir, '/opt/aisa-payments', {
      recursive: true,
      concurrency: 5,
      validate: (itemPath) => {
        const baseName = path.basename(itemPath);
        if (baseName === 'node_modules' || baseName === '.next' || baseName === '.git') return false;
        return true;
      }
    });

    console.log('4. Copying production .env file...');
    // Copy local .env file
    await ssh.putFile(`${localDir}/.env`, '/opt/aisa-payments/.env');

    console.log('5. Building Docker image on server...');
    const buildRes = await ssh.execCommand('cd /opt/aisa-payments && docker compose build', {
      onStdout: (chunk) => process.stdout.write(chunk.toString()),
      onStderr: (chunk) => process.stderr.write(chunk.toString()),
    });

    console.log('6. Starting Docker container...');
    const upRes = await ssh.execCommand('cd /opt/aisa-payments && docker compose up -d');
    console.log(upRes.stdout);
    console.log(upRes.stderr);

    console.log('7. Checking status & health...');
    await new Promise((r) => setTimeout(r, 5000));
    const psRes = await ssh.execCommand('cd /opt/aisa-payments && docker compose ps');
    console.log(psRes.stdout);

    const healthRes = await ssh.execCommand('curl -i http://127.0.0.1:3000/api/health');
    console.log('--- API HEALTH CHECK ---');
    console.log(healthRes.stdout);

    ssh.dispose();
  } catch (err) {
    console.error('Deployment Error:', err);
    process.exit(1);
  }
}

run();
