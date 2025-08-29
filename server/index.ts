#!/usr/bin/env tsx
// Dual server setup: API backend + Vite frontend
import { spawn } from 'child_process';
import { createApp } from './app.js';

const API_PORT = 3001;
const HOST = '0.0.0.0';
const FRONTEND_PORT = 5000;

async function startServer() {
  try {
    console.log('🚀 Starting full-stack application...');
    console.log('📊 Setting up database connection...');
    console.log('🌐 Starting API server...');

    // Start API server
    const app = await createApp();
    const apiServer = app.listen(API_PORT, () => {
      console.log(`📡 API server running at http://localhost:${API_PORT}/api`);
    });

    console.log('📁 Starting Vite development server...');

    // Start Vite frontend server with custom Replit-compatible config
    const viteServer = spawn('npx', ['vite', 'dev', '--config', 'vite.replit.config.ts'], {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        VITE_API_URL: `http://localhost:${API_PORT}`,
        VITE_HOST: HOST,
        VITE_PORT: FRONTEND_PORT.toString()
      }
    });

    console.log(`🎨 Frontend server starting at http://${HOST}:${FRONTEND_PORT}/`);

    // Handle graceful shutdown
    const shutdown = () => {
      console.log('\n🛑 Shutting down servers...');
      viteServer.kill();
      apiServer.close(() => {
        console.log('Servers closed');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    viteServer.on('error', (error) => {
      console.error('Vite server error:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start servers:', error);
    process.exit(1);
  }
}

startServer();