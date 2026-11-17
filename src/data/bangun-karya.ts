/**
 * Data CV Bangun Karya, kontraktor fiktif. Semua angka, nama proyek, dan
 * klien karangan. Tidak merujuk perusahaan atau bangunan nyata.
 */

export const perusahaan = {
  nama: 'CV Bangun Karya',
  tagline: 'Dibangun rapi, selesai tepat waktu',
  domain: 'bangunkarya.co.id',
  berdiri: 2009,
  kota: 'Semarang',
  alamat: 'Jl. Pemuda No. 118, Semarang 50132',
  telepon: '024-555-0142',
  whatsapp: '6281234567890',
  email: 'info@bangunkarya.co.id',
  jam: 'Senin – Sabtu, 08.00 – 16.30',
  npwp: '01.234.567.8-502.000',
} as const;

export const angka = [
  { nilai: '15', satuan: 'tahun', ket: 'berpengalaman sejak 2009' },
  { nilai: '240+', satuan: 'proyek', ket: 'selesai dan diserahterimakan' },
  { nilai: '96%', satuan: 'tepat waktu', ket: 'diserahkan sesuai jadwal kontrak' },
  { nilai: '48', satuan: 'tenaga', ket: 'tim tetap, bukan borongan' },
];

export interface Layanan {
  slug: string;
  nama: string;
  ringkas: string;
  isi: string[];
}

export const layanan: Layanan[] = [
  {
    slug: 'bangun-baru',
    nama: 'Bangun Baru',
    ringkas: 'Rumah tinggal, ruko, dan gudang dari gambar sampai serah terima.',
    isi: ['Gambar kerja & RAB', 'Struktur & arsitektur', 'Pengawasan harian', 'Garansi 12 bulan'],
  },
  {
    slug: 'renovasi',
    nama: 'Renovasi',
    ringkas: 'Perbaikan dan perluasan bangunan tanpa menghentikan usahamu.',
    isi: ['Survei kondisi bangunan', 'Pekerjaan bertahap', 'Pembongkaran terkendali', 'Perapian akhir'],
  },
  {
    slug: 'interior',
    nama: 'Interior & Fit-out',
    ringkas: 'Kantor, toko, dan klinik siap pakai, lengkap dengan furnitur tanam.',
    isi: ['Desain 3D', 'Furnitur tanam', 'Instalasi listrik & AC', 'Serah terima rapi'],
  },
  {
    slug: 'sipil',
    nama: 'Pekerjaan Sipil',
    ringkas: 'Jalan lingkungan, drainase, dan pengerasan lahan untuk kawasan usaha.',
    isi: ['Pengerasan & pengaspalan', 'Drainase', 'Pagar & dinding penahan', 'Uji mutu bahan'],
  },
];

export type JenisProyek = 'rumah' | 'komersial' | 'industri' | 'sipil';

export const jenisProyek: { slug: JenisProyek; nama: string }[] = [
  { slug: 'rumah', nama: 'Rumah Tinggal' },
  { slug: 'komersial', nama: 'Komersial' },
  { slug: 'industri', nama: 'Industri' },
  { slug: 'sipil', nama: 'Sipil' },
];

export interface Proyek {
  slug: string;
  nama: string;
  jenis: JenisProyek;
  lokasi: string;
  tahun: number;
  luas: string;
  nilai: string;
  durasi: string;
  klien: string;
  ringkas: string;
  tantangan: string;
  hasil: string;
  foto: string;
  unggulan?: boolean;
}

