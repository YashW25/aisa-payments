import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '100.103.218.118',
      username: 'gaurav',
      password: '12345678',
    });

    console.log('Testing direct HTTP request to container via server IP on port 3000...');
    const directRes = await ssh.execCommand('curl -i http://127.0.0.1:3000/api/health');
    console.log('Direct 3000 Health Output:\n', directRes.stdout);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
