import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('Fixing /opt/aisa-payments directory ownership for nextjs user (uid 1001)...');
    await ssh.execCommand('echo "12345678" | sudo -S chown -R 1001:1001 /opt/aisa-payments/data');
    await ssh.execCommand('echo "12345678" | sudo -S chmod -R 775 /opt/aisa-payments/data');

    console.log('Testing file creation as node non-root user (1001)...');
    await ssh.execCommand('echo "12345678" | sudo -S docker exec aisa-payments-app touch /app/data/uploads/test_mount.tmp');
    const check = await ssh.execCommand('ls -la /opt/aisa-payments/data/uploads/test_mount.tmp');
    console.log('Host file list output:', check.stdout);
    
    await ssh.execCommand('echo "12345678" | sudo -S docker exec aisa-payments-app rm /app/data/uploads/test_mount.tmp');
    console.log('Cleanup completed successfully.');

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
