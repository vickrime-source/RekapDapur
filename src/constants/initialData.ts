import { Kitchen, Store, OrderItem } from '../types';

export const INITIAL_PEMASOK: string[] = [
  "Pemasok 1",
  "Pemasok 2",
  "Pemasok 3",
  "Pemasok 4"
];

export const INITIAL_STORES: Store[] = [
  {
    "id": "st-1",
    "nama": "HTG",
    "lokasi": "CV. HANDAI TOLAN GROUP"
  },
  {
    "id": "st-2",
    "nama": "PROHE",
    "lokasi": "Gudang Protein"
  },
  {
    "id": "st-3",
    "nama": "LUWENG BOGA",
    "lokasi": "Depo Makanan"
  },
  {
    "id": "st-4",
    "nama": "ADIFRUITA",
    "lokasi": "Distributor Buah"
  }
];

export const INITIAL_KITCHENS: Kitchen[] = [
  {
    "id": "kt-1",
    "nama": "Siliragung"
  },
  {
    "id": "kt-2",
    "nama": "Singojuruh"
  },
  {
    "id": "kt-3",
    "nama": "Banjarsari 2"
  },
  {
    "id": "kt-4",
    "nama": "Cluring"
  },
  {
    "id": "kt-5",
    "nama": "Tamansari"
  },
  {
    "id": "kt-6",
    "nama": "Wongsorejo"
  },
  {
    "id": "kt-7",
    "nama": "Wringinputih 2"
  },
  {
    "id": "kt-8",
    "nama": "Wringinputih 4"
  },
  {
    "id": "kt-9",
    "nama": "Sumberagung"
  },
  {
    "id": "kt-10",
    "nama": "Mojoroto"
  },
  {
    "id": "kt-11",
    "nama": "Tapanrejo"
  },
  {
    "id": "kt-12",
    "nama": "Kendalrejo"
  },
  {
    "id": "kt-13",
    "nama": "Gambiran"
  },
  {
    "id": "kt-14",
    "nama": "Pidis"
  },
  {
    "id": "kt-15",
    "nama": "Kesilir 2"
  },
  {
    "id": "kt-16",
    "nama": "Mufid"
  },
  {
    "id": "kt-17",
    "nama": "Rejoagung"
  },
  {
    "id": "kt-18",
    "nama": "Ajeng"
  },
  {
    "id": "kt-19",
    "nama": "Kedayunan"
  },
  {
    "id": "kt-20",
    "nama": "Pesanggaran"
  },
  {
    "id": "kt-21",
    "nama": "Bangorejo"
  }
];

export const DEFAULT_DATE = '2026-07-26';

