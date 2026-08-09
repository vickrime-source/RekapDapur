import { convertDocxToPdfWithCloudConvert } from '../src/lib/cloudConvert';
import { compressDocxImages } from '../src/lib/docxCompressor';

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

    const initialSizeMB = (docxBuffer.length / (1024 * 1024)).toFixed(2);
    console.log(`[Vercel API /api/convert-to-pdf] Initial DOCX size: ${initialSizeMB} MB. Running auto image compression...`);

    // Auto-compress images in DOCX zip archive
    docxBuffer = await compressDocxImages(docxBuffer);

    const finalSizeBytes = docxBuffer.length;
    const finalSizeMB = (finalSizeBytes / (1024 * 1024)).toFixed(2);

    const MAX_PAYLOAD_BYTES = 4.5 * 1024 * 1024;
    if (finalSizeBytes > MAX_PAYLOAD_BYTES) {
      console.warn(`[Vercel API /api/convert-to-pdf] Size after compression (${finalSizeMB} MB) exceeds 4.5MB limit`);
      return res.status(413).json({
        error: `Ukuran file DOCX setelah kompresi otomatis (${finalSizeMB} MB) masih melebihi batas maksimum platform (4.50 MB, ukuran awal: ${initialSizeMB} MB). Harap kurangi ukuran logo/gambar pada template Google Docs Anda.`,
      });
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

