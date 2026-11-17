/**
 * Data dan aturan dasar demo aplikasi kasir Warung Maju.
 * Semuanya fiktif. Harga memakai kisaran warung di Jawa pada 2026.
 *
 * Berkas ini memuat bentuk data, isi awal, dan fungsi hitung murni.
 * Keadaan yang berubah (stok, keranjang, transaksi) hidup di `store.tsx`.
 */

export const warung = {
  nama: 'Warung Maju',
  alamat: 'Jl. Melati No. 12, Sleman',
  telepon: '0812-3456-7890',
  domain: 'kasir.warungmaju.id',
} as const;

/* ------------------------------------------------------------------ */
/* Bentuk data                                                         */
/* ------------------------------------------------------------------ */

export type Metode = 'Tunai' | 'Transfer' | 'QRIS';
export const SEMUA_METODE: Metode[] = ['Tunai', 'Transfer', 'QRIS'];

export interface Kategori {
  id: string;
  nama: string;
}

export interface Produk {
  kode: string;
  nama: string;
  kategoriId: string;
  harga: number;
  /** Harga beli, dipakai menghitung laba. Hanya admin yang melihatnya. */
  hargaBeli: number;
  stok: number;
  /** Di bawah angka ini barang ditandai menipis. */
  minimum: number;
  /** Tampil di tab "Laris" pada layar kasir. */
  laris: boolean;
  /** Barang nonaktif tidak muncul di layar kasir, tapi riwayatnya tetap ada. */
  aktif: boolean;
  /** Alamat gambar. Kosong berarti tampil huruf awal nama. */
  foto?: string;
  /** Nama berkas foto bawaan di src/assets/warung-maju, tanpa .jpg. */
  berkas?: string;
}

export interface Promo {
  id: string;
  kode: string;
  nama: string;
  jenis: 'persen' | 'nominal';
  nilai: number;
  /** Belanja minimal supaya promo berlaku. 0 berarti tanpa syarat. */
  minimal: number;
  /** Batas potongan untuk promo persen. 0 berarti tanpa batas. */
  maksimal: number;
  /** Tanggal terakhir berlaku, format YYYY-MM-DD. Kosong berarti tanpa batas. */
  akhir: string;
  /** Jumlah pemakaian maksimal. 0 berarti tanpa batas. */
  kuota: number;
  terpakai: number;
  aktif: boolean;
}

export interface BarisTrx {
  kode: string;
  nama: string;
  jumlah: number;
  harga: number;
  hargaBeli: number;
}

export interface Transaksi {
  nomor: string;
  /** Waktu dalam milidetik sejak epoch. */
  waktu: number;
  kasir: string;
  pelanggan: string;
  baris: BarisTrx[];
  subtotal: number;
  kodePromo: string;
  potPromo: number;
  potManual: number;
  pajak: number;
  total: number;
  metode: Metode;
  bayar: number;
  kembali: number;
  status: 'selesai' | 'batal';
  alasanBatal?: string;
  dibatalkanOleh?: string;
}

export type PeranSlug = 'admin' | 'kasir';

export interface Pengguna {
  id: string;
  nama: string;
  peran: PeranSlug;
  aktif: boolean;
  terakhir: string;
}

export interface Pengaturan {
  nama: string;
  alamat: string;
  telepon: string;
  /** Pajak yang ditambahkan ke tagihan, dalam persen. 0 berarti tanpa pajak. */
  pajak: number;
  footerStruk: string;
  metodeAktif: Record<Metode, boolean>;
  /** Kalau mati, hanya admin yang boleh memberi diskon manual. */
  kasirBolehDiskon: boolean;
}

export interface MutasiStok {
  id: string;
  waktu: number;
  kode: string;
  delta: number;
  alasan: string;
  oleh: string;
}

/* ------------------------------------------------------------------ */
/* Izin per peran                                                      */
/* ------------------------------------------------------------------ */

export type Menu =
  | 'kasir'
  | 'transaksi'
  | 'produk'
  | 'kategori'
  | 'promo'
  | 'laporan'
  | 'pengguna'
  | 'pengaturan';

