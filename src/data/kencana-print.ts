/**
 * Data toko Kencana Print. Semua isinya fiktif.
 * Harga mengacu pada kisaran pasaran percetakan digital Indonesia supaya
 * demonya terasa masuk akal, bukan angka asal.
 */

export const toko = {
  nama: 'Kencana Print',
  tagline: 'Cetak cepat, harga jelas di depan',
  domain: 'kencanaprint.id',
  kota: 'Yogyakarta',
  alamat: 'Jl. Kaliurang KM 5,5 No. 21, Sleman, Yogyakarta',
  telepon: '0274-555-0188',
  whatsapp: '6281234567890',
  email: 'order@kencanaprint.id',
  jam: [
    { hari: 'Senin – Jumat', buka: '08.00 – 21.00' },
    { hari: 'Sabtu', buka: '08.00 – 17.00' },
    { hari: 'Minggu & libur', buka: '10.00 – 15.00' },
  ],
} as const;

/** Satuan hitung menentukan bentuk kalkulator di halaman produk. */
export type Satuan = 'm2' | 'pcs' | 'lembar' | 'box';

export interface Opsi {
  nama: string;
  /** Pengali harga dasar. 1 berarti tidak menambah biaya. */
  faktor: number;
  catatan?: string;
}

export interface Produk {
  slug: string;
  nama: string;
  kategori: string;
  /** Bentuk gambar yang digambar ProductArt. */
  art: ArtJenis;
  satuan: Satuan;
  /** Harga dasar per satuan, dalam rupiah. */
  harga: number;
  /** Minimal pemesanan dalam satuan di atas. */
  minimal: number;
  ringkas: string;
  deskripsi: string;
  bahan?: Opsi[];
  finishing?: Opsi[];
  /** Potongan untuk jumlah banyak: { mulai, potongan } dalam persen. */
  grosir?: { mulai: number; potongan: number }[];
  rating: number;
  ulasan: number;
  lamaKerja: string;
  unggulan?: boolean;
  promo?: string;
}

export type ArtJenis =
  | 'spanduk'
  | 'xbanner'
  | 'rollbanner'
  | 'stiker'
  | 'kartunama'
  | 'dokumen'
  | 'brosur'
  | 'kaos'
  | 'mug'
  | 'totebag'
  | 'pin'
  | 'kalender'
  | 'idcard'
  | 'undangan';

/** `foto` menunjuk slug produk yang fotonya mewakili kategori ini. */
export const kategori = [
  { slug: 'banner', nama: 'Spanduk & Banner', art: 'spanduk' as ArtJenis, foto: 'spanduk-mmt' },
  { slug: 'stiker', nama: 'Stiker & Label', art: 'stiker' as ArtJenis, foto: 'stiker-uv-dtf' },
  { slug: 'dokumen', nama: 'Print Dokumen', art: 'dokumen' as ArtJenis, foto: 'print-a4' },
  { slug: 'kartu', nama: 'Kartu & Undangan', art: 'kartunama' as ArtJenis, foto: 'undangan' },
  { slug: 'merchandise', nama: 'Merchandise', art: 'mug' as ArtJenis, foto: 'mug-custom' },
  { slug: 'bisnis', nama: 'Perlengkapan Bisnis', art: 'idcard' as ArtJenis, foto: 'id-card' },
] as const;

const bahanBanner: Opsi[] = [
  { nama: 'Flexy China 280 gr', faktor: 1, catatan: 'Paling ekonomis, untuk dalam ruangan' },
  { nama: 'Flexy Korea 340 gr', faktor: 1.35, catatan: 'Lebih tebal, tahan panas dan hujan' },
  { nama: 'Albatros', faktor: 1.6, catatan: 'Permukaan halus, warna paling tajam' },
];

const finishingBanner: Opsi[] = [
  { nama: 'Potong rapi', faktor: 1 },
  { nama: 'Mata ayam tiap 50 cm', faktor: 1.12 },
  { nama: 'Selongsong atas bawah', faktor: 1.2 },
];

