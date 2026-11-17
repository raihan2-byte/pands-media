/**
 * Data gudang distributor untuk demo pencatatan stok.
 * Semuanya fiktif. Harga memakai kisaran grosir Indonesia pada 2026.
 */

export const gudang = {
  nama: 'Gudang Sentosa',
  bidang: 'Distributor sembako & kebutuhan harian',
  kota: 'Semarang',
  petugas: 'Agus',
  domain: 'stok.gudangsentosa.id',
  /** Lokasi penyimpanan. Dipakai sebagai penyaring di layar stok. */
  lokasi: ['Gudang Utama', 'Gudang Timur'] as const,
} as const;

export type Lokasi = (typeof gudang.lokasi)[number];

export interface Barang {
  kode: string;
  nama: string;
  kategori: KategoriSlug;
  /** Nomor rak, memudahkan petugas mencari barangnya. */
  rak: string;
  lokasi: Lokasi;
  satuan: string;
  /** Jumlah per satuan, mis. 1 dus isi 24. Dipakai di keterangan. */
  isi?: string;
  stok: number;
  /** Batas bawah. Di bawah ini barang ditandai perlu dipesan. */
  minimum: number;
  /** Harga beli per satuan, dipakai menghitung nilai stok. */
  hargaBeli: number;
  pemasok: string;
}

export type KategoriSlug = 'minuman' | 'makanan' | 'kebersihan' | 'perawatan' | 'atk';

export const kategori: { slug: KategoriSlug; nama: string }[] = [
  { slug: 'minuman', nama: 'Minuman' },
  { slug: 'makanan', nama: 'Makanan' },
  { slug: 'kebersihan', nama: 'Kebersihan' },
  { slug: 'perawatan', nama: 'Perawatan' },
  { slug: 'atk', nama: 'Alat Tulis' },
];

