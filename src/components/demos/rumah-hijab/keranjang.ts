import { produk, ONGKIR, GRATIS_ONGKIR_DARI } from '../../../data/rumah-hijab';

/**
 * Keranjang bersama antar halaman.
 *
 * Toko ini punya beberapa halaman asli (beranda, katalog, halaman produk),
 * jadi keranjangnya tidak bisa hidup di dalam satu komponen saja. Isinya
 * disimpan di localStorage, lalu tiap pulau React saling memberi tahu lewat
 * satu peristiwa window.
 *
 * Ini tetap demo tanpa server: isinya hanya ada di browser pengunjung, tidak
 * pernah dikirim ke mana pun, dan bisa dikosongkan kapan saja.
 */

const KUNCI = 'rha-keranjang-v1';
export const PERISTIWA = 'rha-keranjang-berubah';

export interface Baris {
  slug: string;
  warna: string;
  ukuran?: string;
  jumlah: number;
}

export function bacaKeranjang(): Baris[] {
  if (typeof window === 'undefined') return [];
  try {
    const mentah = window.localStorage.getItem(KUNCI);
    if (!mentah) return [];
    const isi = JSON.parse(mentah);
    return Array.isArray(isi) ? (isi as Baris[]) : [];
  } catch {
    // Penyimpanan bisa ditolak di mode penyamaran. Kalau gagal, keranjang
    // dianggap kosong — halaman tetap jalan.
    return [];
  }
}

export function tulisKeranjang(isi: Baris[]) {
  try {
    window.localStorage.setItem(KUNCI, JSON.stringify(isi));
  } catch {
    /* diabaikan dengan sengaja */
  }
  window.dispatchEvent(new CustomEvent(PERISTIWA));
}

export function tambahKeKeranjang(baru: Baris) {
  const isi = bacaKeranjang();
  const sama = isi.find(
    (b) => b.slug === baru.slug && b.warna === baru.warna && b.ukuran === baru.ukuran,
  );
  if (sama) sama.jumlah += baru.jumlah;
  else isi.push(baru);
  tulisKeranjang(isi);
}

export function hitungTotal(isi: Baris[]) {
  const peta = Object.fromEntries(produk.map((p) => [p.slug, p]));
  const subtotal = isi.reduce((t, b) => t + (peta[b.slug]?.harga ?? 0) * b.jumlah, 0);
  const item = isi.reduce((t, b) => t + b.jumlah, 0);
  const ongkir = subtotal === 0 || subtotal >= GRATIS_ONGKIR_DARI ? 0 : ONGKIR;
  return { subtotal, item, ongkir, total: subtotal + ongkir };
}
