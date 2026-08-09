import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { convertDocxToPdfWithCloudConvert } from './src/lib/cloudConvert';

const TEMPLATE_URLS: Record<string, string> = {
  "LUWENG BOGA": "https://docs.google.com/document/d/1GoLCYZnsf27NMaNYAiDbkgbVavGS4eGu/export?format=docx",
  "HTG": "https://docs.google.com/document/d/1TRhM_wW6z5FqGLXYAuXf5-vv28-CBFYe/export?format=docx",
  "LUMBUNG ADIFRUTA": "https://docs.google.com/document/d/1mu0MjtyESAVNhdE-myKdZ3ydF9XReN78/export?format=docx",
  "PROHE": "https://docs.google.com/document/d/1YboT-odlgjZTCMO94MrsjiZgFh69NSJ8/export?format=docx"
};

function getGoogleDocTemplateUrl(storeName: string): string {
  const norm = (storeName || '').trim().toUpperCase();
  if (norm.includes('LUWENG') || norm.includes('LEMBUNG') || norm.includes('BOGA') || norm.includes('LB')) {
    return TEMPLATE_URLS["LUWENG BOGA"];
  }
  if (norm.includes('PROHE') || norm.includes('PW')) {
    return TEMPLATE_URLS["PROHE"];
  }
  if (norm.includes('LUMBUNG') || norm.includes('ADIFRUTA') || norm.includes('FRUITA') || norm.includes('LA')) {
    return TEMPLATE_URLS["LUMBUNG ADIFRUTA"];
  }
  return TEMPLATE_URLS["HTG"];
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing large JSON payloads (base64 docx)
  app.use(express.json({ limit: '50mb' }));

  // Proxy endpoint to fetch Google Docs export link as binary docx
  app.get('/api/fetch-template', async (req, res) => {
    try {
      const tokoQuery = (req.query.toko as string) || 'HTG';
      const targetUrl = getGoogleDocTemplateUrl(tokoQuery);

      console.log(`[Proxy Server] Fetching template for store "${tokoQuery}" from ${targetUrl}`);

      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (!response.ok) {
        return res.status(response.status).json({
          error: `Gagal mengambil template dari Google Docs (${response.statusText})`,
        });
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="template_${tokoQuery.replace(/\s+/g, '_')}.docx"`);
      res.send(buffer);
    } catch (err: any) {
      console.error('[Proxy Server Error]:', err);
      res.status(500).json({ error: err?.message || 'Server error proxying Google Docs template' });
    }
  });

  // Convert DOCX to PDF using CloudConvert API
  app.post('/api/convert-to-pdf', async (req, res) => {
    try {
      const { docxBase64, apiKey: customApiKey, fileName } = req.body || {};

      if (!docxBase64) {
        return res.status(400).json({ error: 'Parameter docxBase64 wajib diisi.' });
      }

      const apiKey = customApiKey || process.env.CLOUDCONVERT_API_KEY || '';
      if (!apiKey) {
        return res.status(400).json({
          error: 'CLOUDCONVERT_API_KEY tidak dikonfigurasi di environment server. Harap set CLOUDCONVERT_API_KEY.',
        });
      }

      console.log('[Server API] Converting DOCX to PDF via CloudConvert API...');
      const docxBuffer = Buffer.from(docxBase64, 'base64');
      const pdfBuffer = await convertDocxToPdfWithCloudConvert(docxBuffer, apiKey);

      const downloadName = fileName || 'Invoice.pdf';
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
      return res.status(200).send(pdfBuffer);
    } catch (err: any) {
      console.error('[Convert PDF Server Error]:', err);
      return res.status(500).json({
        error: err?.message || 'Gagal melakukan konversi PDF via CloudConvert',
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();