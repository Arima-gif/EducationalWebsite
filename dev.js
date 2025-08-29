#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting frontend-only React application...');
console.log('📁 Running from client directory');

// Start Vite development server
const vite = spawn('npx', ['vite', 'dev', '--host', '0.0.0.0', '--port', '5000'], {
  cwd: path.join(__dirname),
  stdio: 'inherit',
  shell: true
});

vite.on('error', (error) => {
  console.error('Failed to start Vite server:', error);
  process.exit(1);
});

vite.on('close', (code) => {
  console.log(`Vite server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  vite.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development server...');
  vite.kill('SIGTERM');
});