export const produk: Produk[] = [
  {
    slug: 'spanduk-mmt',
    nama: 'Spanduk MMT',
    kategori: 'banner',
    art: 'spanduk',
    satuan: 'm2',
    harga: 20000,
    minimal: 1,
    ringkas: 'Cetak spanduk ukuran bebas, hitung per meter persegi.',
    deskripsi:
      'Spanduk cetak digital untuk promo toko, acara, dan ucapan. Ukuran bebas, dihitung per meter persegi. Hasil cetak tahan luar ruangan sampai satu tahun untuk bahan Korea ke atas.',
    bahan: bahanBanner,
    finishing: finishingBanner,
    grosir: [
      { mulai: 10, potongan: 5 },
      { mulai: 25, potongan: 10 },
    ],
    rating: 4.9,
    ulasan: 2114,
    lamaKerja: '1 hari kerja',
    unggulan: true,
    promo: 'Paling laris',
  },
  {
    slug: 'x-banner',
    nama: 'X-Banner 60 × 160 cm',
    kategori: 'banner',
    art: 'xbanner',
    satuan: 'pcs',
    harga: 65000,
    minimal: 1,
    ringkas: 'Sudah termasuk rangka X, siap pakai di depan toko.',
    deskripsi:
      'Paket lengkap: cetak bahan Albatros plus rangka X besi. Ringan, bisa dibongkar pasang, cocok untuk pameran dan depan toko.',
    bahan: [
      { nama: 'Albatros', faktor: 1 },
      { nama: 'Luster, laminasi doff', faktor: 1.25, catatan: 'Tidak memantulkan lampu' },
    ],
    grosir: [{ mulai: 5, potongan: 8 }],
    rating: 4.8,
    ulasan: 312,
    lamaKerja: '1 hari kerja',
    unggulan: true,
  },
  {
    slug: 'roll-banner',
    nama: 'Roll Banner 85 × 200 cm',
    kategori: 'banner',
    art: 'rollbanner',
    satuan: 'pcs',
    harga: 185000,
    minimal: 1,
    ringkas: 'Rangka gulung, masuk tas, aman dibawa jalan.',
    deskripsi:
      'Rangka roll up aluminium dengan tas jinjing. Cetakan bisa diganti tanpa mengganti rangka.',
    bahan: [
      { nama: 'Luster standar', faktor: 1 },
      { nama: 'Albatros premium', faktor: 1.2 },
    ],
    rating: 4.9,
    ulasan: 188,
    lamaKerja: '2 hari kerja',
  },
  {
    slug: 'stiker-vinyl',
    nama: 'Stiker Vinyl',
    kategori: 'stiker',
    art: 'stiker',
    satuan: 'm2',
    harga: 45000,
    minimal: 1,
    ringkas: 'Tahan air, bisa potong mengikuti bentuk desain.',
    deskripsi:
      'Stiker bahan vinyl untuk kemasan, kaca toko, dan kendaraan. Bisa dipotong kotak atau mengikuti bentuk gambar.',
    bahan: [
      { nama: 'Vinyl standar', faktor: 1 },
      { nama: 'Vinyl + laminasi glossy', faktor: 1.3, catatan: 'Tahan gesek dan sinar matahari' },
      { nama: 'Vinyl transparan', faktor: 1.4, catatan: 'Untuk tempel di kaca' },
    ],
    finishing: [
      { nama: 'Potong kotak', faktor: 1 },
      { nama: 'Potong mengikuti bentuk', faktor: 1.25 },
    ],
    grosir: [{ mulai: 5, potongan: 7 }],
    rating: 4.9,
    ulasan: 744,
    lamaKerja: '1–2 hari kerja',
    unggulan: true,
  },
  {
    slug: 'stiker-uv-dtf',
    nama: 'Stiker UV DTF Timbul',
    kategori: 'stiker',
    art: 'stiker',
    satuan: 'pcs',
    harga: 33000,
    minimal: 1,
    ringkas: 'Stiker timbul, nempel di gelas, botol, dan tumbler.',
    deskripsi:
      'Stiker transfer UV DTF yang terasa timbul saat diraba. Menempel di permukaan tidak rata seperti botol dan tumbler.',
    rating: 5,
    ulasan: 96,
    lamaKerja: '2 hari kerja',
    promo: 'Baru',
  },
  {
    slug: 'print-a3-color',
    nama: 'Print A3+ Warna',
    kategori: 'dokumen',
    art: 'dokumen',
    satuan: 'lembar',
    harga: 2200,
    minimal: 1,
    ringkas: 'Cetak warna tajam untuk poster dan tugas kuliah.',
    deskripsi:
      'Cetak laser warna ukuran A3+ dengan hasil rapat dan warna stabil. Cocok untuk poster, gambar kerja, dan tugas kuliah.',
    bahan: [
      { nama: 'HVS 100 gr', faktor: 1 },
      { nama: 'Art Paper 150 gr', faktor: 1.6 },
      { nama: 'Art Carton 260 gr', faktor: 2.2 },
    ],
    grosir: [
      { mulai: 50, potongan: 10 },
      { mulai: 200, potongan: 18 },
    ],
    rating: 5,
    ulasan: 683,
    lamaKerja: 'Ditunggu, 15 menit',
    unggulan: true,
  },
  {
    slug: 'print-a4',
    nama: 'Print & Fotokopi A4',
    kategori: 'dokumen',
    art: 'dokumen',
    satuan: 'lembar',
    harga: 700,
    minimal: 10,
    ringkas: 'Hitam putih, bisa ditunggu, minimal 10 lembar.',
    deskripsi:
      'Cetak dan fotokopi dokumen A4 hitam putih. Bisa bolak-balik, bisa langsung dijilid.',
    bahan: [
      { nama: 'HVS 70 gr', faktor: 1 },
      { nama: 'HVS 80 gr', faktor: 1.15 },
    ],
    finishing: [
      { nama: 'Tanpa jilid', faktor: 1 },
      { nama: 'Jilid spiral', faktor: 1.1 },
      { nama: 'Jilid lakban', faktor: 1.05 },
    ],
    grosir: [
      { mulai: 100, potongan: 12 },
      { mulai: 500, potongan: 20 },
    ],
    rating: 4.8,
    ulasan: 416,
    lamaKerja: 'Ditunggu, 10 menit',
  },
  {
    slug: 'brosur-a5',
    nama: 'Brosur A5',
    kategori: 'dokumen',
    art: 'brosur',
    satuan: 'lembar',
    harga: 1500,
    minimal: 50,
    ringkas: 'Art paper, dua sisi, minimal 50 lembar.',
    deskripsi:
      'Brosur promo ukuran A5 cetak dua sisi di art paper. Makin banyak jumlahnya, makin murah per lembarnya.',
    bahan: [
      { nama: 'Art Paper 120 gr', faktor: 1 },
      { nama: 'Art Paper 150 gr', faktor: 1.2 },
    ],
    grosir: [
      { mulai: 250, potongan: 15 },
      { mulai: 1000, potongan: 28 },
    ],
    rating: 4.7,
    ulasan: 203,
    lamaKerja: '2 hari kerja',
  },
  {
    slug: 'kartu-nama',
    nama: 'Kartu Nama',
    kategori: 'kartu',
    art: 'kartunama',
    satuan: 'box',
    harga: 16500,
    minimal: 1,
    ringkas: 'Satu box isi 100 lembar, cetak dua sisi.',
    deskripsi:
      'Kartu nama art carton 260 gr, cetak dua sisi, potong presisi. Satu box isi 100 lembar.',
    bahan: [
      { nama: 'Art Carton 260 gr', faktor: 1 },
      { nama: 'Art Carton + laminasi doff', faktor: 1.45 },
      { nama: 'Blu Jackson 250 gr', faktor: 1.7, catatan: 'Tekstur kasar, kesan mahal' },
    ],
    grosir: [{ mulai: 5, potongan: 12 }],
    rating: 4.9,
    ulasan: 187,
    lamaKerja: '2 hari kerja',
  },
  {
    slug: 'undangan',
    nama: 'Undangan Custom',
    kategori: 'kartu',
    art: 'undangan',
    satuan: 'pcs',
    harga: 4500,
    minimal: 50,
    ringkas: 'Desain dibuatkan, minimal 50 lembar.',
    deskripsi:
      'Undangan pernikahan atau acara, termasuk satu kali desain dan dua kali revisi. Minimal pesan 50 lembar.',
    bahan: [
      { nama: 'Art Carton 260 gr', faktor: 1 },
      { nama: 'Jasmine, emas', faktor: 1.5 },
      { nama: 'Linen, timbul', faktor: 1.8 },
    ],
    grosir: [
      { mulai: 150, potongan: 10 },
      { mulai: 300, potongan: 18 },
    ],
    rating: 4.8,
    ulasan: 128,
    lamaKerja: '5–7 hari kerja',
  },
  {
    slug: 'kaos-dtf',
    nama: 'Kaos Sablon DTF',
    kategori: 'merchandise',
    art: 'kaos',
    satuan: 'pcs',
    harga: 99500,
    minimal: 1,
    ringkas: 'Satuan juga boleh, warna bebas, tidak retak.',
    deskripsi:
      'Kaos cotton combed 30s dengan sablon DTF. Bisa pesan satuan, warna gambar bebas, hasil lentur dan tidak mudah retak.',
    bahan: [
      { nama: 'Cotton Combed 30s', faktor: 1 },
      { nama: 'Cotton Combed 24s', faktor: 1.12, catatan: 'Lebih tebal' },
    ],
    grosir: [
      { mulai: 12, potongan: 10 },
      { mulai: 50, potongan: 18 },
    ],
    rating: 4.6,
    ulasan: 97,
    lamaKerja: '3 hari kerja',
    unggulan: true,
  },
  {
    slug: 'mug-custom',
    nama: 'Mug Custom',
    kategori: 'merchandise',
    art: 'mug',
    satuan: 'pcs',
    harga: 22000,
    minimal: 1,
    ringkas: 'Mug keramik, cetak foto penuh, aman dicuci.',
    deskripsi:
      'Mug keramik putih 11 oz dengan cetak sublim. Gambar bisa penuh melingkar. Aman dicuci tangan, warna tidak cepat pudar.',
    bahan: [
      { nama: 'Mug putih 11 oz', faktor: 1 },
      { nama: 'Mug warna dalam', faktor: 1.3 },
      { nama: 'Mug magic, berubah warna', faktor: 2.1 },
    ],
    grosir: [
      { mulai: 12, potongan: 12 },
      { mulai: 48, potongan: 20 },
    ],
    rating: 4.9,
    ulasan: 241,
    lamaKerja: '2 hari kerja',
    promo: 'Mulai 22rb',
  },
  {
    slug: 'totebag',
    nama: 'Totebag Sablon',
    kategori: 'merchandise',
    art: 'totebag',
    satuan: 'pcs',
    harga: 71500,
    minimal: 1,
    ringkas: 'Kanvas tebal, untuk seminar kit dan hampers.',
    deskripsi:
      'Totebag kanvas blacu dengan sablon DTF satu sisi. Sering dipakai untuk seminar kit dan oleh-oleh acara.',
    grosir: [{ mulai: 24, potongan: 15 }],
    rating: 4.7,
    ulasan: 64,
    lamaKerja: '4 hari kerja',
  },
  {
    slug: 'pin-bulat',
    nama: 'Pin Bulat 58 mm',
    kategori: 'merchandise',
    art: 'pin',
    satuan: 'pcs',
    harga: 4000,
    minimal: 10,
    ringkas: 'Murah untuk suvenir acara, minimal 10 biji.',
    deskripsi: 'Pin peniti diameter 58 mm dengan laminasi glossy. Minimal pesan 10 biji.',
    grosir: [
      { mulai: 100, potongan: 15 },
      { mulai: 500, potongan: 25 },
    ],
    rating: 4.8,
    ulasan: 112,
    lamaKerja: '2 hari kerja',
  },
  {
    slug: 'kalender-meja',
    nama: 'Kalender Meja',
    kategori: 'bisnis',
    art: 'kalender',
    satuan: 'pcs',
    harga: 35000,
    minimal: 10,
    ringkas: '13 lembar, spiral, untuk hadiah pelanggan.',
    deskripsi:
      'Kalender meja 13 lembar art carton dengan spiral kawat dan dudukan. Logo usaha dipasang di tiap lembar.',
    grosir: [
      { mulai: 50, potongan: 12 },
      { mulai: 200, potongan: 22 },
    ],
    rating: 4.8,
    ulasan: 73,
    lamaKerja: '5 hari kerja',
  },
  {
    slug: 'id-card',
    nama: 'ID Card + Tali',
    kategori: 'bisnis',
    art: 'idcard',
    satuan: 'pcs',
    harga: 12000,
    minimal: 10,
    ringkas: 'PVC tebal plus tali printing nama usaha.',
    deskripsi:
      'Kartu identitas PVC 0,76 mm cetak dua sisi, lengkap dengan tali printing dan penjepit.',
    bahan: [
      { nama: 'PVC + tali polos', faktor: 1 },
      { nama: 'PVC + tali printing', faktor: 1.35 },
    ],
    grosir: [{ mulai: 50, potongan: 15 }],
    rating: 4.7,
    ulasan: 58,
    lamaKerja: '3 hari kerja',
  },
];

