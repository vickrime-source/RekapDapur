/**
 * CloudConvert Helper for converting filled DOCX buffer into PDF
 */
export async function convertDocxToPdfWithCloudConvert(
  docxBuffer: Buffer,
  apiKey: string
): Promise<Buffer> {
  const cleanKey = (apiKey || '').trim();
  if (!cleanKey) {
    throw new Error('API Key CloudConvert tidak dikonfigurasi. Harap tentukan CLOUDCONVERT_API_KEY di environment variable server.');
  }

  console.log('[CloudConvert] Membuat Job konversi DOCX ke PDF...');

  // 1. Create Job with tasks: import-file -> convert-file -> export-file
  const createJobRes = await fetch('https://api.cloudconvert.com/v2/jobs', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cleanKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tasks: {
        'import-file': {
          operation: 'import/upload',
        },
        'convert-file': {
          operation: 'convert',
          input: 'import-file',
          input_format: 'docx',
          output_format: 'pdf',
          engine: 'libreoffice',
        },
        'export-file': {
          operation: 'export/url',
          input: 'convert-file',
        },
      },
    }),
  });

  if (!createJobRes.ok) {
    const errText = await createJobRes.text();
    console.error(`[CloudConvert API Error - Create Job] Status Code: ${createJobRes.status}`);
    console.error(`[CloudConvert API Response Body]:`, errText);
    
    if (createJobRes.status === 403 || errText.includes('Invalid scope')) {
      throw new Error(
        `CloudConvert API Error (403): API Key tidak memiliki izin/scope yang cukup ("Invalid scope(s) provided"). API Key saat ini hanya memiliki scope 'user.read/user.write'. Harap buat API Key baru di CloudConvert Dashboard (https://cloudconvert.com/dashboard/api/v1/keys) dan centang scope 'task.read', 'task.write', 'task.create' (atau centang ALL SCOPES).`
      );
    }

    let errorDetail = errText;
    try {
      const parsed = JSON.parse(errText);
      if (parsed.message) errorDetail = parsed.message;
      if (parsed.errors) errorDetail += ' | ' + JSON.stringify(parsed.errors);
    } catch (_) {}

    throw new Error(`CloudConvert API Error (${createJobRes.status}): ${errorDetail}`);
  }

  const jobJson = await createJobRes.json();
  const jobId = jobJson.data?.id;
  const tasks = jobJson.data?.tasks || [];
  const uploadTask = tasks.find((t: any) => t.name === 'import-file' || t.operation === 'import/upload');

  if (!uploadTask || !uploadTask.result?.form) {
    console.error('[CloudConvert Invalid Job Structure]:', JSON.stringify(jobJson, null, 2));
    throw new Error('Tidak dapat memperoleh Form Upload dari response CloudConvert.');
  }

  const uploadUrl = uploadTask.result.form.url;
  const uploadParams = uploadTask.result.form.parameters;

  // 2. Upload file docx via FormData
  console.log('[CloudConvert] Mengunggah file docx ke CloudConvert...');
  const formData = new FormData();
  for (const [key, value] of Object.entries(uploadParams)) {
    formData.append(key, value as string);
  }

  const blob = new Blob([docxBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  formData.append('file', blob, 'document.docx');

  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok) {
    const uploadErr = await uploadRes.text();
    console.error(`[CloudConvert API Error - Upload] Status Code: ${uploadRes.status}`);
    console.error(`[CloudConvert Upload Response Body]:`, uploadErr);
    throw new Error(`Gagal mengunggah file docx ke CloudConvert (Status ${uploadRes.status}): ${uploadErr}`);
  }

  // 3. Poll job status
  console.log(`[CloudConvert] Memantau status job ID: ${jobId}...`);
  let status = 'processing';
  let exportTask: any = null;
  let attempts = 0;
  const maxAttempts = 40; // ~80 seconds timeout max

  while (status !== 'finished' && status !== 'error' && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    attempts++;

    const checkRes = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${cleanKey}`,
      },
    });

    if (!checkRes.ok) {
      const checkErr = await checkRes.text();
      console.warn(`[CloudConvert Poll Status Warning] Status Code ${checkRes.status}:`, checkErr);
      continue;
    }

    const checkJson = await checkRes.json();
    status = checkJson.data?.status;

    if (status === 'error') {
      console.error('[CloudConvert Job Detailed Errors]:', JSON.stringify(checkJson.data, null, 2));
      const failedTask = checkJson.data?.tasks?.find((t: any) => t.status === 'error');
      const errorMsg = failedTask?.message || failedTask?.code || 'Proses konversi PDF di CloudConvert gagal.';
      throw new Error(`Gagal Konversi PDF (CloudConvert): ${errorMsg}`);
    }

    if (status === 'finished') {
      exportTask = checkJson.data?.tasks?.find((t: any) => t.name === 'export-file' || t.operation === 'export/url');
    }
  }

  if (status !== 'finished' || !exportTask) {
    throw new Error('Timeout saat menunggu konversi PDF dari CloudConvert. Silakan coba lagi.');
  }

  const pdfUrl = exportTask.result?.files?.[0]?.url;
  if (!pdfUrl) {
    console.error('[CloudConvert Missing PDF URL Task Result]:', JSON.stringify(exportTask, null, 2));
    throw new Error('URL file PDF dari CloudConvert tidak ditemukan.');
  }

  // 4. Fetch translated PDF file
  console.log('[CloudConvert] Mengunduh hasil PDF...');
  const pdfRes = await fetch(pdfUrl);
  if (!pdfRes.ok) {
    const downloadErr = await pdfRes.text();
    console.error(`[CloudConvert API Error - Download PDF] Status Code: ${pdfRes.status}`, downloadErr);
    throw new Error(`Gagal mengunggah/mengunduh file PDF hasil konversi (Status ${pdfRes.status})`);
  }

  const pdfArrayBuffer = await pdfRes.arrayBuffer();
  return Buffer.from(pdfArrayBuffer);
}
