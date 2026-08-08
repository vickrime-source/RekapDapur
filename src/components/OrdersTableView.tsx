import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Printer, 
  MoreVertical, 
  Edit2, 
  Copy, 
  Trash2, 
  Package
} from 'lucide-react';
import { OrderItem, PaymentStatus, DeliveryStatus } from '../types';
import { formatRupiah, formatTanggalDisatuin, getTokoBadgeStyle } from '../lib/formatters';
import { motion, AnimatePresence } from 'motion/react';

import { Pagination } from './Pagination';

interface OrdersTableViewProps {
  orders: OrderItem[];
  onUpdatePaymentStatus: (id: string, status: PaymentStatus) => void;
  onUpdateDeliveryStatus: (id: string, status: DeliveryStatus) => void;
  onEditOrder: (item: OrderItem) => void;
  onDuplicateOrder: (item: OrderItem) => void;
  onDeleteOrder: (id: string) => void;
  onOpenInvoiceModal: (items: OrderItem[], kitchenName?: string, storeName?: string) => void;
}

export const OrdersTableView: React.FC<OrdersTableViewProps> = ({
  orders,
  onUpdatePaymentStatus,
  onUpdateDeliveryStatus,
  onEditOrder,
  onDuplicateOrder,
  onDeleteOrder,
  onOpenInvoiceModal,
}) => {
  // Pagination State (Max 20 orders per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Dropdown open state tracking by order ID
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper getters for status fields
  const getPayStatus = (item: OrderItem): PaymentStatus => {
    if (item.paymentStatus) return item.paymentStatus;
    return item.status === 'selesai' ? 'PAID' : 'UNPAID';
  };

  const getDelStatus = (item: OrderItem): DeliveryStatus => {
    if (item.deliveryStatus) return item.deliveryStatus;
    return item.status === 'selesai' ? 'DONE' : 'PENDING';
  };

  // Group items hierarchically:
  // Group 1: ATAS -> UNPAID or PENDING payment + PENDING delivery
  // Group 2: TENGAH -> PAID payment + PENDING delivery (or payment PENDING/UNPAID with DONE delivery)
  // Group 3: BAWAH -> PAID payment + DONE delivery
  const sortedOrders = useMemo(() => {
    const groupAtas = orders.filter((item) => {
      const pay = getPayStatus(item);
      const del = getDelStatus(item);
      return (pay === 'UNPAID' || pay === 'PENDING') && del === 'PENDING';
    });

    const groupTengah = orders.filter((item) => {
      const pay = getPayStatus(item);
      const del = getDelStatus(item);
      return (pay === 'PAID' && del === 'PENDING') || ((pay === 'UNPAID' || pay === 'PENDING') && del === 'DONE');
    });

    const groupBawah = orders.filter((item) => {
      const pay = getPayStatus(item);
      const del = getDelStatus(item);
      return pay === 'PAID' && del === 'DONE';
    });

    return [...groupAtas, ...groupTengah, ...groupBawah];
  }, [orders]);

  const totalPages = Math.ceil(sortedOrders.length / pageSize);

  // Reset page to 1 if filter reduces totalPages below currentPage
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [sortedOrders.length, totalPages, currentPage]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedOrders.slice(startIndex, startIndex + pageSize);
  }, [sortedOrders, currentPage, pageSize]);

  const hasAnyOrders = orders.length > 0;

  if (!hasAnyOrders) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center my-4 space-y-2 shadow-xs">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-900">Belum Ada Transaksi Pesanan</h3>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            Tambah pesanan baru untuk mulai mengelola data supplier, toko, dan dapur.
          </p>
        </div>
      </div>
    );
  }

  // Render rows helper
  const renderRowItem = (item: OrderItem, indexNum: number) => {
    const payStatus = getPayStatus(item);
    const delStatus = getDelStatus(item);
    const isMenuOpen = activeMenuId === item.id;

    return (
      <tr 
        key={item.id} 
        className="hover:bg-slate-50/90 transition-colors group border-b border-slate-100"
      >
        {/* 1. NOMER */}
        <td className="py-1 px-0.5 text-center font-mono text-[9.5px] text-slate-400 font-bold">
          {indexNum}
        </td>

        {/* 2. NAMA BARANG & SUPPLIER */}
        <td className="py-1 px-1">
          <div className="font-bold text-slate-900 text-[10px] leading-tight">
            {item.namaBarang}
          </div>
          <div className="text-[8.5px] text-slate-500 font-mono font-medium">
            {item.pemasok}
          </div>
          {item.catatan && (
            <div className="mt-0.5 text-[8px] font-mono text-slate-500 bg-slate-50 px-1 py-0.2 rounded border border-slate-200/60 max-w-[120px] truncate">
              {item.catatan}
            </div>
          )}
        </td>

        {/* 3. HARI & TANGGAL */}
        <td className="py-1 px-0.5 text-center font-mono whitespace-nowrap">
          <span className="font-bold text-slate-800 text-[9.5px] bg-slate-100/80 px-1 py-0.2 rounded border border-slate-200/60">
            {formatTanggalDisatuin(item.tanggal)}
          </span>
        </td>

        {/* 4. TOKO */}
        <td className="py-1 px-0.5 text-center whitespace-nowrap">
          <span className={`inline-block px-1.5 py-0.5 rounded text-[9.5px] border ${getTokoBadgeStyle(item.toko)}`}>
            {item.toko}
          </span>
        </td>

        {/* 5. DAPUR */}
        <td className="py-1 px-0.5 text-center whitespace-nowrap">
          <span className="inline-block bg-slate-100 text-slate-800 font-extrabold px-1.5 py-0.5 rounded text-[9.5px] border border-slate-200/80">
            {item.tujuanDapur}
          </span>
        </td>

        {/* 6. PAYMENT SELECT */}
        <td className="py-1 px-0.5 text-center whitespace-nowrap">
          <select
            value={payStatus}
            onChange={(e) => onUpdatePaymentStatus(item.id, e.target.value as PaymentStatus)}
            className={`text-[9px] font-black px-1 py-0.5 rounded border cursor-pointer focus:outline-none transition-all ${
              payStatus === 'PAID'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : payStatus === 'UNPAID'
                ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
            }`}
          >
            <option value="UNPAID">UNPAID</option>
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
          </select>
        </td>

        {/* 7. DELIVERY SELECT */}
        <td className="py-1 px-0.5 text-center whitespace-nowrap">
          <select
            value={delStatus}
            onChange={(e) => onUpdateDeliveryStatus(item.id, e.target.value as DeliveryStatus)}
            className={`text-[9px] font-black px-1 py-0.5 rounded border cursor-pointer focus:outline-none transition-all ${
              delStatus === 'DONE'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
            }`}
          >
            <option value="PENDING">PENDING</option>
            <option value="DONE">DONE</option>
          </select>
        </td>

        {/* 8. QTY */}
        <td className="py-1 px-0.5 text-center font-black font-mono text-[9.5px] text-slate-900">
          {item.qty}
        </td>

        {/* 9. H. JUAL */}
        <td className="py-1 px-1 text-right whitespace-nowrap">
          <div className="font-bold text-slate-900 font-mono text-[9.5px]">
            {formatRupiah(item.qty * item.hargaJual)}
          </div>
          <div className="text-[8px] text-slate-400 font-mono">
            @{formatRupiah(item.hargaJual)}
          </div>
        </td>

        {/* 10. H. BELI */}
        <td className="py-1 px-1 text-right whitespace-nowrap">
          <div className="font-semibold text-slate-600 font-mono text-[9.5px]">
            {formatRupiah(item.qty * item.hargaBeli)}
          </div>
          <div className="text-[8px] text-slate-400 font-mono">
            @{formatRupiah(item.hargaBeli)}
          </div>
        </td>


        {/* 11. AKSI */}
        <td className="py-1.5 px-1 text-center relative">
          <div className="flex items-center justify-center space-x-0.5">
            <button
              onClick={() => onOpenInvoiceModal([item], item.tujuanDapur, item.toko)}
              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Invoice"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            <div className="relative" ref={isMenuOpen ? menuRef : null}>
              <button
                onClick={() => setActiveMenuId(isMenuOpen ? null : item.id)}
                className={`p-1 rounded transition-colors ${
                  isMenuOpen 
                    ? 'bg-slate-200 text-slate-900' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Menu"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 text-left"
                  >
                    <button
                      onClick={() => {
                        setActiveMenuId(null);
                        onEditOrder(item);
                      }}
                      className="w-full px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
                    >
                      <Edit2 className="w-3 h-3 text-emerald-600" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveMenuId(null);
                        onDuplicateOrder(item);
                      }}
                      className="w-full px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3 h-3 text-indigo-600" />
                      <span>Duplicate</span>
                    </button>

                    <div className="border-t border-slate-100 my-0.5" />

                    <button
                      onClick={() => {
                        setActiveMenuId(null);
                        onDeleteOrder(item.id);
                      }}
                      className="w-full px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-rose-600" />
                      <span>Hapus</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  const startRowIndex = (currentPage - 1) * pageSize + 1;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* ONE SINGLE COMPACT TABLE WITH STICKY FREEZE PANES HEADER */}
      <div className="overflow-x-auto max-h-[70vh] sm:max-h-[75vh] overflow-y-auto">
        <table className="w-full text-left border-collapse text-[10px] font-sans relative">
          <thead className="sticky top-0 z-20 bg-slate-100 border-b border-slate-200 shadow-2xs">
            <tr className="text-[8.5px] sm:text-[9px] font-black text-slate-600 uppercase tracking-wider">
              <th className="py-2 px-1 text-center w-5 bg-slate-100 sticky top-0">#</th>
              <th className="py-2 px-1.5 min-w-[95px] bg-slate-100 sticky top-0">BARANG & SUPPLIER</th>
              <th className="py-2 px-1 text-center whitespace-nowrap min-w-[85px] bg-slate-100 sticky top-0">HARI, TANGGAL</th>
              <th className="py-2 px-1 text-center bg-slate-100 sticky top-0">TOKO</th>
              <th className="py-2 px-1 text-center bg-slate-100 sticky top-0">DAPUR</th>
              <th className="py-2 px-1 text-center bg-slate-100 sticky top-0">PAYMENT</th>
              <th className="py-2 px-1 text-center bg-slate-100 sticky top-0">DELIVERY</th>
              <th className="py-2 px-1 text-center w-8 bg-slate-100 sticky top-0">QTY</th>
              <th className="py-2 px-1.5 text-right whitespace-nowrap bg-slate-100 sticky top-0">H. JUAL</th>
              <th className="py-2 px-1.5 text-right whitespace-nowrap bg-slate-100 sticky top-0">H. BELI</th>
              <th className="py-2 px-1 text-center w-10 bg-slate-100 sticky top-0">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {paginatedOrders.map((item, idx) =>
              renderRowItem(item, startRowIndex + idx)
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

