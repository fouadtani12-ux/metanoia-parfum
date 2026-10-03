import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter, dbProducts } from './src/server/apiRouter';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// CORS headers
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

// REST API routes mounted at /api
app.use('/api', apiRouter);

// SEO: Robots.txt fallback
app.get('/robots.txt', (_req: Request, res: Response) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /account/
Disallow: /checkout/

Sitemap: https://metanoia-parfums.com/sitemap.xml
`);
});

// SEO: Sitemap.xml fallback
app.get('/sitemap.xml', (_req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || 'https://metanoia-parfums.com';
  const urls = [
    '',
    '/shop',
    '/shop/homme',
    '/shop/femme',
    '/shop/unisexe',
    '/about',
    '/contact',
    '/faq',
    '/shipping',
    '/returns',
    '/terms',
    '/privacy',
  ];

  const productUrls = dbProducts.map((p) => `/product/${p.slug}`);
  const allPaths = [...urls, ...productUrls];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPaths
  .map(
    (p) => `  <url>
    <loc>${baseUrl}${p}</loc>
    <lastmod>2026-09-27</lastmod>
    <changefreq>${p === '' || p.startsWith('/shop') ? 'daily' : 'weekly'}</changefreq>
    <priority>${p === '' ? '1.0' : p.startsWith('/product') ? '0.8' : '0.6'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.type('application/xml');
  res.send(sitemapXml);
});

// ==========================================
// VITE OR STATIC SERVING
// ==========================================
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`METANOÏA PARFUMS Server active at http://localhost:${PORT}`);
  });
}

startServer();

export default app;
