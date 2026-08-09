import { convertDocxToPdfWithCloudConvert } from '../src/lib/cloudConvert';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    let docxBuffer: Buffer | null = null;
    let downloadName = 'Invoice.pdf';
    let customApiKey = '';

    if (Buffer.isBuffer(req.body) && req.body.length > 0) {
      docxBuffer = req.body;
      if (req.query.fileName) {
        downloadName = decodeURIComponent(req.query.fileName as string);
      }
    } else {
      const { docxBase64, apiKey, fileName } = req.body || {};
      if (docxBase64) {
        docxBuffer = Buffer.from(docxBase64, 'base64');
      }
      if (fileName) downloadName = fileName;
      if (apiKey) customApiKey = apiKey;
    }

    if (!docxBuffer || docxBuffer.length === 0) {
      return res.status(400).json({ error: 'Data file DOCX tidak ditemukan dalam request.' });
    }

    const apiKey = (process.env.CLOUDCONVERT_API_KEY || customApiKey || '').trim();
    if (!apiKey) {
      console.error('[API Error /api/convert-to-pdf]: CLOUDCONVERT_API_KEY environment variable is not set on the server.');
      return res.status(400).json({
        error: 'CLOUDCONVERT_API_KEY tidak ditemukan di environment variable server (Vercel).',
      });
    }

    const pdfBuffer = await convertDocxToPdfWithCloudConvert(docxBuffer, apiKey);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    return res.status(200).send(pdfBuffer);
  } catch (err: any) {
    console.error('[API Error /api/convert-to-pdf Exception Details]:', err);
    return res.status(500).json({
      error: err?.message || 'Gagal melakukan konversi PDF via CloudConvert',
    });
  }
}

