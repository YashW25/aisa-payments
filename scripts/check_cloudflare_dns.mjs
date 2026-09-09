import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('--- TESTING CLOUDFLARE PROXY RESOLUTION FOR ISBMCOE.IN ---');
    const res = await ssh.execCommand('nslookup erp.isbmcoe.in');
    console.log('erp.isbmcoe.in resolution:\n', res.stdout);

    const res2 = await ssh.execCommand('nslookup payments.isbmcoe.in');
    console.log('payments.isbmcoe.in resolution:\n', res2.stdout);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
