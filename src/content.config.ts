import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Katalog demo portofolio.
 *
 * Menambah demo baru = tambah satu file markdown di `src/content/demos/`
 * dan satu folder halaman di `src/pages/porto/<slug>/`.
 * Tidak ada navigasi atau array yang perlu diedit manual.
 */
const demos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/demos' }),
  schema: ({ image }) =>
    z.object({
      /** Nama brand fiktif yang dipakai di dalam demo, mis. "Kencana Print". */
      brand: z.string(),
      /** Jenis produk yang ditunjukkan, dipakai sebagai filter di katalog. */
      kategori: z.enum([
        'Company Profile',
        'Katalog & Pemesanan',
        'E-commerce',
        'Aplikasi Kasir',
        'Aplikasi Inventory',
        'Dashboard',
      ]),
      /** Satu baris: masalah yang dipecahkan, bukan daftar fitur. */
      tagline: z.string().max(120),
      /** Kalimat lebih panjang untuk halaman detail dan meta description. */
      ringkasan: z.string(),
      /** Fitur yang bisa dicoba klien di demo. */
      fitur: z.array(z.string()).min(1),
      /** Rute demo, mis. "/porto/kencana-print". */
      url: z.string().startsWith('/porto/'),
      /** Nilai atribut `data-brand` yang memilih token warna di brands.css. */
      brandToken: z.string(),
      /** Domain palsu di chrome browser pratinjau, mis. "kencanaprint.id". */
      domain: z.string().optional(),
      /** Thumbnail kartu katalog. */
      thumbnail: image().optional(),
      /** `siap` tampil normal, `rencana` tampil sebagai kartu "segera". */
      status: z.enum(['siap', 'rencana']).default('rencana'),
      /** Urutan tampil di katalog, kecil tampil dulu. */
      urutan: z.number().default(99),
    }),
});

export const collections = { demos };
