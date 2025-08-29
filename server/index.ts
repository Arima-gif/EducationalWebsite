#!/usr/bin/env tsx
// Frontend-only redirect script
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 Starting frontend-only React application...');
console.log('📁 Running Vite development server');

// Set environment variables for Replit compatibility
process.env.VITE_HOST = '0.0.0.0';
process.env.VITE_PORT = '5000';

// Start Vite development server from root directory
const vite = spawn('npx', ['vite', 'dev', '--host', '0.0.0.0', '--port', '5000'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

vite.on('error', (error) => {
  console.error('Failed to start Vite server:', error);
  process.exit(1);
});

vite.on('close', (code) => {
  console.log(`Vite server exited with code ${code}`);
  process.exit(code || 0);
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