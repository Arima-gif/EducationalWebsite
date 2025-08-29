#!/usr/bin/env node
// Custom Vite development server for Replit environment

import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startDevServer() {
  try {
    const server = await createServer({
      root: path.resolve(__dirname, 'client'),
      server: {
        host: '0.0.0.0',
        port: 5000,
        strictPort: true,
        hmr: {
          host: 'localhost',
          port: 5000
        }
      },
      configFile: path.resolve(__dirname, 'vite.config.ts')
    });

    await server.listen();
    
    console.log('🚀 Starting frontend-only React application...');
    console.log('📁 Vite development server started successfully');
    server.printUrls();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down development server...');
      await server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Shutting down development server...');
      await server.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start development server:', error);
    process.exit(1);
  }
}

startDevServer();