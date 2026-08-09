import React, { useState } from 'react';
import { X, Printer, Receipt } from 'lucide-react';
import { OrderItem } from '../types';
import { formatRupiah, formatTanggalRealtime } from '../lib/formatters';
import { downloadDocxInvoice } from '../lib/docxTemplate';
import { motion, AnimatePresence } from 'motion/react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceNumber: string;
  items: OrderItem[];
  tujuanDapur?: string;
  toko?: string;
  onSaveInvoiceRecord?: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  invoiceNumber,
  items,
  tujuanDapur,
  toko,
  onSaveInvoiceRecord,
}) => {
  const [bayar, setBayar] = useState<number>(0);

  if (!isOpen || items.length === 0) return null;

  // Filter items strictly to match store + kitchen + date
  const targetStore = (toko || items[0]?.toko || '').trim().toLowerCase();
  const targetKitchen = (tujuanDapur || items[0]?.tujuanDapur || '').trim().toLowerCase();
  const targetDate = items[0]?.tanggal;

  const scopedItems = items.filter((item) => {
    const matchStore = !targetStore || item.toko.trim().toLowerCase() === targetStore;
    const matchKitchen = !targetKitchen || item.tujuanDapur.trim().toLowerCase() === targetKitchen;
    const matchDate = !targetDate || item.tanggal === targetDate;
    return matchStore && matchKitchen && matchDate;
  });

  const displayItems = scopedItems.length > 0 ? scopedItems : items;

  const realTimeDate = formatTanggalRealtime();
  const totalJual = displayItems.reduce((sum, item) => sum + item.qty * item.hargaJual, 0);
  const sisa = totalJual - bayar;

  const mainKitchen = tujuanDapur || displayItems[0]?.tujuanDapur || 'Singojuruh';
  const mainStore = toko || displayItems[0]?.toko || 'HTG';

  const handlePrint = async () => {
    if (onSaveInvoiceRecord) {
      onSaveInvoiceRecord();
    }
    // Automatically trigger print / save as PDF
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs no-print font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-300"
        >
          {/* Modal Top Control Bar (Lampiran 2: Only 1 Cetak PDF Button) */}
          <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-3 no-print border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-400" />
              <div>
                <h2 className="text-sm sm:text-base font-extrabold tracking-tight">Pratinjau Invoice</h2>
                <span className="text-[10px] text-emerald-400 font-mono">
                  Dapur: {mainKitchen} • Toko: {mainStore}
                </span>
              </div>
            </div>

            {/* Action Buttons: "Cetak PDF" & "Download DOCX" + Close */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={async () => {
                  try {
                    await downloadDocxInvoice({
                      storeName: mainStore,
                      kitchenName: mainKitchen,
                      items: displayItems,
                      invoiceNumber,
                      bayar,
                    });
                  } catch (err: any) {
                    alert(`Gagal download DOCX: ${err?.message || err}`);
                  }
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 no-print"
                title="Unduh Invoice format DOCX (Template Custom)"
              >
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Export DOCX</span>
                <span className="sm:hidden">DOCX</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-md transition-all active:scale-95 print-include"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak PDF</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Live Printable Invoice Document Body (Matching Supabase Document Layout) */}
          <div className="p-8 sm:p-12 overflow-y-auto flex-1 printable-area bg-white text-slate-900 font-sans">
            {/* Kop Invoice Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-slate-400">
              {/* Left Logo & Company Details */}
              <div className="space-y-1">
                {/* Store Brand / Logo Header */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center font-black tracking-tighter text-3xl leading-none">
                    <span className="text-[#059669]">{mainStore.substring(0, 1)}</span>
                    <span className="text-[#059669]">{mainStore.substring(1, 2)}</span>
                    <span className="text-[#d97706]">{mainStore.substring(2) || 'G'}</span>
                  </div>
                </div>
                <div className="text-[9px] font-black tracking-wider text-[#059669] uppercase leading-none">
                  RANTAI PANGAN TERPERCAYA
                </div>

                <div className="pt-2">
                  <h1 className="text-sm font-black text-slate-900 uppercase">
                    CV. HANDAI TOLAN GROUP — {mainStore}
                  </h1>
                  <p className="text-[11px] text-slate-700 leading-snug font-semibold max-w-xs">
                    Jl. Krasak, RT.5/RW.1, Glowong,<br />
                    Wringin Agung, Kec. Gambiran<br />
                    Kab. banyuwangi
                  </p>
                </div>
              </div>

              {/* Right Recipient Details & Date */}
              <div className="text-left sm:text-right space-y-1 text-xs text-slate-800">
                <p className="font-semibold text-slate-600">
                  Tanggal : <span className="font-extrabold text-slate-900">{realTimeDate}</span>
                </p>
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">KEPADA YTH.</span>
                  <h2 className="text-sm font-extrabold text-slate-900">{mainKitchen}</h2>
                  <p className="text-xs text-slate-700 font-medium">Bwi</p>
                  <p className="text-xs text-slate-700 font-medium">082229992371</p>
                </div>
                <div className="text-[10px] font-mono text-slate-500 pt-1">
                  No. Ref: {invoiceNumber}
                </div>
              </div>
            </div>

            {/* Invoice Table Matched to Reference PDF */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-900 text-xs">
                <thead>
                  <tr className="bg-[#d0e1f9] text-slate-900 font-black border-b border-slate-900 text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 border-r border-slate-900 text-center w-12">NO</th>
                    <th className="py-2.5 px-3 border-r border-slate-900 text-center w-24">BANYAKNYA</th>
                    <th className="py-2.5 px-3 border-r border-slate-900">NAMA ITEM</th>
                    <th className="py-2.5 px-3 border-r border-slate-900 text-right w-32">HARGA</th>
                    <th className="py-2.5 px-3 text-right w-36">JUMLAH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-900 font-medium">
                  {displayItems.map((item, idx) => {
                    const subtotalJual = item.qty * item.hargaJual;
                    return (
                      <tr key={item.id} className="border-b border-slate-900">
                        <td className="py-2.5 px-3 border-r border-slate-900 text-center font-bold">{idx + 1}</td>
                        <td className="py-2.5 px-3 border-r border-slate-900 text-center font-bold">{item.qty}</td>
                        <td className="py-2.5 px-3 border-r border-slate-900 font-bold text-slate-900">
                          {item.namaBarang}
                          {item.catatan && (
                            <span className="block text-[10px] text-slate-500 font-normal italic">
                              Catatan: {item.catatan}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-900 text-right font-semibold">
                          {formatRupiah(item.hargaJual)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">
                          {formatRupiah(subtotalJual)}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Summary Rows Embedded in Table */}
                  <tr className="border-t-2 border-slate-900 font-black text-xs">
                    <td colSpan={3} className="border-r border-slate-900"></td>
                    <td className="py-2 px-3 border-r border-slate-900 text-right uppercase">TOTAL</td>
                    <td className="py-2 px-3 text-right text-sm font-black text-slate-900">{formatRupiah(totalJual)}</td>
                  </tr>
                  <tr className="border-t border-slate-900 font-black text-xs">
                    <td colSpan={3} className="border-r border-slate-900"></td>
                    <td className="py-2 px-3 border-r border-slate-900 text-right uppercase">BAYAR</td>
                    <td className="py-1.5 px-3 text-right">
                      <input
                        type="number"
                        value={bayar}
                        onChange={(e) => setBayar(Number(e.target.value) || 0)}
                        className="w-28 text-right p-1 border border-slate-300 rounded text-xs font-black no-print"
                      />
                      <span className="hidden print:inline font-extrabold">{bayar ? formatRupiah(bayar) : '0'}</span>
                    </td>
                  </tr>
                  <tr className="border-t border-slate-900 font-black text-xs bg-slate-50">
                    <td colSpan={3} className="border-r border-slate-900"></td>
                    <td className="py-2 px-3 border-r border-slate-900 text-right uppercase">SISA</td>
                    <td className="py-2 px-3 text-right text-sm font-black text-slate-900">{formatRupiah(sisa)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bottom Payment Info & Signatures */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-800">
              {/* Payment Info */}
              <div className="space-y-1">
                <p className="font-extrabold uppercase tracking-wider text-slate-900 text-[11px]">
                  INFORMASI PEMBAYARAN
                </p>
                <div className="text-slate-700 font-medium space-y-0.5 pt-1">
                  <p>Atas Nama : <span className="font-bold text-slate-900">Vica Indah Narsisus</span></p>
                  <p>Bank : <span className="font-bold text-slate-900">BNI</span></p>
                  <p>No. Rekening : <span className="font-bold text-slate-900">2826372715</span></p>
                </div>
              </div>

              {/* Signatures */}
              <div className="flex justify-between items-end pt-4 sm:pt-0">
                {/* Left Receiver */}
                <div className="text-center space-y-12">
                  <p className="font-bold text-slate-800">Tanda Terima</p>
                  <p className="font-extrabold text-slate-900">({mainKitchen})</p>
                </div>

                {/* Right Stamp & Signature */}
                <div className="text-center space-y-2">
                  <p className="font-bold text-slate-800">Hormat Kami,</p>
                  {/* Stamp Graphic */}
                  <div className="w-24 h-12 mx-auto border-2 border-[#059669]/60 rounded flex items-center justify-center rotate-[-4deg] bg-[#059669]/5">
                    <span className="text-[10px] font-black text-[#059669] leading-tight text-center">
                      CV. HANDAI TOLAN<br />GROUP
                    </span>
                  </div>
                  <p className="font-extrabold text-slate-900 pt-2">Vica Indah Narsisus</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

