import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const TEMPLATE_URLS: Record<string, string> = {
  "LUWENG BOGA": "https://docs.google.com/document/d/178rvld0b0QB5ZgNryG_P1fVFyTrx2RcG/export?format=docx",
  "HTG": "https://docs.google.com/document/d/14LO9lhajdxQ0Mpnx5X-En-rhzpyLtJAe/export?format=docx",
  "LUMBUNG ADIFRUTA": "https://docs.google.com/document/d/1mE9-edW_0Sh4evlEUcVUUpWUtCrX_xCD/export?format=docx",
  "PROHE": "https://docs.google.com/document/d/1FwifnVpOfLlb2bN4mZBaPCmO7xZ8HuoA/export?format=docx"
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