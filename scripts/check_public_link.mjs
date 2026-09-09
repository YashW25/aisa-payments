import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('--- CHECKING DNS & PUBLIC ACCESSIBILITY FOR PAYMENTS.ISBMCOE.IN ---');
    const dnsRes = await ssh.execCommand('nslookup payments.isbmcoe.in');
    console.log(dnsRes.stdout);

    if (!dnsRes.stdout.includes('NXDOMAIN')) {
      const curlRes = await ssh.execCommand('curl -i -k https://payments.isbmcoe.in/api/health');
      console.log('Public HTTPS Curl Result:\n', curlRes.stdout);
    }

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
