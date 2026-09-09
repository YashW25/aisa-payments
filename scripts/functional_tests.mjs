import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('--- TESTING COMPLETE END-TO-END FLOW FOR payments.isbmcoe.in ---');

    // 1. Test homepage HTML response
    console.log('\n1. Testing Homepage Route (/)...');
    const homeRes = await ssh.execCommand('curl -s -H "Host: payments.isbmcoe.in" http://127.0.0.1:80/');
    console.log('Homepage Title Found:', homeRes.stdout.includes('AISA Payments') ? 'YES ✅' : 'NO ❌');

    // 2. Test API health endpoint (/api/health)
    console.log('\n2. Testing Health API (/api/health)...');
    const healthRes = await ssh.execCommand('curl -s -H "Host: payments.isbmcoe.in" http://127.0.0.1:80/api/health');
    console.log('Health JSON:', healthRes.stdout);

    // 3. Test Admin Login Page (/admin/login)
    console.log('\n3. Testing Admin Login Route (/admin/login)...');
    const adminRes = await ssh.execCommand('curl -s -H "Host: payments.isbmcoe.in" http://127.0.0.1:80/admin/login');
    console.log('Admin Page Received:', adminRes.stdout.includes('Admin Login') ? 'YES ✅' : 'NO ❌');

    // 4. Test Proof Security Endpoint (/api/admin/payments/test-id/proof)
    console.log('\n4. Testing Proof Endpoint Security (expect 401)...');
    const proofRes = await ssh.execCommand('curl -i -H "Host: payments.isbmcoe.in" http://127.0.0.1:80/api/admin/payments/test-id/proof');
    console.log('Unauthenticated Proof Status:', proofRes.stdout.split('\n')[0]);

    // 5. Test existing project (erp.isbmcoe.in) protection
    console.log('\n5. Verifying existing project (erp.isbmcoe.in) protection...');
    const erpRes = await ssh.execCommand('curl -i -H "Host: erp.isbmcoe.in" http://127.0.0.1:80/');
    console.log('Existing ERP Status:', erpRes.stdout.split('\n')[0]);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
