/** Data tetap Pands Media. Satu tempat, dipakai semua halaman induk. */
export const site = {
  nama: 'Pands Media',
  tagline: 'Website & aplikasi untuk UMKM',
  deskripsi:
    'Pands Media membangun website dan aplikasi untuk usaha kecil: percetakan digital, toko, warung, dan gudang.',
  /** Ganti dengan nomor asli sebelum rilis. Format internasional tanpa tanda plus. */
  whatsapp: '6281234567890',
  email: 'halo@pandsmedia.id',
  kota: 'Indonesia',
  /** Dipakai di astro.config.mjs dan untuk URL kanonik. */
  url: 'https://pandsmedia.id',
} as const;

/**
 * Link nav situs induk. Demo punya nav sendiri.
 * Proses, harga, dan kontak masih berupa bagian di beranda, bukan halaman
 * tersendiri. Pindahkan ke rute sendiri kalau isinya sudah cukup panjang.
 */
export const navUtama = [
  { label: 'Portofolio', href: '/porto' },
  { label: 'Cara kerja', href: '/#proses' },
  { label: 'Harga', href: '/#harga' },
  { label: 'Kontak', href: '/#kontak' },
] as const;

/** Bangun link WhatsApp berisi pesan yang sudah terisi. */
export function waLink(pesan: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(pesan)}`;
}
