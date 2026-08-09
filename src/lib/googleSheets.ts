import { OrderItem, InvoiceRecord } from '../types';

export const GAS_BASE_URL =
  'https://script.google.com/macros/s/AKfycbxvxj1V6LKfqFNYVh_ITbigm_LeS0Q1_f2qpHdAcuqUQqgOrNtzI0_RA4ypPJbU-Fe6sQ/exec';

export const GAS_TOKEN = 'GANTI_TOKEN_RAHASIA_INI';

export interface AddRowResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * Fungsi addRow() mengirimkan POST data ke Google Apps Script backend.
 * Format Payload:
 * {
 *   "token": "GANTI_TOKEN_RAHASIA_INI",
 *   "action": "add",
 *   "sheet": "pesanan" | "transaksi",
 *   "data": { ...field sesuai kolom sheet... }
 * }
 */
export async function addRow(
  sheet: 'pesanan' | 'transaksi',
  data: Record<string, any>
): Promise<AddRowResponse> {
  const token = localStorage.getItem('gas_secret_token') || GAS_TOKEN;
  const payload = {
    token,
    action: 'add',
    sheet,
    data,
  };

  try {
    const response = await fetch(GAS_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error status: ${response.status}`);
    }

    const text = await response.text();
    let resData: any = {};
    try {
      resData = JSON.parse(text);
    } catch {
      resData = { raw: text };
    }

    // Evaluasi respon dari backend Apps Script
    if (resData.success === true || resData.status === 'success' || resData.status === 'ok') {
      return {
        success: true,
        message: resData.message || `Data berhasil disimpan ke sheet "${sheet}"!`,
        data: resData.data,
      };
    } else {
      const errorMsg =
        resData.error ||
        resData.message ||
        (typeof resData.raw === 'string' ? resData.raw : null) ||
        'Gagal menyimpan data ke Google Sheets (Response error).';
      return {
        success: false,
        error: errorMsg,
      };
    }
  } catch (err: any) {
    console.error(`[GoogleSheets API] Error addRow ke sheet ${sheet}:`, err);
    return {
      success: false,
      error: err?.message || 'Gagal terhubung ke Google Apps Script backend.',
    };
  }
}

/**
 * Mapper helper untuk baris raw dari Sheet Pesanan ke TypeScript OrderItem
 */
export function mapRawOrder(row: any): OrderItem {
  const statusStr = (row.status || 'pending').toString().toLowerCase();
  const status = statusStr === 'selesai' ? 'selesai' : 'pending';
  const payStatus = row.paymentStatus || row.payment_status || (status === 'selesai' ? 'PAID' : 'UNPAID');
  const delStatus = row.deliveryStatus || row.delivery_status || (status === 'selesai' ? 'DONE' : 'PENDING');

  return {
    id: (row.id || row.ID || `ord-${Date.now()}-${Math.floor(Math.random() * 10000)}`).toString(),
    namaBarang: (row.namaBarang || row.nama_barang || row['Nama Barang'] || '').toString(),
    qty: Number(row.qty || row.Qty || row.jumlah) || 0,
    hargaBeli: Number(row.hargaBeli || row.harga_beli || row['Harga Beli']) || 0,
    hargaJual: Number(row.hargaJual || row.harga_jual || row['Harga Jual']) || 0,
    toko: (row.toko || row.Toko || '').toString(),
    tujuanDapur: (row.tujuanDapur || row.tujuan_dapur || row['Tujuan Dapur'] || '').toString(),
    pemasok: (row.pemasok || row.Pemasok || '').toString(),
    status,
    paymentStatus: payStatus === 'PAID' ? 'PAID' : 'UNPAID',
    deliveryStatus: delStatus === 'DONE' ? 'DONE' : 'PENDING',
    tanggal: (row.tanggal || row.Tanggal || new Date().toISOString().split('T')[0]).toString(),
    createdAt: (row.createdAt || row.created_at || new Date().toISOString()).toString(),
    catatan: (row.catatan || row.Catatan || '').toString(),
  };
}

/**
 * Mapper helper untuk baris raw dari Sheet Transaksi ke TypeScript InvoiceRecord
 */
export function mapRawInvoice(row: any): InvoiceRecord {
  let items: OrderItem[] = [];
  if (typeof row.items === 'string') {
    try {
      items = JSON.parse(row.items);
    } catch {
      items = [];
    }
  } else if (Array.isArray(row.items)) {
    items = row.items.map(mapRawOrder);
  }

  return {
    id: (row.id || row.ID || `inv-${Date.now()}-${Math.floor(Math.random() * 10000)}`).toString(),
    invoiceNumber: (row.invoiceNumber || row.invoice_number || row['Nomor Invoice'] || '').toString(),
    tanggalPrint: (row.tanggalPrint || row.tanggal_print || row['Tanggal Print'] || '').toString(),
    createdAt: (row.createdAt || row.created_at || new Date().toISOString()).toString(),
    tujuanDapur: (row.tujuanDapur || row.tujuan_dapur || '').toString(),
    toko: (row.toko || row.Toko || '').toString(),
    items,
    totalBeli: Number(row.totalBeli || row.total_beli) || 0,
    totalJual: Number(row.totalJual || row.total_jual) || 0,
    totalProfit: Number(row.totalProfit || row.total_profit) || 0,
  };
}

/**
 * Fetch data dari Google Sheets via GET endpoint
 * GET {BASE_URL}?sheet=pesanan
 * GET {BASE_URL}?sheet=transaksi
 */
export async function fetchSheetData<T = any>(
  sheet: 'pesanan' | 'transaksi'
): Promise<{ data: T[]; error: string | null }> {
  try {
    const url = `${GAS_BASE_URL}?sheet=${encodeURIComponent(sheet)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error status ${response.status}`);
    }

    const json = await response.json();
    let rows: any[] = [];
    if (Array.isArray(json)) {
      rows = json;
    } else if (Array.isArray(json.data)) {
      rows = json.data;
    } else if (Array.isArray(json.result)) {
      rows = json.result;
    } else if (Array.isArray(json.rows)) {
      rows = json.rows;
    }

    return { data: rows as T[], error: null };
  } catch (err: any) {
    console.error(`[GoogleSheets API] Error fetchSheetData (${sheet}):`, err);
    return { data: [], error: err?.message || 'Gagal mengambil data dari Google Sheets' };
  }
}
