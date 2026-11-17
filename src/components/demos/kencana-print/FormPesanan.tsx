import { useMemo, useRef, useState } from 'react';
import type { Produk } from '../../../data/kencana-print';

/**
 * Alur pesan empat langkah: spesifikasi, desain, pengiriman, ringkasan.
 *
 * Semua berjalan di browser. Berkas desain tidak dikirim ke mana pun — hanya
 * dibaca untuk ditampilkan namanya dan pratinjaunya. Tidak ada server dan
 * tidak ada basis data, jadi isian kembali kosong setiap halaman dimuat ulang.
 */

interface Props {
  produk: Produk;
  whatsapp: string;
}

const BIAYA_DESAIN = 50000;
const ONGKIR = 15000;
const GRATIS_ONGKIR_DARI = 150000;

const langkah = ['Spesifikasi', 'Desain', 'Pengiriman', 'Ringkasan'] as const;

function rupiah(n: number): string {
  return 'Rp' + Math.round(n).toLocaleString('id-ID');
}

function ukuranBerkas(b: number): string {
  return b > 1024 * 1024
    ? `${(b / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(b / 1024))} KB`;
}

export default function FormPesanan({ produk, whatsapp }: Props) {
  const perMeter = produk.satuan === 'm2';
  const satuanKata = produk.satuan === 'm2' ? 'lembar' : produk.satuan;

  const [step, setStep] = useState(0);

  // Langkah 1
  const [lebar, setLebar] = useState(300);
  const [tinggi, setTinggi] = useState(100);
  const [jumlah, setJumlah] = useState(produk.minimal);
  const [bahan, setBahan] = useState(0);
  const [finishing, setFinishing] = useState(0);

  // Langkah 2
  const [berkas, setBerkas] = useState<File | null>(null);
  const [pratinjau, setPratinjau] = useState<string | null>(null);
  const [mintaDesain, setMintaDesain] = useState(false);
  const inputBerkas = useRef<HTMLInputElement>(null);

  // Langkah 3
  const [nama, setNama] = useState('');
  const [telepon, setTelepon] = useState('');
  const [kirim, setKirim] = useState<'ambil' | 'antar'>('ambil');
  const [alamat, setAlamat] = useState('');
  const [catatan, setCatatan] = useState('');

  const [salah, setSalah] = useState<Record<string, string>>({});
  const ringkasanSalah = useRef<HTMLDivElement>(null);

  const hitung = useMemo(() => {
    const fBahan = produk.bahan?.[bahan]?.faktor ?? 1;
    const fFinishing = produk.finishing?.[finishing]?.faktor ?? 1;

    // Luas dibulatkan ke atas per 0,25 m², kebiasaan umum percetakan.
    const luasAsli = perMeter ? (lebar / 100) * (tinggi / 100) : 0;
    const luas = perMeter ? Math.max(0.25, Math.ceil(luasAsli * 4) / 4) : 0;

    const banyak = Math.max(produk.minimal, jumlah || 0);
    const satuanDasar = produk.harga * fBahan * fFinishing;
    const cetak = perMeter ? satuanDasar * luas * banyak : satuanDasar * banyak;

    const dasarGrosir = perMeter ? luas * banyak : banyak;
    const tingkat = (produk.grosir ?? [])
      .filter((g) => dasarGrosir >= g.mulai)
      .sort((a, b) => b.potongan - a.potongan)[0];
    const potongan = tingkat ? (cetak * tingkat.potongan) / 100 : 0;

    const desain = mintaDesain ? BIAYA_DESAIN : 0;
    const subtotal = cetak - potongan + desain;
    const ongkir = kirim === 'antar' && subtotal < GRATIS_ONGKIR_DARI ? ONGKIR : 0;

    return {
      luas,
      luasAsli,
      banyak,
      satuanDasar,
      cetak,
      potongan,
      persen: tingkat?.potongan ?? 0,
      desain,
      ongkir,
      total: subtotal + ongkir,
    };
  }, [lebar, tinggi, jumlah, bahan, finishing, mintaDesain, kirim, perMeter, produk]);

  const berikutnya = (produk.grosir ?? [])
    .filter((g) => (perMeter ? hitung.luas * hitung.banyak : hitung.banyak) < g.mulai)
    .sort((a, b) => a.mulai - b.mulai)[0];

  function pilihBerkas(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (pratinjau) URL.revokeObjectURL(pratinjau);
    setBerkas(f);
    setPratinjau(f && f.type.startsWith('image/') ? URL.createObjectURL(f) : null);
    if (f) setSalah((s) => ({ ...s, berkas: '' }));
  }

  function hapusBerkas() {
    if (pratinjau) URL.revokeObjectURL(pratinjau);
    setBerkas(null);
    setPratinjau(null);
    if (inputBerkas.current) inputBerkas.current.value = '';
  }

  /** Memeriksa satu langkah. Mengembalikan daftar kesalahan yang ditemukan. */
  function periksa(n: number): Record<string, string> {
    const e: Record<string, string> = {};
    if (n === 0) {
      if (perMeter && (lebar < 10 || tinggi < 10)) {
        e.ukuran = 'Lebar dan tinggi minimal 10 cm.';
      }
      if (jumlah < produk.minimal) {
        e.jumlah = `Minimal pesan ${produk.minimal} ${satuanKata}.`;
      }
    }
    if (n === 1 && !berkas && !mintaDesain) {
      e.berkas = 'Pilih berkas desain, atau centang minta dibuatkan desain.';
    }
    if (n === 2) {
      if (nama.trim().length < 3) e.nama = 'Tulis nama lengkap, minimal 3 huruf.';
      if (!/^0\d{8,13}$/.test(telepon.replace(/[\s-]/g, ''))) {
        e.telepon = 'Tulis nomor WhatsApp aktif, contoh 081234567890.';
      }
      if (kirim === 'antar' && alamat.trim().length < 10) {
        e.alamat = 'Tulis alamat lengkap beserta patokan.';
      }
    }
    return e;
  }

  function lanjut() {
    const e = periksa(step);
    setSalah(e);
    if (Object.keys(e).length > 0) {
      // Fokus dipindah ke ringkasan kesalahan supaya pemakai pembaca layar
      // langsung tahu ada yang perlu diperbaiki.
      requestAnimationFrame(() => ringkasanSalah.current?.focus());
      return;
    }
    setStep((s) => Math.min(langkah.length - 1, s + 1));
  }

  const pesan = [
    'Halo Kencana Print, saya mau pesan:',
    '',
    `Produk: ${produk.nama}`,
    perMeter ? `Ukuran: ${lebar} x ${tinggi} cm (${hitung.luas} m²)` : null,
    `Jumlah: ${hitung.banyak} ${satuanKata}`,
    produk.bahan ? `Bahan: ${produk.bahan[bahan].nama}` : null,
    produk.finishing ? `Finishing: ${produk.finishing[finishing].nama}` : null,
    berkas ? `Berkas desain: ${berkas.name}` : null,
    mintaDesain ? 'Minta dibuatkan desain: ya' : null,
    '',
    `Nama: ${nama}`,
    `WhatsApp: ${telepon}`,
    kirim === 'antar' ? `Diantar ke: ${alamat}` : 'Diambil sendiri di toko',
    catatan ? `Catatan: ${catatan}` : null,
    '',
    `Perkiraan total: ${rupiah(hitung.total)}`,
  ]
    .filter((b) => b !== null)
    .join('\n');

  const inputCls =
    'h-11 w-full rounded-control border border-line bg-surface px-3 text-sm outline-none ' +
    'focus:border-brand';
  const salahCls = 'border-red-500';

  return (
    <div className="rounded-card border border-line bg-surface">
      {/* Total selalu kelihatan, di langkah mana pun. */}
      <div className="flex items-baseline justify-between gap-4 border-b border-line px-4 py-3 sm:px-5">
        <span className="text-sm text-ink-muted">Perkiraan total</span>
        <span
          aria-live="polite"
          className="tabular font-display text-2xl font-extrabold text-brand-strong"
        >
          {rupiah(hitung.total)}
        </span>
      </div>

      {/* Penunjuk langkah. Angka plus nama, bukan warna saja. */}
      <ol className="flex gap-1 border-b border-line px-4 py-3 sm:px-5">
        {langkah.map((l, i) => (
          <li key={l} className="flex flex-1 items-center gap-1.5">
            <span
              className={[
                'tabular grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold',
                i < step
                  ? 'bg-brand text-white'
                  : i === step
                    ? 'bg-brand text-white ring-3 ring-brand-soft'
                    : 'bg-surface-alt text-ink-muted',
              ].join(' ')}
              aria-current={i === step ? 'step' : undefined}
            >
              {i < step ? '✓' : i + 1}
            </span>
            <span
              className={[
                'hidden truncate text-xs sm:block',
                i === step ? 'font-semibold text-ink' : 'text-ink-muted',
              ].join(' ')}
            >
              {l}
            </span>
          </li>
        ))}
      </ol>

      <div className="p-4 sm:p-5">
        {Object.values(salah).some(Boolean) && (
          <div
            ref={ringkasanSalah}
            tabIndex={-1}
            role="alert"
            className="mb-4 rounded-control border border-red-300 bg-red-50 p-3 text-sm text-red-800"
          >
            <p className="font-semibold">Ada yang perlu diperbaiki:</p>
            <ul className="mt-1 list-inside list-disc">
              {Object.entries(salah)
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <li key={k}>{v}</li>
                ))}
            </ul>
          </div>
        )}

        {/* ---------- Langkah 1: spesifikasi ---------- */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            {perMeter && (
              <fieldset>
                <legend className="text-sm font-semibold">Ukuran</legend>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="lebar" className="block text-xs text-ink-muted">
                      Lebar (cm)
                    </label>
                    <input
                      id="lebar"
                      type="number"
                      inputMode="numeric"
                      min={10}
                      value={lebar}
                      onChange={(e) => setLebar(Number(e.target.value))}
                      className={`mt-1 ${inputCls} ${salah.ukuran ? salahCls : ''}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="tinggi" className="block text-xs text-ink-muted">
                      Tinggi (cm)
                    </label>
                    <input
                      id="tinggi"
                      type="number"
                      inputMode="numeric"
                      min={10}
                      value={tinggi}
                      onChange={(e) => setTinggi(Number(e.target.value))}
                      className={`mt-1 ${inputCls} ${salah.ukuran ? salahCls : ''}`}
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-ink-muted">
                  Luas {hitung.luasAsli.toFixed(2)} m², dihitung{' '}
                  <strong className="font-semibold text-ink">{hitung.luas} m²</strong>.
                  Pembulatan ke atas per 0,25 m².
                </p>
              </fieldset>
            )}

            {produk.bahan && (
              <div>
                <label htmlFor="bahan" className="block text-sm font-semibold">
                  Bahan
                </label>
                <select
                  id="bahan"
                  value={bahan}
                  onChange={(e) => setBahan(Number(e.target.value))}
                  className={`mt-2 ${inputCls}`}
                >
                  {produk.bahan.map((b, i) => (
                    <option key={b.nama} value={i}>
                      {b.nama}
                      {b.faktor !== 1 ? ` (+${Math.round((b.faktor - 1) * 100)}%)` : ''}
                    </option>
                  ))}
                </select>
                {produk.bahan[bahan].catatan && (
                  <p className="mt-1.5 text-xs text-ink-muted">
                    {produk.bahan[bahan].catatan}
                  </p>
                )}
              </div>
            )}

            {produk.finishing && (
              <div>
                <label htmlFor="finishing" className="block text-sm font-semibold">
                  Finishing
                </label>
                <select
                  id="finishing"
                  value={finishing}
                  onChange={(e) => setFinishing(Number(e.target.value))}
                  className={`mt-2 ${inputCls}`}
                >
                  {produk.finishing.map((f, i) => (
                    <option key={f.nama} value={i}>
                      {f.nama}
                      {f.faktor !== 1 ? ` (+${Math.round((f.faktor - 1) * 100)}%)` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="jumlah" className="block text-sm font-semibold">
                Jumlah ({satuanKata})
              </label>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setJumlah((j) => Math.max(produk.minimal, j - 1))}
                  className="grid size-11 shrink-0 place-items-center rounded-control border border-line text-lg font-bold hover:bg-surface-alt"
                  aria-label="Kurangi jumlah"
                >
                  &minus;
                </button>
                <input
                  id="jumlah"
                  type="number"
                  inputMode="numeric"
                  min={produk.minimal}
                  value={jumlah}
                  onChange={(e) => setJumlah(Number(e.target.value))}
                  className={`${inputCls} text-center ${salah.jumlah ? salahCls : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setJumlah((j) => j + 1)}
                  className="grid size-11 shrink-0 place-items-center rounded-control border border-line text-lg font-bold hover:bg-surface-alt"
                  aria-label="Tambah jumlah"
                >
                  +
                </button>
              </div>
            </div>

            {berikutnya && (
              <p className="rounded-control bg-brand-soft px-3 py-2 text-xs text-brand-strong">
                Pesan {berikutnya.mulai}
                {perMeter ? ' m²' : ` ${satuanKata}`} atau lebih, potongannya jadi{' '}
                {berikutnya.potongan}%.
              </p>
            )}
          </div>
        )}

        {/* ---------- Langkah 2: desain ---------- */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="berkas" className="block text-sm font-semibold">
                Berkas desain
              </label>
              <p className="mt-1 text-xs text-ink-muted">
                PDF, AI, CDR, JPG, atau PNG. Resolusi minimal 150 dpi pada ukuran
                cetak.
              </p>
              <input
                ref={inputBerkas}
                id="berkas"
                type="file"
                accept=".pdf,.ai,.cdr,image/*"
                onChange={pilihBerkas}
                aria-describedby={salah.berkas ? 'berkas-salah' : undefined}
                className="mt-2 block w-full cursor-pointer rounded-control border border-dashed border-line-strong bg-surface-alt p-3 text-sm file:mr-3 file:rounded-control file:border-0 file:bg-brand file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
              />
              {salah.berkas && (
                <p id="berkas-salah" className="mt-1.5 text-xs font-medium text-red-700">
                  {salah.berkas}
                </p>
              )}
            </div>

            {berkas && (
              <div className="flex items-center gap-3 rounded-control border border-line p-3">
                {pratinjau ? (
                  <img
                    src={pratinjau}
                    alt=""
                    className="size-14 shrink-0 rounded-control object-cover"
                  />
                ) : (
                  <span className="grid size-14 shrink-0 place-items-center rounded-control bg-brand-soft text-xs font-bold text-brand-strong">
                    {(berkas.name.split('.').pop() ?? '').toUpperCase().slice(0, 4)}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{berkas.name}</span>
                  <span className="block text-xs text-ink-muted">
                    {ukuranBerkas(berkas.size)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={hapusBerkas}
                  className="shrink-0 rounded-control px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  Hapus
                </button>
              </div>
            )}

            <label className="flex cursor-pointer items-start gap-3 rounded-control border border-line p-3">
              <input
                type="checkbox"
                checked={mintaDesain}
                onChange={(e) => {
                  setMintaDesain(e.target.checked);
                  if (e.target.checked) setSalah((s) => ({ ...s, berkas: '' }));
                }}
                className="mt-0.5 size-5 shrink-0 accent-brand"
              />
              <span>
                <span className="block text-sm font-semibold">
                  Belum punya desain, minta dibuatkan
                </span>
                <span className="block text-xs text-ink-muted">
                  Tambah {rupiah(BIAYA_DESAIN)}. Sudah termasuk dua kali revisi.
                </span>
              </span>
            </label>

            <p className="rounded-control bg-surface-alt px-3 py-2 text-xs text-ink-muted">
              Berkasmu tidak dikirim ke mana pun. Di demo ini hanya dibaca untuk
              ditampilkan namanya.
            </p>
          </div>
        )}

        {/* ---------- Langkah 3: pengiriman ---------- */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="nama" className="block text-sm font-semibold">
                Nama <span className="text-red-600">*</span>
              </label>
              <input
                id="nama"
                type="text"
                autoComplete="name"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                aria-describedby={salah.nama ? 'nama-salah' : undefined}
                className={`mt-2 ${inputCls} ${salah.nama ? salahCls : ''}`}
              />
              {salah.nama && (
                <p id="nama-salah" className="mt-1.5 text-xs font-medium text-red-700">
                  {salah.nama}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="telepon" className="block text-sm font-semibold">
                Nomor WhatsApp <span className="text-red-600">*</span>
              </label>
              <input
                id="telepon"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="081234567890"
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                aria-describedby={salah.telepon ? 'telepon-salah' : 'telepon-bantu'}
                className={`mt-2 ${inputCls} ${salah.telepon ? salahCls : ''}`}
              />
              <p
                id={salah.telepon ? 'telepon-salah' : 'telepon-bantu'}
                className={`mt-1.5 text-xs ${salah.telepon ? 'font-medium text-red-700' : 'text-ink-muted'}`}
              >
                {salah.telepon ?? 'Nota dan foto hasil cetak dikirim ke nomor ini.'}
              </p>
            </div>

            <fieldset>
              <legend className="text-sm font-semibold">Pengambilan</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(
                  [
                    { nilai: 'ambil', judul: 'Ambil sendiri', isi: 'Gratis' },
                    { nilai: 'antar', judul: 'Diantar', isi: `${rupiah(ONGKIR)} dalam kota` },
                  ] as const
                ).map((o) => (
                  <label
                    key={o.nilai}
                    className={[
                      'flex cursor-pointer flex-col rounded-control border p-3',
                      kirim === o.nilai ? 'border-brand bg-brand-soft' : 'border-line',
                    ].join(' ')}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="kirim"
                        value={o.nilai}
                        checked={kirim === o.nilai}
                        onChange={() => setKirim(o.nilai)}
                        className="size-4 accent-brand"
                      />
                      <span className="text-sm font-semibold">{o.judul}</span>
                    </span>
                    <span className="mt-1 text-xs text-ink-muted">{o.isi}</span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-ink-muted">
                Gratis ongkir untuk pesanan di atas {rupiah(GRATIS_ONGKIR_DARI)}.
              </p>
            </fieldset>

            {kirim === 'antar' && (
              <div>
                <label htmlFor="alamat" className="block text-sm font-semibold">
                  Alamat pengantaran <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="alamat"
                  rows={3}
                  autoComplete="street-address"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  aria-describedby={salah.alamat ? 'alamat-salah' : undefined}
                  className={`mt-2 w-full rounded-control border border-line bg-surface p-3 text-sm outline-none focus:border-brand ${salah.alamat ? salahCls : ''}`}
                />
                {salah.alamat && (
                  <p id="alamat-salah" className="mt-1.5 text-xs font-medium text-red-700">
                    {salah.alamat}
                  </p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="catatan" className="block text-sm font-semibold">
                Catatan <span className="font-normal text-ink-muted">(boleh kosong)</span>
              </label>
              <textarea
                id="catatan"
                rows={2}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Misalnya: warna merah jangan terlalu gelap"
                className="mt-2 w-full rounded-control border border-line bg-surface p-3 text-sm outline-none focus:border-brand"
              />
            </div>
          </div>
        )}

        {/* ---------- Langkah 4: ringkasan ---------- */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Produk</dt>
                <dd className="text-right font-medium">{produk.nama}</dd>
              </div>
              {perMeter && (
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-muted">Ukuran</dt>
                  <dd className="tabular text-right font-medium">
                    {lebar} × {tinggi} cm ({hitung.luas} m²)
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Jumlah</dt>
                <dd className="tabular text-right font-medium">
                  {hitung.banyak} {satuanKata}
                </dd>
              </div>
              {produk.bahan && (
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-muted">Bahan</dt>
                  <dd className="text-right font-medium">{produk.bahan[bahan].nama}</dd>
                </div>
              )}
              {produk.finishing && (
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-muted">Finishing</dt>
                  <dd className="text-right font-medium">
                    {produk.finishing[finishing].nama}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Desain</dt>
                <dd className="text-right font-medium">
                  {berkas ? berkas.name : mintaDesain ? 'Dibuatkan toko' : '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Pengambilan</dt>
                <dd className="text-right font-medium">
                  {kirim === 'ambil' ? 'Ambil di toko' : 'Diantar'}
                </dd>
              </div>
            </dl>

            <dl className="flex flex-col gap-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Biaya cetak</dt>
                <dd className="tabular font-medium">{rupiah(hitung.cetak)}</dd>
              </div>
              {hitung.potongan > 0 && (
                <div className="flex justify-between gap-4 text-brand-strong">
                  <dt>Potongan grosir {hitung.persen}%</dt>
                  <dd className="tabular font-medium">&minus;{rupiah(hitung.potongan)}</dd>
                </div>
              )}
              {hitung.desain > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-muted">Jasa desain</dt>
                  <dd className="tabular font-medium">{rupiah(hitung.desain)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Ongkir</dt>
                <dd className="tabular font-medium">
                  {hitung.ongkir === 0 ? 'Gratis' : rupiah(hitung.ongkir)}
                </dd>
              </div>
              <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-line pt-3">
                <dt className="font-semibold">Total</dt>
                <dd className="tabular font-display text-2xl font-extrabold text-brand-strong">
                  {rupiah(hitung.total)}
                </dd>
              </div>
            </dl>

            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(pesan)}`}
              target="_blank"
              rel="noopener"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-control bg-brand px-5 font-bold text-white transition-colors duration-200 hover:bg-brand-strong motion-reduce:transition-none"
            >
              Kirim pesanan lewat WhatsApp
            </a>

            <p className="text-xs text-ink-muted">
              Harga di atas perkiraan. Kami konfirmasi ulang setelah berkas
              desainmu diperiksa.
            </p>
          </div>
        )}
      </div>

      {/* Tombol pindah langkah. Mundur selalu tersedia. */}
      {step < langkah.length - 1 && (
        <div className="flex gap-2 border-t border-line p-4 sm:p-5">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="min-h-12 shrink-0 rounded-control border border-line px-5 text-sm font-semibold hover:bg-surface-alt"
            >
              Kembali
            </button>
          )}
          <button
            type="button"
            onClick={lanjut}
            className="min-h-12 flex-1 rounded-control bg-brand px-5 font-bold text-white transition-colors duration-200 hover:bg-brand-strong motion-reduce:transition-none"
          >
            {step === langkah.length - 2 ? 'Lihat ringkasan' : 'Lanjut'}
          </button>
        </div>
      )}

      {step === langkah.length - 1 && (
        <div className="border-t border-line p-4 sm:p-5">
          <button
            type="button"
            onClick={() => setStep(0)}
            className="min-h-12 w-full rounded-control border border-line px-5 text-sm font-semibold hover:bg-surface-alt"
          >
            Ubah pesanan
          </button>
        </div>
      )}
    </div>
  );
}