export const barang: Barang[] = [
  { kode: 'MNM-001', nama: 'Air Mineral 600 ml', kategori: 'minuman', rak: 'A-01', lokasi: 'Gudang Utama', satuan: 'dus', isi: '24 botol', stok: 142, minimum: 40, hargaBeli: 38000, pemasok: 'PT Tirta Jaya' },
  { kode: 'MNM-002', nama: 'Teh Kotak 200 ml', kategori: 'minuman', rak: 'A-02', lokasi: 'Gudang Utama', satuan: 'dus', isi: '24 kotak', stok: 36, minimum: 30, hargaBeli: 62000, pemasok: 'PT Tirta Jaya' },
  { kode: 'MNM-003', nama: 'Kopi Sachet 20 g', kategori: 'minuman', rak: 'A-03', lokasi: 'Gudang Utama', satuan: 'karton', isi: '10 renceng', stok: 18, minimum: 25, hargaBeli: 85000, pemasok: 'CV Nusantara Boga' },
  { kode: 'MNM-004', nama: 'Susu UHT 1 L', kategori: 'minuman', rak: 'A-04', lokasi: 'Gudang Timur', satuan: 'dus', isi: '12 kotak', stok: 54, minimum: 20, hargaBeli: 168000, pemasok: 'PT Lembah Hijau' },
  { kode: 'MNM-005', nama: 'Sirup Markisa 600 ml', kategori: 'minuman', rak: 'A-05', lokasi: 'Gudang Timur', satuan: 'lusin', stok: 7, minimum: 10, hargaBeli: 192000, pemasok: 'CV Nusantara Boga' },

  { kode: 'MKN-001', nama: 'Beras Premium 5 kg', kategori: 'makanan', rak: 'B-01', lokasi: 'Gudang Utama', satuan: 'karung', stok: 88, minimum: 30, hargaBeli: 68000, pemasok: 'UD Tani Makmur' },
  { kode: 'MKN-002', nama: 'Minyak Goreng 2 L', kategori: 'makanan', rak: 'B-02', lokasi: 'Gudang Utama', satuan: 'dus', isi: '6 pouch', stok: 41, minimum: 25, hargaBeli: 198000, pemasok: 'PT Sinar Pangan' },
  { kode: 'MKN-003', nama: 'Gula Pasir 1 kg', kategori: 'makanan', rak: 'B-03', lokasi: 'Gudang Utama', satuan: 'sak', isi: '25 kg', stok: 23, minimum: 15, hargaBeli: 345000, pemasok: 'UD Tani Makmur' },
  { kode: 'MKN-004', nama: 'Mie Instan Goreng', kategori: 'makanan', rak: 'B-04', lokasi: 'Gudang Utama', satuan: 'dus', isi: '40 bungkus', stok: 96, minimum: 50, hargaBeli: 118000, pemasok: 'PT Sinar Pangan' },
  { kode: 'MKN-005', nama: 'Tepung Terigu 1 kg', kategori: 'makanan', rak: 'B-05', lokasi: 'Gudang Timur', satuan: 'dus', isi: '20 bungkus', stok: 12, minimum: 20, hargaBeli: 196000, pemasok: 'PT Sinar Pangan' },
  { kode: 'MKN-006', nama: 'Kecap Manis 600 ml', kategori: 'makanan', rak: 'B-06', lokasi: 'Gudang Timur', satuan: 'dus', isi: '12 botol', stok: 29, minimum: 15, hargaBeli: 204000, pemasok: 'CV Nusantara Boga' },
  { kode: 'MKN-007', nama: 'Garam Beryodium 250 g', kategori: 'makanan', rak: 'B-07', lokasi: 'Gudang Utama', satuan: 'dus', isi: '40 bungkus', stok: 4, minimum: 12, hargaBeli: 92000, pemasok: 'UD Tani Makmur' },

  { kode: 'KBR-001', nama: 'Sabun Cuci Piring 800 ml', kategori: 'kebersihan', rak: 'C-01', lokasi: 'Gudang Utama', satuan: 'dus', isi: '12 botol', stok: 33, minimum: 15, hargaBeli: 186000, pemasok: 'PT Cahaya Kimia' },
  { kode: 'KBR-002', nama: 'Deterjen Bubuk 800 g', kategori: 'kebersihan', rak: 'C-02', lokasi: 'Gudang Utama', satuan: 'dus', isi: '12 bungkus', stok: 27, minimum: 18, hargaBeli: 228000, pemasok: 'PT Cahaya Kimia' },
  { kode: 'KBR-003', nama: 'Pewangi Lantai 800 ml', kategori: 'kebersihan', rak: 'C-03', lokasi: 'Gudang Timur', satuan: 'dus', isi: '12 botol', stok: 9, minimum: 12, hargaBeli: 174000, pemasok: 'PT Cahaya Kimia' },
  { kode: 'KBR-004', nama: 'Tisu Gulung 4 roll', kategori: 'kebersihan', rak: 'C-04', lokasi: 'Gudang Timur', satuan: 'bal', isi: '12 pack', stok: 0, minimum: 10, hargaBeli: 156000, pemasok: 'CV Putra Mandiri' },
  { kode: 'KBR-005', nama: 'Kantong Sampah 60×90', kategori: 'kebersihan', rak: 'C-05', lokasi: 'Gudang Timur', satuan: 'bal', stok: 21, minimum: 8, hargaBeli: 98000, pemasok: 'CV Putra Mandiri' },

  { kode: 'PRW-001', nama: 'Sabun Mandi Batang', kategori: 'perawatan', rak: 'D-01', lokasi: 'Gudang Utama', satuan: 'dus', isi: '48 batang', stok: 19, minimum: 10, hargaBeli: 216000, pemasok: 'PT Cahaya Kimia' },
  { kode: 'PRW-002', nama: 'Sampo Sachet 10 ml', kategori: 'perawatan', rak: 'D-02', lokasi: 'Gudang Utama', satuan: 'karton', isi: '24 renceng', stok: 14, minimum: 12, hargaBeli: 288000, pemasok: 'PT Cahaya Kimia' },
  { kode: 'PRW-003', nama: 'Pasta Gigi 190 g', kategori: 'perawatan', rak: 'D-03', lokasi: 'Gudang Timur', satuan: 'dus', isi: '12 tube', stok: 6, minimum: 10, hargaBeli: 162000, pemasok: 'CV Putra Mandiri' },
  { kode: 'PRW-004', nama: 'Popok Bayi M isi 20', kategori: 'perawatan', rak: 'D-04', lokasi: 'Gudang Timur', satuan: 'dus', isi: '8 pack', stok: 11, minimum: 6, hargaBeli: 432000, pemasok: 'CV Putra Mandiri' },

  { kode: 'ATK-001', nama: 'Buku Tulis 38 lembar', kategori: 'atk', rak: 'E-01', lokasi: 'Gudang Utama', satuan: 'pak', isi: '10 buku', stok: 62, minimum: 20, hargaBeli: 38000, pemasok: 'UD Cerdas Media' },
  { kode: 'ATK-002', nama: 'Pulpen Hitam', kategori: 'atk', rak: 'E-02', lokasi: 'Gudang Utama', satuan: 'lusin', stok: 48, minimum: 15, hargaBeli: 26000, pemasok: 'UD Cerdas Media' },
  { kode: 'ATK-003', nama: 'Kertas HVS A4 70 g', kategori: 'atk', rak: 'E-03', lokasi: 'Gudang Timur', satuan: 'rim', stok: 16, minimum: 20, hargaBeli: 52000, pemasok: 'UD Cerdas Media' },
];

