import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('=== VERIFYING DNS RESOLUTION FOR ISBMCOE.IN SUBDOMAINS ===');

    const dnsVal = await ssh.execCommand('dig +short payments.isbmcoe.in || nslookup payments.isbmcoe.in');
    console.log('DNS Lookup Output:');
    console.log(dnsVal.stdout);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
