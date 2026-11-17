/**
 * Data toko busana muslim Rumah Hijab Aisyah. Semuanya fiktif.
 * Harga mengikuti kisaran pasar hijab daring Indonesia pada 2026.
 */

export const toko = {
  nama: 'Rumah Hijab Aisyah',
  tagline: 'Hijab harian yang nyaman dipakai seharian',
  domain: 'rumahhijabaisyah.id',
  pemilik: 'Aisyah',
  kota: 'Bandung',
  whatsapp: '6281234567890',
  instagram: '@rumahhijabaisyah',
  ongkir: 'Gratis ongkir se-Indonesia untuk belanja di atas Rp300.000',
} as const;

export type KategoriSlug = 'hijab' | 'gamis' | 'atasan' | 'perlengkapan';

export const kategori: { slug: KategoriSlug; nama: string; ringkas: string }[] = [
  { slug: 'hijab', nama: 'Hijab', ringkas: 'Segi empat, pashmina, bergo' },
  { slug: 'gamis', nama: 'Gamis & Dress', ringkas: 'Untuk kerja sampai kondangan' },
  { slug: 'atasan', nama: 'Atasan', ringkas: 'Tunik dan blus sehari-hari' },
  { slug: 'perlengkapan', nama: 'Perlengkapan', ringkas: 'Inner, mukena, dan pelengkap' },
];

export interface Varian {
  nama: string;
  /** Kode warna untuk titik contoh di halaman produk. */
  kode: string;
  stok: number;
}

export interface Produk {
  slug: string;
  nama: string;
  kategori: KategoriSlug;
  harga: number;
  /** Harga coret. Kosongkan kalau tidak sedang diskon. */
  hargaCoret?: number;
  ringkas: string;
  deskripsi: string;
  bahan: string;
  ukuran?: string[];
  warna: Varian[];
  rating: number;
  ulasan: number;
  terjual: number;
  /** Tampil di deretan pilihan di beranda. */
  unggulan?: boolean;
  label?: string;
}

