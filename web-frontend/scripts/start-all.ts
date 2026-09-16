import { spawn } from 'child_process';
import path from 'path';

console.log('🚀 Starting Mini Employee Task Manager (Backend & Frontend)...');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// Spawn Backend Server
const serverProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(process.cwd(), '../backend'),
  stdio: 'inherit',
  shell: true,
});

// Spawn Frontend Next.js Server
const frontendProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  console.log('\nStopping development servers...');
  serverProcess.kill();
  frontendProcess.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
