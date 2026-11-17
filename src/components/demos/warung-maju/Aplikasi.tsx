import { useEffect, useState, type ReactNode } from 'react';
import { namaMenu, namaPeran, type Menu, type PeranSlug } from '../../../data/warung-maju';
import Kasir from './Kasir';
import KelolaKategori from './Kategori';
import Laporan from './Laporan';
import PengaturanToko from './Pengaturan';
import KelolaPengguna from './Pengguna';
import KelolaProduk from './Produk';
import KelolaPromo from './Promo';
import { PenyediaToko, useToko } from './store';
import Riwayat from './Transaksi';
import { Toast } from './ui';

/**
 * Rangka aplikasi kasir: panel samping untuk berpindah menu, isi di sebelahnya.
 *
 * Tinggi dikunci ke tinggi layar di layar lebar, dan tiap bagian menggulir
 * sendiri. Dengan begitu daftar barang, keranjang, dan panel samping tidak
 * saling menekan jadi gepeng saat layarnya pendek.
 */

/** Pengelompokan menu di panel samping. Menu yang tak diizinkan peran tidak digambar. */
const kelompok: { judul: string; isi: Menu[] }[] = [
  { judul: 'Operasional', isi: ['kasir', 'transaksi'] },
  { judul: 'Kelola', isi: ['produk', 'kategori', 'promo'] },
  { judul: 'Analisis', isi: ['laporan'] },
  { judul: 'Sistem', isi: ['pengguna', 'pengaturan'] },
];

export default function Aplikasi({ foto }: { foto: Record<string, string> }) {
  return (
    <PenyediaToko foto={foto}>
      <Rangka />
    </PenyediaToko>
  );
}

