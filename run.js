const { spawn } = require('child_process');

const memoryLimit = '2048';
const script = 'index.js';

const child = spawn('node', [`--max-old-space-size=${memoryLimit}`, script], {
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  console.log(`App exited with code ${code}`);
});