export interface Izin {
  menu: Menu[];
  lihatModal: boolean;
  semuaTransaksi: boolean;
  batalkan: boolean;
}

export const izinPeran: Record<PeranSlug, Izin> = {
  admin: {
    menu: ['kasir', 'transaksi', 'produk', 'kategori', 'promo', 'laporan', 'pengguna', 'pengaturan'],
    lihatModal: true,
    semuaTransaksi: true,
    batalkan: true,
  },
  kasir: {
    menu: ['kasir', 'transaksi'],
    lihatModal: false,
    semuaTransaksi: false,
    batalkan: false,
  },
};

export const namaPeran: Record<PeranSlug, { nama: string; ringkas: string }> = {
  admin: {
    nama: 'Admin',
    ringkas: 'Pemilik warung. Mengelola produk, promo, laporan, dan pengguna.',
  },
  kasir: {
    nama: 'Kasir',
    ringkas: 'Melayani pembeli dan mencetak struk. Tidak melihat harga beli.',
  },
};

export const namaMenu: Record<Menu, string> = {
  kasir: 'Kasir',
  transaksi: 'Transaksi',
  produk: 'Produk',
  kategori: 'Kategori',
  promo: 'Promo',
  laporan: 'Laporan',
  pengguna: 'Pengguna',
  pengaturan: 'Pengaturan',
};

/* ------------------------------------------------------------------ */
/* Isi awal                                                            */
/* ------------------------------------------------------------------ */

export const kategoriAwal: Kategori[] = [
  { id: 'makanan', nama: 'Makanan' },
  { id: 'minuman', nama: 'Minuman' },
  { id: 'snack', nama: 'Snack' },
  { id: 'sembako', nama: 'Sembako' },
];

type Baku = Omit<Produk, 'hargaBeli' | 'minimum' | 'aktif' | 'laris'> & {
  laris?: boolean;
  minimum?: number;
};

