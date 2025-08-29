import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'vite';
import apiRoutes from './routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

export async function createApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API routes
  app.use('/api', apiRoutes);

  // Catch-all route for non-API requests
  app.get('/', (req, res) => {
    res.json({ 
      message: 'API Server Running',
      endpoints: ['/api/organizations', '/api/users', '/api/courses', '/api/enrollments']
    });
  });

  return app;
}

// Export is handled by the named export above