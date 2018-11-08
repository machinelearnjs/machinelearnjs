const cp = require('child_process');

function isDockerInstalled() {
  let result = true;
  try {
    cp.execSync('docker version');
  } catch (err) {
    result = false;
  }
  return result;
}

function runIntegrationTests() {
  if (isDockerInstalled()) {
    const cmds = [
      {
        comment: '### 1. building a kalimdor docker image',
        cmd: 'docker build -t kalimdor:latest .'
      },
      {
        comment: '### 2. Running build-prod.sh in a temporary container',
        cmd: "docker run --rm kalimdor:latest './scripts/build-prod.sh'"
      }
    ];

    for (let i = 0; i < cmds.length; i++) {
      console.log(cmds[i].comment);
      cp.execSync(cmds[i].cmd, { stdio: [0, 1, 2] });
    }
  } else {
    console.warn(
      'Docker does not seem to be properly installed. Skipping integration tests.'
    );
  }
}

try {
  runIntegrationTests();
  console.log('PASS Integration tests');
} catch (err) {
  console.error('FAILED Integration tests');
  process.exitCode = 1;
}