export type JenisGerak = 'masuk' | 'keluar';

export interface Gerak {
  id: string;
  waktu: string;
  kode: string;
  jenis: JenisGerak;
  jumlah: number;
  catatan: string;
  petugas: string;
}

/** Riwayat contoh, supaya layar tidak kosong saat demo dibuka. */
export const gerakAwal: Gerak[] = [
  { id: 'GRK-118', waktu: '12 Nov 08.10', kode: 'MKN-001', jenis: 'masuk', jumlah: 50, catatan: 'Kiriman UD Tani Makmur, surat jalan 4471', petugas: 'Agus' },
  { id: 'GRK-119', waktu: '12 Nov 09.02', kode: 'MNM-001', jenis: 'keluar', jumlah: 24, catatan: 'Pesanan Toko Berkah', petugas: 'Agus' },
  { id: 'GRK-120', waktu: '12 Nov 09.40', kode: 'MKN-004', jenis: 'keluar', jumlah: 12, catatan: 'Pesanan Warung Maju', petugas: 'Rina' },
  { id: 'GRK-121', waktu: '12 Nov 10.15', kode: 'KBR-004', jenis: 'keluar', jumlah: 10, catatan: 'Pesanan Minimarket Sido', petugas: 'Agus' },
  { id: 'GRK-122', waktu: '12 Nov 10.48', kode: 'MKN-007', jenis: 'keluar', jumlah: 8, catatan: 'Pesanan Toko Berkah', petugas: 'Rina' },
  { id: 'GRK-123', waktu: '12 Nov 11.20', kode: 'MNM-004', jenis: 'masuk', jumlah: 30, catatan: 'Kiriman PT Lembah Hijau', petugas: 'Agus' },
  { id: 'GRK-124', waktu: '12 Nov 13.05', kode: 'PRW-003', jenis: 'keluar', jumlah: 6, catatan: 'Pesanan Apotek Sehat', petugas: 'Rina' },
  { id: 'GRK-125', waktu: '12 Nov 14.30', kode: 'ATK-003', jenis: 'keluar', jumlah: 14, catatan: 'Pesanan Kencana Print', petugas: 'Agus' },
];

export function rupiah(n: number): string {
  return 'Rp' + Math.round(n).toLocaleString('id-ID');
}

/** Angka panjang dipendekkan supaya muat di kartu ringkas. */
export function rupiahSingkat(n: number): string {
  if (n >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toFixed(1)} M`;
  if (n >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(1)} jt`;
  if (n >= 1_000) return `Rp${Math.round(n / 1000)} rb`;
  return rupiah(n);
}

/** Status stok dipakai untuk lencana dan penyaring. */
export function statusStok(stok: number, minimum: number): 'habis' | 'menipis' | 'aman' {
  if (stok <= 0) return 'habis';
  if (stok <= minimum) return 'menipis';
  return 'aman';
}

/* ------------------------------------------------------------------ */
/* Peran dan izin                                                      */
/* ------------------------------------------------------------------ */

export type PeranSlug = 'admin' | 'kepala' | 'staf' | 'penjualan';

export interface Izin {
  /** Boleh melihat harga beli dan nilai stok. */
  lihatNilai: boolean;
  /** Boleh mencatat barang masuk/keluar dan langsung mengubah stok. */
  catatLangsung: boolean;
  /** Boleh mengajukan permintaan barang keluar, tanpa mengubah stok. */
  ajukanPermintaan: boolean;
  /** Boleh menyetujui atau menolak permintaan orang lain. */
  setujuiPermintaan: boolean;
  /** Boleh mengubah batas minimum barang. */
  ubahMinimum: boolean;
  /** Boleh menambah, menonaktifkan, dan mengubah peran pengguna. */
  kelolaPengguna: boolean;
  /** Boleh melihat semua lokasi gudang, bukan hanya lokasinya sendiri. */
  semuaLokasi: boolean;
}

export interface Peran {
  slug: PeranSlug;
  nama: string;
  ringkas: string;
  izin: Izin;
}

