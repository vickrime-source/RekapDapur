const TEMPLATE_URLS: Record<string, string> = {
  "LUWENG BOGA": "https://docs.google.com/document/d/1X2HNMC1CW8hqjhKw_QS2U3CFknywAwX9/export?format=docx",
  "HTG": "https://docs.google.com/document/d/16EIPBpX8aax5nqJAhiwXe2GUgdH0dNKd/export?format=docx",
  "LUMBUNG ADIFRUTA": "https://docs.google.com/document/d/1WTfrlnfKBkMmn99PBOjjCwLxmG2Wvvht/export?format=docx",
  "PROHE": "https://docs.google.com/document/d/1JIJ4NwEcZS18yGVy8kf4k27Ln1aaVDIf/export?format=docx"
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

export default async function handler(req: any, res: any) {
  try {
    const tokoQuery = (req.query.toko as string) || 'HTG';
    const targetUrl = getGoogleDocTemplateUrl(tokoQuery);

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
    res.status(500).json({ error: err?.message || 'Server error proxying Google Docs template' });
  }
}
