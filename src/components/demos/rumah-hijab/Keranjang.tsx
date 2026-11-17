import { useEffect, useState } from 'react';
import {
  produk as daftarProduk,
  rupiah,
  toko,
  GRATIS_ONGKIR_DARI,
} from '../../../data/rumah-hijab';
import {
  bacaKeranjang,
  hitungTotal,
  tulisKeranjang,
  PERISTIWA,
  type Baris,
} from './keranjang';

/**
 * Tombol keranjang di kepala toko, sekaligus laci isinya dan checkout.
 *
 * Dipasang di tiap halaman. Isinya dibaca dari localStorage dan ikut
 * berubah saat halaman lain menambah barang, lewat peristiwa window.
 */

interface Props {
  /** Alamat foto per slug, dioptimalkan di sisi Astro. */
  foto: Record<string, string>;
}

const peta = Object.fromEntries(daftarProduk.map((p) => [p.slug, p]));

export default function Keranjang({ foto }: Props) {
  const [isi, setIsi] = useState<Baris[]>([]);
  const [buka, setBuka] = useState(false);
  const [langkah, setLangkah] = useState<'isi' | 'data'>('isi');
  const [nama, setNama] = useState('');
  const [telepon, setTelepon] = useState('');
  const [alamat, setAlamat] = useState('');
  const [salah, setSalah] = useState('');

  useEffect(() => {
    const muat = () => setIsi(bacaKeranjang());
    muat();
    window.addEventListener(PERISTIWA, muat);
    // Tab lain di browser yang sama ikut disamakan.
    window.addEventListener('storage', muat);
    return () => {
      window.removeEventListener(PERISTIWA, muat);
      window.removeEventListener('storage', muat);
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && buka) setBuka(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [buka]);

  const hitung = hitungTotal(isi);
  const kurangGratis = GRATIS_ONGKIR_DARI - hitung.subtotal;

  function ubah(i: number, delta: number) {
    const baru = [...isi];
    baru[i] = { ...baru[i], jumlah: baru[i].jumlah + delta };
    tulisKeranjang(baru.filter((b) => b.jumlah > 0));
  }

  function hapus(i: number) {
    tulisKeranjang(isi.filter((_, x) => x !== i));
  }

  const pesan = [
    `Halo ${toko.nama}, saya mau pesan:`,
    '',
    ...isi.map((b) => {
      const p = peta[b.slug];
      const rinci = [b.warna, b.ukuran].filter(Boolean).join(', ');
      return `• ${p.nama} (${rinci}) × ${b.jumlah} — ${rupiah(p.harga * b.jumlah)}`;
    }),
    '',
    `Subtotal: ${rupiah(hitung.subtotal)}`,
    `Ongkir: ${hitung.ongkir === 0 ? 'Gratis' : rupiah(hitung.ongkir)}`,
    `Total: ${rupiah(hitung.total)}`,
    '',
    `Nama: ${nama}`,
    `WhatsApp: ${telepon}`,
    `Alamat: ${alamat}`,
  ].join('\n');

  function lanjut() {
    if (isi.length === 0) return;
    setSalah('');
    setLangkah('data');
  }

  function periksa(e: React.MouseEvent<HTMLAnchorElement>) {
    if (nama.trim().length < 3) {
      e.preventDefault();
      setSalah('Tulis nama penerima, minimal 3 huruf.');
      return;
    }
    if (!/^0\d{8,13}$/.test(telepon.replace(/[\s-]/g, ''))) {
      e.preventDefault();
      setSalah('Tulis nomor WhatsApp aktif, contoh 081234567890.');
      return;
    }
    if (alamat.trim().length < 15) {
      e.preventDefault();
      setSalah('Tulis alamat lengkap beserta kecamatan dan kode pos.');
      return;
    }
    setSalah('');
  }

  const inputCls =
    'mt-1.5 w-full rounded-control border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand';

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setBuka(true);
          setLangkah('isi');
        }}
        className="relative inline-flex min-h-11 items-center gap-2 rounded-control border border-line-strong px-4 text-sm font-semibold hover:border-brand hover:text-brand"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
          aria-hidden="true"
        >
          <path d="M3 5h2l1.5 9h9L17 7H6" />
          <circle cx="8" cy="17" r="1" />
          <circle cx="15" cy="17" r="1" />
        </svg>
        <span className="hidden sm:inline">Keranjang</span>
        {hitung.item > 0 && (
          <span className="tabular grid size-5 place-items-center rounded-full bg-brand text-[11px] font-bold text-white">
            {hitung.item}
          </span>
        )}
      </button>

      {buka && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-ink/40"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setBuka(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Keranjang belanja"
            className="masuk-kanan flex h-dvh w-full flex-col bg-surface sm:w-[26rem]"
          >
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
              <h2 className="font-display text-xl">
                {langkah === 'isi' ? 'Keranjang' : 'Data pengiriman'}
              </h2>
              <button
                type="button"
                onClick={() => setBuka(false)}
                aria-label="Tutup keranjang"
                className="-mr-2 grid size-11 place-items-center rounded-control text-xl text-ink-muted hover:bg-surface-alt"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {isi.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="font-display text-lg">Keranjangmu masih kosong</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    Pilih hijab atau gamis dulu, nanti muncul di sini.
                  </p>
                  <a
                    href="/porto/rumah-hijab/produk"
                    className="mt-5 inline-flex min-h-11 items-center rounded-control bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong"
                  >
                    Lihat semua produk
                  </a>
                </div>
              ) : langkah === 'isi' ? (
                <>
                  <ul className="flex flex-col gap-4">
                    {isi.map((b, i) => {
                      const p = peta[b.slug];
                      return (
                        <li key={`${b.slug}-${b.warna}-${b.ukuran ?? ''}`} className="flex gap-3">
                          <img
                            src={foto[b.slug]}
                            alt=""
                            width={64}
                            height={80}
                            loading="lazy"
                            className="h-20 w-16 shrink-0 rounded-control bg-surface-alt object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">{p.nama}</p>
                            <p className="text-xs text-ink-muted">
                              {[b.warna, b.ukuran].filter(Boolean).join(' · ')}
                            </p>
                            <p className="tabular mt-1 text-sm font-semibold text-brand">
                              {rupiah(p.harga * b.jumlah)}
                            </p>

                            <div className="mt-2 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => ubah(i, -1)}
                                aria-label={`Kurangi ${p.nama}`}
                                className="grid size-8 place-items-center rounded-full border border-line font-bold hover:bg-surface-alt"
                              >
                                &minus;
                              </button>
                              <span className="tabular w-6 text-center text-sm font-semibold">
                                {b.jumlah}
                              </span>
                              <button
                                type="button"
                                onClick={() => ubah(i, 1)}
                                aria-label={`Tambah ${p.nama}`}
                                className="grid size-8 place-items-center rounded-full border border-line font-bold hover:bg-surface-alt"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() => hapus(i)}
                                className="ml-auto text-xs font-semibold text-ink-muted hover:text-brand"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {hitung.ongkir > 0 && (
                    <p className="mt-5 rounded-card bg-accent-soft px-4 py-3 text-xs text-accent-strong">
                      Belanja {rupiah(kurangGratis)} lagi untuk dapat gratis ongkir.
                    </p>
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="nama" className="text-sm font-medium text-ink-muted">
                      Nama penerima <span className="text-brand">*</span>
                    </label>
                    <input
                      id="nama"
                      type="text"
                      autoComplete="name"
                      value={nama}
                      onChange={(e) => {
                        setNama(e.target.value);
                        setSalah('');
                      }}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label htmlFor="telepon" className="text-sm font-medium text-ink-muted">
                      Nomor WhatsApp <span className="text-brand">*</span>
                    </label>
                    <input
                      id="telepon"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="081234567890"
                      value={telepon}
                      onChange={(e) => {
                        setTelepon(e.target.value);
                        setSalah('');
                      }}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label htmlFor="alamat" className="text-sm font-medium text-ink-muted">
                      Alamat lengkap <span className="text-brand">*</span>
                    </label>
                    <textarea
                      id="alamat"
                      rows={4}
                      autoComplete="street-address"
                      placeholder="Jalan, nomor rumah, kelurahan, kecamatan, kota, kode pos"
                      value={alamat}
                      onChange={(e) => {
                        setAlamat(e.target.value);
                        setSalah('');
                      }}
                      className={inputCls}
                    />
                  </div>

                  <p className="rounded-card bg-surface-alt px-4 py-3 text-xs text-ink-muted">
                    Datamu tidak dikirim ke mana pun. Di demo ini isian tadi hanya
                    disusun jadi pesan WhatsApp yang bisa kamu periksa dulu sebelum
                    dikirim.
                  </p>
                </div>
              )}
            </div>

            {isi.length > 0 && (
              <div className="border-t border-line px-5 py-4">
                <dl className="flex flex-col gap-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink-muted">Subtotal</dt>
                    <dd className="tabular">{rupiah(hitung.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-muted">Ongkir</dt>
                    <dd className="tabular">
                      {hitung.ongkir === 0 ? 'Gratis' : rupiah(hitung.ongkir)}
                    </dd>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between border-t border-line pt-2">
                    <dt className="font-semibold">Total</dt>
                    <dd className="tabular font-display text-2xl text-brand">
                      {rupiah(hitung.total)}
                    </dd>
                  </div>
                </dl>

                {salah !== '' && (
                  <p role="alert" className="mt-3 text-sm font-medium text-brand-strong">
                    {salah}
                  </p>
                )}

                {langkah === 'isi' ? (
                  <button
                    type="button"
                    onClick={lanjut}
                    className="mt-4 min-h-12 w-full rounded-control bg-brand font-semibold text-white hover:bg-brand-strong"
                  >
                    Lanjut ke pengiriman
                  </button>
                ) : (
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setLangkah('isi')}
                      className="min-h-12 shrink-0 rounded-control border border-line px-5 text-sm font-semibold hover:bg-surface-alt"
                    >
                      Kembali
                    </button>
                    <a
                      href={`https://wa.me/${toko.whatsapp}?text=${encodeURIComponent(pesan)}`}
                      target="_blank"
                      rel="noopener"
                      onClick={periksa}
                      className="flex min-h-12 flex-1 items-center justify-center rounded-control bg-brand px-5 font-semibold text-white hover:bg-brand-strong"
                    >
                      Pesan lewat WhatsApp
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
