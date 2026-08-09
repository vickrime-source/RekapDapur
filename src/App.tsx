import React, { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { 
  OrderItem, 
  Kitchen, 
  Store as StoreType, 
  InvoiceRecord, 
  TextParseResult,
  PaymentStatus,
  DeliveryStatus
} from './types';
import { 
  INITIAL_KITCHENS, 
  INITIAL_STORES, 
  INITIAL_PEMASOK, 
  INITIAL_ORDERS 
} from './constants/initialData';
import { HeaderBanner } from './components/HeaderBanner';
import { BottomNav, TabType } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { OrderModal } from './components/OrderModal';
import { InvoiceModal } from './components/InvoiceModal';
import { TextImportModal } from './components/TextImportModal';
import { ExportModal } from './components/ExportModal';
import { SettingsModal } from './components/SettingsModal';
import { ConfirmModal } from './components/ConfirmModal';
import { Toast, ToastMessage, ToastType } from './components/Toast';
import { SplashScreen } from './components/SplashScreen';
import { generateInvoiceNumber } from './lib/formatters';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // Persistent State
  const [orders, setOrders] = useLocalStorage<OrderItem[]>('dapur_tracker_orders_v4', INITIAL_ORDERS);
  const [kitchens, setKitchens] = useLocalStorage<Kitchen[]>('dapur_tracker_kitchens_v4', INITIAL_KITCHENS);
  const [stores, setStores] = useLocalStorage<StoreType[]>('dapur_tracker_stores_v4', INITIAL_STORES);
  const [pemasokList, setPemasokList] = useLocalStorage<string[]>('dapur_tracker_pemasok_v4', INITIAL_PEMASOK);
  const [invoices, setInvoices] = useLocalStorage<InvoiceRecord[]>('dapur_tracker_invoices_v4', []);


  // Toast Notification State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ id: `toast-${Date.now()}`, message, type });
  };

  // Confirm Modal State
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Data Sanitization / Migration Effect
  React.useEffect(() => {
    if (stores.some((s) => s.nama.startsWith('Toko '))) {
      setStores(INITIAL_STORES);
    }
    if (pemasokList.some((p) => ['HTG', 'PROHE', 'LUWENG BOGA', 'ADIFRUITA'].includes(p))) {
      setPemasokList(INITIAL_PEMASOK);
    }

    let needUpdate = false;
    const updatedOrders = orders.map((o) => {
      let toko = o.toko;
      let pemasok = o.pemasok;
      let itemChanged = false;

      if (['HTG', 'PROHE', 'LUWENG BOGA', 'ADIFRUITA'].includes(o.pemasok)) {
        toko = o.pemasok;
        pemasok = 'Pemasok 1';
        itemChanged = true;
      }
      if (['Toko 1', 'Toko 2', 'Toko 3', 'Toko 4'].includes(o.toko)) {
        toko = 'HTG';
        itemChanged = true;
      }
      if (['Toko 1', 'Toko 2', 'Toko 3', 'Toko 4'].includes(o.pemasok)) {
        pemasok = 'Pemasok 1';
        itemChanged = true;
      }

      if (itemChanged) {
        needUpdate = true;
        return { ...o, toko, pemasok };
      }
      return o;
    });

    if (needUpdate) {
      setOrders(updatedOrders);
    }
  }, []);

  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Modal States
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderItem | null>(null);
  const [prefilledKitchen, setPrefilledKitchen] = useState<string | undefined>();

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<OrderItem[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceTargetKitchen, setInvoiceTargetKitchen] = useState<string | undefined>();
  const [invoiceTargetStore, setInvoiceTargetStore] = useState<string | undefined>();

  const [isTextImportOpen, setIsTextImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Handlers for Order CRUD
  const handleToggleStatus = (id: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: o.status === 'pending' ? 'selesai' : 'pending' } : o
      )
    );
  };

  const handleUpdatePaymentStatus = (id: string, paymentStatus: PaymentStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const delStatus = o.deliveryStatus || (o.status === 'selesai' ? 'DONE' : 'PENDING');
        return {
          ...o,
          paymentStatus,
          status: paymentStatus === 'PAID' && delStatus === 'DONE' ? 'selesai' : 'pending',
        };
      })
    );
  };

  const handleUpdateDeliveryStatus = (id: string, deliveryStatus: 'DONE' | 'PENDING') => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const payStatus = o.paymentStatus || (o.status === 'selesai' ? 'PAID' : 'UNPAID');
        return {
          ...o,
          deliveryStatus,
          status: payStatus === 'PAID' && deliveryStatus === 'DONE' ? 'selesai' : 'pending',
        };
      })
    );
  };

  const handleDuplicateOrder = (item: OrderItem) => {
    const duplicated: OrderItem = {
      ...item,
      id: `ord-dup-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [duplicated, ...prev]);
    showToast('Pesanan berhasil diduplikasi', 'success');
  };

  const handleToggleBatchStatus = (targetName: string, date: string, targetStatus: 'pending' | 'selesai') => {
    setOrders((prev) =>
      prev.map((o) =>
        (o.toko === targetName || o.tujuanDapur === targetName) && o.tanggal === date
          ? { ...o, status: targetStatus }
          : o
      )
    );
  };

  const handleSaveOrder = (
    orderData: Omit<OrderItem, 'id' | 'createdAt'> | Array<Omit<OrderItem, 'id' | 'createdAt'>>,
    editId?: string
  ) => {
    if (editId && !Array.isArray(orderData)) {
      setOrders((prev) =>
        prev.map((o) => (o.id === editId ? { ...o, ...orderData } : o))
      );
      showToast('Pesanan berhasil diperbarui', 'edit');
    } else {
      const itemsToAdd = Array.isArray(orderData) ? orderData : [orderData];
      const newOrders: OrderItem[] = itemsToAdd.map((item, idx) => ({
        ...item,
        id: `ord-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date().toISOString(),
      }));
      setOrders((prev) => [...newOrders, ...prev]);
      showToast(`${itemsToAdd.length} pesanan berhasil ditambahkan`, 'success');
    }
  };

  const handleDeleteOrder = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Konfirmasi Hapus Pesanan',
      message: 'Apakah Anda yakin ingin menghapus barang ini dari daftar pesanan?',
      onConfirm: () => {
        setOrders((prev) => prev.filter((o) => o.id !== id));
        setConfirmState(null);
        showToast('Pesanan berhasil dihapus', 'delete');
      },
    });
  };

  const handleDeleteKitchenOrders = (targetName: string, date: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Hapus Semua Pesanan',
      message: `Hapus semua pesanan untuk ${targetName} pada tanggal ${date}?`,
      onConfirm: () => {
        setOrders((prev) => prev.filter((o) => !((o.toko === targetName || o.tujuanDapur === targetName) && o.tanggal === date)));
        setConfirmState(null);
        showToast('Semua pesanan berhasil dihapus', 'delete');
      },
    });
  };

  const handleOpenEditOrder = (item: OrderItem) => {
    setEditingOrder(item);
    setPrefilledKitchen(item.tujuanDapur);
    setIsOrderModalOpen(true);
  };

  const handleOpenAddModal = (kitchenName?: string) => {
    setEditingOrder(null);
    setPrefilledKitchen(kitchenName);
    setIsOrderModalOpen(true);
  };

  // Handlers for Invoice
  const handleOpenInvoice = (items: OrderItem[], kitchenName?: string, storeName?: string) => {
    if (items.length === 0) {
      alert('Tidak ada item untuk dibuatkan invoice');
      return;
    }

    const mainKitchen = kitchenName || items[0]?.tujuanDapur;
    const mainStore = storeName || items[0]?.toko;
    const mainDate = items[0]?.tanggal;

    const normStore = (mainStore || '').trim().toLowerCase();
    const normKitchen = (mainKitchen || '').trim().toLowerCase();

    // Strict filter for store + kitchen + date
    const scopedItems = items.filter((item) => {
      const matchStore = !normStore || item.toko.trim().toLowerCase() === normStore;
      const matchKitchen = !normKitchen || item.tujuanDapur.trim().toLowerCase() === normKitchen;
      const matchDate = !mainDate || item.tanggal === mainDate;
      return matchStore && matchKitchen && matchDate;
    });

    const finalItems = scopedItems.length > 0 ? scopedItems : items;
    const invNum = generateInvoiceNumber(mainKitchen);

    setInvoiceItems(finalItems);
    setInvoiceNumber(invNum);
    setInvoiceTargetKitchen(mainKitchen);
    setInvoiceTargetStore(mainStore);
    setIsInvoiceModalOpen(true);
  };

  const handleSaveInvoiceRecord = () => {
    if (invoices.some((inv) => inv.invoiceNumber === invoiceNumber)) return;

    const totalBeli = invoiceItems.reduce((s, i) => s + i.qty * i.hargaBeli, 0);
    const totalJual = invoiceItems.reduce((s, i) => s + i.qty * i.hargaJual, 0);
    const newRecord: InvoiceRecord = {
      id: `inv-rec-${Date.now()}`,
      invoiceNumber,
      tanggalPrint: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      createdAt: new Date().toISOString(),
      tujuanDapur: invoiceTargetKitchen || invoiceItems[0]?.tujuanDapur || 'Siliragung',
      toko: invoiceTargetStore || invoiceItems[0]?.toko || 'Toko 1',
      items: invoiceItems,
      totalBeli,
      totalJual,
      totalProfit: totalJual - totalBeli,
    };

    setInvoices((prev) => [newRecord, ...prev]);
    showToast('Invoice berhasil disimpan', 'success');
  };

  const handleDeleteInvoice = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Hapus Riwayat Invoice',
      message: 'Apakah Anda yakin ingin menghapus riwayat invoice ini?',
      onConfirm: () => {
        setInvoices((prev) => prev.filter((inv) => inv.id !== id));
        setConfirmState(null);
        showToast('Riwayat invoice dihapus', 'delete');
      },
    });
  };

  const handleDeleteAllData = () => {
    setOrders([]);
    setInvoices([]);
    showToast('Seluruh data pesanan berhasil dihapus bersih', 'delete');
  };

  // Handlers for WhatsApp Text Import

  const handleImportParsedItems = (parsedResults: TextParseResult[], targetDate: string) => {
    const newOrders: OrderItem[] = parsedResults.map((res, index) => ({
      id: `ord-imp-${Date.now()}-${index}`,
      namaBarang: res.namaBarang,
      qty: res.qty,
      hargaBeli: res.hargaBeli,
      hargaJual: res.hargaJual,
      toko: res.toko || stores[0]?.nama || 'HTG',
      tujuanDapur: res.tujuanDapur || kitchens[0]?.nama || 'Siliragung',
      pemasok: res.pemasok || pemasokList[0] || 'Pemasok 1',
      status: 'pending',
      tanggal: targetDate || selectedDate,
      createdAt: new Date().toISOString(),
    }));

    setOrders((prev) => [...newOrders, ...prev]);
    showToast(`${parsedResults.length} item berhasil diimport`, 'success');
  };

  // Horizontal Swipe Gesture threshold logic
  const handleDragEnd = (_: any, info: { offset: { x: number; y: number }; velocity: { x: number } }) => {
    const swipeThreshold = 60;
    if (Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
      if (info.offset.x < -swipeThreshold && activeTab === 'dashboard') {
        setActiveTab('transaksi');
      } else if (info.offset.x > swipeThreshold && activeTab === 'transaksi') {
        setActiveTab('dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f6] text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-[#4f46e5]">
      {/* Header Banner */}
      <HeaderBanner
        orders={orders}
        selectedDate={selectedDate}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTextImport={() => setIsTextImportOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.08}
          onDragEnd={handleDragEnd}
          className="touch-pan-y"
        >
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' ? (
              <motion.div
                key="dashboard-view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <DashboardView
                  orders={orders}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  onToggleStatus={handleToggleStatus}
                  onUpdatePaymentStatus={handleUpdatePaymentStatus}
                  onUpdateDeliveryStatus={handleUpdateDeliveryStatus}
                  onDuplicateOrder={handleDuplicateOrder}
                  onToggleBatchStatus={handleToggleBatchStatus}
                  onEditOrder={handleOpenEditOrder}
                  onDeleteOrder={handleDeleteOrder}
                  onDeleteKitchenOrders={handleDeleteKitchenOrders}
                  onOpenAddModal={handleOpenAddModal}
                  onOpenInvoiceModal={handleOpenInvoice}
                  kitchens={kitchens}
                  stores={stores}
                />
              </motion.div>
            ) : (
              <motion.div
                key="transaksi-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <TransactionsView
                  invoices={invoices}
                  orders={orders}
                  kitchens={kitchens}
                  onToggleStatus={handleToggleStatus}
                  onUpdatePaymentStatus={handleUpdatePaymentStatus}
                  onToggleBatchStatus={handleToggleBatchStatus}
                  onEditOrder={handleOpenEditOrder}
                  onDeleteOrder={handleDeleteOrder}
                  onDeleteKitchenOrders={handleDeleteKitchenOrders}
                  onOpenInvoiceModal={handleOpenInvoice}
                  onDeleteInvoice={handleDeleteInvoice}
                  onOpenAddModal={handleOpenAddModal}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Fixed Sticky Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenAddModal={() => handleOpenAddModal()}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Confirm Delete Modal */}
      {confirmState && (
        <ConfirmModal
          isOpen={confirmState.isOpen}
          title={confirmState.title}
          message={confirmState.message}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}

      {/* MODALS */}
      {/* 1. Add / Edit Order Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setEditingOrder(null);
          setPrefilledKitchen(undefined);
        }}
        onSave={handleSaveOrder}
        initialData={editingOrder}
        prefilledKitchen={prefilledKitchen}
        kitchens={kitchens}
        stores={stores}
        pemasokList={pemasokList}
        selectedDate={selectedDate}
      />

      {/* 2. Invoice Printable Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoiceNumber={invoiceNumber}
        items={invoiceItems}
        tujuanDapur={invoiceTargetKitchen}
        toko={invoiceTargetStore}
        onSaveInvoiceRecord={handleSaveInvoiceRecord}
      />

      {/* 3. Text Import (WhatsApp Parser) Modal */}
      <TextImportModal
        isOpen={isTextImportOpen}
        onClose={() => setIsTextImportOpen(false)}
        onImportItems={handleImportParsedItems}
        kitchens={kitchens}
        stores={stores}
        pemasokList={pemasokList}
        selectedDate={selectedDate}
      />

      {/* 4. Export Modal (.xlsx & .csv) */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        orders={orders}
        selectedDate={selectedDate}
      />

      {/* Animated Initial Splash Screen */}
      <AnimatePresence>
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      </AnimatePresence>

      {/* 5. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        kitchens={kitchens}
        onUpdateKitchens={setKitchens}
        stores={stores}
        onUpdateStores={setStores}
        pemasokList={pemasokList}
        onUpdatePemasok={setPemasokList}
        orders={orders}
        onUpdateOrders={setOrders}
        onDeleteAllData={handleDeleteAllData}
      />
    </div>
  );
}


