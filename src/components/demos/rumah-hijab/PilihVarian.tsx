import { useState } from 'react';
import type { Produk } from '../../../data/rumah-hijab';
import { tambahKeKeranjang } from './keranjang';

/**
 * Pemilih warna, ukuran, dan jumlah di halaman produk.
 * Hanya bagian ini yang mengirim JavaScript; sisa halaman tetap HTML biasa.
 */

export default function PilihVarian({ produk: p }: { produk: Produk }) {
  const [warna, setWarna] = useState(p.warna[0].nama);
  const [ukuran, setUkuran] = useState(p.ukuran?.[0]);
  const [jumlah, setJumlah] = useState(1);
  const [kabar, setKabar] = useState('');

  const dipilih = p.warna.find((w) => w.nama === warna)!;
  const habis = dipilih.stok <= 0;

  function tambah() {
    if (habis) return;
    tambahKeKeranjang({ slug: p.slug, warna, ukuran, jumlah });
    setKabar(`${jumlah} ${p.nama} warna ${warna} masuk keranjang.`);
  }

  return (
    <div>
      <fieldset>
        <legend className="text-sm font-semibold">
          Warna: <span className="font-normal text-ink-muted">{warna}</span>
        </legend>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {p.warna.map((w) => {
            const aktif = w.nama === warna;
            return (
              <button
                key={w.nama}
                type="button"
                onClick={() => setWarna(w.nama)}
                aria-pressed={aktif}
                disabled={w.stok <= 0}
                className={[
                  'flex min-h-11 items-center gap-2 rounded-control border px-3 text-sm',
                  aktif ? 'border-brand bg-brand-soft font-semibold' : 'border-line',
                  w.stok <= 0 ? 'cursor-not-allowed opacity-45' : 'hover:border-brand',
                ].join(' ')}
              >
                <span
                  aria-hidden="true"
                  className="size-4 rounded-full border border-black/10"
                  style={{ backgroundColor: w.kode }}
                />
                {w.nama}
                {w.stok <= 0 && <span className="text-xs">(habis)</span>}
              </button>
            );
          })}
        </div>
      </fieldset>

      {p.ukuran && (
        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">
            Ukuran: <span className="font-normal text-ink-muted">{ukuran}</span>
          </legend>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {p.ukuran.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUkuran(u)}
                aria-pressed={u === ukuran}
                className={[
                  'min-h-11 min-w-12 rounded-control border px-3 text-sm',
                  u === ukuran
                    ? 'border-brand bg-brand-soft font-semibold'
                    : 'border-line hover:border-brand',
                ].join(' ')}
              >
                {u}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <p className="mt-4 text-sm text-ink-muted">
        {habis ? (
          <span className="font-semibold text-brand">Warna ini sedang kosong.</span>
        ) : dipilih.stok <= 10 ? (
          <span className="font-semibold text-accent-strong">
            Tinggal {dipilih.stok} buah untuk warna ini.
          </span>
        ) : (
          `Stok ${dipilih.stok} buah, siap kirim hari ini.`
        )}
      </p>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-control border border-line p-1">
          <button
            type="button"
            onClick={() => setJumlah((n) => Math.max(1, n - 1))}
            aria-label="Kurangi jumlah"
            className="grid size-10 place-items-center rounded-full font-bold hover:bg-surface-alt"
          >
            &minus;
          </button>
          <span className="tabular w-8 text-center font-semibold">{jumlah}</span>
          <button
            type="button"
            onClick={() => setJumlah((n) => Math.min(dipilih.stok || 1, n + 1))}
            aria-label="Tambah jumlah"
            className="grid size-10 place-items-center rounded-full font-bold hover:bg-surface-alt"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={tambah}
          disabled={habis}
          className="min-h-12 flex-1 rounded-control bg-brand px-6 font-semibold text-white hover:bg-brand-strong disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-muted"
        >
          Masukkan keranjang
        </button>
      </div>

      <p aria-live="polite" className="mt-3 min-h-5 text-sm font-medium text-brand">
        {kabar}
      </p>
    </div>
  );
}
