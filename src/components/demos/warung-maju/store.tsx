import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  alasanPromoTidakBerlaku,
  buatTransaksiAwal,
  hitungPotonganPromo,
  izinPeran,
  kategoriAwal,
  pengaturanAwal,
  penggunaAwal,
  produkAwal,
  promoAwal,
  type Izin,
  type Kategori,
  type Metode,
  type MutasiStok,
  type Pengaturan,
  type Pengguna,
  type PeranSlug,
  type Produk,
  type Promo,
  type Transaksi,
} from '../../../data/warung-maju';

/**
 * Keadaan bersama seluruh aplikasi kasir.
 *
 * Produk, kategori, promo, keranjang, dan transaksi hidup di satu tempat
 * supaya layar kasir, laporan, dan pengelolaan tidak pernah menampilkan
 * angka yang berbeda.
 *
 * Tidak ada server dan tidak ada basis data. Semua berubah hanya di browser
 * dan kembali ke awal saat halaman dimuat ulang.
 *
 * Izin diperiksa di dua tempat: saat menu digambar, dan lagi di dalam fungsi
 * aksinya. Di sistem asli pemeriksaan kedua harus terjadi di server, karena
 * apa pun yang hidup di browser bisa diubah pemakainya.
 */

export interface Hasil {
  ok: boolean;
  pesan?: string;
}

export interface BarisKeranjang {
  kode: string;
  jumlah: number;
}

export interface Tagihan {
  subtotal: number;
  item: number;
  potPromo: number;
  promo?: Promo;
  potManual: number;
  pajak: number;
  total: number;
}

export interface MasukanProduk {
  kode?: string;
  nama: string;
  kategoriId: string;
  harga: number;
  hargaBeli: number;
  stok: number;
  minimum: number;
  laris: boolean;
  aktif: boolean;
  foto?: string;
}

export interface MasukanPromo {
  id?: string;
  kode: string;
  nama: string;
  jenis: 'persen' | 'nominal';
  nilai: number;
  minimal: number;
  maksimal: number;
  akhir: string;
  kuota: number;
  aktif: boolean;
}

export interface MasukanBayar {
  pelanggan: string;
  metode: Metode;
  kodePromo: string;
  potManual: number;
  bayar: number;
}

export interface Toko {
  kategori: Kategori[];
  produk: Produk[];
  peta: Record<string, Produk>;
  promo: Promo[];
  transaksi: Transaksi[];
  pengguna: Pengguna[];
  pengaturan: Pengaturan;
  mutasi: MutasiStok[];
  keranjang: BarisKeranjang[];

  peran: PeranSlug;
  setPeran: (p: PeranSlug) => void;
  akun: Pengguna;
  izin: Izin;
  sekarang: () => number;

  kabar: string;
  umumkan: (pesan: string) => void;

  tambahProduk: (m: MasukanProduk) => Hasil;
  ubahProduk: (kode: string, m: MasukanProduk) => Hasil;
  hapusProduk: (kode: string) => Hasil;
  sesuaikanStok: (kode: string, delta: number, alasan: string) => Hasil;

  tambahKategori: (nama: string) => Hasil & { id?: string };
  ubahKategori: (id: string, nama: string) => Hasil;
  hapusKategori: (id: string) => Hasil;
  geserKategori: (id: string, arah: -1 | 1) => void;

  simpanPromo: (m: MasukanPromo) => Hasil;
  hapusPromo: (id: string) => Hasil;
  jedaPromo: (id: string) => void;

  tambahKeKeranjang: (kode: string) => void;
  ubahJumlah: (kode: string, delta: number) => void;
  hapusDariKeranjang: (kode: string) => void;
  kosongkanKeranjang: () => void;
  hitung: (kodePromo: string, potManual: number) => Tagihan;
  bayar: (m: MasukanBayar) => Hasil & { transaksi?: Transaksi };
  batalkan: (nomor: string, alasan: string) => Hasil;

  tambahPengguna: (nama: string, peran: PeranSlug) => Hasil;
  ubahPengguna: (id: string, patch: Partial<Pengguna>) => Hasil;
  ubahPengaturan: (patch: Partial<Pengaturan>) => void;

