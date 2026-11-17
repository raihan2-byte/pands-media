import { useMemo, useState } from 'react';
import {
  awalHari,
  HARI,
  jam,
  rupiah,
  tanggalPendek,
  waktuLengkap,
  type Metode,
  type Transaksi,
} from '../../../data/warung-maju';
import { Struk } from './Struk';
import { useToko } from './store';
import { AngkaRingkas, cls, Halaman, Kosong, Lencana, Medan, Panel } from './ui';

type Rentang = 'hari' | 'kemarin' | 'minggu' | 'semua';

/** Satu transaksi jadi satu baris CSV; barangnya digabung dalam satu sel. */
function buatCsv(daftar: Transaksi[]): string {
  const kepala = [
    'Nomor', 'Waktu', 'Kasir', 'Pelanggan', 'Barang', 'Subtotal', 'Promo', 'Potongan promo',
    'Diskon manual', 'Pajak', 'Total', 'Metode', 'Status',
  ];
  const sel = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const baris = daftar.map((t) =>
    [
      t.nomor,
      new Date(t.waktu).toLocaleString('id-ID'),
      t.kasir,
      t.pelanggan,
      t.baris.map((b) => `${b.nama} x${b.jumlah}`).join('; '),
      t.subtotal,
      t.kodePromo,
      t.potPromo,
      t.potManual,
      t.pajak,
      t.total,
      t.metode,
      t.status,
    ]
      .map(sel)
      .join(','),
  );
  return [kepala.map(sel).join(','), ...baris].join('\n');
}