export const peran: Peran[] = [
  {
    slug: 'admin',
    nama: 'Admin',
    ringkas: 'Pemilik usaha. Semua akses, termasuk mengatur pengguna.',
    izin: {
      lihatNilai: true,
      catatLangsung: true,
      ajukanPermintaan: true,
      setujuiPermintaan: true,
      ubahMinimum: true,
      kelolaPengguna: true,
      semuaLokasi: true,
    },
  },
  {
    slug: 'kepala',
    nama: 'Kepala Gudang',
    ringkas: 'Mengatur stok dan menyetujui permintaan. Tidak mengurus pengguna.',
    izin: {
      lihatNilai: true,
      catatLangsung: true,
      ajukanPermintaan: true,
      setujuiPermintaan: true,
      ubahMinimum: true,
      kelolaPengguna: false,
      semuaLokasi: true,
    },
  },
  {
    slug: 'staf',
    nama: 'Staf Gudang',
    ringkas: 'Mencatat keluar masuk barang di lokasinya. Harga disembunyikan.',
    izin: {
      lihatNilai: false,
      catatLangsung: true,
      ajukanPermintaan: false,
      setujuiPermintaan: false,
      ubahMinimum: false,
      kelolaPengguna: false,
      semuaLokasi: false,
    },
  },
  {
    slug: 'penjualan',
    nama: 'Admin Penjualan',
    ringkas: 'Mengecek sisa barang dan mengajukan pengeluaran, tanpa menyentuh stok.',
    izin: {
      lihatNilai: false,
      catatLangsung: false,
      ajukanPermintaan: true,
      setujuiPermintaan: false,
      ubahMinimum: false,
      kelolaPengguna: false,
      semuaLokasi: true,
    },
  },
];

export interface Pengguna {
  id: string;
  nama: string;
  peran: PeranSlug;
  /** Lokasi yang boleh diakses bila perannya tidak mencakup semua lokasi. */
  lokasi: Lokasi;
  aktif: boolean;
  terakhir: string;
}

export const penggunaAwal: Pengguna[] = [
  { id: 'U-01', nama: 'Bu Hartini', peran: 'admin', lokasi: 'Gudang Utama', aktif: true, terakhir: 'Hari ini, 07.20' },
  { id: 'U-02', nama: 'Pak Darto', peran: 'kepala', lokasi: 'Gudang Utama', aktif: true, terakhir: 'Hari ini, 06.55' },
  { id: 'U-03', nama: 'Agus', peran: 'staf', lokasi: 'Gudang Utama', aktif: true, terakhir: 'Hari ini, 08.02' },
  { id: 'U-04', nama: 'Rina', peran: 'staf', lokasi: 'Gudang Timur', aktif: true, terakhir: 'Kemarin, 16.40' },
  { id: 'U-05', nama: 'Dewi', peran: 'penjualan', lokasi: 'Gudang Utama', aktif: true, terakhir: 'Hari ini, 08.15' },
  { id: 'U-06', nama: 'Bayu', peran: 'staf', lokasi: 'Gudang Timur', aktif: false, terakhir: '2 Nov, 15.10' },
];

export type StatusPermintaan = 'menunggu' | 'disetujui' | 'ditolak';

export interface Permintaan {
  id: string;
  kode: string;
  jumlah: number;
  catatan: string;
  pemohon: string;
  waktu: string;
  status: StatusPermintaan;
  /** Nama penyetuju atau penolak, terisi setelah diputuskan. */
  penilai?: string;
  alasan?: string;
}

export const permintaanAwal: Permintaan[] = [
  { id: 'REQ-041', kode: 'MKN-004', jumlah: 20, catatan: 'Pesanan Minimarket Sido, kirim besok pagi', pemohon: 'Dewi', waktu: '15 Nov, 08.20', status: 'menunggu' },
  { id: 'REQ-042', kode: 'MNM-001', jumlah: 30, catatan: 'Pesanan Katering Bu Sri', pemohon: 'Dewi', waktu: '15 Nov, 08.35', status: 'menunggu' },
  { id: 'REQ-040', kode: 'KBR-002', jumlah: 6, catatan: 'Pesanan Toko Berkah', pemohon: 'Dewi', waktu: '14 Nov, 15.02', status: 'disetujui', penilai: 'Pak Darto' },
  { id: 'REQ-039', kode: 'PRW-004', jumlah: 15, catatan: 'Pesanan Apotek Sehat', pemohon: 'Dewi', waktu: '14 Nov, 11.48', status: 'ditolak', penilai: 'Pak Darto', alasan: 'Sisa tidak cukup, tunggu kiriman pemasok' },
];
