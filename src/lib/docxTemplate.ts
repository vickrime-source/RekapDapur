import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';
import { OrderItem } from '../types';
import { formatRupiah, formatTanggal, formatTanggalRealtime, parseIndonesianNumber, generateInvoiceNumber } from './formatters';

export const TEMPLATE_URLS: Record<string, string> = {
  "LUWENG BOGA": "https://docs.google.com/document/d/178rvld0b0QB5ZgNryG_P1fVFyTrx2RcG/export?format=docx",
  "HTG": "https://docs.google.com/document/d/14LO9lhajdxQ0Mpnx5X-En-rhzpyLtJAe/export?format=docx",
  "LUMBUNG ADIFRUTA": "https://docs.google.com/document/d/1mE9-edW_0Sh4evlEUcVUUpWUtCrX_xCD/export?format=docx",
  "PROHE": "https://docs.google.com/document/d/1FwifnVpOfLlb2bN4mZBaPCmO7xZ8HuoA/export?format=docx"
};

export const INVOICE_TEMPLATES = TEMPLATE_URLS;

export function getCustomTemplateUrl(): string | null {
  return localStorage.getItem('custom_docx_template_url');
}

export function setCustomTemplateUrl(url: string | null, name?: string): void {
  if (url) {
    localStorage.setItem('custom_docx_template_url', url);
    if (name) localStorage.setItem('custom_docx_template_name', name);
  } else {
    localStorage.removeItem('custom_docx_template_url');
    localStorage.removeItem('custom_docx_template_name');
  }
}

/**
 * Get Google Docs export URL for a given store name
 */
