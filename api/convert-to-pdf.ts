import { convertDocxToPdfWithCloudConvert } from '../src/lib/cloudConvert';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { docxBase64, apiKey: customApiKey } = req.body || {};

    if (!docxBase64) {
      return res.status(400).json({ error: 'Parameter docxBase64 wajib diisi.' });
    }

    const apiKey = (process.env.CLOUDCONVERT_API_KEY || customApiKey || '').trim();
    if (!apiKey) {
      console.error('[API Error /api/convert-to-pdf]: CLOUDCONVERT_API_KEY environment variable is not set on the server.');
      return res.status(400).json({
        error: 'CLOUDCONVERT_API_KEY tidak ditemukan di environment variable server (Vercel).',
      });
    }

    const docxBuffer = Buffer.from(docxBase64, 'base64');
    const pdfBuffer = await convertDocxToPdfWithCloudConvert(docxBuffer, apiKey);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
    return res.status(200).send(pdfBuffer);
  } catch (err: any) {
    console.error('[API Error /api/convert-to-pdf Exception Details]:', err);
    return res.status(500).json({
      error: err?.message || 'Gagal melakukan konversi PDF via CloudConvert',
    });
  }
}

