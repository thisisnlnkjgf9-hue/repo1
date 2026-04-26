import cors from 'cors';
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import apiRoutes from './routes/api.routes.js';
import adminRoutes from './routes/admin.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Lightweight probe endpoint for Render health checks / keep-warm pings.
app.get('/health2', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'nouryum-api',
    uptimeSeconds: Math.floor(process.uptime())
  });
});

/* Serve uploaded images */
app.use('/uploads', express.static(path.resolve(__dirname, '../../public/uploads')));

app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);

/* Serve Vite build in production */
const distPath = path.resolve(__dirname, '../../dist');
app.use(express.static(distPath));
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
