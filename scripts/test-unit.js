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

function runUnitTests() {
  if (isDockerInstalled()) {
    const cmds = [
      {
        comment: '### 1. building a kalimdor docker image',
        cmd: 'docker build -t kalimdor:latest .'
      },
      {
        comment: '### 2. Running Jest unit tests in a temporary container',
        cmd:
          'docker run --rm kalimdor:latest npx jest --testPathIgnorePatterns "./test/integration/require.test.ts"'
      }
    ];

    for (let i = 0; i < cmds.length; i++) {
      console.log(cmds[i].comment);
      cp.execSync(cmds[i].cmd, { stdio: [0, 1, 2] });
    }
  } else {
    console.warn(
      'Docker does not seem to be properly installed. Skipping unit tests.'
    );
  }
}

try {
  runUnitTests();
  console.log('PASS Unit tests');
} catch (err) {
  console.error('FAILED Unit tests');
  process.exitCode = 1;
}
