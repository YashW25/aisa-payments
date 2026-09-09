import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('--- PHASE 8 to 16 VERIFICATIONS ---');
    
    // 1. Host storage mount & permission test
    console.log('\n1. Testing host bind mount write test...');
    await ssh.execCommand('echo "12345678" | sudo -S docker exec aisa-payments-app touch /app/data/uploads/test_mount.tmp');
    const testFileCheck = await ssh.execCommand('ls -la /opt/aisa-payments/data/uploads/test_mount.tmp');
    console.log('Host file created via container:', testFileCheck.stdout.trim() ? 'SUCCESS' : 'FAILED');
    await ssh.execCommand('echo "12345678" | sudo -S docker exec aisa-payments-app rm /app/data/uploads/test_mount.tmp');

    // 2. Health check test
    console.log('\n2. Testing /api/health endpoint...');
    const healthCheck = await ssh.execCommand('curl -s http://127.0.0.1:3000/api/health');
    console.log('Health JSON:', healthCheck.stdout);

    // 3. Admin Proof Security test (unauthenticated request)
    console.log('\n3. Testing unauthenticated proof access...');
    const proofRes = await ssh.execCommand('curl -i http://127.0.0.1:3000/api/admin/payments/test-id/proof');
    console.log('Unauthenticated proof status (expect 401):', proofRes.stdout.split('\n')[0]);

    // 4. Backup script execution test
    console.log('\n4. Testing backup script...');
    await ssh.execCommand('chmod +x /opt/aisa-payments/scripts/backup.sh');
    const backupRes = await ssh.execCommand('/opt/aisa-payments/scripts/backup.sh');
    console.log('Backup script output:', backupRes.stdout);
    const backupList = await ssh.execCommand('ls -la /opt/aisa-payments/backups');
    console.log('Backups directory:\n', backupList.stdout);

    // 5. Container restart persistence test
    console.log('\n5. Testing container restart...');
    await ssh.execCommand('cd /opt/aisa-payments && docker compose restart app');
    const psRes = await ssh.execCommand('cd /opt/aisa-payments && docker compose ps');
    console.log('Container status after restart:\n', psRes.stdout);

    ssh.dispose();
  } catch (err) {
    console.error('Verification Error:', err);
  }
}

run();
