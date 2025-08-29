#!/usr/bin/env tsx
// Frontend-only redirect script
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Start custom development server that handles Replit hosts properly
const devServer = spawn('node', ['dev-server.js'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

devServer.on('error', (error) => {
  console.error('Failed to start development server:', error);
  process.exit(1);
});

devServer.on('close', (code) => {
  console.log(`Development server exited with code ${code}`);
  process.exit(code || 0);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  devServer.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development server...');
  devServer.kill('SIGTERM');
});