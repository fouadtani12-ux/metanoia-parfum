import express, { Request, Response } from 'express';
import { apiRouter } from '../src/server/apiRouter';

const app = express();

// Middleware
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// CORS configuration for Vercel deployment
app.use((_req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (_req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Dual mounting: supports both rewritten `/api/*` and direct `/api/*` on Vercel
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Standard Vercel Serverless Function entry point
export default function handler(req: any, res: any) {
  return app(req, res);
}

export { app };