const baku: Baku[] = [
  { kode: 'MK01', nama: 'Nasi Goreng', kategoriId: 'makanan', harga: 15000, stok: 40, laris: true, berkas: 'nasi-goreng' },
  { kode: 'MK02', nama: 'Mie Goreng', kategoriId: 'makanan', harga: 14000, stok: 35, laris: true, berkas: 'mie-goreng' },
  { kode: 'MK03', nama: 'Nasi Rames', kategoriId: 'makanan', harga: 13000, stok: 28, laris: true, berkas: 'nasi-rames' },
  { kode: 'MK04', nama: 'Ayam Geprek', kategoriId: 'makanan', harga: 16000, stok: 22, berkas: 'ayam-geprek' },
  { kode: 'MK05', nama: 'Soto Ayam', kategoriId: 'makanan', harga: 12000, stok: 18, berkas: 'soto-ayam' },
  { kode: 'MK06', nama: 'Bakso Urat', kategoriId: 'makanan', harga: 13000, stok: 16, berkas: 'bakso' },
  { kode: 'MK07', nama: 'Telur Dadar', kategoriId: 'makanan', harga: 5000, stok: 50, berkas: 'telur-dadar' },
  { kode: 'MK08', nama: 'Gorengan', kategoriId: 'makanan', harga: 1000, stok: 120, laris: true, berkas: 'gorengan' },

  { kode: 'MN01', nama: 'Es Teh Manis', kategoriId: 'minuman', harga: 4000, stok: 80, laris: true, berkas: 'es-teh' },
  { kode: 'MN02', nama: 'Teh Hangat', kategoriId: 'minuman', harga: 3000, stok: 80, berkas: 'teh-hangat' },
  { kode: 'MN03', nama: 'Es Jeruk', kategoriId: 'minuman', harga: 5000, stok: 45, berkas: 'es-jeruk' },
  { kode: 'MN04', nama: 'Kopi Hitam', kategoriId: 'minuman', harga: 4000, stok: 60, laris: true, berkas: 'kopi-hitam' },
  { kode: 'MN05', nama: 'Kopi Susu', kategoriId: 'minuman', harga: 6000, stok: 55, berkas: 'kopi-susu' },
  { kode: 'MN06', nama: 'Susu Jahe', kategoriId: 'minuman', harga: 7000, stok: 20, berkas: 'susu-jahe' },
  { kode: 'MN07', nama: 'Es Campur', kategoriId: 'minuman', harga: 10000, stok: 14, berkas: 'es-campur' },
  { kode: 'MN08', nama: 'Air Mineral', kategoriId: 'minuman', harga: 3000, stok: 96, berkas: 'air-mineral' },

  { kode: 'SN01', nama: 'Keripik Singkong', kategoriId: 'snack', harga: 10000, stok: 24, berkas: 'keripik' },
  { kode: 'SN02', nama: 'Roti Bakar', kategoriId: 'snack', harga: 6000, stok: 18, berkas: 'roti-bakar' },
  { kode: 'SN03', nama: 'Kacang Kulit', kategoriId: 'snack', harga: 8000, stok: 30, berkas: 'kacang' },
  { kode: 'SN04', nama: 'Permen Mint', kategoriId: 'snack', harga: 1000, stok: 200, berkas: 'permen' },
  { kode: 'SN05', nama: 'Biskuit Kelapa', kategoriId: 'snack', harga: 9000, stok: 7, berkas: 'biskuit' },

  { kode: 'SB01', nama: 'Beras 1 kg', kategoriId: 'sembako', harga: 13000, stok: 42, berkas: 'beras' },
  { kode: 'SB02', nama: 'Minyak Goreng 1 L', kategoriId: 'sembako', harga: 17000, stok: 26, berkas: 'minyak' },
  { kode: 'SB03', nama: 'Gula Pasir 1 kg', kategoriId: 'sembako', harga: 15000, stok: 31, berkas: 'gula' },
  { kode: 'SB04', nama: 'Telur 1 kg', kategoriId: 'sembako', harga: 28000, stok: 12, berkas: 'telur' },
  { kode: 'SB05', nama: 'Mie Instan', kategoriId: 'sembako', harga: 3500, stok: 88, laris: true, berkas: 'mie-instan' },
  { kode: 'SB06', nama: 'Kopi Sachet', kategoriId: 'sembako', harga: 2000, stok: 150, berkas: 'kopi-sachet' },
  { kode: 'SB07', nama: 'Sabun Mandi', kategoriId: 'sembako', harga: 4500, stok: 9, berkas: 'sabun' },
  { kode: 'SB08', nama: 'Garam 250 g', kategoriId: 'sembako', harga: 3000, stok: 40, berkas: 'garam' },
];

/** Harga beli kira-kira 68% dari harga jual, dibulatkan ke 100 rupiah. */
export const produkAwal: Produk[] = baku.map((b) => ({
  ...b,
  hargaBeli: Math.max(100, Math.round((b.harga * 0.68) / 100) * 100),
  minimum: b.minimum ?? (b.harga <= 3500 ? 30 : 10),
  laris: b.laris ?? false,
  aktif: true,
}));

export function promoAwal(): Promo[] {
  const tahun = new Date().getFullYear();
  return [
    { id: 'PR1', kode: 'HEMAT5', nama: 'Hemat 5% semua barang', jenis: 'persen', nilai: 5, minimal: 0, maksimal: 0, akhir: '', kuota: 0, terpakai: 41, aktif: true },
    { id: 'PR2', kode: 'KOPI2RB', nama: 'Potongan kopi Rp2.000', jenis: 'nominal', nilai: 2000, minimal: 0, maksimal: 0, akhir: '', kuota: 0, terpakai: 23, aktif: true },
    { id: 'PR3', kode: 'MAKAN10', nama: 'Makan 10%, belanja min. Rp50.000', jenis: 'persen', nilai: 10, minimal: 50000, maksimal: 15000, akhir: '', kuota: 0, terpakai: 9, aktif: true },
    { id: 'PR4', kode: 'PELANGGAN', nama: 'Pelanggan baru, 50 pemakaian pertama', jenis: 'nominal', nilai: 5000, minimal: 25000, maksimal: 0, akhir: '', kuota: 50, terpakai: 17, aktif: true },
    { id: 'PR5', kode: 'LEBARAN', nama: 'Promo Lebaran 20%', jenis: 'persen', nilai: 20, minimal: 30000, maksimal: 25000, akhir: `${tahun}-04-30`, kuota: 0, terpakai: 64, aktif: true },
    { id: 'PR6', kode: 'AKHIRBULAN', nama: 'Akhir bulan (dijeda)', jenis: 'persen', nilai: 8, minimal: 40000, maksimal: 0, akhir: '', kuota: 0, terpakai: 3, aktif: false },
  ];
}