export const proyek: Proyek[] = [
  {
    slug: 'gudang-logistik-kendal',
    nama: 'Gudang Logistik Kendal',
    jenis: 'industri',
    lokasi: 'Kendal, Jawa Tengah',
    tahun: 2025,
    luas: '4.200 m²',
    nilai: 'Rp 11,8 miliar',
    durasi: '7 bulan',
    klien: 'PT Sentra Distribusi (fiktif)',
    ringkas: 'Gudang bentang lebar dengan lantai beton rata laser dan dok bongkar muat enam jalur.',
    tantangan: 'Lahan bekas sawah dengan daya dukung rendah. Pondasi tiang pancang dipakai supaya lantai tidak turun saat rak penuh.',
    hasil: 'Diserahkan 11 hari lebih cepat dari jadwal. Lantai lolos uji kerataan untuk forklift tinggi.',
    foto: 'gudang-a',
    unggulan: true,
  },
  {
    slug: 'villa-tembalang',
    nama: 'Rumah Tinggal Tembalang',
    jenis: 'rumah',
    lokasi: 'Tembalang, Semarang',
    tahun: 2025,
    luas: '420 m²',
    nilai: 'Rp 4,6 miliar',
    durasi: '9 bulan',
    klien: 'Keluarga Hadi (fiktif)',
    ringkas: 'Rumah dua lantai dengan kolam renang dan atap datar, menghadap lembah.',
    tantangan: 'Kontur tanah miring 4 meter. Dinding penahan dibangun lebih dulu, baru rumahnya.',
    hasil: 'Dua lantai menyatu dengan taman bertingkat tanpa urugan besar.',
    foto: 'rumah-a',
    unggulan: true,
  },
  {
    slug: 'kantor-pusat-simpang-lima',
    nama: 'Fit-out Kantor Simpang Lima',
    jenis: 'komersial',
    lokasi: 'Simpang Lima, Semarang',
    tahun: 2024,
    luas: '1.150 m²',
    nilai: 'Rp 3,2 miliar',
    durasi: '4 bulan',
    klien: 'Kantor Konsultan Arta (fiktif)',
    ringkas: 'Kantor terbuka dengan partisi kaca, ruang rapat, dan pantri, dikerjakan saat gedung tetap beroperasi.',
    tantangan: 'Pekerjaan bising hanya boleh malam dan akhir pekan karena lantai lain masih dipakai.',
    hasil: 'Serah terima tepat waktu, tanpa satu pun keluhan dari penyewa lantai lain.',
    foto: 'kantor-a',
    unggulan: true,
  },
  {
    slug: 'jalan-kawasan-industri',
    nama: 'Jalan Kawasan Industri Batang',
    jenis: 'sipil',
    lokasi: 'Batang, Jawa Tengah',
    tahun: 2024,
    luas: '3,4 km',
    nilai: 'Rp 14,5 miliar',
    durasi: '8 bulan',
    klien: 'Pengelola Kawasan (fiktif)',
    ringkas: 'Pengaspalan dua jalur dengan drainase tepi, dilewati truk kontainer tiap hari.',
    tantangan: 'Pekerjaan harus berjalan di musim hujan. Aspal digelar per segmen pendek agar tidak rusak sebelum padat.',
    hasil: 'Lolos uji kepadatan di seluruh titik sampel dan bertahan dua musim hujan tanpa retak berarti.',
    foto: 'jalan-b',
  },
  {
    slug: 'renovasi-ruko-kota-lama',
    nama: 'Renovasi Ruko Kota Lama',
    jenis: 'komersial',
    lokasi: 'Kota Lama, Semarang',
    tahun: 2023,
    luas: '260 m²',
    nilai: 'Rp 1,9 miliar',
    durasi: '5 bulan',
    klien: 'Bu Marlina (fiktif)',
    ringkas: 'Pemugaran fasad bangunan tua menjadi kafe, dengan struktur diperkuat dan tampak depan dipertahankan.',
    tantangan: 'Fasad tidak boleh diubah. Penguatan dilakukan dari dalam, dengan rangka baja yang tidak terlihat dari luar.',
    hasil: 'Tampak depan utuh, bagian dalamnya sepenuhnya baru dan memenuhi standar keselamatan.',
    foto: 'ruko-a',
  },
  {
    slug: 'rumah-pantai-jepara',
    nama: 'Rumah Tinggal Jepara',
    jenis: 'rumah',
    lokasi: 'Jepara, Jawa Tengah',
    tahun: 2023,
    luas: '310 m²',
    nilai: 'Rp 3,1 miliar',
    durasi: '8 bulan',
    klien: 'Keluarga Santoso (fiktif)',
    ringkas: 'Rumah modern putih dengan teras luas dan kolam, tahan angin laut.',
    tantangan: 'Udara asin cepat menggerogoti besi. Seluruh tulangan memakai pelapis anti karat dan selimut beton ditebalkan.',
    hasil: 'Struktur dirancang awet untuk lingkungan pesisir dengan perawatan minimal.',
    foto: 'rumah-b',
  },
  {
    slug: 'kantor-koridor',
    nama: 'Fit-out Kantor Koridor Kaca',
    jenis: 'komersial',
    lokasi: 'Semarang Barat',
    tahun: 2022,
    luas: '780 m²',
    nilai: 'Rp 2,4 miliar',
    durasi: '3 bulan',
    klien: 'Perusahaan Teknologi (fiktif)',
    ringkas: 'Lantai kantor dengan koridor kaca dan ruang kerja bersama.',
    tantangan: 'Kaca partisi tinggi tiga meter harus terpasang tanpa retak di gedung yang lantainya tidak rata.',
    hasil: 'Seluruh panel kaca terpasang rapat, dikerjakan dengan perata lantai khusus sebelum partisi dipasang.',
    foto: 'kantor-b',
  },
  {
    slug: 'pengerasan-lahan-ungaran',
    nama: 'Pengerasan Lahan Ungaran',
    jenis: 'sipil',
    lokasi: 'Ungaran, Semarang',
    tahun: 2022,
    luas: '2,1 ha',
    nilai: 'Rp 5,2 miliar',
    durasi: '5 bulan',
    klien: 'Pengembang Perumahan (fiktif)',
    ringkas: 'Pematangan lahan, penggalian, dan pengerasan untuk kawasan perumahan baru.',
    tantangan: 'Volume tanah yang dipindahkan besar dan jadwal truk padat. Rute angkut diatur supaya tidak mengganggu warga sekitar.',
    hasil: 'Lahan siap bangun sesuai jadwal dengan drainase yang berfungsi sejak hari pertama.',
    foto: 'jalan-a',
  },
];

