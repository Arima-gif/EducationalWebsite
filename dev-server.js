#!/usr/bin/env node
// Custom Vite development server for Replit environment

import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startDevServer() {
  try {
    const server = await createServer({
      root: path.resolve(__dirname, 'client'),
      plugins: [
        react(),
        // Disable problematic replit plugins for now
      ],
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "client", "src"),
          "@shared": path.resolve(__dirname, "shared"),
          "@assets": path.resolve(__dirname, "attached_assets"),
        },
      },
      server: {
        host: '0.0.0.0',
        port: 5000,
        strictPort: true,
        hmr: {
          host: 'localhost',
          port: 5000
        }
      },
      build: {
        outDir: path.resolve(__dirname, "dist/public"),
        emptyOutDir: true,
      },
      configFile: false // Don't load the main config file to avoid conflicts
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