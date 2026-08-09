import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import { OrderItem } from '../types';
import { formatRupiah, formatTanggal, formatTanggalDisatuin, formatTanggalRealtime } from './formatters';

const SUPABASE_INVOICE_BUCKET_URL = 'https://vkrgybebgnnaxzzcfjpn.supabase.co/storage/v1/object/public/invoice';

export const INVOICE_TEMPLATES: Record<string, string> = {
  HTG: `${SUPABASE_INVOICE_BUCKET_URL}/invoice_template_HTG.docx`,
  PROHE: `${SUPABASE_INVOICE_BUCKET_URL}/invoice_template_PW.docx`,
  LUWENG_BOGA: `${SUPABASE_INVOICE_BUCKET_URL}/_invoice_template_LB.docx`,
  LUMBUNG_ADIFRUTA: `${SUPABASE_INVOICE_BUCKET_URL}/invoice_template_LA.docx`,
};

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
 * Helper to get template URL for a store name
 */
export function getTemplateUrlForStore(storeName: string): string {
  const customUrl = getCustomTemplateUrl();
  if (customUrl) return customUrl;

  const normalized = storeName.trim().toUpperCase();
  if (normalized.includes('HTG')) return INVOICE_TEMPLATES.HTG;
  if (normalized.includes('PROHE') || normalized.includes('PW')) return INVOICE_TEMPLATES.PROHE;
  if (normalized.includes('LEMBUNG') || normalized.includes('LUWENG') || normalized.includes('BOGA') || normalized.includes('LB')) {
    return INVOICE_TEMPLATES.LUWENG_BOGA;
  }
  if (
    normalized.includes('ADIFRUITA') ||
    normalized.includes('ADIFRUTA') ||
    normalized.includes('FRUITA') ||
    normalized.includes('LUMBUNG') ||
    normalized.includes('LA')
  ) {
    return INVOICE_TEMPLATES.LUMBUNG_ADIFRUTA;
  }
  return INVOICE_TEMPLATES.HTG; // Default fallback
}

/**
 * Generate and download filled DOCX invoice using Supabase template
 */
export async function downloadDocxInvoice(options: {
  storeName: string;
  kitchenName: string;
  items: OrderItem[];
  invoiceNumber: string;
  dateStr?: string;
  bayar?: number;
}): Promise<void> {
  const { storeName, kitchenName, items, invoiceNumber, dateStr, bayar = 0 } = options;

  // 1. FILTERING STEP: Ensure items are scoped STRICTLY to this store, kitchen, and date
  const normStore = storeName.trim().toLowerCase();
  const normKitchen = kitchenName.trim().toLowerCase();
  const normDate = dateStr || items[0]?.tanggal;

  const filteredItems = items.filter((item) => {
    const matchStore = !normStore || item.toko.trim().toLowerCase() === normStore;
    const matchKitchen = !normKitchen || item.tujuanDapur.trim().toLowerCase() === normKitchen;
    const matchDate = !normDate || item.tanggal === normDate;
    return matchStore && matchKitchen && matchDate;
  });

  const validItems = filteredItems.length > 0 ? filteredItems : items;

  const templateUrl = getTemplateUrlForStore(storeName);
  
  // Fetch template from Supabase Storage
  const response = await fetch(templateUrl);
  if (!response.ok) {
    throw new Error(`Gagal mengunduh template invoice (${response.statusText})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const zip = new PizZip(arrayBuffer);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => '',
  });

  const formattedDate = normDate ? formatTanggal(normDate, false) : formatTanggalRealtime();
  const rawDate = normDate || new Date().toISOString().split('T')[0];

  const totalJual = validItems.reduce((sum, item) => sum + item.qty * (item.hargaJual || item.hargaBeli || 0), 0);
  const sisa = totalJual - bayar;

  // Prepare item list with all common placeholder keys for table row repeat loops
  const itemsFormatted = validItems.map((item, index) => {
    const unitPrice = item.hargaJual || item.hargaBeli || 0;
    const subtotal = item.qty * unitPrice;

    return {
      no: index + 1,
      NO: index + 1,
      banyaknya: item.qty,
      BANYAKNYA: item.qty,
      qty: item.qty,
      QTY: item.qty,

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
      hargaBeli: formatRupiah(item.hargaBeli),
      harga_raw: unitPrice,

      jumlah: formatRupiah(subtotal),
      JUMLAH: formatRupiah(subtotal),
      subtotal: formatRupiah(subtotal),
      SUBTOTAL: formatRupiah(subtotal),

      catatan: item.catatan || '',
      pemasok: item.pemasok || '',
    };
  });

  // Extensive context variables matching template placeholders
  const dataContext = {
    // Dates
    tgl: formattedDate,
    TGL: formattedDate,
    tanggal: formattedDate,
    TANGGAL: formattedDate,
    Tanggal: formattedDate,
    raw_tanggal: rawDate,

    // Store & Kitchen Recipient Info
    nama: kitchenName,
    NAMA: kitchenName,
    dapur: kitchenName,
    DAPUR: kitchenName,
    kitchen: kitchenName,
    mainKitchen: kitchenName,
    tujuanDapur: kitchenName,
    TUJUAN_DAPUR: kitchenName,
    kepada: kitchenName,
    KEPADA: kitchenName,

    alamat: 'Banyuwangi',
    ALAMAT: 'Banyuwangi',

    // Store Info
    toko: storeName,
    TOKO: storeName,
    store: storeName,
    mainStore: storeName,

    // Invoice Ref
    nomor: invoiceNumber,
    NOMOR: invoiceNumber,
    no: invoiceNumber,
    NO: invoiceNumber,
    invoiceNumber: invoiceNumber,
    INVOICE_NUMBER: invoiceNumber,
    no_ref: invoiceNumber,
    no_invoice: invoiceNumber,
    NO_REF: invoiceNumber,

    // Totals
    total: formatRupiah(totalJual),
    TOTAL: formatRupiah(totalJual),
    totalJual: formatRupiah(totalJual),
    total_jual: formatRupiah(totalJual),
    total_raw: totalJual,

    bayar: formatRupiah(bayar),
    BAYAR: formatRupiah(bayar),
    sisa: formatRupiah(sisa),
    SISA: formatRupiah(sisa),

    // Array loops for table rows
    items: itemsFormatted,
    ITEMS: itemsFormatted,
    orders: itemsFormatted,
    ORDERS: itemsFormatted,
    barang: itemsFormatted,
    BARANG: itemsFormatted,
    table: itemsFormatted,
    TABLE: itemsFormatted,
  };

  // Render document
  doc.render(dataContext);

  // Generate output blob and download
  const blob = doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  const fileName = `Invoice_${storeName.replace(/\s+/g, '_')}_${kitchenName.replace(/\s+/g, '_')}_${rawDate}.docx`;
  saveAs(blob, fileName);
}
