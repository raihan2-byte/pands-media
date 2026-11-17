import { useMemo, useState } from 'react';
import {
  alasanPromoTidakBerlaku,
  hitungPotonganPromo,
  rupiah,
  statusStok,
  type Metode,
  type Transaksi,
} from '../../../data/warung-maju';
import { Struk } from './Struk';
import { useToko } from './store';
import { cls, FotoProduk, IsianRupiah, Kosong, Medan, Panel } from './ui';

/** Tulis nominal sependek mungkin: 50000 jadi "50rb", 21500 tetap utuh. */
function labelUang(n: number): string {
  return n % 1000 === 0 ? `${n / 1000}rb` : rupiah(n);
}

export default function Kasir() {
  const t = useToko();
  const [kat, setKat] = useState<string>('laris');
  const [cari, setCari] = useState('');
  const [bukaKeranjang, setBukaKeranjang] = useState(false);
  const [bukaBayar, setBukaBayar] = useState(false);
  const [struk, setStruk] = useState<Transaksi | null>(null);

  const dijual = useMemo(() => t.produk.filter((p) => p.aktif), [t.produk]);

  const tampil = useMemo(() => {
    const kata = cari.trim().toLowerCase();
    return dijual.filter((p) => {
      if (kata) return `${p.nama} ${p.kode}`.toLowerCase().includes(kata);
      if (kat === 'laris') return p.laris;
      if (kat === 'semua') return true;
      return p.kategoriId === kat;
    });
  }, [dijual, cari, kat]);

  const tagihan = t.hitung('', 0);
  const adaIsi = t.keranjang.length > 0;

  const chips = [
    { id: 'laris', nama: 'Laris' },
    { id: 'semua', nama: 'Semua' },
    ...t.kategori.map((k) => ({ id: k.id, nama: k.nama })),
  ];

  return (
    <div className="flex flex-col lg:h-full lg:flex-row">
      <section className="flex min-w-0 flex-1 flex-col lg:min-h-0">
        {/* Pencarian dan kategori menempel di atas, daftar barang menggulir di bawahnya. */}
        <div className="shrink-0 border-b border-line bg-surface px-3 py-3 sm:px-4">
          <label htmlFor="cari-barang" className="sr-only">
            Cari barang atau kode
          </label>
          <input
            id="cari-barang"
            type="search"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari barang atau kode…"
            className="h-12 w-full rounded-control border border-line-strong bg-surface-alt px-4 text-base outline-none focus:border-brand focus:bg-surface"
          />
          <div
            className="mt-3 flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="Kelompok barang"
          >
            {chips.map((c) => {
              const aktif = kat === c.id && cari === '';
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setKat(c.id);
                    setCari('');
                  }}
                  aria-pressed={aktif}
                  className={[
                    'min-h-11 shrink-0 rounded-control border px-4 text-sm font-semibold whitespace-nowrap',
                    aktif
                      ? 'border-brand bg-brand text-white'
                      : 'border-line-strong bg-surface text-ink-muted hover:text-ink',
                  ].join(' ')}
                >
                  {c.nama}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3 pb-28 sm:p-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pb-4">
          {tampil.length === 0 ? (
            <Kosong
              judul={cari ? `Tidak ada barang “${cari}”` : 'Belum ada barang di sini'}
              isi={
                cari
                  ? 'Coba kata lain atau kodenya.'
                  : 'Admin bisa menambah produk lewat menu Produk.'
              }
            />
          ) : (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3">
              {tampil.map((p) => {
                const s = statusStok(p.stok, p.minimum);
                const di = t.keranjang.find((b) => b.kode === p.kode)?.jumlah ?? 0;
                return (
                  <li key={p.kode}>
                    <button
                      type="button"
                      onClick={() => t.tambahKeKeranjang(p.kode)}
                      disabled={p.stok <= 0}
                      aria-label={`${p.nama}, ${rupiah(p.harga)}, ${p.stok <= 0 ? 'stok habis' : `sisa ${p.stok}`}${di ? `, ${di} di keranjang` : ''}`}
                      className={[
                        'relative flex h-full w-full flex-col overflow-hidden rounded-card border bg-surface text-left',
                        'transition-colors duration-150 motion-reduce:transition-none',
                        p.stok <= 0
                          ? 'cursor-not-allowed border-line opacity-60'
                          : 'border-line hover:border-brand active:bg-brand-soft',
                      ].join(' ')}
                    >
                      {di > 0 && (
                        <span className="tabular absolute top-2 right-2 z-10 grid size-6 place-items-center rounded-full bg-brand text-xs font-bold text-white">
                          {di}
                        </span>
                      )}
                      <FotoProduk
                        produk={p}
                        className={`aspect-4/3 w-full text-3xl ${p.stok <= 0 ? 'grayscale' : ''}`}
                      />
                      <span className="flex flex-1 flex-col p-2.5">
                        <span className="text-sm leading-snug font-semibold">{p.nama}</span>
                        <span className="tabular mt-auto block pt-1.5 font-display font-extrabold text-brand-strong">
                          {rupiah(p.harga)}
                        </span>
                        <span
                          className={`tabular block text-[11px] ${
                            s === 'habis'
                              ? 'font-semibold text-red-700'
                              : s === 'menipis'
                                ? 'font-semibold text-amber-700'
                                : 'text-ink-muted'
                          }`}
                        >
                          {s === 'habis' ? 'Stok habis' : `Sisa ${p.stok}`}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Keranjang tetap di sisi kanan pada layar lebar. */}
      <aside className="hidden w-[22rem] shrink-0 flex-col border-l border-line bg-surface lg:flex lg:min-h-0">
        <IsiKeranjang onBayar={() => setBukaBayar(true)} />
      </aside>

      {/* Di ponsel, palang bawah membuka keranjang sebagai lembar. */}
      {adaIsi && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface p-3 lg:hidden">
          <button
            type="button"
            onClick={() => setBukaKeranjang(true)}
            className="flex min-h-13 w-full items-center justify-between gap-3 rounded-control bg-brand px-4 font-bold text-white"
          >
            <span className="tabular flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-full bg-white/20 text-sm">
                {tagihan.item}
              </span>
              Lihat keranjang
            </span>
            <span className="tabular text-lg">{rupiah(tagihan.subtotal)}</span>
          </button>
        </div>
      )}

      {bukaKeranjang && (
        <Panel judul="Keranjang" ukuran="sm" onTutup={() => setBukaKeranjang(false)}>
          <div className="-mx-5 -my-4 flex max-h-[70dvh] flex-col">
            <IsiKeranjang
              tanpaJudul
              onBayar={() => {
                setBukaBayar(true);
              }}
            />
          </div>
        </Panel>
      )}

      {bukaBayar && (
        <Pembayaran
          onTutup={() => setBukaBayar(false)}
          onSelesai={(trx) => {
            setBukaBayar(false);
            setBukaKeranjang(false);
            setStruk(trx);
          }}
        />
      )}

      {struk && <Struk t={struk} onTutup={() => setStruk(null)} tombolTutup="Transaksi baru" />}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function IsiKeranjang({
  onBayar,
  tanpaJudul = false,
}: {
  onBayar: () => void;
  tanpaJudul?: boolean;
}) {
  const t = useToko();
  const tagihan = t.hitung('', 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {!tanpaJudul && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 className="text-base">
            Keranjang <span className="tabular font-normal text-ink-muted">({tagihan.item})</span>
          </h2>
          {t.keranjang.length > 0 && (
            <button
              type="button"
              onClick={t.kosongkanKeranjang}
              className="min-h-9 rounded-control px-3 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              Kosongkan
            </button>
          )}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-4">
        {t.keranjang.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-muted">
            Belum ada barang. Ketuk barang di sebelah kiri untuk menambahkan.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {t.keranjang.map((b) => {
              const p = t.peta[b.kode];
              if (!p) return null;
              return (
                <li key={b.kode} className="flex items-center gap-3 py-3">
                  <FotoProduk produk={p} className="size-11 shrink-0 rounded-control text-sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{p.nama}</span>
                    <span className="tabular block text-xs text-ink-muted">
                      {rupiah(p.harga)} × {b.jumlah}
                    </span>
                    <span className="tabular block text-sm font-bold">{rupiah(p.harga * b.jumlah)}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => t.ubahJumlah(b.kode, -1)}
                      aria-label={`Kurangi ${p.nama}`}
                      className="grid size-9 place-items-center rounded-full border border-line-strong font-bold hover:bg-surface-alt"
                    >
                      &minus;
                    </button>
                    <span className="tabular w-6 text-center text-sm font-semibold">{b.jumlah}</span>
                    <button
                      type="button"
                      onClick={() => t.ubahJumlah(b.kode, 1)}
                      aria-label={`Tambah ${p.nama}`}
                      disabled={b.jumlah >= p.stok}
                      className="grid size-9 place-items-center rounded-full border border-line-strong font-bold hover:bg-surface-alt disabled:opacity-40"
                    >
                      +
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="shrink-0 border-t border-line p-4">
        <dl className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Jumlah barang</dt>
            <dd className="tabular">{tagihan.item}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-line pt-2">
            <dt className="font-semibold">Subtotal</dt>
            <dd className="tabular font-display text-2xl font-extrabold text-brand-strong">
              {rupiah(tagihan.subtotal)}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={onBayar}
          disabled={t.keranjang.length === 0}
          className={`${cls.btnUtama} mt-3 min-h-13 w-full text-base`}
        >
          Bayar
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Pembayaran({
  onTutup,
  onSelesai,
}: {
  onTutup: () => void;
  onSelesai: (t: Transaksi) => void;
}) {
  const t = useToko();
  const metodeAktif = (['Tunai', 'Transfer', 'QRIS'] as Metode[]).filter((m) => t.pengaturan.metodeAktif[m]);
  const bolehDiskon = t.peran === 'admin' || t.pengaturan.kasirBolehDiskon;

  const [pelanggan, setPelanggan] = useState('');
  const [metode, setMetode] = useState<Metode>(metodeAktif[0] ?? 'Tunai');
  const [kodePromo, setKodePromo] = useState('');
  const [potManual, setPotManual] = useState(0);
  const [uang, setUang] = useState(0);
  const [salah, setSalah] = useState('');

  const tagihan = t.hitung(kodePromo, bolehDiskon ? potManual : 0);
  const sekarang = t.sekarang();
  const subtotal = t.hitung('', 0).subtotal;
  const promoDipilih = t.promo.find((p) => p.kode === kodePromo);
  const alasanPromo = promoDipilih ? alasanPromoTidakBerlaku(promoDipilih, subtotal, sekarang) : '';

  const kurang = metode === 'Tunai' && uang < tagihan.total;
  const belumIsi = metode === 'Tunai' && uang === 0;

  // Nominal yang paling mungkin diserahkan pembeli: pas, lalu pembulatan ke atas.
  const saran = useMemo(() => {
    const total = tagihan.total;
    const pilihan = new Set<number>([total]);
    for (const p of [5000, 10000, 20000, 50000, 100000]) {
      const bulat = Math.ceil(total / p) * p;
      if (bulat > total) pilihan.add(bulat);
    }
    return [...pilihan].sort((a, b) => a - b).slice(0, 4);
  }, [tagihan.total]);

  // Promo yang bisa dipakai naik ke atas daftar, yang tidak bisa diberi alasannya.
  const daftarPromo = useMemo(
    () =>
      t.promo
        .map((p) => ({ p, alasan: alasanPromoTidakBerlaku(p, subtotal, sekarang) }))
        .sort((a, b) => Number(a.alasan !== '') - Number(b.alasan !== '')),
    [t.promo, subtotal, sekarang],
  );

  function bayar() {
    const h = t.bayar({ pelanggan, metode, kodePromo, potManual: bolehDiskon ? potManual : 0, bayar: uang });
    if (!h.ok || !h.transaksi) {
      setSalah(h.pesan ?? 'Pembayaran gagal.');
      return;
    }
    onSelesai(h.transaksi);
  }

  return (
    <Panel
      judul="Pembayaran"
      ukuran="md"
      onTutup={onTutup}
      kaki={
        <div>
          {salah !== '' && (
            <p role="alert" className="mb-2 text-sm font-medium text-red-700">
              {salah}
            </p>
          )}
          <button type="button" onClick={bayar} className={`${cls.btnUtama} min-h-13 w-full text-base`}>
            Bayar {rupiah(tagihan.total)}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Isi keranjang masih bisa diubah dari sini. Pembeli sering menambah
            satu gorengan saat kasir sudah membuka layar bayar. */}
        <ul className="max-h-40 overflow-y-auto">
          {t.keranjang.map((b) => {
            const p = t.peta[b.kode];
            if (!p) return null;
            return (
              <li key={b.kode} className="flex items-center gap-3 py-1.5 text-sm">
                <span className="min-w-0 flex-1 truncate">
                  {p.nama} <span className="tabular text-ink-muted">×{b.jumlah}</span>
                </span>
                <span className="tabular shrink-0 font-medium">{rupiah(p.harga * b.jumlah)}</span>
                <span className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => t.ubahJumlah(b.kode, -1)}
                    aria-label={`Kurangi ${p.nama}`}
                    className="grid size-8 place-items-center rounded-full border border-line-strong font-bold hover:bg-surface-alt"
                  >
                    &minus;
                  </button>
                  <button
                    type="button"
                    onClick={() => t.ubahJumlah(b.kode, 1)}
                    aria-label={`Tambah ${p.nama}`}
                    disabled={b.jumlah >= p.stok}
                    className="grid size-8 place-items-center rounded-full border border-line-strong font-bold hover:bg-surface-alt disabled:opacity-40"
                  >
                    +
                  </button>
                </span>
              </li>
            );
          })}
        </ul>

        <div className="flex justify-between border-t border-line pt-3 text-sm font-semibold">
          <span>Subtotal</span>
          <span className="tabular">{rupiah(subtotal)}</span>
        </div>

        <Medan label="Nama pelanggan" wajib>
          {(a) => (
            <input
              {...a}
              type="text"
              autoComplete="off"
              value={pelanggan}
              onChange={(e) => {
                setPelanggan(e.target.value);
                setSalah('');
              }}
              className={cls.input}
              data-fokus-awal
            />
          )}
        </Medan>

        <Medan label="Metode pembayaran">
          {(a) => (
            <select
              {...a}
              value={metode}
              onChange={(e) => {
                setMetode(e.target.value as Metode);
                setUang(0);
                setSalah('');
              }}
              className={cls.input}
            >
              {metodeAktif.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          )}
        </Medan>

        <Medan
          label="Kode promo (opsional)"
          bantu={
            kodePromo !== '' && alasanPromo !== ''
              ? undefined
              : promoDipilih && tagihan.promo
                ? `Potongan ${rupiah(hitungPotonganPromo(promoDipilih, subtotal))}`
                : undefined
          }
          salah={kodePromo !== '' && alasanPromo !== '' ? `${promoDipilih?.kode} belum berlaku: ${alasanPromo}.` : undefined}
        >
          {(a) => (
            <select
              {...a}
              value={kodePromo}
              onChange={(e) => {
                setKodePromo(e.target.value);
                setSalah('');
              }}
              className={cls.input}
            >
              <option value="">Tanpa promo</option>
              {daftarPromo.map(({ p, alasan }) => (
                <option key={p.id} value={p.kode} disabled={alasan !== ''}>
                  {p.kode} — {p.nama}
                  {alasan ? ` (${alasan})` : ''}
                </option>
              ))}
            </select>
          )}
        </Medan>

        {bolehDiskon ? (
          <Medan label="Diskon manual (opsional)">
            {(a) => <IsianRupiah {...a} nilai={potManual} onUbah={setPotManual} />}
          </Medan>
        ) : (
          <p className="rounded-control bg-surface-alt px-3 py-2 text-xs text-ink-muted">
            Diskon manual hanya bisa diberikan admin.
          </p>
        )}

        {metode === 'Tunai' && (
          <div>
            <Medan label="Uang diterima" wajib>
              {(a) => (
                <IsianRupiah
                  {...a}
                  nilai={uang}
                  onUbah={(n) => {
                    setUang(n);
                    setSalah('');
                  }}
                />
              )}
            </Medan>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {saran.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setUang(n);
                    setSalah('');
                  }}
                  className="tabular min-h-10 rounded-control border border-line-strong px-1 text-xs font-semibold hover:bg-surface-alt"
                >
                  {n === tagihan.total ? 'Uang pas' : labelUang(n)}
                </button>
              ))}
            </div>
          </div>
        )}

        {metode === 'QRIS' && (
          <div className="rounded-card border border-line p-4 text-center">
            <KodeQr />
            <p className="mt-3 text-sm font-semibold">Tunjukkan ke pembeli</p>
            <p className="mt-1 text-xs text-ink-muted">
              Kode contoh. Di sistem asli, kode dibuat per transaksi oleh penyedia pembayaran.
            </p>
          </div>
        )}

        {metode === 'Transfer' && (
          <div className="rounded-card border border-line p-4 text-sm">
            <p className="font-semibold">Rekening warung</p>
            <p className="tabular mt-1">BCA 1234567890</p>
            <p className="text-ink-muted">a.n. {t.pengaturan.nama}</p>
            <p className="mt-2 text-xs text-ink-muted">Cek mutasi dulu sebelum menyelesaikan transaksi.</p>
          </div>
        )}

        <dl className="flex flex-col gap-1.5 border-t border-line pt-4 text-sm">
          {tagihan.potPromo > 0 && (
            <div className="flex justify-between text-brand-strong">
              <dt>Promo {tagihan.promo?.kode}</dt>
              <dd className="tabular">&minus;{rupiah(tagihan.potPromo)}</dd>
            </div>
          )}
          {tagihan.potManual > 0 && (
            <div className="flex justify-between text-brand-strong">
              <dt>Diskon manual</dt>
              <dd className="tabular">&minus;{rupiah(tagihan.potManual)}</dd>
            </div>
          )}
          {tagihan.pajak > 0 && (
            <div className="flex justify-between">
              <dt className="text-ink-muted">Pajak {t.pengaturan.pajak}%</dt>
              <dd className="tabular">{rupiah(tagihan.pajak)}</dd>
            </div>
          )}
          <div className="flex items-baseline justify-between">
            <dt className="font-semibold">Total bayar</dt>
            <dd aria-live="polite" className="tabular font-display text-2xl font-extrabold text-brand-strong">
              {rupiah(tagihan.total)}
            </dd>
          </div>
          {metode === 'Tunai' && !belumIsi && (
            <div
              aria-live="polite"
              className={`flex justify-between ${kurang ? 'font-medium text-red-700' : 'text-ink-muted'}`}
            >
              <dt>{kurang ? 'Kurang' : 'Kembalian'}</dt>
              <dd className="tabular">{rupiah(Math.abs(uang - tagihan.total))}</dd>
            </div>
          )}
        </dl>
      </div>
    </Panel>
  );
}

/** Gambar kode QR contoh. Tidak memuat data apa pun. */
function KodeQr() {
  const kotak = [
    [1, 1, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 1, 0, 0, 1, 1, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1],
    [0, 0, 0, 0, 1, 1, 0, 0, 0],
    [1, 0, 1, 1, 0, 1, 1, 0, 1],
    [0, 1, 1, 0, 1, 0, 0, 1, 0],
    [1, 1, 1, 0, 0, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 0],
    [1, 1, 1, 0, 1, 1, 1, 0, 1],
  ];
  return (
    <div
      className="mx-auto grid w-36 grid-cols-9 gap-0.5 rounded-control border border-line bg-white p-2"
      role="img"
      aria-label="Contoh kode QR pembayaran"
    >
      {kotak.flat().map((v, i) => (
        <span key={i} className={v ? 'aspect-square bg-ink' : 'aspect-square bg-white'} />
      ))}
    </div>
  );
}
