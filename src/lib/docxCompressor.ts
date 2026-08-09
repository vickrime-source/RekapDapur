import JSZip from 'jszip';
import sharp from 'sharp';

/**
 * Automatically compresses images inside a DOCX buffer before converting to PDF.
 * - Extracts DOCX as a ZIP file
 * - Finds images in word/media/
 * - Resizes images to max width 800px and compresses quality using `sharp`
 * - Replaces files in ZIP and generates a compressed DOCX buffer
 */
export async function compressDocxImages(docxBuffer: Buffer): Promise<Buffer> {
  const originalSizeBytes = docxBuffer.length;
  const originalSizeMB = (originalSizeBytes / (1024 * 1024)).toFixed(2);
  console.log(`[DOCX Compressor] Starting auto-compression on DOCX buffer (${originalSizeBytes} bytes / ${originalSizeMB} MB)...`);

  try {
    const zip = await JSZip.loadAsync(docxBuffer);
    const filePaths: string[] = [];

    zip.forEach((relativePath, file) => {
      if (relativePath.startsWith('word/media/') && !file.dir) {
        filePaths.push(relativePath);
      }
    });

    if (filePaths.length === 0) {
      console.log('[DOCX Compressor] No media images found in word/media/. Returning original DOCX.');
      return docxBuffer;
    }

    let modifiedCount = 0;

    for (const filePath of filePaths) {
      const file = zip.file(filePath);
      if (!file) continue;

      const imgBuffer = await file.async('nodebuffer');
      const ext = filePath.split('.').pop()?.toLowerCase();

      if (!['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) {
        continue;
      }

      // Compress if image buffer is larger than 80 KB
      if (imgBuffer.length > 80 * 1024) {
        try {
          const image = sharp(imgBuffer);
          const metadata = await image.metadata();

          let pipeline = sharp(imgBuffer);

          // Resize if width > 800px
          if (metadata.width && metadata.width > 800) {
            pipeline = pipeline.resize({ width: 800, fit: 'inside', withoutEnlargement: true });
          }

          let compressedImgBuffer: Buffer;

          if (ext === 'png') {
            if (metadata.hasAlpha) {
              compressedImgBuffer = await pipeline.png({ quality: 75, compressionLevel: 9 }).toBuffer();
            } else {
              // PNG without alpha channel can be safely converted to JPEG for huge savings
              compressedImgBuffer = await pipeline.jpeg({ quality: 80, mozjpeg: true }).toBuffer();
            }
          } else {
            // JPG / JPEG / WEBP
            compressedImgBuffer = await pipeline.jpeg({ quality: 75, mozjpeg: true }).toBuffer();
          }

          if (compressedImgBuffer.length < imgBuffer.length) {
            console.log(
              `[DOCX Compressor] Optimized ${filePath}: ${(imgBuffer.length / 1024).toFixed(1)} KB -> ${(compressedImgBuffer.length / 1024).toFixed(1)} KB`
            );
            zip.file(filePath, compressedImgBuffer);
            modifiedCount++;
          }
        } catch (imgErr) {
          console.warn(`[DOCX Compressor] Warning: Failed to compress image ${filePath}:`, imgErr);
        }
      }
    }

    if (modifiedCount === 0) {
      console.log('[DOCX Compressor] Images are already optimized. Returning original DOCX.');
      return docxBuffer;
    }

    const compressedDocxBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });

    const newSizeBytes = compressedDocxBuffer.length;
    const newSizeMB = (newSizeBytes / (1024 * 1024)).toFixed(2);
    console.log(
      `[DOCX Compressor] Auto-compression successful! ${originalSizeMB} MB -> ${newSizeMB} MB (${modifiedCount} image(s) compressed)`
    );

    return compressedDocxBuffer;
  } catch (err) {
    console.error('[DOCX Compressor Error]: Failed to extract/compress ZIP:', err);
    return docxBuffer;
  }
}