export const tahap = [
  {
    nomor: '01',
    judul: 'Survei & konsultasi',
    isi: 'Kami datang ke lokasi, mengukur, dan mendengar kebutuhanmu. Gratis, tanpa kewajiban lanjut.',
  },
  {
    nomor: '02',
    judul: 'Gambar & RAB',
    isi: 'Gambar kerja dan rincian biaya per item. Kamu tahu ke mana tiap rupiah pergi sebelum tanda tangan.',
  },
  {
    nomor: '03',
    judul: 'Pelaksanaan',
    isi: 'Pengawas ada di lokasi tiap hari. Laporan foto mingguan dikirim ke WhatsApp-mu.',
  },
  {
    nomor: '04',
    judul: 'Serah terima & garansi',
    isi: 'Diperiksa bersama daftar cacat. Garansi struktur 12 bulan, perbaikan tanpa biaya.',
  },
];

export const sertifikat = [
  { kode: 'SBU', nama: 'Sertifikat Badan Usaha Konstruksi', ket: 'Kualifikasi Kecil & Menengah (contoh)' },
  { kode: 'K3', nama: 'Sistem Manajemen K3', ket: 'Keselamatan kerja tiap proyek' },
  { kode: 'SKK', nama: 'Tenaga Ahli Bersertifikat', ket: 'Pelaksana dan pengawas tersertifikasi' },
];

export const fotoAlt: Record<string, string> = {
  hero: 'Para pekerja berdiri di atas lantai beton proyek yang sedang dikerjakan',
  'gudang-a': 'Gedung gudang modern berdinding abu-abu dengan pintu angkat besar',
  'rumah-a': 'Rumah dua lantai modern dengan kolam renang dan taman',
  'kantor-a': 'Ruang kantor terbuka dengan jendela kaca besar dan meja panjang',
  'jalan-b': 'Mesin penghampar aspal kuning bekerja di jalan perbukitan',
  'ruko-a': 'Fasad bangunan tua berwarna kuning dan hijau dengan jendela berjalusi',
  'rumah-b': 'Rumah modern putih dengan kolam renang di bawah langit biru',
  'kantor-b': 'Koridor kantor dengan partisi kaca dan lampu gantung',
  'jalan-a': 'Truk tambang dan alat berat bekerja di lahan galian',
  tim: 'Dua perempuan berhelm putih membaca gambar kerja di depan jendela kota',
  crane: 'Dua derek menara menjulang di samping gedung bertingkat',
  'ruko-b': 'Deretan ruko berfasad putih dengan jendela berjalusi',
  rangka: 'Pekerja berdiri di atas rangka kayu bangunan di bawah langit biru',
};

export const WA_PESAN = 'Halo CV Bangun Karya, saya mau konsultasi untuk proyek bangunan.';