function Rangka() {
  const t = useToko();
  const [menu, setMenu] = useState<Menu>('kasir');

  // Pindah peran bisa membuat menu yang sedang dibuka tak lagi diizinkan.
  useEffect(() => {
    if (!t.izin.menu.includes(menu)) setMenu(t.izin.menu[0]);
  }, [t.izin, menu]);

  // Pemeriksaan kedua: kalau menu tak diizinkan, layarnya tidak digambar sama sekali.
  const boleh = t.izin.menu.includes(menu);

  const layar: Record<Menu, ReactNode> = {
    kasir: <Kasir />,
    transaksi: <Riwayat />,
    produk: <KelolaProduk />,
    kategori: <KelolaKategori />,
    promo: <KelolaPromo />,
    laporan: <Laporan buka={setMenu} />,
    pengguna: <KelolaPengguna />,
    pengaturan: <PengaturanToko />,
  };

  const penuh = menu === 'kasir';

  return (
    <div className="bg-surface-alt lg:flex lg:h-[calc(100dvh-2.75rem)] lg:overflow-hidden">
      <Sisi menu={menu} onPilih={setMenu} />

      <main
        id="isi"
        className={`min-w-0 flex-1 ${penuh ? 'lg:overflow-hidden' : 'lg:overflow-y-auto'}`}
      >
        {boleh ? layar[menu] : null}
      </main>

      <Toast pesan={t.kabar} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Sisi({ menu, onPilih }: { menu: Menu; onPilih: (m: Menu) => void }) {
  const t = useToko();

  return (
    <aside className="border-b border-line bg-surface lg:flex lg:w-60 lg:shrink-0 lg:flex-col lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between gap-3 px-4 py-3 lg:block lg:py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-control bg-brand font-display font-extrabold text-white"
            aria-hidden="true"
          >
            W
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display leading-tight font-extrabold">{t.pengaturan.nama}</span>
            <span className="block truncate text-xs text-ink-muted">Aplikasi kasir</span>
          </span>
        </div>

        {/* Pengalih peran. Alat demo, bukan menu yang ada di sistem asli:
            di sana peran ditentukan saat masuk. */}
        <div className="shrink-0 lg:mt-4">
          <label htmlFor="peran" className="sr-only lg:not-sr-only lg:mb-1 lg:block lg:text-[11px] lg:font-semibold lg:tracking-wide lg:text-ink-muted lg:uppercase">
            Masuk sebagai
          </label>
          <select
            id="peran"
            value={t.peran}
            onChange={(e) => t.setPeran(e.target.value as PeranSlug)}
            className="h-10 w-full rounded-control border border-line-strong bg-surface px-3 text-sm font-semibold outline-none focus:border-brand"
          >
            {(['admin', 'kasir'] as const).map((p) => (
              <option key={p} value={p}>
                {namaPeran[p].nama}
              </option>
            ))}
          </select>
          <p className="mt-1.5 hidden text-xs text-ink-muted lg:block">
            {t.akun.nama} · {namaPeran[t.peran].ringkas}
          </p>
        </div>
      </div>

      <nav
        aria-label="Menu aplikasi"
        className="flex gap-1 overflow-x-auto border-t border-line px-2 py-2 lg:flex-1 lg:flex-col lg:gap-0 lg:overflow-x-visible lg:overflow-y-auto lg:px-3 lg:py-3"
      >
        {kelompok.map((g) => {
          const isi = g.isi.filter((m) => t.izin.menu.includes(m));
          if (isi.length === 0) return null;
          return (
            <div key={g.judul} className="flex gap-1 lg:mb-3 lg:flex-col lg:gap-0.5">
              <p className="mb-1 hidden px-3 text-[11px] font-semibold tracking-wide text-ink-muted uppercase lg:block">
                {g.judul}
              </p>
              {isi.map((m) => {
                const aktif = menu === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onPilih(m)}
                    aria-current={aktif ? 'page' : undefined}
                    className={[
                      'relative flex min-h-11 shrink-0 items-center gap-2.5 rounded-control px-3 text-sm font-medium whitespace-nowrap',
                      'transition-colors duration-150 motion-reduce:transition-none lg:w-full',
                      aktif ? 'bg-brand-soft text-brand-strong' : 'text-ink-muted hover:bg-surface-alt hover:text-ink',
                    ].join(' ')}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute left-0 h-5 w-0.5 rounded-full bg-brand ${aktif ? 'block' : 'hidden'}`}
                    />
                    <IkonMenu nama={m} />
                    {namaMenu[m]}
                    {m === 'kasir' && t.keranjang.length > 0 && (
                      <span className="tabular ml-auto grid min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white">
                        {t.keranjang.reduce((s, b) => s + b.jumlah, 0)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

/** Ikon menu, satu keluarga garis dengan tebal yang sama. */
function IkonMenu({ nama }: { nama: Menu }) {
  const jalur: Record<Menu, string> = {
    kasir: 'M4 6h12M4 10h12M4 14h7M14 12v5m-2.5-2.5h5',
    transaksi: 'M5 3h10v14l-2.5-1.5L10 17l-2.5-1.5L5 17V3ZM8 7h4M8 10h4',
    produk: 'M3 7.5 10 4l7 3.5M3 7.5v5L10 16l7-3.5v-5M3 7.5 10 11l7-3.5M10 11v5',
    kategori: 'M3 4h5v5H3V4Zm9 0h5v5h-5V4ZM3 11h5v5H3v-5Zm9 0h5v5h-5v-5Z',
    promo: 'M10.5 3H16a1 1 0 0 1 1 1v5.5L9.5 17 3 10.5 10.5 3ZM13.5 6.5h.01',
    laporan: 'M4 16V9m4 7V5m4 11v-6m4 6V8M3 16.5h14',
    pengguna:
      'M7 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM2.5 16a4.5 4.5 0 0 1 9 0M14 9.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM13 12.5c2 0 4 1.3 4 3.5',
    pengaturan:
      'M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4',
  };
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 shrink-0"
      aria-hidden="true"
    >
      <path d={jalur[nama]} />
    </svg>
  );
}