export function getTemplateUrlForStore(storeName: string): string {
  const customUrl = getCustomTemplateUrl();
  if (customUrl) return customUrl;

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

export interface ExportInvoiceOptions {
  storeName: string;
  kitchenName: string;
  items: OrderItem[];
  invoiceNumber?: string;
  dateStr?: string;
  bayar?: number;
  customNama?: string;
  customAlamat?: string;
  customNomor?: string;
}

/**
 * Prepare and filter transaction items strictly by store, kitchen, and date
 */
export function prepareScopedInvoiceData(options: ExportInvoiceOptions) {
  const { storeName, kitchenName, items, bayar = 0 } = options;

  const targetStore = (storeName || '').trim().toLowerCase();
  const targetKitchen = (kitchenName || '').trim().toLowerCase();
  const targetDate = options.dateStr || items[0]?.tanggal;

  // 1. FILTER: strictly match store + kitchen + date of the clicked action row
  const filteredItems = items.filter((item) => {
    const matchStore = !targetStore || (item.toko || '').trim().toLowerCase() === targetStore;
    const matchKitchen = !targetKitchen || (item.tujuanDapur || '').trim().toLowerCase() === targetKitchen;
    const matchDate = !targetDate || item.tanggal === targetDate;
    return matchStore && matchKitchen && matchDate;
  });

  const validItems = filteredItems.length > 0 ? filteredItems : items;

  // 2. Invoice Number Auto Generation
  const autoInvoiceNo =
    options.invoiceNumber ||
    (validItems[0] as any)?.noInvoice ||
    (validItems[0] as any)?.nomorInvoice ||
    generateInvoiceNumber(kitchenName);

  const formattedDate = targetDate ? formatTanggal(targetDate, false) : formatTanggalRealtime();
  const rawDate = targetDate || new Date().toISOString().split('T')[0];

  const displayNama = options.customNama || kitchenName;
  const displayAlamat = options.customAlamat || 'Banyuwangi';
  const displayNomor = options.customNomor || autoInvoiceNo;

  // 3. Calculate TOTAL using parseIndonesianNumber
  let grandTotal = 0;
  const itemsFormatted = validItems.map((item, index) => {
    const q = parseIndonesianNumber(item.qty);
    const unitPrice = parseIndonesianNumber(item.hargaJual || item.hargaBeli || 0);
    const subtotal = q * unitPrice;
    grandTotal += subtotal;

    return {
      no: index + 1,
      NO: index + 1,
      banyaknya: q,
      BANYAKNYA: q,
      qty: q,
      QTY: q,

      namaItem: item.namaBarang,
      NAMA_ITEM: item.namaBarang,
      nama_item: item.namaBarang,
      namaBarang: item.namaBarang,
      NAMA_BARANG: item.namaBarang,
      nama_barang: item.namaBarang,
      barang: item.namaBarang,
      BARANG: item.namaBarang,
      item: item.namaBarang,
      ITEM: item.namaBarang,
      nama: item.namaBarang,
      NAMA: item.namaBarang,

      harga: formatRupiah(unitPrice),
      HARGA: formatRupiah(unitPrice),
      hargaJual: formatRupiah(unitPrice),
      hargaBeli: formatRupiah(parseIndonesianNumber(item.hargaBeli)),

      jumlah: formatRupiah(subtotal),
      JUMLAH: formatRupiah(subtotal),
      subtotal: formatRupiah(subtotal),
      SUBTOTAL: formatRupiah(subtotal),

      catatan: item.catatan || '',
      pemasok: item.pemasok || '',
    };
  });

  const parsedBayar = parseIndonesianNumber(bayar);
  const sisa = grandTotal - parsedBayar;

  // Data Context containing all placeholders: {{tgl}}, {{nama}}, {{alamat}}, {{nomor}}, {{TOTAL}}
  const dataContext = {
    // Dates
    tgl: formattedDate,
    TGL: formattedDate,
    tanggal: formattedDate,
    TANGGAL: formattedDate,
    raw_tanggal: rawDate,

    // Kitchen / Recipient Name
    nama: displayNama,
    NAMA: displayNama,
    dapur: displayNama,
    DAPUR: displayNama,
    kitchen: displayNama,
    tujuanDapur: displayNama,
    TUJUAN_DAPUR: displayNama,
    kepada: displayNama,
    KEPADA: displayNama,

    // Address
    alamat: displayAlamat,
    ALAMAT: displayAlamat,

    // Store Info
    toko: storeName,
    TOKO: storeName,
    store: storeName,

    // Invoice Number / Phone / HP
    nomor: displayNomor,
    NOMOR: displayNomor,
    no: displayNomor,
    NO: displayNomor,
    invoiceNumber: autoInvoiceNo,
    INVOICE_NUMBER: autoInvoiceNo,

    // Totals
    total: formatRupiah(grandTotal),
    TOTAL: formatRupiah(grandTotal),
    totalJual: formatRupiah(grandTotal),

    bayar: formatRupiah(parsedBayar),
    BAYAR: formatRupiah(parsedBayar),
    sisa: formatRupiah(sisa),
    SISA: formatRupiah(sisa),

    // Dynamic Items Table Loops
    items: itemsFormatted,
    ITEMS: itemsFormatted,
    orders: itemsFormatted,
    ORDERS: itemsFormatted,
    barang: itemsFormatted,
    BARANG: itemsFormatted,
    table: itemsFormatted,
    TABLE: itemsFormatted,
  };

  return {
    validItems,
    dataContext,
    grandTotal,
    autoInvoiceNo,
    formattedDate,
    rawDate,
    itemsFormatted,
    parsedBayar,
    sisa,
  };
}

/**
 * Fetch Google Docs docx template via server proxy
 */
export async function fetchDocxTemplateBuffer(storeName: string): Promise<ArrayBuffer> {
  const proxyUrl = `/api/fetch-template?toko=${encodeURIComponent(storeName)}`;
  
  try {
    const response = await fetch(proxyUrl);
    if (response.ok) {
      return await response.arrayBuffer();
    }
  } catch (err) {
    console.warn('Server proxy fetch failed, trying direct Google Docs export fallback...', err);
  }

  // Fallback to direct fetch if proxy unavailable
  const directUrl = getTemplateUrlForStore(storeName);
  const response = await fetch(directUrl);
  if (!response.ok) {
    throw new Error(`Gagal mengambil template Google Docs untuk ${storeName} (${response.statusText})`);
  }
  return await response.arrayBuffer();
}

/**
 * Main Export Function: Triggered EXCLUSIVELY when clicking the print icon in row AKSI column
 */
export async function exportInvoicePdf(options: ExportInvoiceOptions): Promise<void> {
  const { storeName, kitchenName } = options;

  // 1. Prepare scoped data
  const {
    validItems,
    dataContext,
    grandTotal,
    autoInvoiceNo,
    formattedDate,
    rawDate,
    itemsFormatted,
    parsedBayar,
    sisa,
  } = prepareScopedInvoiceData(options);

  if (validItems.length === 0) {
    throw new Error('Tidak ada transaksi valid untuk di-export');
  }

  // 2. Fetch Google Docs docx template via proxy
  const arrayBuffer = await fetchDocxTemplateBuffer(storeName);

  // 3. Process docx with Docxtemplater
  const zip = new PizZip(arrayBuffer);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => '',
  });

  doc.render(dataContext);

  // 4. Generate filled docx blob and save
  const docxBlob = doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  const baseFileName = `Invoice_${storeName.replace(/\s+/g, '_')}_${kitchenName.replace(/\s+/g, '_')}_${rawDate}`;
  saveAs(docxBlob, `${baseFileName}.docx`);

  // 5. Generate PDF export using html2pdf.js from rendered HTML template element
  const pdfContainer = document.createElement('div');
  pdfContainer.style.position = 'absolute';
  pdfContainer.style.left = '-9999px';
  pdfContainer.style.top = '-9999px';
  pdfContainer.style.width = '794px'; // A4 width in px at 96 DPI
  pdfContainer.style.padding = '40px';
  pdfContainer.style.backgroundColor = '#ffffff';
  pdfContainer.style.color = '#0f172a';
  pdfContainer.style.fontFamily = 'sans-serif';

  let companyName = `CV. HANDAI TOLAN GROUP — ${storeName.toUpperCase()}`;
  const normStore = storeName.toUpperCase();
  if (normStore.includes('LEMBUNG') || normStore.includes('LUWENG') || normStore.includes('BOGA') || normStore.includes('LB')) {
    companyName = 'LUWENG BOGA';
  } else if (normStore.includes('LUMBUNG') || normStore.includes('ADIFRUTA') || normStore.includes('FRUITA') || normStore.includes('LA')) {
    companyName = 'LUMBUNG ADIFRUTA';
  } else if (normStore.includes('PROHE') || normStore.includes('PW')) {
    companyName = 'PROHE';
  }

  pdfContainer.innerHTML = `
    <div style="font-family: sans-serif; color: #0f172a; padding: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px;">
        <div>
          <h1 style="font-size: 16px; font-weight: 900; margin: 0; text-transform: uppercase;">${companyName}</h1>
          <p style="font-size: 11px; margin: 4px 0 0 0; color: #475569;">Banyuwangi, Jawa Timur</p>
        </div>
        <div style="text-align: right;">
          <h2 style="font-size: 18px; font-weight: 900; margin: 0; color: #0f172a;">INVOICE</h2>
          <p style="font-size: 11px; margin: 4px 0 0 0; font-family: monospace;">No: <strong>${autoInvoiceNo}</strong></p>
          <p style="font-size: 11px; margin: 2px 0 0 0;">Tgl: <strong>${formattedDate}</strong></p>
        </div>
      </div>

      <div style="margin-bottom: 20px; font-size: 12px;">
        <p style="margin: 0; font-weight: bold; color: #475569;">KEPADA / DAPUR TUJUAN:</p>
        <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 900; color: #0f172a;">${options.customNama || kitchenName}</p>
        <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b;">Alamat: ${options.customAlamat || 'Banyuwangi'}</p>
        ${options.customNomor ? `<p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b;">Telp/HP: ${options.customNomor}</p>` : ''}
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
        <thead>
          <tr style="background-color: #f1f5f9; border-top: 1.5px solid #0f172a; border-bottom: 1.5px solid #0f172a;">
            <th style="padding: 8px; text-align: center; width: 40px;">NO</th>
            <th style="padding: 8px; text-align: center; width: 60px;">QTY</th>
            <th style="padding: 8px; text-align: left;">NAMA BARANG</th>
            <th style="padding: 8px; text-align: right; width: 110px;">HARGA</th>
            <th style="padding: 8px; text-align: right; width: 120px;">JUMLAH</th>
          </tr>
        </thead>
        <tbody>
          ${itemsFormatted.map((it) => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px; text-align: center; font-weight: bold;">${it.no}</td>
              <td style="padding: 8px; text-align: center; font-weight: bold;">${it.qty}</td>
              <td style="padding: 8px; font-weight: bold;">
                ${it.namaBarang}
                ${it.catatan ? `<br/><span style="font-size: 9px; color: #64748b; font-weight: normal;">*${it.catatan}</span>` : ''}
              </td>
              <td style="padding: 8px; text-align: right;">${it.harga}</td>
              <td style="padding: 8px; text-align: right; font-weight: 900;">${it.jumlah}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
        <div style="width: 250px; font-size: 12px;">
          <div style="display: flex; justify-content: space-between; padding: 6px 0; border-top: 2px solid #0f172a; font-weight: 900; font-size: 14px;">
            <span>TOTAL:</span>
            <span>${formatRupiah(grandTotal)}</span>
          </div>
          ${parsedBayar > 0 ? `
            <div style="display: flex; justify-content: space-between; padding: 4px 0; font-weight: bold; color: #166534;">
              <span>BAYAR:</span>
              <span>${formatRupiah(parsedBayar)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 4px 0; font-weight: bold; color: #991b1b;">
              <span>SISA:</span>
              <span>${formatRupiah(sisa)}</span>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(pdfContainer);

  try {
    const pdfOptions = {
      margin: 8,
      filename: `${baseFileName}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
    };

    await html2pdf().set(pdfOptions).from(pdfContainer).save();
  } finally {
    document.body.removeChild(pdfContainer);
  }
}

/**
 * Backwards compatibility alias for downloadDocxInvoice
 */
export const downloadDocxInvoice = exportInvoicePdf;