export default function Riwayat() {
  const t = useToko();
  const admin = t.izin.semuaTransaksi;
  const [rentang, setRentang] = useState<Rentang>('hari');
  const [metode, setMetode] = useState<Metode | 'semua'>('semua');
  const [status, setStatus] = useState<'semua' | 'selesai' | 'batal'>('semua');
  const [cari, setCari] = useState('');
  const [dipilih, setDipilih] = useState<string | null>(null);

  const sekarang = t.sekarang();
  const hariIni = awalHari(sekarang);

  const daftar = useMemo(() => {
    const kata = cari.trim().toLowerCase();
    return t.transaksi
      .filter((x) => {
        // Kasir hanya melihat transaksi hari ini yang dia layani sendiri.
        if (!admin && (x.kasir !== t.akun.nama || x.waktu < hariIni)) return false;
        if (admin) {
          if (rentang === 'hari' && x.waktu < hariIni) return false;
          if (rentang === 'kemarin' && (x.waktu < hariIni - HARI || x.waktu >= hariIni)) return false;
          if (rentang === 'minggu' && x.waktu < hariIni - 6 * HARI) return false;
        }
        if (metode !== 'semua' && x.metode !== metode) return false;
        if (status !== 'semua' && x.status !== status) return false;
        if (kata && !`${x.nomor} ${x.pelanggan} ${x.kasir}`.toLowerCase().includes(kata)) return false;
        return true;
      })
      .sort((a, b) => b.waktu - a.waktu);
  }, [t.transaksi, t.akun.nama, admin, rentang, metode, status, cari, hariIni]);

  const ringkas = useMemo(() => {
    const selesai = daftar.filter((x) => x.status === 'selesai');
    const omzet = selesai.reduce((s, x) => s + x.total, 0);
    const laba = selesai.reduce(
      (s, x) =>
        s +
        x.subtotal -
        x.potPromo -
        x.potManual -
        x.baris.reduce((h, b) => h + b.hargaBeli * b.jumlah, 0),
      0,
    );
    return { jumlah: selesai.length, batal: daftar.length - selesai.length, omzet, laba };
  }, [daftar]);

  const detail = dipilih ? t.transaksi.find((x) => x.nomor === dipilih) : undefined;

  function ekspor() {
    const blob = new Blob([buatCsv(daftar)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transaksi-warung-maju.csv`;
    a.click();
    URL.revokeObjectURL(url);
    t.umumkan(`${daftar.length} transaksi diekspor ke CSV.`);
  }

  return (
    <Halaman
      judul="Transaksi"
      ringkas={
        admin
          ? 'Semua penjualan. Admin bisa membatalkan transaksi dan mengekspor datanya.'
          : `Transaksi hari ini yang kamu layani, ${t.akun.nama}.`
      }
      aksi={
        admin && (
          <button type="button" onClick={ekspor} disabled={daftar.length === 0} className={cls.btn}>
            Ekspor CSV
          </button>
        )
      }
    >
      <dl className={`grid gap-3 ${admin ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2'}`}>
        <AngkaRingkas label="Transaksi" nilai={String(ringkas.jumlah)} ket={ringkas.batal ? `${ringkas.batal} dibatalkan` : 'selesai'} />
        <AngkaRingkas label="Penjualan" nilai={rupiah(ringkas.omzet)} ket="belum dikurangi modal" />
        {admin && (
          <>
            <AngkaRingkas label="Laba kotor" nilai={rupiah(ringkas.laba)} ket="penjualan − harga beli" />
            <AngkaRingkas
              label="Rata-rata belanja"
              nilai={rupiah(ringkas.jumlah ? ringkas.omzet / ringkas.jumlah : 0)}
            />
          </>
        )}
      </dl>

      <div className={`${cls.kartu} mt-5 flex flex-col gap-3 p-3 sm:p-4`}>
        <div className={`grid gap-3 ${admin ? 'sm:grid-cols-4' : 'sm:grid-cols-2'}`}>
          <div className={admin ? 'sm:col-span-2' : ''}>
            <label htmlFor="cari-trx" className="sr-only">
              Cari nomor atau pelanggan
            </label>
            <input
              id="cari-trx"
              type="search"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari nomor, pelanggan…"
              className={cls.input}
            />
          </div>
          <div>
            <label htmlFor="trx-metode" className="sr-only">
              Metode bayar
            </label>
            <select
              id="trx-metode"
              value={metode}
              onChange={(e) => setMetode(e.target.value as Metode | 'semua')}
              className={cls.input}
            >
              <option value="semua">Semua metode</option>
              <option>Tunai</option>
              <option>Transfer</option>
              <option>QRIS</option>
            </select>
          </div>
          {admin && (
            <div>
              <label htmlFor="trx-status" className="sr-only">
                Status
              </label>
              <select
                id="trx-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'semua' | 'selesai' | 'batal')}
                className={cls.input}
              >
                <option value="semua">Semua status</option>
                <option value="selesai">Selesai</option>
                <option value="batal">Dibatalkan</option>
              </select>
            </div>
          )}
        </div>

        {admin && (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Rentang waktu">
            {(
              [
                ['hari', 'Hari ini'],
                ['kemarin', 'Kemarin'],
                ['minggu', '7 hari'],
                ['semua', 'Semua'],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => setRentang(v)}
                aria-pressed={rentang === v}
                className={`min-h-10 rounded-full border px-4 text-sm font-semibold ${
                  rentang === v ? 'border-brand bg-brand text-white' : 'border-line-strong text-ink-muted hover:text-ink'
                }`}
              >
                {l}
              </button>
            ))}
            <p aria-live="polite" className="ml-auto text-sm text-ink-muted">
              {daftar.length} transaksi
            </p>
          </div>
        )}
      </div>

      <div className={`${cls.kartu} mt-4 overflow-hidden`}>
        {daftar.length === 0 ? (
          <div className="p-6">
            <Kosong judul="Belum ada transaksi" isi="Coba ganti rentang waktu atau saringannya." />
          </div>
        ) : (
          <>
            <table className="hidden w-full border-collapse text-left text-sm md:table">
              <thead className="border-b border-line bg-surface-alt text-[11px] tracking-wide text-ink-muted uppercase">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Transaksi</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Pelanggan</th>
                  {admin && <th scope="col" className="px-4 py-2.5 font-semibold">Kasir</th>}
                  <th scope="col" className="px-4 py-2.5 text-right font-semibold">Barang</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Bayar</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-semibold">Total</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {daftar.slice(0, 80).map((x) => (
                  <tr key={x.nomor} className="hover:bg-surface-alt">
                    <td className="px-4 py-2.5">
                      <button
                        type="button"
                        onClick={() => setDipilih(x.nomor)}
                        className="text-left font-semibold text-brand hover:underline"
                      >
                        {x.nomor}
                      </button>
                      <span className="tabular block text-xs text-ink-muted">{waktuLengkap(x.waktu)}</span>
                    </td>
                    <td className="px-4 py-2.5">{x.pelanggan}</td>
                    {admin && <td className="px-4 py-2.5 text-ink-muted">{x.kasir}</td>}
                    <td className="tabular px-4 py-2.5 text-right">
                      {x.baris.reduce((s, b) => s + b.jumlah, 0)}
                    </td>
                    <td className="px-4 py-2.5 text-ink-muted">{x.metode}</td>
                    <td className={`tabular px-4 py-2.5 text-right font-semibold ${x.status === 'batal' ? 'text-ink-muted line-through' : ''}`}>
                      {rupiah(x.total)}
                    </td>
                    <td className="px-4 py-2.5">
                      {x.status === 'batal' ? <Lencana nada="bahaya">Dibatalkan</Lencana> : <Lencana nada="aman">Selesai</Lencana>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="divide-y divide-line md:hidden">
              {daftar.slice(0, 80).map((x) => (
                <li key={x.nomor}>
                  <button
                    type="button"
                    onClick={() => setDipilih(x.nomor)}
                    className="flex w-full items-start justify-between gap-3 p-4 text-left hover:bg-surface-alt"
                  >
                    <span className="min-w-0">
                      <span className="block font-semibold">{x.nomor}</span>
                      <span className="tabular block text-xs text-ink-muted">
                        {tanggalPendek(x.waktu)} {jam(x.waktu)} · {x.pelanggan}
                        {admin && ` · ${x.kasir}`}
                      </span>
                      <span className="mt-1.5 flex gap-1.5">
                        <Lencana>{x.metode}</Lencana>
                        {x.status === 'batal' && <Lencana nada="bahaya">Dibatalkan</Lencana>}
                      </span>
                    </span>
                    <span className={`tabular shrink-0 font-display text-lg font-extrabold ${x.status === 'batal' ? 'text-ink-muted line-through' : ''}`}>
                      {rupiah(x.total)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {daftar.length > 80 && (
              <p className="border-t border-line px-4 py-3 text-xs text-ink-muted">
                Menampilkan 80 transaksi terbaru dari {daftar.length}. Persempit saringan untuk melihat sisanya.
              </p>
            )}
          </>
        )}
      </div>

      {detail && <DetailTransaksi t={detail} onTutup={() => setDipilih(null)} />}
    </Halaman>
  );
}

/* ------------------------------------------------------------------ */

function DetailTransaksi({ t: trx, onTutup }: { t: Transaksi; onTutup: () => void }) {
  const t = useToko();
  const [cetak, setCetak] = useState(false);
  const [batal, setBatal] = useState(false);
  const [alasan, setAlasan] = useState('');
  const [salah, setSalah] = useState('');

  const modal = trx.baris.reduce((s, b) => s + b.hargaBeli * b.jumlah, 0);
  const laba = trx.subtotal - trx.potPromo - trx.potManual - modal;

  function konfirmasiBatal() {
    const h = t.batalkan(trx.nomor, alasan);
    if (!h.ok) {
      setSalah(h.pesan ?? '');
      return;
    }
    setBatal(false);
  }

  if (cetak) return <Struk t={trx} onTutup={() => setCetak(false)} tombolTutup="Kembali" />;

  if (batal) {
    return (
      <Panel
        judul={`Batalkan ${trx.nomor}?`}
        ukuran="sm"
        onTutup={() => setBatal(false)}
        kaki={
          <div className="flex gap-2">
            <button type="button" onClick={() => setBatal(false)} className={`${cls.btn} flex-1`}>
              Kembali
            </button>
            <button type="button" onClick={konfirmasiBatal} className={`${cls.btnBahaya} flex-1`}>
              Ya, batalkan
            </button>
          </div>
        }
      >
        <p className="text-sm text-ink-muted">
          Barang dikembalikan ke stok dan penjualan ini tidak dihitung di laporan. Transaksi tetap
          tercatat dengan alasan pembatalannya.
        </p>
        <div className="mt-4">
          <Medan label="Alasan pembatalan" wajib salah={salah}>
            {(a) => (
              <input
                {...a}
                type="text"
                value={alasan}
                onChange={(e) => {
                  setAlasan(e.target.value);
                  setSalah('');
                }}
                placeholder="Misalnya: salah input harga"
                className={cls.input}
                data-fokus-awal
              />
            )}
          </Medan>
        </div>
      </Panel>
    );
  }

  return (
    <Panel
      judul={trx.nomor}
      deskripsi={`${waktuLengkap(trx.waktu)} · ${trx.kasir}`}
      posisi="kanan"
      onTutup={onTutup}
      kaki={
        <div className="flex gap-2">
          <button type="button" onClick={() => setCetak(true)} className={`${cls.btn} flex-1`}>
            Cetak ulang struk
          </button>
          {t.izin.batalkan && trx.status === 'selesai' && (
            <button type="button" onClick={() => setBatal(true)} className={`${cls.btn} flex-1 text-red-700`}>
              Batalkan
            </button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {trx.status === 'batal' && (
          <div className="rounded-card border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <p className="font-semibold">Transaksi dibatalkan</p>
            <p className="mt-0.5">
              {trx.alasanBatal} — oleh {trx.dibatalkanOleh}
            </p>
          </div>
        )}

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-ink-muted">Pelanggan</dt>
            <dd className="font-medium">{trx.pelanggan}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">Metode bayar</dt>
            <dd className="font-medium">{trx.metode}</dd>
          </div>
        </dl>

        <div>
          <h3 className="text-base">Barang</h3>
          <ul className="mt-1 divide-y divide-line">
            {trx.baris.map((b) => (
              <li key={b.kode} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                <span className="min-w-0">
                  <span className="block">{b.nama}</span>
                  <span className="tabular block text-xs text-ink-muted">
                    {b.jumlah} × {rupiah(b.harga)}
                  </span>
                </span>
                <span className="tabular shrink-0 font-medium">{rupiah(b.harga * b.jumlah)}</span>
              </li>
            ))}
          </ul>
        </div>

        <dl className="tabular flex flex-col gap-1.5 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Subtotal</dt>
            <dd>{rupiah(trx.subtotal)}</dd>
          </div>
          {trx.potPromo > 0 && (
            <div className="flex justify-between text-brand-strong">
              <dt>Promo {trx.kodePromo}</dt>
              <dd>&minus;{rupiah(trx.potPromo)}</dd>
            </div>
          )}
          {trx.potManual > 0 && (
            <div className="flex justify-between text-brand-strong">
              <dt>Diskon manual</dt>
              <dd>&minus;{rupiah(trx.potManual)}</dd>
            </div>
          )}
          {trx.pajak > 0 && (
            <div className="flex justify-between">
              <dt className="text-ink-muted">Pajak</dt>
              <dd>{rupiah(trx.pajak)}</dd>
            </div>
          )}
          <div className="flex items-baseline justify-between">
            <dt className="font-semibold">Total</dt>
            <dd className="font-display text-xl font-extrabold">{rupiah(trx.total)}</dd>
          </div>
          {trx.metode === 'Tunai' && (
            <>
              <div className="flex justify-between text-ink-muted">
                <dt>Uang diterima</dt>
                <dd>{rupiah(trx.bayar)}</dd>
              </div>
              <div className="flex justify-between text-ink-muted">
                <dt>Kembalian</dt>
                <dd>{rupiah(trx.kembali)}</dd>
              </div>
            </>
          )}
          {t.izin.lihatModal && trx.status === 'selesai' && (
            <div className="mt-2 flex justify-between border-t border-line pt-2 text-ink-muted">
              <dt>Laba kotor transaksi ini</dt>
              <dd className="font-semibold text-ink">{rupiah(laba)}</dd>
            </div>
          )}
        </dl>
      </div>
    </Panel>
  );
}
