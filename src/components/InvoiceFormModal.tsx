import React, { useState, useEffect } from 'react';
import { X, FileText, ArrowRight, User, MapPin, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OrderItem, Kitchen } from '../types';

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  kitchenName?: string;
  storeName?: string;
  kitchens?: Kitchen[];
  onConfirm: (data: {
    items: OrderItem[];
    kitchenName: string;
    storeName: string;
    recipientName: string;
    address: string;
    phone: string;
  }) => void;
}

export const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({
  isOpen,
  onClose,
  items,
  kitchenName = '',
  storeName = '',
  kitchens = [],
  onConfirm,
}) => {
  const [recipientName, setRecipientName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      const normKitchen = (kitchenName || items[0]?.tujuanDapur || '').trim().toLowerCase();
      const matchedKitchen = kitchens.find(
        (k) => k.nama.trim().toLowerCase() === normKitchen
      );

      // Default prefill values
      const defaultName = matchedKitchen?.penanggungJawab || matchedKitchen?.nama || kitchenName || items[0]?.tujuanDapur || '';
      const defaultAddress = matchedKitchen?.lokasi || 'Banyuwangi';
      const defaultPhone = '082229992371';

      setRecipientName(defaultName);
      setAddress(defaultAddress);
      setPhone(defaultPhone);
    }
  }, [isOpen, kitchenName, items, kitchens]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) {
      setError('Nama Penerima wajib diisi');
      return;
    }

    const mainKitchen = kitchenName || items[0]?.tujuanDapur || '';
    const mainStore = storeName || items[0]?.toko || '';

    onConfirm({
      items,
      kitchenName: mainKitchen,
      storeName: mainStore,
      recipientName: recipientName.trim(),
      address: address.trim() || 'Banyuwangi',
      phone: phone.trim() || '-',
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-400/20 text-amber-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  Konfirmasi Data Invoice
                </h3>
                <p className="text-[11px] text-slate-400">
                  Lengkapi data penerima sebelum export PDF
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Input 1: Nama Penerima */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                Nama Penerima <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => {
                  setRecipientName(e.target.value);
                  if (e.target.value.trim()) setError('');
                }}
                placeholder="e.g. Dapur Singojuruh / Ibu Maria"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                  error
                    ? 'border-red-500 focus:ring-red-200 bg-red-50/50'
                    : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100 bg-slate-50 focus:bg-white'
                }`}
                autoFocus
              />
              {error && (
                <p className="text-[11px] text-red-500 font-medium mt-1">
                  {error}
                </p>
              )}
            </div>

            {/* Input 2: Alamat */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                Alamat
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Banyuwangi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:border-indigo-600 focus:ring-indigo-100 bg-slate-50 focus:bg-white transition-all"
              />
            </div>

            {/* Input 3: Nomor Telepon/HP */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-600" />
                Nomor Telepon / HP
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 082229992371"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:border-indigo-600 focus:ring-indigo-100 bg-slate-50 focus:bg-white transition-all"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer border border-amber-500/80"
              >
                <span>Lanjut ke Preview</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