export const INITIAL_ORDERS: OrderItem[] = [
  {
    "id": "ord-silir-26",
    "namaBarang": "Lele",
    "qty": 323,
    "hargaBeli": 22000,
    "hargaJual": 25000,
    "toko": "HTG",
    "tujuanDapur": "Siliragung",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-26",
    "catatan": "fie 323x3000 = 969.000"
  },
  {
    "id": "ord-silir-27",
    "namaBarang": "Ayam Paha",
    "qty": 309,
    "hargaBeli": 29000,
    "hargaJual": 30000,
    "toko": "PROHE",
    "tujuanDapur": "Siliragung",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-27",
    "catatan": "fie 309.000"
  },
  {
    "id": "ord-silir-30",
    "namaBarang": "Daging Sapi",
    "qty": 422,
    "hargaBeli": 51500,
    "hargaJual": 53000,
    "toko": "HTG",
    "tujuanDapur": "Siliragung",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-30",
    "catatan": "fie 422x1500 = 633.000"
  },
  {
    "id": "ord-sumber-28",
    "namaBarang": "Cavendish",
    "qty": 21,
    "hargaBeli": 140000,
    "hargaJual": 185000,
    "toko": "ADIFRUITA",
    "tujuanDapur": "Sumberagung",
    "pemasok": "Pemasok 2",
    "status": "selesai",
    "tanggal": "2026-07-28",
    "catatan": "fie 21x45.000 = 945.000"
  },
  {
    "id": "ord-cluring-26",
    "namaBarang": "Ayam",
    "qty": 215,
    "hargaBeli": 29000,
    "hargaJual": 30000,
    "toko": "PROHE",
    "tujuanDapur": "Cluring",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-26",
    "catatan": "fie 215.000"
  },
  {
    "id": "ord-cluring-28",
    "namaBarang": "Ayam",
    "qty": 215,
    "hargaBeli": 31000,
    "hargaJual": 32000,
    "toko": "PROHE",
    "tujuanDapur": "Cluring",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-28",
    "catatan": "fie 215.000"
  },
  {
    "id": "ord-mojo-26-1",
    "namaBarang": "Fillet Paha (Part 1)",
    "qty": 130,
    "hargaBeli": 42000,
    "hargaJual": 43000,
    "toko": "PROHE",
    "tujuanDapur": "Mojoroto",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-26",
    "catatan": "Sebagian paha (130 kg)"
  },
  {
    "id": "ord-mojo-26-2",
    "namaBarang": "Fillet Paha (Part 2)",
    "qty": 30,
    "hargaBeli": 39000,
    "hargaJual": 43000,
    "toko": "PROHE",
    "tujuanDapur": "Mojoroto",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-26",
    "catatan": "Sebagian paha (30 kg), fie total = 250.000"
  },
  {
    "id": "ord-mojo-27",
    "namaBarang": "Dori",
    "qty": 185,
    "hargaBeli": 35000,
    "hargaJual": 40000,
    "toko": "LUWENG BOGA",
    "tujuanDapur": "Mojoroto",
    "pemasok": "Pemasok 3",
    "status": "selesai",
    "tanggal": "2026-07-27",
    "catatan": "fie 185x5000 = 925.000"
  },
  {
    "id": "ord-tapan-26",
    "namaBarang": "Jagung Pipil",
    "qty": 13,
    "hargaBeli": 10000,
    "hargaJual": 20000,
    "toko": "HTG",
    "tujuanDapur": "Tapanrejo",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-26",
    "catatan": "fie 130.000"
  },
  {
    "id": "ord-tapan-28",
    "namaBarang": "Daging Sapi",
    "qty": 79,
    "hargaBeli": 122000,
    "hargaJual": 128000,
    "toko": "HTG",
    "tujuanDapur": "Tapanrejo",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-28",
    "catatan": "fie 79x6.000 = 474.000"
  },
  {
    "id": "ord-tapan-29",
    "namaBarang": "Jagung Pipil",
    "qty": 28,
    "hargaBeli": 10000,
    "hargaJual": 20000,
    "toko": "HTG",
    "tujuanDapur": "Tapanrejo",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-29",
    "catatan": "fie 28x10.000 = 280.000"
  },
  {
    "id": "ord-kendal-26",
    "namaBarang": "Baby Cumi",
    "qty": 135,
    "hargaBeli": 55000,
    "hargaJual": 59000,
    "toko": "HTG",
    "tujuanDapur": "Kendalrejo",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-26",
    "catatan": "fie 135x4000 = 540.000"
  },
  {
    "id": "ord-gambir-26",
    "namaBarang": "Lele",
    "qty": 280,
    "hargaBeli": 22000,
    "hargaJual": 25000,
    "toko": "HTG",
    "tujuanDapur": "Gambiran",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-26",
    "catatan": "fie 280x3000 = 840.000"
  },
  {
    "id": "ord-pidis-26",
    "namaBarang": "Daging Sapi",
    "qty": 53,
    "hargaBeli": 119000,
    "hargaJual": 120000,
    "toko": "HTG",
    "tujuanDapur": "Pidis",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-26",
    "catatan": "fie 53.000"
  },
  {
    "id": "ord-wongso-26-1",
    "namaBarang": "Semboro",
    "qty": 295,
    "hargaBeli": 11000,
    "hargaJual": 13000,
    "toko": "ADIFRUITA",
    "tujuanDapur": "Wongsorejo",
    "pemasok": "Pemasok 4",
    "status": "selesai",
    "tanggal": "2026-07-26",
    "catatan": "fie 295x2000 = 590.000"
  },
  {
    "id": "ord-wongso-26-2",
    "namaBarang": "Klengkeng Biru",
    "qty": 16,
    "hargaBeli": 346875,
    "hargaJual": 400000,
    "toko": "ADIFRUITA",
    "tujuanDapur": "Wongsorejo",
    "pemasok": "Pemasok 4",
    "status": "selesai",
    "tanggal": "2026-07-26",
    "catatan": "Beli 15 x 370.000 = 5.550.000, fie = 650.000"
  },
  {
    "id": "ord-kesilir-27-1",
    "namaBarang": "Fillet Kulit",
    "qty": 195,
    "hargaBeli": 37000,
    "hargaJual": 40000,
    "toko": "PROHE",
    "tujuanDapur": "Kesilir 2",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-27",
    "catatan": "fie 195x3000 = 585.000, Nota 8.385.000"
  },
  {
    "id": "ord-kesilir-27-2",
    "namaBarang": "Melon",
    "qty": 325,
    "hargaBeli": 10000,
    "hargaJual": 11000,
    "toko": "ADIFRUITA",
    "tujuanDapur": "Kesilir 2",
    "pemasok": "Pemasok 4",
    "status": "selesai",
    "tanggal": "2026-07-27",
    "catatan": "fie 325.000"
  },
  {
    "id": "ord-kesilir-28",
    "namaBarang": "Klengkeng Pohon",
    "qty": 20,
    "hargaBeli": 361000,
    "hargaJual": 400000,
    "toko": "ADIFRUITA",
    "tujuanDapur": "Kesilir 2",
    "pemasok": "Pemasok 4",
    "status": "selesai",
    "tanggal": "2026-07-28",
    "catatan": "fie 1.160.000"
  },
  {
    "id": "ord-kesilir-29-1",
    "namaBarang": "Aussie",
    "qty": 18,
    "hargaBeli": 335000,
    "hargaJual": 360000,
    "toko": "HTG",
    "tujuanDapur": "Kesilir 2",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-29",
    "catatan": "fie 18x25.000 = 450.000"
  },
  {
    "id": "ord-kesilir-29-2",
    "namaBarang": "Ayam",
    "qty": 297,
    "hargaBeli": 31000,
    "hargaJual": 33000,
    "toko": "PROHE",
    "tujuanDapur": "Kesilir 2",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-29",
    "catatan": "fie 397x2000 = 794.000, Nota 10.395.000"
  },
  {
    "id": "ord-mufid-27",
    "namaBarang": "Siem",
    "qty": 287,
    "hargaBeli": 12000,
    "hargaJual": 13000,
    "toko": "ADIFRUITA",
    "tujuanDapur": "Mufid",
    "pemasok": "Pemasok 4",
    "status": "selesai",
    "tanggal": "2026-07-27",
    "catatan": "fie 287.000"
  },
  {
    "id": "ord-rejo-26",
    "namaBarang": "Sayur",
    "qty": 1,
    "hargaBeli": 4330000,
    "hargaJual": 4699000,
    "toko": "LUWENG BOGA",
    "tujuanDapur": "Rejoagung",
    "pemasok": "Pemasok 3",
    "status": "selesai",
    "tanggal": "2026-07-26",
    "catatan": "fie 369.000"
  },
  {
    "id": "ord-rejo-27",
    "namaBarang": "Fillet Bersih",
    "qty": 125,
    "hargaBeli": 45000,
    "hargaJual": 46000,
    "toko": "PROHE",
    "tujuanDapur": "Rejoagung",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-27",
    "catatan": "fie 125.000, Nota 8.665.000"
  },
  {
    "id": "ord-rejo-28",
    "namaBarang": "Muscat",
    "qty": 30,
    "hargaBeli": 240000,
    "hargaJual": 280000,
    "toko": "ADIFRUITA",
    "tujuanDapur": "Rejoagung",
    "pemasok": "Pemasok 4",
    "status": "selesai",
    "tanggal": "2026-07-28",
    "catatan": "fie 30x40.000 = 1.200.000"
  },
  {
    "id": "ord-rejo-29-1",
    "namaBarang": "Fillet Bersih",
    "qty": 140,
    "hargaBeli": 48000,
    "hargaJual": 49000,
    "toko": "PROHE",
    "tujuanDapur": "Rejoagung",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-29",
    "catatan": "fie 140.000, Nota 10.115.000"
  },
  {
    "id": "ord-rejo-29-2",
    "namaBarang": "Mix Vege Home",
    "qty": 90,
    "hargaBeli": 25000,
    "hargaJual": 28000,
    "toko": "LUWENG BOGA",
    "tujuanDapur": "Rejoagung",
    "pemasok": "Pemasok 3",
    "status": "selesai",
    "tanggal": "2026-07-29",
    "catatan": "fie 90x3000 = 270.000"
  },
  {
    "id": "ord-wp2-26-1",
    "namaBarang": "Ayam",
    "qty": 69,
    "hargaBeli": 29000,
    "hargaJual": 30000,
    "toko": "PROHE",
    "tujuanDapur": "Wringinputih 2",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-26",
    "catatan": "fie 69.000"
  },
  {
    "id": "ord-wp2-26-2",
    "namaBarang": "Semangka",
    "qty": 70,
    "hargaBeli": 7000,
    "hargaJual": 10000,
    "toko": "ADIFRUITA",
    "tujuanDapur": "Wringinputih 2",
    "pemasok": "Pemasok 4",
    "status": "selesai",
    "tanggal": "2026-07-26",
    "catatan": "fie 70x3000 = 210.000"
  },
  {
    "id": "ord-wp2-26-3",
    "namaBarang": "Klengkeng Hijau",
    "qty": 9,
    "hargaBeli": 284444,
    "hargaJual": 350000,
    "toko": "ADIFRUITA",
    "tujuanDapur": "Wringinputih 2",
    "pemasok": "Pemasok 4",
    "status": "selesai",
    "tanggal": "2026-07-26",
    "catatan": "Beli 8x320.000 = 2.560.000, fie 590.000"
  },
  {
    "id": "ord-wp2-27-1",
    "namaBarang": "Jeruk Wogan",
    "qty": 26,
    "hargaBeli": 300000,
    "hargaJual": 330000,
    "toko": "ADIFRUITA",
    "tujuanDapur": "Wringinputih 2",
    "pemasok": "Pemasok 4",
    "status": "selesai",
    "tanggal": "2026-07-27",
    "catatan": "fie 630.000"
  },
  {
    "id": "ord-wp2-27-2",
    "namaBarang": "Jagung Pipil",
    "qty": 16,
    "hargaBeli": 10000,
    "hargaJual": 20000,
    "toko": "HTG",
    "tujuanDapur": "Wringinputih 2",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-27",
    "catatan": "fie 160.000"
  },
  {
    "id": "ord-wp2-28-1",
    "namaBarang": "Klengkeng Hijau",
    "qty": 4,
    "hargaBeli": 340000,
    "hargaJual": 360000,
    "toko": "ADIFRUITA",
    "tujuanDapur": "Wringinputih 2",
    "pemasok": "Pemasok 4",
    "status": "selesai",
    "tanggal": "2026-07-28",
    "catatan": "fie 4x20.000 = 80.000"
  },
  {
    "id": "ord-wp2-28-2",
    "namaBarang": "Ayam",
    "qty": 142,
    "hargaBeli": 31000,
    "hargaJual": 32000,
    "toko": "PROHE",
    "tujuanDapur": "Wringinputih 2",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-28",
    "catatan": "fie 142.000"
  },
  {
    "id": "ord-wp2-28-3",
    "namaBarang": "Semangka",
    "qty": 170,
    "hargaBeli": 7000,
    "hargaJual": 10000,
    "toko": "ADIFRUITA",
    "tujuanDapur": "Wringinputih 2",
    "pemasok": "Pemasok 4",
    "status": "selesai",
    "tanggal": "2026-07-28",
    "catatan": "fie 170x3000 = 510.000"
  },
  {
    "id": "ord-wp2-29",
    "namaBarang": "Pisang",
    "qty": 23,
    "hargaBeli": 155000,
    "hargaJual": 180000,
    "toko": "ADIFRUITA",
    "tujuanDapur": "Wringinputih 2",
    "pemasok": "Pemasok 4",
    "status": "selesai",
    "tanggal": "2026-07-29",
    "catatan": "fie 23x25.000 = 575.000"
  },
  {
    "id": "ord-wp2-30-1",
    "namaBarang": "Ayam",
    "qty": 114,
    "hargaBeli": 32000,
    "hargaJual": 33000,
    "toko": "PROHE",
    "tujuanDapur": "Wringinputih 2",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-30",
    "catatan": "fie 114.000"
  },
  {
    "id": "ord-wp2-30-2",
    "namaBarang": "Muscat",
    "qty": 30,
    "hargaBeli": 235000,
    "hargaJual": 300000,
    "toko": "ADIFRUITA",
    "tujuanDapur": "Wringinputih 2",
    "pemasok": "Pemasok 4",
    "status": "selesai",
    "tanggal": "2026-07-30",
    "catatan": "fie 30x65.000 = 1.950.000"
  },
  {
    "id": "ord-wp4-26-1",
    "namaBarang": "Baby Cumi",
    "qty": 219,
    "hargaBeli": 45000,
    "hargaJual": 50000,
    "toko": "HTG",
    "tujuanDapur": "Wringinputih 4",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-26",
    "catatan": "fie 219x5000 = 1.095.000"
  },
  {
    "id": "ord-wp4-26-2",
    "namaBarang": "Semangka",
    "qty": 315,
    "hargaBeli": 7000,
    "hargaJual": 10000,
    "toko": "ADIFRUITA",
    "tujuanDapur": "Wringinputih 4",
    "pemasok": "Pemasok 4",
    "status": "selesai",
    "tanggal": "2026-07-26",
    "catatan": "fie 315x3000 = 945.000"
  },
  {
    "id": "ord-wp4-27",
    "namaBarang": "Melon",
    "qty": 321,
    "hargaBeli": 10000,
    "hargaJual": 12000,
    "toko": "ADIFRUITA",
    "tujuanDapur": "Wringinputih 4",
    "pemasok": "Pemasok 4",
    "status": "selesai",
    "tanggal": "2026-07-27",
    "catatan": "fie 321x2000 = 642.000"
  },
  {
    "id": "ord-wp4-28-1",
    "namaBarang": "Ayam",
    "qty": 142,
    "hargaBeli": 31000,
    "hargaJual": 32000,
    "toko": "PROHE",
    "tujuanDapur": "Wringinputih 4",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-28",
    "catatan": "fie 142.000"
  },
  {
    "id": "ord-wp4-28-2",
    "namaBarang": "Klengkeng H",
    "qty": 15,
    "hargaBeli": 317333,
    "hargaJual": 360000,
    "toko": "ADIFRUITA",
    "tujuanDapur": "Wringinputih 4",
    "pemasok": "Pemasok 4",
    "status": "selesai",
    "tanggal": "2026-07-28",
    "catatan": "Beli 14x340.000 = 4.760.000, fie 640.000"
  },
  {
    "id": "ord-wp4-29",
    "namaBarang": "Muscat",
    "qty": 28,
    "hargaBeli": 235000,
    "hargaJual": 300000,
    "toko": "ADIFRUITA",
    "tujuanDapur": "Wringinputih 4",
    "pemasok": "Pemasok 4",
    "status": "selesai",
    "tanggal": "2026-07-29",
    "catatan": "fie 28x65.000 = 1.820.000"
  },
  {
    "id": "ord-wp4-30-1",
    "namaBarang": "Chicken Katsu",
    "qty": 215,
    "hargaBeli": 33000,
    "hargaJual": 34000,
    "toko": "PROHE",
    "tujuanDapur": "Wringinputih 4",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-30",
    "catatan": "fie 215.000"
  },
  {
    "id": "ord-wp4-30-2",
    "namaBarang": "Cavendish",
    "qty": 26,
    "hargaBeli": 155000,
    "hargaJual": 180000,
    "toko": "ADIFRUITA",
    "tujuanDapur": "Wringinputih 4",
    "pemasok": "Pemasok 4",
    "status": "selesai",
    "tanggal": "2026-07-30",
    "catatan": "fie 26x25.000 = 650.000"
  },
  {
    "id": "ord-wp4-30-3",
    "namaBarang": "Kubis Ungu",
    "qty": 27,
    "hargaBeli": 32000,
    "hargaJual": 35000,
    "toko": "LUWENG BOGA",
    "tujuanDapur": "Wringinputih 4",
    "pemasok": "Pemasok 3",
    "status": "selesai",
    "tanggal": "2026-07-30",
    "catatan": "fie 27x3000 = 81.000"
  },
  {
    "id": "ord-taman-27",
    "namaBarang": "Dori",
    "qty": 250,
    "hargaBeli": 35000,
    "hargaJual": 40000,
    "toko": "LUWENG BOGA",
    "tujuanDapur": "Tamansari",
    "pemasok": "Pemasok 3",
    "status": "selesai",
    "tanggal": "2026-07-27",
    "catatan": "fie 250x5000 = 1.250.000, Nota 11.250.000"
  },
  {
    "id": "ord-taman-29-1",
    "namaBarang": "Edamame",
    "qty": 70,
    "hargaBeli": 20000,
    "hargaJual": 22000,
    "toko": "LUWENG BOGA",
    "tujuanDapur": "Tamansari",
    "pemasok": "Pemasok 3",
    "status": "selesai",
    "tanggal": "2026-07-29",
    "catatan": "fie 70x2000 = 140.000"
  },
  {
    "id": "ord-taman-29-2",
    "namaBarang": "Semangka",
    "qty": 230,
    "hargaBeli": 7000,
    "hargaJual": 10000,
    "toko": "ADIFRUITA",
    "tujuanDapur": "Tamansari",
    "pemasok": "Pemasok 4",
    "status": "selesai",
    "tanggal": "2026-07-29",
    "catatan": "fie 230x3000 = 690.000"
  },
  {
    "id": "ord-banjar-26",
    "namaBarang": "Sayur",
    "qty": 1,
    "hargaBeli": 1921500,
    "hargaJual": 2170500,
    "toko": "LUWENG BOGA",
    "tujuanDapur": "Banjarsari 2",
    "pemasok": "Pemasok 3",
    "status": "selesai",
    "tanggal": "2026-07-26",
    "catatan": "fie 249.000"
  },
  {
    "id": "ord-banjar-27",
    "namaBarang": "Sayur",
    "qty": 1,
    "hargaBeli": 3188500,
    "hargaJual": 3421500,
    "toko": "LUWENG BOGA",
    "tujuanDapur": "Banjarsari 2",
    "pemasok": "Pemasok 3",
    "status": "selesai",
    "tanggal": "2026-07-27",
    "catatan": "fie 233.000"
  },
  {
    "id": "ord-banjar-28-1",
    "namaBarang": "Dori",
    "qty": 250,
    "hargaBeli": 35000,
    "hargaJual": 40000,
    "toko": "LUWENG BOGA",
    "tujuanDapur": "Banjarsari 2",
    "pemasok": "Pemasok 3",
    "status": "selesai",
    "tanggal": "2026-07-28",
    "catatan": "fie 250x5000 = 1.250.000"
  },
  {
    "id": "ord-banjar-28-2",
    "namaBarang": "Sayur",
    "qty": 1,
    "hargaBeli": 3061900,
    "hargaJual": 3495000,
    "toko": "LUWENG BOGA",
    "tujuanDapur": "Banjarsari 2",
    "pemasok": "Pemasok 3",
    "status": "selesai",
    "tanggal": "2026-07-28",
    "catatan": "fie 433.100"
  },
  {
    "id": "ord-banjar-29",
    "namaBarang": "Sayur",
    "qty": 1,
    "hargaBeli": 1216100,
    "hargaJual": 1955500,
    "toko": "LUWENG BOGA",
    "tujuanDapur": "Banjarsari 2",
    "pemasok": "Pemasok 3",
    "status": "selesai",
    "tanggal": "2026-07-29",
    "catatan": "fie 739.400"
  },
  {
    "id": "ord-banjar-30",
    "namaBarang": "Sayur",
    "qty": 1,
    "hargaBeli": 1250400,
    "hargaJual": 1358000,
    "toko": "LUWENG BOGA",
    "tujuanDapur": "Banjarsari 2",
    "pemasok": "Pemasok 3",
    "status": "selesai",
    "tanggal": "2026-07-30",
    "catatan": "fie 107.600"
  },
  {
    "id": "ord-singo-26",
    "namaBarang": "Sayur",
    "qty": 1,
    "hargaBeli": 1467000,
    "hargaJual": 1646000,
    "toko": "LUWENG BOGA",
    "tujuanDapur": "Singojuruh",
    "pemasok": "Pemasok 3",
    "status": "selesai",
    "tanggal": "2026-07-26",
    "catatan": "fie 179.000"
  },
  {
    "id": "ord-singo-27",
    "namaBarang": "Sayur",
    "qty": 1,
    "hargaBeli": 1907000,
    "hargaJual": 2070000,
    "toko": "LUWENG BOGA",
    "tujuanDapur": "Singojuruh",
    "pemasok": "Pemasok 3",
    "status": "selesai",
    "tanggal": "2026-07-27",
    "catatan": "fie 163.000"
  },
  {
    "id": "ord-singo-28",
    "namaBarang": "Sayur",
    "qty": 1,
    "hargaBeli": 1052000,
    "hargaJual": 1653000,
    "toko": "LUWENG BOGA",
    "tujuanDapur": "Singojuruh",
    "pemasok": "Pemasok 3",
    "status": "selesai",
    "tanggal": "2026-07-28",
    "catatan": "fie 601.000"
  },
  {
    "id": "ord-singo-29-1",
    "namaBarang": "Edamame",
    "qty": 90,
    "hargaBeli": 20000,
    "hargaJual": 22000,
    "toko": "LUWENG BOGA",
    "tujuanDapur": "Singojuruh",
    "pemasok": "Pemasok 3",
    "status": "selesai",
    "tanggal": "2026-07-29",
    "catatan": "fie 90x2000 = 180.000"
  },
  {
    "id": "ord-singo-29-2",
    "namaBarang": "Sayur",
    "qty": 1,
    "hargaBeli": 1097300,
    "hargaJual": 1336000,
    "toko": "LUWENG BOGA",
    "tujuanDapur": "Singojuruh",
    "pemasok": "Pemasok 3",
    "status": "selesai",
    "tanggal": "2026-07-29",
    "catatan": "fie 214.700"
  },
  {
    "id": "ord-singo-30",
    "namaBarang": "Sayur",
    "qty": 1,
    "hargaBeli": 2961600,
    "hargaJual": 3204000,
    "toko": "LUWENG BOGA",
    "tujuanDapur": "Singojuruh",
    "pemasok": "Pemasok 3",
    "status": "selesai",
    "tanggal": "2026-07-30",
    "catatan": "fie 242.400"
  },
  {
    "id": "ord-ajeng-30",
    "namaBarang": "Jagung Pipil",
    "qty": 100,
    "hargaBeli": 12000,
    "hargaJual": 15000,
    "toko": "HTG",
    "tujuanDapur": "Ajeng",
    "pemasok": "Pemasok 1",
    "status": "selesai",
    "tanggal": "2026-07-30",
    "catatan": "fie 100x3000 = 300.000"
  }
];
