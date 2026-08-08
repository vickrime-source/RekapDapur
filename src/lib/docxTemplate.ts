import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import { OrderItem } from '../types';
import { formatRupiah, formatTanggal, formatTanggalDisatuin, formatTanggalRealtime } from './formatters';

export const INVOICE_TEMPLATES: Record<string, string> = {
  HTG: 'https://vkrgybebgnnaxzzcfjpn.supabase.co/storage/v1/object/public/invoice/invoice%20template%20HTG.docx',
  PROHE: 'https://vkrgybebgnnaxzzcfjpn.supabase.co/storage/v1/object/public/invoice/invoice%20template%20PW.docx',
  'LEMBUNG BOGA': 'https://vkrgybebgnnaxzzcfjpn.supabase.co/storage/v1/object/public/invoice/_invoice%20template%20LB.docx',
  'LUWENG BOGA': 'https://vkrgybebgnnaxzzcfjpn.supabase.co/storage/v1/object/public/invoice/_invoice%20template%20LB.docx',
  ADIFRUITA: 'https://vkrgybebgnnaxzzcfjpn.supabase.co/storage/v1/object/public/invoice/invoice%20template%20LA.docx',
};

/**
 * Helper to get template URL for a store name
 */
export function getTemplateUrlForStore(storeName: string): string {
  const normalized = storeName.trim().toUpperCase();
  if (normalized.includes('HTG')) return INVOICE_TEMPLATES.HTG;
  if (normalized.includes('PROHE') || normalized.includes('PW')) return INVOICE_TEMPLATES.PROHE;
  if (normalized.includes('LEMBUNG') || normalized.includes('LUWENG') || normalized.includes('BOGA') || normalized.includes('LB')) {
    return INVOICE_TEMPLATES['LEMBUNG BOGA'];
  }
  if (normalized.includes('ADIFRUITA') || normalized.includes('FRUITA') || normalized.includes('LA')) {
    return INVOICE_TEMPLATES.ADIFRUITA;
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

  const formattedDate = dateStr ? formatTanggal(dateStr, false) : formatTanggalRealtime();
  const rawDate = dateStr || new Date().toISOString().split('T')[0];

  const totalJual = items.reduce((sum, item) => sum + item.qty * item.hargaJual, 0);
  const sisa = totalJual - bayar;

  // Prepare item list with all common placeholder keys for table row repeat loops
  const itemsFormatted = items.map((item, index) => {
    const subtotal = item.qty * item.hargaJual;
    return {
      no: index + 1,
      NO: index + 1,
      banyaknya: item.qty,
      BANYAKNYA: item.qty,
      qty: item.qty,
      QTY: item.qty,
      namaBarang: item.namaBarang,
      NAMA_BARANG: item.namaBarang,
      nama_barang: item.namaBarang,
      barang: item.namaBarang,
      item: item.namaBarang,
      harga: formatRupiah(item.hargaJual),
      HARGA: formatRupiah(item.hargaJual),
      hargaJual: formatRupiah(item.hargaJual),
      harga_raw: item.hargaJual,
      jumlah: formatRupiah(subtotal),
      JUMLAH: formatRupiah(subtotal),
      subtotal: formatRupiah(subtotal),
      catatan: item.catatan || '',
      pemasok: item.pemasok || '',
    };
  });

  // Extensive context variables so whatever placeholders the user put in docx template will resolve correctly
  const dataContext = {
    // Dates
    tanggal: formattedDate,
    TANGGAL: formattedDate,
    Tanggal: formattedDate,
    tgl: formattedDate,
    raw_tanggal: rawDate,

    // Store & Kitchen Info
    toko: storeName,
    TOKO: storeName,
    store: storeName,
    mainStore: storeName,

    dapur: kitchenName,
    DAPUR: kitchenName,
    kitchen: kitchenName,
    mainKitchen: kitchenName,
    tujuanDapur: kitchenName,
    TUJUAN_DAPUR: kitchenName,
    kepada: kitchenName,
    KEPADA: kitchenName,

    // Invoice Ref
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

    // Array loops (e.g. {#items} ... {/items} or {#orders} ... {/orders})
    items: itemsFormatted,
    ITEMS: itemsFormatted,
    orders: itemsFormatted,
    ORDERS: itemsFormatted,
    barang: itemsFormatted,
    BARANG: itemsFormatted,
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