  reset: () => void;
}

const Konteks = createContext<Toko | null>(null);

export function useToko(): Toko {
  const k = useContext(Konteks);
  if (!k) throw new Error('useToko dipakai di luar PenyediaToko');
  return k;
}

const gagal = (pesan: string): Hasil => ({ ok: false, pesan });
const berhasil: Hasil = { ok: true };

export function PenyediaToko({
  foto,
  children,
}: {
  /** Alamat foto bawaan per kode produk, sudah dioptimalkan oleh halaman Astro. */
  foto: Record<string, string>;
  children: ReactNode;
}) {
  const awalProduk = () =>
    produkAwal.map((p) => ({ ...p, foto: p.berkas ? foto[p.kode] : undefined }));

  const [kategori, setKategori] = useState<Kategori[]>(kategoriAwal);
  const [produk, setProduk] = useState<Produk[]>(awalProduk);
  const [promo, setPromo] = useState<Promo[]>(promoAwal);
  const [transaksi, setTransaksi] = useState<Transaksi[]>(() =>
    buatTransaksiAwal(produkAwal, Date.now()),
  );
  const [pengguna, setPengguna] = useState<Pengguna[]>(penggunaAwal);
  const [pengaturan, setPengaturan] = useState<Pengaturan>(pengaturanAwal);
  const [mutasi, setMutasi] = useState<MutasiStok[]>([]);
  const [keranjang, setKeranjang] = useState<BarisKeranjang[]>([]);
  const [peran, setPeranState] = useState<PeranSlug>('admin');
  const [kabar, setKabar] = useState('');

  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const peta = Object.fromEntries(produk.map((p) => [p.kode, p])) as Record<string, Produk>;
  const sekarang = () => Date.now();

  const akun =
    pengguna.find((u) => u.peran === peran && u.aktif) ??
    penggunaAwal.find((u) => u.peran === peran)!;
  const izin = izinPeran[peran];

  function umumkan(pesan: string) {
    setKabar(pesan);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setKabar(''), 4000);
  }

  function setPeran(p: PeranSlug) {
    setPeranState(p);
    setKabar('');
  }

  /* ---------------- produk ---------------- */

  function periksaProduk(m: MasukanProduk, kodeLama?: string): string {
    if (m.nama.trim().length < 2) return 'Tulis nama produk, minimal 2 huruf.';
    if (!kategori.some((k) => k.id === m.kategoriId)) return 'Pilih kategori produk.';
    if (!(m.harga > 0)) return 'Harga jual harus lebih dari 0.';
    if (m.hargaBeli < 0) return 'Harga beli tidak boleh negatif.';
    if (!Number.isInteger(m.stok) || m.stok < 0) return 'Stok harus bilangan bulat, 0 atau lebih.';
    if (!Number.isInteger(m.minimum) || m.minimum < 0) return 'Batas minimum harus bilangan bulat.';
    const kode = (m.kode ?? '').trim().toUpperCase();
    if (kodeLama === undefined && kode !== '' && produk.some((p) => p.kode === kode))
      return `Kode ${kode} sudah dipakai produk lain.`;
    return '';
  }

  function kodeBaru(): string {
    const nomor = produk
      .map((p) => /^PRD(\d+)$/.exec(p.kode)?.[1])
      .filter(Boolean)
      .map(Number);
    return `PRD${String((nomor.length ? Math.max(...nomor) : 0) + 1).padStart(3, '0')}`;
  }

  function tambahProduk(m: MasukanProduk): Hasil {
    const salah = periksaProduk(m);
    if (salah) return gagal(salah);
    const kode = (m.kode ?? '').trim().toUpperCase() || kodeBaru();
    setProduk((l) => [
      ...l,
      {
        kode,
        nama: m.nama.trim(),
        kategoriId: m.kategoriId,
        harga: m.harga,
        hargaBeli: m.hargaBeli,
        stok: m.stok,
        minimum: m.minimum,
        laris: m.laris,
        aktif: m.aktif,
        foto: m.foto,
      },
    ]);
    if (m.stok > 0) {
      setMutasi((l) => [
        { id: `M${l.length + 1}`, waktu: sekarang(), kode, delta: m.stok, alasan: 'Stok awal', oleh: akun.nama },
        ...l,
      ]);
    }
    umumkan(`${m.nama.trim()} ditambahkan dengan kode ${kode}.`);
    return berhasil;
  }

  function ubahProduk(kode: string, m: MasukanProduk): Hasil {
    const salah = periksaProduk(m, kode);
    if (salah) return gagal(salah);
    setProduk((l) =>
      l.map((p) =>
        p.kode === kode
          ? {
              ...p,
              nama: m.nama.trim(),
              kategoriId: m.kategoriId,
              harga: m.harga,
              hargaBeli: m.hargaBeli,
              minimum: m.minimum,
              laris: m.laris,
              aktif: m.aktif,
              // Form selalu mengirim foto yang berlaku; kosong berarti dihapus.
              foto: m.foto,
            }
          : p,
      ),
    );
    // Barang yang dinonaktifkan ikut keluar dari keranjang yang sedang jalan.
    if (!m.aktif) setKeranjang((k) => k.filter((b) => b.kode !== kode));
    umumkan(`${m.nama.trim()} diperbarui.`);
    return berhasil;
  }

  function hapusProduk(kode: string): Hasil {
    const p = peta[kode];
    if (!p) return gagal('Produk tidak ditemukan.');
    if (transaksi.some((t) => t.baris.some((b) => b.kode === kode))) {
      return gagal(
        `${p.nama} sudah pernah terjual. Nonaktifkan saja supaya riwayat dan laporan tetap utuh.`,
      );
    }
    setProduk((l) => l.filter((x) => x.kode !== kode));
    setKeranjang((k) => k.filter((b) => b.kode !== kode));
    umumkan(`${p.nama} dihapus.`);
    return berhasil;
  }

  function sesuaikanStok(kode: string, delta: number, alasan: string): Hasil {
    const p = peta[kode];
    if (!p) return gagal('Produk tidak ditemukan.');
    if (!Number.isInteger(delta) || delta === 0) return gagal('Jumlah harus bilangan bulat dan bukan 0.');
    if (p.stok + delta < 0) return gagal(`Stok ${p.nama} tinggal ${p.stok}, tidak bisa dikurangi ${-delta}.`);
    if (alasan.trim() === '') return gagal('Tulis alasan penyesuaian, misalnya "Kulakan pagi".');
    setProduk((l) => l.map((x) => (x.kode === kode ? { ...x, stok: x.stok + delta } : x)));
    setMutasi((l) => [
      { id: `M${l.length + 1}`, waktu: sekarang(), kode, delta, alasan: alasan.trim(), oleh: akun.nama },
      ...l,
    ]);
    umumkan(`Stok ${p.nama} ${delta > 0 ? 'bertambah' : 'berkurang'} ${Math.abs(delta)}, jadi ${p.stok + delta}.`);
    return berhasil;
  }

  /* ---------------- kategori ---------------- */

  function tambahKategori(nama: string): Hasil & { id?: string } {
    const n = nama.trim();
    if (n.length < 2) return gagal('Tulis nama kategori, minimal 2 huruf.');
    if (kategori.some((k) => k.nama.toLowerCase() === n.toLowerCase()))
      return gagal(`Kategori ${n} sudah ada.`);
    const id = `k${Date.now().toString(36)}`;
    setKategori((l) => [...l, { id, nama: n }]);
    umumkan(`Kategori ${n} ditambahkan.`);
    return { ok: true, id };
  }

  function ubahKategori(id: string, nama: string): Hasil {
    const n = nama.trim();
    if (n.length < 2) return gagal('Tulis nama kategori, minimal 2 huruf.');
    if (kategori.some((k) => k.id !== id && k.nama.toLowerCase() === n.toLowerCase()))
      return gagal(`Kategori ${n} sudah ada.`);
    setKategori((l) => l.map((k) => (k.id === id ? { ...k, nama: n } : k)));
    umumkan(`Kategori diubah jadi ${n}.`);
    return berhasil;
  }

  function hapusKategori(id: string): Hasil {
    const k = kategori.find((x) => x.id === id);
    if (!k) return gagal('Kategori tidak ditemukan.');
    const isi = produk.filter((p) => p.kategoriId === id).length;
    if (isi > 0)
      return gagal(`Masih ada ${isi} produk di ${k.nama}. Pindahkan produknya ke kategori lain dulu.`);
    setKategori((l) => l.filter((x) => x.id !== id));
    umumkan(`Kategori ${k.nama} dihapus.`);
    return berhasil;
  }

  function geserKategori(id: string, arah: -1 | 1) {
    setKategori((l) => {
      const i = l.findIndex((k) => k.id === id);
      const j = i + arah;
      if (i < 0 || j < 0 || j >= l.length) return l;
      const baru = [...l];
      [baru[i], baru[j]] = [baru[j], baru[i]];
      return baru;
    });
  }

  /* ---------------- promo ---------------- */

  function simpanPromo(m: MasukanPromo): Hasil {
    const kode = m.kode.trim().toUpperCase().replace(/\s+/g, '');
    if (kode.length < 3) return gagal('Kode promo minimal 3 karakter, tanpa spasi.');
    if (promo.some((p) => p.id !== m.id && p.kode === kode)) return gagal(`Kode ${kode} sudah dipakai promo lain.`);
    if (m.nama.trim().length < 3) return gagal('Tulis keterangan promo, minimal 3 huruf.');
    if (!(m.nilai > 0)) return gagal('Nilai potongan harus lebih dari 0.');
    if (m.jenis === 'persen' && m.nilai > 100) return gagal('Potongan persen tidak boleh lebih dari 100.');
    if (m.minimal < 0 || m.maksimal < 0 || m.kuota < 0) return gagal('Angka tidak boleh negatif.');

    if (m.id) {
      setPromo((l) => l.map((p) => (p.id === m.id ? { ...p, ...m, kode, nama: m.nama.trim() } : p)));
      umumkan(`Promo ${kode} diperbarui.`);
    } else {
      const id = `PR${Date.now().toString(36)}`;
      setPromo((l) => [...l, { ...m, id, kode, nama: m.nama.trim(), terpakai: 0 }]);
      umumkan(`Promo ${kode} dibuat.`);
    }
    return berhasil;
  }

  function hapusPromo(id: string): Hasil {
    const p = promo.find((x) => x.id === id);
    if (!p) return gagal('Promo tidak ditemukan.');
    if (transaksi.some((t) => t.kodePromo === p.kode))
      return gagal(`Promo ${p.kode} sudah pernah dipakai. Jeda saja supaya laporan tetap utuh.`);
    setPromo((l) => l.filter((x) => x.id !== id));
    umumkan(`Promo ${p.kode} dihapus.`);
    return berhasil;
  }

  function jedaPromo(id: string) {
    const p = promo.find((x) => x.id === id);
    if (!p) return;
    setPromo((l) => l.map((x) => (x.id === id ? { ...x, aktif: !x.aktif } : x)));
    umumkan(`Promo ${p.kode} ${p.aktif ? 'dijeda' : 'diaktifkan lagi'}.`);
  }

  /* ---------------- keranjang dan pembayaran ---------------- */

  function tambahKeKeranjang(kode: string) {
    const p = peta[kode];
    if (!p || !p.aktif) return;
    const ada = keranjang.find((b) => b.kode === kode)?.jumlah ?? 0;
    if (p.stok <= 0) return umumkan(`${p.nama} stoknya habis.`);
    if (ada >= p.stok) return umumkan(`Stok ${p.nama} tinggal ${p.stok}.`);
    setKeranjang((k) =>
      ada > 0 ? k.map((b) => (b.kode === kode ? { ...b, jumlah: b.jumlah + 1 } : b)) : [...k, { kode, jumlah: 1 }],
    );
  }

  function ubahJumlah(kode: string, delta: number) {
    const p = peta[kode];
    if (!p) return;
    setKeranjang((k) =>
      k
        .map((b) => (b.kode === kode ? { ...b, jumlah: Math.min(p.stok, Math.max(0, b.jumlah + delta)) } : b))
        .filter((b) => b.jumlah > 0),
    );
  }

  function hapusDariKeranjang(kode: string) {
    setKeranjang((k) => k.filter((b) => b.kode !== kode));
  }

  function kosongkanKeranjang() {
    setKeranjang([]);
  }

  /** Hitungan tagihan: promo dulu, lalu diskon manual, lalu pajak. */
  function hitung(kodePromo: string, potManual: number): Tagihan {
    const subtotal = keranjang.reduce((t, b) => t + (peta[b.kode]?.harga ?? 0) * b.jumlah, 0);
    const item = keranjang.reduce((t, b) => t + b.jumlah, 0);
    const p = promo.find((x) => x.kode === kodePromo);
    const layak = p && alasanPromoTidakBerlaku(p, subtotal, sekarang()) === '' ? p : undefined;
    const potPromo = layak ? hitungPotonganPromo(layak, subtotal) : 0;
    const manual = Math.min(Math.max(0, potManual), subtotal - potPromo);
    const dasar = subtotal - potPromo - manual;
    const pajak = Math.round((dasar * pengaturan.pajak) / 100);
    return { subtotal, item, potPromo, promo: layak, potManual: manual, pajak, total: dasar + pajak };
  }

  function bayar(m: MasukanBayar): Hasil & { transaksi?: Transaksi } {
    if (keranjang.length === 0) return gagal('Keranjang masih kosong.');
    if (m.pelanggan.trim() === '') return gagal('Nama pelanggan wajib diisi.');
    if (!pengaturan.metodeAktif[m.metode]) return gagal(`Metode ${m.metode} sedang tidak dipakai.`);
    if (m.potManual > 0 && peran !== 'admin' && !pengaturan.kasirBolehDiskon)
      return gagal('Diskon manual hanya boleh diberikan admin.');

    for (const b of keranjang) {
      const p = peta[b.kode];
      if (!p || !p.aktif) return gagal('Ada barang di keranjang yang sudah tidak dijual.');
      if (b.jumlah > p.stok) return gagal(`Stok ${p.nama} tinggal ${p.stok}.`);
    }

    const t = hitung(m.kodePromo, m.potManual);
    if (m.kodePromo !== '' && !t.promo) return gagal('Promo yang dipilih tidak berlaku untuk belanja ini.');
    if (m.metode === 'Tunai') {
      if (m.bayar === 0) return gagal('Jumlah uang tunai wajib diisi.');
      if (m.bayar < t.total) return gagal('Uang yang diterima masih kurang dari total.');
    }

    const nomor = `TRX-${200 + transaksi.length}`;
    const baru: Transaksi = {
      nomor,
      waktu: sekarang(),
      kasir: akun.nama,
      pelanggan: m.pelanggan.trim(),
      baris: keranjang.map((b) => {
        const p = peta[b.kode];
        return { kode: b.kode, nama: p.nama, jumlah: b.jumlah, harga: p.harga, hargaBeli: p.hargaBeli };
      }),
      subtotal: t.subtotal,
      kodePromo: t.promo?.kode ?? '',
      potPromo: t.potPromo,
      potManual: t.potManual,
      pajak: t.pajak,
      total: t.total,
      metode: m.metode,
      bayar: m.metode === 'Tunai' ? m.bayar : t.total,
      kembali: m.metode === 'Tunai' ? m.bayar - t.total : 0,
      status: 'selesai',
    };

    setProduk((l) =>
      l.map((p) => {
        const b = keranjang.find((x) => x.kode === p.kode);
        return b ? { ...p, stok: p.stok - b.jumlah } : p;
      }),
    );
    if (t.promo) {
      const kode = t.promo.kode;
      setPromo((l) => l.map((p) => (p.kode === kode ? { ...p, terpakai: p.terpakai + 1 } : p)));
    }
    setTransaksi((l) => [...l, baru]);
    setKeranjang([]);
    return { ok: true, transaksi: baru };
  }

  function batalkan(nomor: string, alasan: string): Hasil {
    if (!izin.batalkan) return gagal('Peran ini tidak boleh membatalkan transaksi.');
    const t = transaksi.find((x) => x.nomor === nomor);
    if (!t) return gagal('Transaksi tidak ditemukan.');
    if (t.status === 'batal') return gagal('Transaksi ini sudah dibatalkan.');
    if (alasan.trim().length < 3) return gagal('Tulis alasan pembatalan, minimal 3 huruf.');

    setTransaksi((l) =>
      l.map((x) =>
        x.nomor === nomor
          ? { ...x, status: 'batal', alasanBatal: alasan.trim(), dibatalkanOleh: akun.nama }
          : x,
      ),
    );
    // Barang dikembalikan ke stok, dan pemakaian promonya ikut ditarik.
    setProduk((l) =>
      l.map((p) => {
        const b = t.baris.find((x) => x.kode === p.kode);
        return b ? { ...p, stok: p.stok + b.jumlah } : p;
      }),
    );
    if (t.kodePromo)
      setPromo((l) => l.map((p) => (p.kode === t.kodePromo ? { ...p, terpakai: Math.max(0, p.terpakai - 1) } : p)));
    umumkan(`${nomor} dibatalkan, stok dikembalikan.`);
    return berhasil;
  }

  /* ---------------- pengguna dan pengaturan ---------------- */

  function tambahPengguna(nama: string, p: PeranSlug): Hasil {
    const n = nama.trim();
    if (n.length < 3) return gagal('Tulis nama pengguna, minimal 3 huruf.');
    if (pengguna.some((u) => u.nama.toLowerCase() === n.toLowerCase())) return gagal(`${n} sudah terdaftar.`);
    setPengguna((l) => [
      ...l,
      { id: `U${Date.now().toString(36)}`, nama: n, peran: p, aktif: true, terakhir: 'Belum pernah masuk' },
    ]);
    umumkan(`${n} ditambahkan sebagai ${p}.`);
    return berhasil;
  }

  function ubahPengguna(id: string, patch: Partial<Pengguna>): Hasil {
    const u = pengguna.find((x) => x.id === id);
    if (!u) return gagal('Pengguna tidak ditemukan.');
    if (u.id === akun.id && (patch.aktif === false || (patch.peran && patch.peran !== u.peran)))
      return gagal('Kamu tidak bisa menonaktifkan atau menurunkan akunmu sendiri.');
    // Harus selalu ada satu admin aktif, kalau tidak tidak ada yang bisa mengelola.
    const adminAktifLain = pengguna.filter((x) => x.id !== id && x.peran === 'admin' && x.aktif).length;
    if (u.peran === 'admin' && adminAktifLain === 0 && (patch.aktif === false || patch.peran === 'kasir'))
      return gagal('Harus ada minimal satu admin yang aktif.');
    setPengguna((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    return berhasil;
  }

  function ubahPengaturan(patch: Partial<Pengaturan>) {
    setPengaturan((p) => ({ ...p, ...patch }));
  }

  function reset() {
    setKategori(kategoriAwal);
    setProduk(awalProduk());
    setPromo(promoAwal());
    setTransaksi(buatTransaksiAwal(produkAwal, Date.now()));
    setPengguna(penggunaAwal);
    setPengaturan(pengaturanAwal);
    setMutasi([]);
    setKeranjang([]);
    umumkan('Demo dikembalikan ke keadaan awal.');
  }

  const nilai: Toko = {
    kategori,
    produk,
    peta,
    promo,
    transaksi,
    pengguna,
    pengaturan,
    mutasi,
    keranjang,
    peran,
    setPeran,
    akun,
    izin,
    sekarang,
    kabar,
    umumkan,
    tambahProduk,
    ubahProduk,
    hapusProduk,
    sesuaikanStok,
    tambahKategori,
    ubahKategori,
    hapusKategori,
    geserKategori,
    simpanPromo,
    hapusPromo,
    jedaPromo,
    tambahKeKeranjang,
    ubahJumlah,
    hapusDariKeranjang,
    kosongkanKeranjang,
    hitung,
    bayar,
    batalkan,
    tambahPengguna,
    ubahPengguna,
    ubahPengaturan,
    reset,
  };

  return <Konteks.Provider value={nilai}>{children}</Konteks.Provider>;
}