export const penggunaAwal: Pengguna[] = [
  { id: 'U1', nama: 'Bu Sri', peran: 'admin', aktif: true, terakhir: 'Hari ini' },
  { id: 'U2', nama: 'Rina', peran: 'kasir', aktif: true, terakhir: 'Hari ini' },
  { id: 'U3', nama: 'Dimas', peran: 'kasir', aktif: true, terakhir: 'Kemarin' },
  { id: 'U4', nama: 'Anto', peran: 'kasir', aktif: false, terakhir: '2 minggu lalu' },
];

export const pengaturanAwal: Pengaturan = {
  nama: warung.nama,
  alamat: warung.alamat,
  telepon: warung.telepon,
  pajak: 0,
  footerStruk: 'Terima kasih, selamat belanja lagi',
  metodeAktif: { Tunai: true, Transfer: true, QRIS: true },
  kasirBolehDiskon: false,
};

/* ------------------------------------------------------------------ */
/* Waktu                                                               */
/* ------------------------------------------------------------------ */

const HARI = 86_400_000;

export function awalHari(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Kunci tanggal lokal, mis. "2026-11-17". */
export function kunciHari(ms: number): string {
  const d = new Date(ms);
  const b = String(d.getMonth() + 1).padStart(2, '0');
  const t = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${b}-${t}`;
}

export function jam(ms: number): string {
  return new Date(ms).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
}

export function tanggalPendek(ms: number): string {
  return new Date(ms).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function hariSingkat(ms: number): string {
  return new Date(ms).toLocaleDateString('id-ID', { weekday: 'short' });
}

export function waktuLengkap(ms: number): string {
  return `${tanggalPendek(ms)}, ${jam(ms)}`;
}

export { HARI };

/* ------------------------------------------------------------------ */
/* Hitungan murni                                                      */
/* ------------------------------------------------------------------ */

export function rupiah(n: number): string {
  return 'Rp' + Math.round(n).toLocaleString('id-ID');
}

/** Alasan promo tidak berlaku, atau kosong kalau berlaku. */
export function alasanPromoTidakBerlaku(p: Promo, subtotal: number, sekarang: number): string {
  if (!p.aktif) return 'Promo sedang dijeda';
  if (p.akhir && kunciHari(sekarang) > p.akhir) return 'Promo sudah berakhir';
  if (p.kuota > 0 && p.terpakai >= p.kuota) return 'Kuota promo habis';
  if (p.minimal > 0 && subtotal < p.minimal) return `Belanja minimal ${rupiah(p.minimal)}`;
  return '';
}

export function hitungPotonganPromo(p: Promo, subtotal: number): number {
  if (p.jenis === 'nominal') return Math.min(p.nilai, subtotal);
  const mentah = Math.round((subtotal * p.nilai) / 100);
  return p.maksimal > 0 ? Math.min(mentah, p.maksimal) : mentah;
}

export function statusPromo(p: Promo, sekarang: number): 'aktif' | 'dijeda' | 'berakhir' | 'habis' {
  if (!p.aktif) return 'dijeda';
  if (p.akhir && kunciHari(sekarang) > p.akhir) return 'berakhir';
  if (p.kuota > 0 && p.terpakai >= p.kuota) return 'habis';
  return 'aktif';
}

export function statusStok(stok: number, minimum: number): 'habis' | 'menipis' | 'aman' {
  if (stok <= 0) return 'habis';
  if (stok <= minimum) return 'menipis';
  return 'aman';
}

/* ------------------------------------------------------------------ */
/* Transaksi contoh                                                    */
/* ------------------------------------------------------------------ */

/** Pembangkit acak tetap, supaya isi demo sama tiap dimuat. */
function acak(benih: number) {
  let s = benih;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const NAMA_PELANGGAN = [
  'Pak Joko', 'Bu Tini', 'Mas Dedi', 'Mbak Ayu', 'Pak Haryo', 'Bu Wati',
  'Mas Bayu', 'Mbak Sinta', 'Pak Anwar', 'Bu Lilik', 'Mas Rizki', 'Umum',
];

/**
 * Tujuh hari transaksi contoh, supaya laporan tidak kosong saat demo dibuka.
 * Dibuat relatif terhadap `sekarang`; hari ini hanya berisi yang sudah lewat.
 */
export function buatTransaksiAwal(produk: Produk[], sekarang: number): Transaksi[] {
  const rnd = acak(2026);
  const hariIni = awalHari(sekarang);
  const kasirAktif = ['Rina', 'Dimas', 'Rina', 'Bu Sri'];
  const hasil: Transaksi[] = [];

  const bobot = produk.flatMap((p) => Array(p.laris ? 4 : 1).fill(p));

  for (let h = 6; h >= 0; h--) {
    const awal = hariIni - h * HARI;
    const jumlah = h === 0 ? 7 : 9 + Math.floor(rnd() * 6);

    for (let i = 0; i < jumlah; i++) {
      // Jam ramai: pagi dan makan siang. Hari ini dibatasi sampai sekarang.
      const jamBuka = 6.5 + (i / jumlah) * 12 + rnd() * 0.5;
      let waktu = awal + jamBuka * 3_600_000;
      if (h === 0) waktu = Math.min(waktu, sekarang - (jumlah - i) * 60_000);
      if (h === 0 && waktu < awal) waktu = awal + (i + 1) * 60_000;

      const n = 1 + Math.floor(rnd() * 4);
      const dipakai = new Map<string, BarisTrx>();
      for (let k = 0; k < n; k++) {
        const p = bobot[Math.floor(rnd() * bobot.length)];
        const ada = dipakai.get(p.kode);
        const qty = 1 + Math.floor(rnd() * 3);
        if (ada) ada.jumlah += qty;
        else dipakai.set(p.kode, { kode: p.kode, nama: p.nama, jumlah: qty, harga: p.harga, hargaBeli: p.hargaBeli });
      }
      const baris = [...dipakai.values()];
      const subtotal = baris.reduce((t, b) => t + b.harga * b.jumlah, 0);

      const r = rnd();
      const metode: Metode = r < 0.58 ? 'Tunai' : r < 0.84 ? 'QRIS' : 'Transfer';
      const bayar =
        metode === 'Tunai' ? Math.ceil(subtotal / (subtotal > 40000 ? 10000 : 5000)) * (subtotal > 40000 ? 10000 : 5000) : subtotal;

      hasil.push({
        nomor: '',
        waktu: Math.round(waktu),
        kasir: kasirAktif[Math.floor(rnd() * kasirAktif.length)],
        pelanggan: NAMA_PELANGGAN[Math.floor(rnd() * NAMA_PELANGGAN.length)],
        baris,
        subtotal,
        kodePromo: '',
        potPromo: 0,
        potManual: 0,
        pajak: 0,
        total: subtotal,
        metode,
        bayar,
        kembali: bayar - subtotal,
        status: 'selesai',
      });
    }
  }

  hasil.sort((a, b) => a.waktu - b.waktu);
  hasil.forEach((t, i) => (t.nomor = `TRX-${200 + i}`));

  // Satu transaksi kemarin dibatalkan, supaya fitur batal terlihat bekerja.
  const kemarin = hasil.find((t) => t.waktu >= hariIni - HARI && t.waktu < hariIni && t.total > 20000);
  if (kemarin) {
    kemarin.status = 'batal';
    kemarin.alasanBatal = 'Pembeli batal, barang dikembalikan';
    kemarin.dibatalkanOleh = 'Bu Sri';
  }

  return hasil;
}