export const langkahOrder = [
  { judul: 'Pilih produk', isi: 'Tentukan ukuran, bahan, dan jumlah. Harga langsung muncul.' },
  { judul: 'Kirim desain', isi: 'Upload file PDF, AI, atau JPG. Belum punya desain? Kami buatkan.' },
  { judul: 'Bayar', isi: 'Transfer bank atau QRIS. Nota otomatis masuk ke WhatsApp kamu.' },
  { judul: 'Dicetak', isi: 'Kami kirim foto hasil cetak sebelum dikemas.' },
  { judul: 'Ambil atau dikirim', isi: 'Ambil di toko, atau diantar kurir di dalam kota hari itu juga.' },
];

/** Format rupiah tanpa spasi berlebih, mis. 20000 jadi "Rp20.000". */
export function rupiah(n: number): string {
  return 'Rp' + Math.round(n).toLocaleString('id-ID');
}

/** Label satuan untuk ditempel di belakang harga. */
export const labelSatuan: Record<Satuan, string> = {
  m2: '/m²',
  pcs: '/pcs',
  lembar: '/lembar',
  box: '/box',
};

/**
 * Teks alternatif foto produk, satu per slug.
 * Ditulis untuk menerangkan isi foto, bukan mengulang nama produk,
 * supaya berguna bagi pembaca layar dan saat foto gagal dimuat.
 */
