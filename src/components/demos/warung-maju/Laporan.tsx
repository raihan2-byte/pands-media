import { useMemo, useState, type ReactNode } from 'react';
import {
  awalHari,
  hariSingkat,
  HARI,
  rupiah,
  statusStok,
  tanggalPendek,
  type Menu,
  type Transaksi,
} from '../../../data/warung-maju';
import { useToko } from './store';
import { cls, Halaman, Kosong } from './ui';

type Periode = 'hari' | 'minggu';

/* ------------------------------------------------------------------ */
/* Pembantu                                                            */
/* ------------------------------------------------------------------ */

/** Penjualan bersih: yang masuk kas dikurangi pajak, karena pajak bukan milik warung. */
const penjualanBersih = (t: Transaksi) => t.total - t.pajak;
const modalBarang = (t: Transaksi) => t.baris.reduce((s, b) => s + b.hargaBeli * b.jumlah, 0);

/** Tulis rupiah sependek mungkin untuk sumbu dan label: 412 rb, 1,2 jt. */
function ringkasRp(n: number, satuan: 'rb' | 'jt'): string {
  if (n === 0) return '0';
  if (satuan === 'jt') return `${(n / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  return `${Math.round(n / 1000).toLocaleString('id-ID')} rb`;
}

/** Batas atas dan langkah sumbu yang bulat, sekitar empat garis. */
function skala(maks: number) {
  if (maks <= 0) return { atas: 1000, langkah: 250 };
  const kasar = maks / 4;
  const p = 10 ** Math.floor(Math.log10(kasar));
  const m = kasar / p;
  const l = m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10;
  const langkah = l * p;
  return { atas: Math.ceil(maks / langkah) * langkah, langkah };
}

interface Kolom {
  label: string;
  sub: string;
  nilai: number;
  jumlah: number;
}

/* ------------------------------------------------------------------ */
/* Halaman                                                             */
/* ------------------------------------------------------------------ */

export default function Laporan({ buka }: { buka: (m: Menu) => void }) {
  const t = useToko();
  const [periode, setPeriode] = useState<Periode>('minggu');

  const sekarang = t.sekarang();
  const hariIni = awalHari(sekarang);
  const awal = periode === 'hari' ? hariIni : hariIni - 6 * HARI;

  const data = useMemo(() => {
    const trx = t.transaksi.filter((x) => x.status === 'selesai' && x.waktu >= awal);
    const penjualan = trx.reduce((s, x) => s + penjualanBersih(x), 0);
    const modal = trx.reduce((s, x) => s + modalBarang(x), 0);
    const item = trx.reduce((s, x) => s + x.baris.reduce((a, b) => a + b.jumlah, 0), 0);

    // Pembanding hanya untuk "hari ini": kemarin sampai jam yang sama, supaya adil.
    let sebelum: number | null = null;
    if (periode === 'hari') {
      sebelum = t.transaksi
        .filter((x) => x.status === 'selesai' && x.waktu >= hariIni - HARI && x.waktu <= sekarang - HARI)
        .reduce((s, x) => s + penjualanBersih(x), 0);
    }

    // Kolom diagram: per jam untuk hari ini, per hari untuk seminggu.
    let kolom: Kolom[];
    if (periode === 'hari') {
      kolom = Array.from({ length: 16 }, (_, i) => {
        const jam = 6 + i;
        const di = trx.filter((x) => new Date(x.waktu).getHours() === jam);
        return {
          label: String(jam).padStart(2, '0'),
          sub: `Pukul ${String(jam).padStart(2, '0')}.00`,
          nilai: di.reduce((s, x) => s + penjualanBersih(x), 0),
          jumlah: di.length,
        };
      });
    } else {
      kolom = Array.from({ length: 7 }, (_, i) => {
        const mulai = awal + i * HARI;
        const di = trx.filter((x) => x.waktu >= mulai && x.waktu < mulai + HARI);
        return {
          label: hariSingkat(mulai),
          sub: `${hariSingkat(mulai)}, ${tanggalPendek(mulai)}`,
          nilai: di.reduce((s, x) => s + penjualanBersih(x), 0),
          jumlah: di.length,
        };
      });
    }

    const metode = (['Tunai', 'Transfer', 'QRIS'] as const).map((m) => ({
      label: m,
      nilai: trx.filter((x) => x.metode === m).reduce((s, x) => s + x.total, 0),
      jumlah: trx.filter((x) => x.metode === m).length,
    }));

    const perKategori = new Map<string, number>();
    const perProduk = new Map<string, { nama: string; qty: number; omzet: number; laba: number }>();
    for (const x of trx) {
      for (const b of x.baris) {
        const kat = t.peta[b.kode]?.kategoriId ?? '?';
        perKategori.set(kat, (perKategori.get(kat) ?? 0) + b.harga * b.jumlah);
        const p = perProduk.get(b.kode) ?? { nama: b.nama, qty: 0, omzet: 0, laba: 0 };
        p.qty += b.jumlah;
        p.omzet += b.harga * b.jumlah;
        p.laba += (b.harga - b.hargaBeli) * b.jumlah;
        perProduk.set(b.kode, p);
      }
    }
    const kategori = [...perKategori.entries()]
      .map(([id, nilai]) => ({
        label: t.kategori.find((k) => k.id === id)?.nama ?? 'Lainnya',
        nilai,
        jumlah: 0,
      }))
      .sort((a, b) => b.nilai - a.nilai);

    const terlaris = [...perProduk.entries()]
      .map(([kode, v]) => ({ kode, ...v }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8);

    const perKasir = [...new Set(trx.map((x) => x.kasir))]
      .map((k) => ({
        label: k,
        nilai: trx.filter((x) => x.kasir === k).reduce((s, x) => s + penjualanBersih(x), 0),
        jumlah: trx.filter((x) => x.kasir === k).length,
      }))
      .sort((a, b) => b.nilai - a.nilai);

    const promo = new Map<string, { kali: number; potong: number }>();
    for (const x of trx) {
      if (!x.kodePromo) continue;
      const p = promo.get(x.kodePromo) ?? { kali: 0, potong: 0 };
      p.kali += 1;
      p.potong += x.potPromo;
      promo.set(x.kodePromo, p);
    }
    const potonganManual = trx.reduce((s, x) => s + x.potManual, 0);

    return {
      jumlah: trx.length,
      penjualan,
      laba: penjualan - modal,
      item,
      rata: trx.length ? penjualan / trx.length : 0,
      sebelum,
      kolom,
      metode,
      kategori,
      terlaris,
      perKasir,
      promo: [...promo.entries()].map(([kode, v]) => ({ kode, ...v })).sort((a, b) => b.kali - a.kali),
      potonganManual,
      batal: t.transaksi.filter((x) => x.status === 'batal' && x.waktu >= awal).length,
    };
  }, [t.transaksi, t.peta, t.kategori, awal, periode, hariIni, sekarang]);

  const menipis = useMemo(
    () =>
      t.produk
        .filter((p) => p.aktif && statusStok(p.stok, p.minimum) !== 'aman')
        .sort((a, b) => a.stok - a.minimum - (b.stok - b.minimum))
        .slice(0, 6),
    [t.produk],
  );

  const delta =
    data.sebelum !== null && data.sebelum > 0
      ? Math.round(((data.penjualan - data.sebelum) / data.sebelum) * 100)
      : null;

  return (
    <Halaman
      judul="Laporan"
      ringkas="Ringkasan penjualan dan laba. Semua angka dihitung dari transaksi yang selesai."
      aksi={
        <div className="inline-flex rounded-control border border-line-strong bg-surface p-0.5" role="group" aria-label="Periode laporan">
          {(
            [
              ['hari', 'Hari ini'],
              ['minggu', '7 hari'],
            ] as const
          ).map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => setPeriode(v)}
              aria-pressed={periode === v}
              className={`min-h-10 rounded-[3px] px-4 text-sm font-semibold ${
                periode === v ? 'bg-brand text-white' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      }
    >
      {data.jumlah === 0 ? (
        <Kosong
          judul="Belum ada penjualan di periode ini"
          isi="Layani transaksi lewat menu Kasir, atau pilih periode 7 hari."
          aksi={
            <button type="button" onClick={() => buka('kasir')} className={cls.btnUtama}>
              Buka Kasir
            </button>
          }
        />
      ) : (
        <>
          {/* Satu angka utama per tampilan, sisanya angka pendukung. */}
          <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr]">
            <div className="rounded-card border border-line bg-surface p-5 lg:row-span-2">
              <p className="text-sm text-ink-muted">Penjualan {periode === 'hari' ? 'hari ini' : '7 hari terakhir'}</p>
              <p className="tabular mt-1 font-display text-[2.6rem] leading-none font-extrabold text-brand-strong sm:text-5xl">
                {rupiah(data.penjualan)}
              </p>
              {delta !== null ? (
                <p className="mt-3 text-sm">
                  <span className={`tabular font-semibold ${delta >= 0 ? 'text-brand-strong' : 'text-red-700'}`}>
                    {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%
                  </span>{' '}
                  <span className="text-ink-muted">dibanding kemarin sampai jam yang sama</span>
                </p>
              ) : (
                <p className="mt-3 text-sm text-ink-muted">
                  Dari {data.jumlah} transaksi, tidak termasuk yang dibatalkan.
                </p>
              )}
            </div>

            {/* Dua kolom di ponsel; di layar lebar kotaknya menyebar ke grid induk. */}
            <div className="grid grid-cols-2 gap-3 lg:contents">
              <Tile label="Laba kotor" nilai={rupiah(data.laba)} ket={`margin ${data.penjualan ? Math.round((data.laba / data.penjualan) * 100) : 0}%`} />
              <Tile label="Transaksi" nilai={String(data.jumlah)} ket={data.batal ? `${data.batal} dibatalkan` : 'tidak ada pembatalan'} />
              <Tile label="Rata-rata belanja" nilai={rupiah(data.rata)} ket="per transaksi" />
              <Tile label="Barang terjual" nilai={String(data.item)} ket="buah, semua jenis" />
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <KartuGrafik
              judul={periode === 'hari' ? 'Penjualan per jam' : 'Penjualan per hari'}
              ringkas="Tiap batang satu periode. Arahkan kursor atau fokus untuk melihat rinciannya."
              tabel={
                <TabelData
                  kepala={[periode === 'hari' ? 'Jam' : 'Hari', 'Penjualan', 'Transaksi']}
                  baris={data.kolom.map((k) => [k.sub, rupiah(k.nilai), String(k.jumlah)])}
                />
              }
            >
              <GrafikKolom data={data.kolom} />
            </KartuGrafik>

            <div className="grid gap-4">
              <KartuGrafik
                judul="Cara pembayaran"
                tabel={
                  <TabelData
                    kepala={['Metode', 'Nilai', 'Transaksi']}
                    baris={data.metode.map((m) => [m.label, rupiah(m.nilai), String(m.jumlah)])}
                  />
                }
              >
                <GrafikPeringkat baris={data.metode} />
              </KartuGrafik>

              <KartuGrafik
                judul="Penjualan per kategori"
                tabel={
                  <TabelData
                    kepala={['Kategori', 'Penjualan kotor']}
                    baris={data.kategori.map((k) => [k.label, rupiah(k.nilai)])}
                  />
                }
              >
                <GrafikPeringkat baris={data.kategori} />
              </KartuGrafik>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <section className={`${cls.kartu} overflow-hidden`}>
              <div className="border-b border-line px-4 py-3">
                <h2 className="text-base">Produk terlaris</h2>
                <p className="text-xs text-ink-muted">Diurutkan menurut jumlah terjual.</p>
              </div>
              <table className="w-full border-collapse text-left text-sm">
                <thead className="border-b border-line bg-surface-alt text-[11px] tracking-wide text-ink-muted uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-2 font-semibold">Produk</th>
                    <th scope="col" className="px-4 py-2 text-right font-semibold">Terjual</th>
                    <th scope="col" className="px-4 py-2 text-right font-semibold">Penjualan</th>
                    <th scope="col" className="hidden px-4 py-2 text-right font-semibold sm:table-cell">Laba</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.terlaris.map((p, i) => (
                    <tr key={p.kode}>
                      <td className="px-4 py-2.5">
                        <span className="tabular mr-2 text-xs text-ink-muted">{i + 1}</span>
                        {p.nama}
                      </td>
                      <td className="tabular px-4 py-2.5 text-right font-semibold">{p.qty}</td>
                      <td className="tabular px-4 py-2.5 text-right">{rupiah(p.omzet)}</td>
                      <td className="tabular hidden px-4 py-2.5 text-right text-ink-muted sm:table-cell">
                        {rupiah(p.laba)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <div className="grid content-start gap-4">
              <section className={`${cls.kartu} p-4`}>
                <h2 className="text-base">Perlu ditambah</h2>
                {menipis.length === 0 ? (
                  <p className="mt-2 text-sm text-ink-muted">Semua stok masih di atas batas minimum.</p>
                ) : (
                  <ul className="mt-2 divide-y divide-line">
                    {menipis.map((p) => (
                      <li key={p.kode} className="flex items-center justify-between gap-3 py-2 text-sm">
                        <span className="min-w-0 truncate">{p.nama}</span>
                        <span className={`tabular shrink-0 font-semibold ${p.stok <= 0 ? 'text-red-700' : 'text-amber-700'}`}>
                          {p.stok <= 0 ? 'habis' : `sisa ${p.stok}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {menipis.length > 0 && (
                  <button type="button" onClick={() => buka('produk')} className={`${cls.btn} mt-3 w-full`}>
                    Atur stok di menu Produk
                  </button>
                )}
              </section>

              <section className={`${cls.kartu} p-4`}>
                <h2 className="text-base">Promo dan diskon</h2>
                {data.promo.length === 0 && data.potonganManual === 0 ? (
                  <p className="mt-2 text-sm text-ink-muted">Tidak ada promo yang dipakai di periode ini.</p>
                ) : (
                  <ul className="mt-2 divide-y divide-line">
                    {data.promo.map((p) => (
                      <li key={p.kode} className="flex items-center justify-between gap-3 py-2 text-sm">
                        <span>
                          <span className="tabular font-semibold">{p.kode}</span>{' '}
                          <span className="text-ink-muted">{p.kali}×</span>
                        </span>
                        <span className="tabular text-ink-muted">&minus;{rupiah(p.potong)}</span>
                      </li>
                    ))}
                    {data.potonganManual > 0 && (
                      <li className="flex items-center justify-between gap-3 py-2 text-sm">
                        <span>Diskon manual</span>
                        <span className="tabular text-ink-muted">&minus;{rupiah(data.potonganManual)}</span>
                      </li>
                    )}
                  </ul>
                )}
              </section>
            </div>
          </div>

          {data.perKasir.length > 1 && (
            <div className="mt-4">
              <KartuGrafik
                judul="Penjualan per kasir"
                tabel={
                  <TabelData
                    kepala={['Kasir', 'Penjualan', 'Transaksi']}
                    baris={data.perKasir.map((k) => [k.label, rupiah(k.nilai), String(k.jumlah)])}
                  />
                }
              >
                <GrafikPeringkat baris={data.perKasir} />
              </KartuGrafik>
            </div>
          )}
        </>
      )}
    </Halaman>
  );
}

/* ------------------------------------------------------------------ */
/* Kartu dan grafik                                                    */
/* ------------------------------------------------------------------ */

function Tile({ label, nilai, ket }: { label: string; nilai: string; ket: string }) {
  return (
    <div className="rounded-card border border-line bg-surface px-4 py-3.5">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="tabular mt-0.5 font-display text-2xl leading-tight font-extrabold">{nilai}</p>
      <p className="mt-0.5 text-[11px] text-ink-muted">{ket}</p>
    </div>
  );
}

/** Pembungkus grafik dengan tombol ganti ke tabel, supaya angkanya terbaca tanpa menyorot. */
function KartuGrafik({
  judul,
  ringkas,
  tabel,
  children,
}: {
  judul: string;
  ringkas?: string;
  tabel: ReactNode;
  children: ReactNode;
}) {
  const [lihat, setLihat] = useState<'grafik' | 'tabel'>('grafik');
  return (
    <section className={`${cls.kartu} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base">{judul}</h2>
          {ringkas && <p className="text-xs text-ink-muted">{ringkas}</p>}
        </div>
        <div className="inline-flex shrink-0 rounded-control border border-line-strong p-0.5" role="group" aria-label={`Tampilan ${judul}`}>
          {(['grafik', 'tabel'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setLihat(v)}
              aria-pressed={lihat === v}
              className={`min-h-8 rounded-[3px] px-3 text-xs font-semibold capitalize ${
                lihat === v ? 'bg-ink text-white' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4">{lihat === 'grafik' ? children : tabel}</div>
    </section>
  );
}

function TabelData({ kepala, baris }: { kepala: string[]; baris: string[][] }) {
  return (
    <div className="max-h-64 overflow-y-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="sticky top-0 bg-surface text-[11px] tracking-wide text-ink-muted uppercase">
          <tr>
            {kepala.map((k, i) => (
              <th key={k} scope="col" className={`border-b border-line px-2 py-2 font-semibold ${i > 0 ? 'text-right' : ''}`}>
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {baris.map((b, r) => (
            <tr key={r}>
              {b.map((c, i) => (
                <td key={i} className={`px-2 py-2 ${i > 0 ? 'tabular text-right' : ''}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Diagram kolom satu seri, satu warna.
 *
 * Batang setebal paling 24 px dengan ujung atas membulat 4 px, pangkal rata.
 * Garis bantu hanya garis rambut. Label nilai hanya di puncak dan di batang
 * terakhir; sisanya lewat tooltip, fokus papan ketik, dan tombol Tabel.
 */
function GrafikKolom({ data }: { data: Kolom[] }) {
  const [aktif, setAktif] = useState<number | null>(null);
  const maks = Math.max(...data.map((d) => d.nilai), 0);
  const { atas, langkah } = skala(maks);
  const satuan = atas >= 1_000_000 ? 'jt' : 'rb';
  const tanda = Array.from({ length: Math.floor(atas / langkah) + 1 }, (_, i) => i * langkah);
  const puncak = data.findIndex((d) => d.nilai === maks && maks > 0);
  const terakhir = data.length - 1;
  const rapat = data.length > 8;
  const n = data.length;

  const a = aktif !== null ? data[aktif] : null;
  const pos = aktif !== null ? (aktif + 0.5) / n : 0;

  return (
    <div className="pl-11">
      <div className="relative h-52" onMouseLeave={() => setAktif(null)}>
        {tanda.map((v) => (
          <div key={v} className="absolute inset-x-0 border-t border-line" style={{ bottom: `${(v / atas) * 100}%` }}>
            <span className="tabular absolute top-0 -left-11 w-9 -translate-y-1/2 text-right text-[11px] text-ink-muted">
              {ringkasRp(v, satuan)}
            </span>
          </div>
        ))}

        <div className="absolute inset-0 flex items-end gap-[2px]">
          {data.map((d, i) => {
            const tinggi = (d.nilai / atas) * 100;
            const label = i === puncak || (i === terakhir && !rapat);
            return (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setAktif(i)}
                onFocus={() => setAktif(i)}
                onBlur={() => setAktif(null)}
                aria-label={`${d.sub}: ${rupiah(d.nilai)}, ${d.jumlah} transaksi`}
                className="group relative flex h-full min-w-0 flex-1 items-end justify-center outline-none"
              >
                <span
                  className={`block w-full max-w-6 rounded-t-[4px] bg-brand transition-colors duration-100 group-hover:bg-brand-strong group-focus-visible:bg-brand-strong motion-reduce:transition-none ${
                    d.nilai === 0 ? 'opacity-0' : ''
                  }`}
                  style={{ height: `${tinggi}%` }}
                />
                {label && d.nilai > 0 && (
                  <span
                    className="tabular pointer-events-none absolute left-1/2 -translate-x-1/2 text-[11px] font-semibold whitespace-nowrap"
                    style={{ bottom: `calc(${tinggi}% + 4px)` }}
                  >
                    {ringkasRp(d.nilai, satuan)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {a && (
          <div
            className="pointer-events-none absolute z-10 w-max max-w-[14rem] rounded-control bg-ink px-3 py-2 text-white shadow-card-hover"
            style={{
              bottom: `calc(${(a.nilai / atas) * 100}% + 30px)`,
              ...(pos < 0.18 ? { left: 0 } : pos > 0.82 ? { right: 0 } : { left: `${pos * 100}%`, transform: 'translateX(-50%)' }),
            }}
          >
            {/* Nilai di depan, nama periode di belakang: pembaca sudah tahu batangnya, ia mencari angkanya. */}
            <p className="tabular text-sm font-bold">{rupiah(a.nilai)}</p>
            <p className="tabular text-[11px] text-white/70">
              {a.sub} · {a.jumlah} transaksi
            </p>
          </div>
        )}
      </div>

      <div className="mt-2 flex gap-[2px]">
        {data.map((d, i) => (
          <span
            key={i}
            className={`tabular min-w-0 flex-1 truncate text-center text-[11px] ${
              i === terakhir ? 'font-semibold text-ink' : 'text-ink-muted'
            } ${rapat && i % 2 === 1 ? 'invisible' : ''}`}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Batang mendatar berurutan, satu warna. Dipakai untuk membandingkan bagian
 * satu sama lain, yang lebih tepat dibaca di satu garis dasar ketimbang
 * irisan lingkaran. Nilai ditulis tepat di ujung batang.
 */
function GrafikPeringkat({ baris }: { baris: { label: string; nilai: number; jumlah?: number }[] }) {
  const urut = [...baris].sort((a, b) => b.nilai - a.nilai);
  const maks = Math.max(...urut.map((b) => b.nilai), 1);
  const total = urut.reduce((s, b) => s + b.nilai, 0) || 1;
  const satuan = maks >= 1_000_000 ? 'jt' : 'rb';

  return (
    <ul className="flex flex-col gap-3">
      {urut.map((b) => (
        <li key={b.label} className="grid grid-cols-[6.5rem_1fr] items-center gap-3 text-sm sm:grid-cols-[7.5rem_1fr]">
          <span className="truncate" title={b.label}>
            {b.label}
          </span>
          <span className="flex min-w-0 items-center gap-2">
            <span
              className="block h-3 min-w-[4px] rounded-r-[4px] bg-brand"
              style={{ width: `${Math.max(1.5, (b.nilai / maks) * 72)}%` }}
              role="img"
              aria-label={`${b.label}: ${rupiah(b.nilai)}, ${Math.round((b.nilai / total) * 100)} persen`}
            />
            <span className="tabular shrink-0 whitespace-nowrap">
              <span className="font-semibold">Rp{ringkasRp(b.nilai, satuan)}</span>{' '}
              <span className="text-xs text-ink-muted">{Math.round((b.nilai / total) * 100)}%</span>
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