export const produk: Produk[] = [
  {
    slug: 'hijab-segiempat',
    nama: 'Hijab Segi Empat Voal',
    kategori: 'hijab',
    harga: 65000,
    hargaCoret: 85000,
    ringkas: 'Voal ultrafine, tidak menerawang, mudah dibentuk.',
    deskripsi:
      'Hijab segi empat 115 × 115 cm dari voal ultrafine. Ringan, jatuh rapi, dan tidak perlu banyak jarum. Tepinya dijahit tipis supaya tidak kaku saat dilipat.',
    bahan: 'Voal ultrafine 115 × 115 cm',
    warna: [
      { nama: 'Dusty Pink', kode: '#d9a6b3', stok: 24 },
      { nama: 'Sage', kode: '#9bb3a0', stok: 18 },
      { nama: 'Mocha', kode: '#a98a76', stok: 12 },
      { nama: 'Hitam', kode: '#2b2b2b', stok: 30 },
    ],
    rating: 4.9,
    ulasan: 312,
    terjual: 1840,
    unggulan: true,
    label: 'Terlaris',
  },
  {
    slug: 'pashmina-ceruty',
    nama: 'Pashmina Ceruty Babydoll',
    kategori: 'hijab',
    harga: 72000,
    ringkas: 'Jatuh cantik, tidak licin, aman dipakai tanpa peniti.',
    deskripsi:
      'Pashmina 175 × 75 cm bahan ceruty babydoll. Teksturnya sedikit berpasir sehingga tidak melorot, cocok untuk gaya simpel sehari-hari.',
    bahan: 'Ceruty babydoll 175 × 75 cm',
    warna: [
      { nama: 'Teal', kode: '#2f7d85', stok: 15 },
      { nama: 'Maroon', kode: '#7a2733', stok: 9 },
      { nama: 'Cream', kode: '#e6dac9', stok: 21 },
    ],
    rating: 4.8,
    ulasan: 186,
    terjual: 940,
    unggulan: true,
  },
  {
    slug: 'bergo-instan',
    nama: 'Bergo Instan Jersey',
    kategori: 'hijab',
    harga: 58000,
    ringkas: 'Tinggal pakai, rapi dalam sepuluh detik.',
    deskripsi:
      'Bergo jadi dari jersey premium yang lentur. Cocok untuk ibu yang buru-buru antar anak sekolah atau dipakai di balik helm.',
    bahan: 'Jersey premium, all size',
    warna: [
      { nama: 'Taupe', kode: '#b49a86', stok: 26 },
      { nama: 'Navy', kode: '#2b3a55', stok: 14 },
      { nama: 'Abu', kode: '#9a9a9a', stok: 7 },
    ],
    rating: 4.7,
    ulasan: 143,
    terjual: 760,
    unggulan: true,
  },
  {
    slug: 'khimar-syari',
    nama: 'Khimar Syar’i Dua Lapis',
    kategori: 'hijab',
    harga: 135000,
    ringkas: 'Menutup dada, adem, tidak tembus pandang.',
    deskripsi:
      'Khimar dua lapis bahan ceruty dengan pet antem. Panjang depan 90 cm, menutup dada dengan rapi tanpa terasa berat.',
    bahan: 'Ceruty dua lapis, panjang 90 cm',
    warna: [
      { nama: 'Putih Tulang', kode: '#efe8dd', stok: 11 },
      { nama: 'Dusty Blue', kode: '#8ba3bd', stok: 8 },
    ],
    rating: 4.9,
    ulasan: 97,
    terjual: 420,
  },
  {
    slug: 'hijab-sport',
    nama: 'Hijab Sport Instan',
    kategori: 'hijab',
    harga: 68000,
    ringkas: 'Menyerap keringat, tetap rapi saat olahraga.',
    deskripsi:
      'Hijab olahraga dari bahan lycra yang cepat kering. Ada tali serut di belakang supaya tidak bergeser saat lari.',
    bahan: 'Lycra cepat kering, all size',
    warna: [
      { nama: 'Merah Bata', kode: '#b4503a', stok: 13 },
      { nama: 'Hitam', kode: '#2b2b2b', stok: 22 },
    ],
    rating: 4.6,
    ulasan: 64,
    terjual: 310,
  },
  {
    slug: 'gamis-polos',
    nama: 'Gamis Katun Polos',
    kategori: 'gamis',
    harga: 245000,
    hargaCoret: 289000,
    ringkas: 'Katun adem, ada saku, aman untuk kerja seharian.',
    deskripsi:
      'Gamis katun toyobo dengan resleting menyusui, dua saku samping, dan karet di pinggang belakang. Tidak perlu disetrika lama.',
    bahan: 'Katun toyobo premium',
    ukuran: ['S', 'M', 'L', 'XL'],
    warna: [
      { nama: 'Mustard', kode: '#c9a227', stok: 9 },
      { nama: 'Olive', kode: '#6f7a4f', stok: 12 },
      { nama: 'Hitam', kode: '#2b2b2b', stok: 16 },
    ],
    rating: 4.8,
    ulasan: 211,
    terjual: 680,
    unggulan: true,
    label: 'Diskon',
  },
  {
    slug: 'dress-muslim',
    nama: 'Dress Muslim Kondangan',
    kategori: 'gamis',
    harga: 320000,
    ringkas: 'Bahan jatuh, cocok untuk acara tanpa terlihat berlebihan.',
    deskripsi:
      'Dress bahan crinkle airflow dengan detail kerut di lengan. Jatuhnya bagus difoto, tapi tetap longgar dan nyaman dipakai duduk lama.',
    bahan: 'Crinkle airflow',
    ukuran: ['M', 'L', 'XL'],
    warna: [
      { nama: 'Dusty Pink', kode: '#d9a6b3', stok: 6 },
      { nama: 'Sage', kode: '#9bb3a0', stok: 4 },
    ],
    rating: 4.9,
    ulasan: 88,
    terjual: 240,
  },
  {
    slug: 'tunik-katun',
    nama: 'Tunik Katun Harian',
    kategori: 'atasan',
    harga: 168000,
    ringkas: 'Panjang menutup pinggul, enak dipakai ke mana saja.',
    deskripsi:
      'Tunik katun dengan panjang 95 cm dan belahan kancing depan. Cocok dipadukan dengan rok atau celana kulot.',
    bahan: 'Katun ima',
    ukuran: ['M', 'L', 'XL'],
    warna: [
      { nama: 'Biru Langit', kode: '#7fa3c3', stok: 10 },
      { nama: 'Krem', kode: '#e2d6c3', stok: 14 },
    ],
    rating: 4.7,
    ulasan: 76,
    terjual: 350,
  },
  {
    slug: 'scarf-motif',
    nama: 'Scarf Motif Cetak',
    kategori: 'hijab',
    harga: 89000,
    ringkas: 'Motif cetak sendiri, tiap seri cuma 50 lembar.',
    deskripsi:
      'Scarf segi empat dengan motif yang dicetak khusus untuk toko ini. Tiap seri dibuat terbatas, jadi tidak pasaran.',
    bahan: 'Voal motif cetak digital',
    warna: [
      { nama: 'Seri Bunga', kode: '#c2748a', stok: 8 },
      { nama: 'Seri Geometri', kode: '#56809b', stok: 5 },
    ],
    rating: 4.8,
    ulasan: 54,
    terjual: 190,
    label: 'Terbatas',
  },
  {
    slug: 'inner-ciput',
    nama: 'Inner Ciput Antem',
    kategori: 'perlengkapan',
    harga: 25000,
    ringkas: 'Rambut tidak keluar, hijab tidak gampang geser.',
    deskripsi:
      'Ciput bahan rayon yang menyerap keringat, dengan antem di bagian depan. Dijual satuan atau paket isi tiga.',
    bahan: 'Rayon spandex, all size',
    warna: [
      { nama: 'Hitam', kode: '#2b2b2b', stok: 45 },
      { nama: 'Krem', kode: '#e2d6c3', stok: 38 },
    ],
    rating: 4.9,
    ulasan: 402,
    terjual: 2600,
  },
  {
    slug: 'mukena-travel',
    nama: 'Mukena Travel Parasut',
    kategori: 'perlengkapan',
    harga: 185000,
    ringkas: 'Dilipat jadi sebesar botol minum, muat di tas kerja.',
    deskripsi:
      'Mukena bahan parasut tipis yang cepat kering, lengkap dengan tas kecil. Jahitannya rapat supaya tidak menerawang.',
    bahan: 'Parasut anti air, satu set dengan tas',
    warna: [
      { nama: 'Navy', kode: '#2b3a55', stok: 12 },
      { nama: 'Dusty Pink', kode: '#d9a6b3', stok: 9 },
    ],
    rating: 4.8,
    ulasan: 129,
    terjual: 510,
  },
  {
    slug: 'pashmina-plisket',
    nama: 'Pashmina Plisket Satin',
    kategori: 'hijab',
    harga: 95000,
    ringkas: 'Plisket rapi, berkilau lembut, tidak perlu disetrika.',
    deskripsi:
      'Pashmina satin plisket 180 × 70 cm. Lipatannya permanen, jadi cukup digantung setelah dicuci.',
    bahan: 'Satin plisket 180 × 70 cm',
    warna: [
      { nama: 'Champagne', kode: '#dcc6a0', stok: 7 },
      { nama: 'Rose Gold', kode: '#c98f91', stok: 11 },
      { nama: 'Hijau Botol', kode: '#2f5d4f', stok: 6 },
    ],
    rating: 4.7,
    ulasan: 71,
    terjual: 280,
  },
];