export const fotoAlt: Record<string, string> = {
  'spanduk-mmt': 'Deretan spanduk kain terpasang di sepanjang gang pertokoan',
  'x-banner': 'X-banner tercetak berdiri di depan pintu masuk gedung',
  'roll-banner': 'Roll banner putih polos berdiri di ruangan terang',
  'stiker-vinyl': 'Dinding penuh tempelan stiker beraneka warna',
  'stiker-uv-dtf': 'Sepuluh stiker bergambar kartun di atas latar kuning',
  'print-a3-color': 'Kipas contoh warna cetak terbuka memperlihatkan gradasi warna',
  'print-a4': 'Mesin cetak format besar mengeluarkan lembar gambar',
  'brosur-a5': 'Tumpukan brosur dan majalah desain di atas meja',
  'kartu-nama': 'Dua kartu nama putih polos di atas permukaan biru muda',
  undangan: 'Undangan pernikahan dengan pita hijau dan amplop di atas meja',
  'kaos-dtf': 'Kaos putih polos tergantung di depan dinding beton',
  'mug-custom': 'Mug keramik putih di dekat jendela',
  totebag: 'Totebag kanvas putih tergantung di dinding abu-abu',
  'pin-bulat': 'Ratusan pin bulat beraneka gambar menempel rapat',
  'kalender-meja': 'Kalender meja kecil berdiri di permukaan putih',
  'id-card': 'Kartu identitas kosong dengan tali gantung di samping tanaman',
};