/** Teks alternatif foto, disimpan bersama datanya. */
export const fotoAlt: Record<string, string> = {
  'hijab-segiempat': 'Perempuan berhijab ungu berdiri di antara bunga',
  'pashmina-ceruty': 'Perempuan mengenakan pashmina biru kehijauan',
  'bergo-instan': 'Dua perempuan berhijab gaya turban di antara dedaunan',
  'khimar-syari': 'Perempuan mengenakan khimar putih dengan syal bermotif',
  'hijab-sport': 'Perempuan berhijab merah berdiri di taman kota',
  'gamis-polos': 'Perempuan mengenakan gamis kuning memegang bunga',
  'dress-muslim': 'Kain merah jambu lembut tergantung berlipat',
  'tunik-katun': 'Perempuan berhijab mengenakan mantel biru di pelataran kota',
  'scarf-motif': 'Padanan busana dengan syal bermotif cerah',
  'inner-ciput': 'Kain satin krem yang melipat halus',
  'mukena-travel': 'Gulungan kain putih tersusun rapat',
  'pashmina-plisket': 'Deretan pashmina aneka warna tergantung berjajar',
  'hero-toko': 'Perempuan membentangkan hijab di depan dinding kuning',
};

export function rupiah(n: number): string {
  return 'Rp' + Math.round(n).toLocaleString('id-ID');
}

export const GRATIS_ONGKIR_DARI = 300000;
export const ONGKIR = 22000;
