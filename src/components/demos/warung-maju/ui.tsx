import { useEffect, useId, useRef, type ReactNode } from 'react';
import type { Produk } from '../../../data/warung-maju';

/**
 * Komponen dasar yang dipakai semua layar aplikasi kasir.
 * Satu tempat supaya tampilan dan perilaku dialog, isian, dan lencana seragam.
 */

export const cls = {
  input:
    'h-11 w-full rounded-control border border-line-strong bg-surface px-3 text-sm outline-none ' +
    'placeholder:text-ink-muted/70 focus:border-brand disabled:bg-surface-alt disabled:text-ink-muted',
  area:
    'w-full rounded-control border border-line-strong bg-surface px-3 py-2.5 text-sm outline-none ' +
    'placeholder:text-ink-muted/70 focus:border-brand',
  btn:
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-line-strong bg-surface ' +
    'px-4 text-sm font-semibold hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50',
  btnUtama:
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-brand px-5 text-sm font-bold ' +
    'text-white hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50',
  btnBahaya:
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-red-700 px-5 text-sm font-bold ' +
    'text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50',
  btnKecil:
    'inline-flex min-h-9 items-center justify-center rounded-control border border-line-strong bg-surface px-3 ' +
    'text-xs font-semibold hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50',
  kartu: 'rounded-card border border-line bg-surface',
} as const;

/* ------------------------------------------------------------------ */
/* Dialog                                                              */
/* ------------------------------------------------------------------ */

const DAPAT_FOKUS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Ukuran = 'sm' | 'md' | 'lg' | 'xl';
const lebar: Record<Ukuran, string> = {
  sm: 'sm:w-[24rem]',
  md: 'sm:w-[30rem]',
  lg: 'sm:w-[40rem]',
  xl: 'sm:w-[54rem]',
};

interface PanelProps {
  judul: string;
  deskripsi?: string;
  onTutup: () => void;
  ukuran?: Ukuran;
  /** `kanan` menempel di tepi kanan setinggi layar; `tengah` jadi lembar bawah di ponsel. */
  posisi?: 'tengah' | 'kanan';
  /** Bagian bawah yang selalu kelihatan, biasanya tombol aksi. */
  kaki?: ReactNode;
  children: ReactNode;
}

/**
 * Dialog yang menjaga fokus papan ketik: fokus pindah ke dalam saat dibuka,
 * Tab berputar di dalamnya, Esc menutup, dan fokus kembali ke pemicunya.
 *
 * Badan dialog bisa digulir sendiri (`min-h-0` + `overflow-y-auto`), jadi
 * isi yang panjang tidak membuat kepala dan kaki terdorong keluar layar atau
 * tertekan jadi gepeng di layar pendek.
 */
export function Panel({
  judul,
  deskripsi,
  onTutup,
  ukuran = 'md',
  posisi = 'tengah',
  kaki,
  children,
}: PanelProps) {
  const kotak = useRef<HTMLDivElement>(null);
  const idJudul = useId();
  const kanan = posisi === 'kanan';

  useEffect(() => {
    const sebelum = document.activeElement as HTMLElement | null;
    const el = kotak.current;
    const awal = el?.querySelector<HTMLElement>('[data-fokus-awal]') ?? el?.querySelector<HTMLElement>('input, select, textarea');
    (awal ?? el?.querySelector<HTMLElement>(DAPAT_FOKUS) ?? el)?.focus();
    // Halaman di belakang tidak ikut tergulir saat dialog terbuka.
    const lama = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = lama;
      sebelum?.focus?.();
    };
  }, []);

  function tekan(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onTutup();
      return;
    }
    if (e.key !== 'Tab' || !kotak.current) return;
    const daftar = Array.from(kotak.current.querySelectorAll<HTMLElement>(DAPAT_FOKUS)).filter(
      (x) => x.offsetParent !== null,
    );
    if (daftar.length === 0) return;
    const pertama = daftar[0];
    const terakhir = daftar[daftar.length - 1];
    if (e.shiftKey && document.activeElement === pertama) {
      e.preventDefault();
      terakhir.focus();
    } else if (!e.shiftKey && document.activeElement === terakhir) {
      e.preventDefault();
      pertama.focus();
    }
  }

  return (
    <div
      className={[
        'fixed inset-0 z-50 flex bg-ink/50',
        kanan ? 'justify-end' : 'items-end justify-center sm:items-center sm:p-4',
      ].join(' ')}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onTutup();
      }}
      onKeyDown={tekan}
    >
      <div
        ref={kotak}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idJudul}
        tabIndex={-1}
        className={[
          'flex w-full flex-col bg-surface shadow-card-hover outline-none',
          kanan
            ? 'masuk-kanan h-dvh sm:w-[30rem]'
            : `masuk-bawah max-h-[92dvh] rounded-t-2xl sm:rounded-card ${lebar[ukuran]}`,
        ].join(' ')}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id={idJudul} className="text-lg leading-tight">
              {judul}
            </h2>
            {deskripsi && <p className="mt-0.5 text-sm text-ink-muted">{deskripsi}</p>}
          </div>
          <button
            type="button"
            onClick={onTutup}
            aria-label="Tutup"
            className="-mt-1 -mr-2 grid size-11 shrink-0 place-items-center rounded-control text-xl text-ink-muted hover:bg-surface-alt"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {kaki && <div className="shrink-0 border-t border-line px-5 py-3">{kaki}</div>}
      </div>
    </div>
  );
}

export function Konfirmasi({
  judul,
  isi,
  tombol,
  bahaya = false,
  onYa,
  onBatal,
}: {
  judul: string;
  isi: ReactNode;
  tombol: string;
  bahaya?: boolean;
  onYa: () => void;
  onBatal: () => void;
}) {
  return (
    <Panel
      judul={judul}
      ukuran="sm"
      onTutup={onBatal}
      kaki={
        <div className="flex gap-2">
          <button type="button" onClick={onBatal} className={`${cls.btn} flex-1`} data-fokus-awal>
            Batal
          </button>
          <button type="button" onClick={onYa} className={`${bahaya ? cls.btnBahaya : cls.btnUtama} flex-1`}>
            {tombol}
          </button>
        </div>
      }
    >
      <div className="text-sm text-ink-muted">{isi}</div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Isian                                                               */
/* ------------------------------------------------------------------ */

interface PropsIsian {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

export function Medan({
  label,
  wajib = false,
  bantu,
  salah,
  children,
  id: idDasar,
}: {
  label: string;
  wajib?: boolean;
  bantu?: string;
  salah?: string;
  /** Isian sungguhan; menerima id dan atribut aksesibilitas yang sudah dirangkai. */
  children: (p: PropsIsian) => ReactNode;
  id?: string;
}) {
  const otomatis = useId();
  const id = idDasar ?? otomatis;
  const idBantu = `${id}-bantu`;
  const ada = Boolean(bantu || salah);
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink-muted">
        {label}
        {wajib && <span className="text-red-700"> *</span>}
      </label>
      <div className="mt-1.5">
        {children({
          id,
          'aria-describedby': ada ? idBantu : undefined,
          'aria-invalid': salah ? true : undefined,
        })}
      </div>
      {ada && (
        <p
          id={idBantu}
          role={salah ? 'alert' : undefined}
          className={`mt-1.5 text-xs ${salah ? 'font-medium text-red-700' : 'text-ink-muted'}`}
        >
          {salah || bantu}
        </p>
      )}
    </div>
  );
}

/** Isian rupiah: tampil dengan titik ribuan, nilai disimpan sebagai angka. */
export function IsianRupiah({
  nilai,
  onUbah,
  awalan = 'Rp',
  ...rest
}: {
  nilai: number;
  onUbah: (n: number) => void;
  awalan?: string;
} & PropsIsian & { placeholder?: string; disabled?: boolean }) {
  const { placeholder, disabled, ...aria } = rest;
  return (
    <div className="flex h-11 items-center rounded-control border border-line-strong bg-surface px-3 focus-within:border-brand">
      <span className="mr-1.5 text-sm text-ink-muted">{awalan}</span>
      <input
        {...aria}
        type="text"
        inputMode="numeric"
        disabled={disabled}
        placeholder={placeholder ?? '0'}
        value={nilai === 0 ? '' : nilai.toLocaleString('id-ID')}
        onChange={(e) => onUbah(Number(e.target.value.replace(/\D/g, '').slice(0, 10)) || 0)}
        className="tabular h-full w-full bg-transparent text-sm outline-none"
      />
    </div>
  );
}

/** Sakelar hidup/mati. Memakai checkbox sungguhan supaya papan ketik dan pembaca layar bekerja. */
export function Sakelar({
  label,
  keterangan,
  nyala,
  onUbah,
  disabled = false,
}: {
  label: string;
  keterangan?: string;
  nyala: boolean;
  onUbah: (b: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={`flex items-start justify-between gap-4 ${disabled ? 'opacity-60' : 'cursor-pointer'}`}
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {keterangan && <span className="block text-xs text-ink-muted">{keterangan}</span>}
      </span>
      <span className="relative mt-0.5 shrink-0">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={nyala}
          disabled={disabled}
          onChange={(e) => onUbah(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="block h-6 w-11 rounded-full bg-line-strong transition-colors duration-150 peer-checked:bg-brand peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand motion-reduce:transition-none"
        />
        <span
          aria-hidden="true"
          className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-150 peer-checked:translate-x-5 motion-reduce:transition-none"
        />
      </span>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Tampilan kecil                                                      */
/* ------------------------------------------------------------------ */

type Nada = 'netral' | 'aman' | 'peringatan' | 'bahaya' | 'info';
const gayaNada: Record<Nada, string> = {
  netral: 'border-line bg-surface-alt text-ink-muted',
  aman: 'border-brand/30 bg-brand-soft text-brand-strong',
  peringatan: 'border-amber-300 bg-amber-50 text-amber-900',
  bahaya: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-sky-200 bg-sky-50 text-sky-900',
};

/** Lencana status. Selalu memuat tulisan, supaya warna tidak jadi satu-satunya penanda. */
export function Lencana({ nada = 'netral', children }: { nada?: Nada; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${gayaNada[nada]}`}
    >
      {children}
    </span>
  );
}

export function Kosong({ judul, isi, aksi }: { judul: string; isi?: string; aksi?: ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
      <p className="font-display text-lg">{judul}</p>
      {isi && <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">{isi}</p>}
      {aksi && <div className="mt-4 flex justify-center">{aksi}</div>}
    </div>
  );
}

/** Foto produk, atau huruf awal nama kalau belum ada foto. */
export function FotoProduk({
  produk,
  className = '',
}: {
  produk: Pick<Produk, 'nama' | 'foto'>;
  className?: string;
}) {
  if (produk.foto) {
    return (
      <img
        src={produk.foto}
        alt=""
        loading="lazy"
        decoding="async"
        className={`bg-surface-alt object-cover ${className}`}
      />
    );
  }
  const huruf = produk.nama
    .split(/\s+/)
    .slice(0, 2)
    .map((k) => k[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <span
      aria-hidden="true"
      className={`grid place-items-center bg-brand-soft font-display font-bold text-brand-strong ${className}`}
    >
      {huruf}
    </span>
  );
}

export function Toast({ pesan }: { pesan: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex justify-center px-4 lg:bottom-6"
    >
      {pesan && (
        <p className="masuk-bawah max-w-md rounded-control bg-ink px-4 py-3 text-sm font-medium text-white shadow-card-hover">
          {pesan}
        </p>
      )}
    </div>
  );
}

/** Kerangka satu halaman: judul di kiri, aksi di kanan, isi di bawahnya. */
export function Halaman({
  judul,
  ringkas,
  aksi,
  children,
}: {
  judul: string;
  ringkas?: string;
  aksi?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl leading-tight">{judul}</h1>
          {ringkas && <p className="mt-0.5 text-sm text-ink-muted">{ringkas}</p>}
        </div>
        {aksi && <div className="flex flex-wrap items-center gap-2">{aksi}</div>}
      </div>
      {children}
    </div>
  );
}

/** Angka ringkas di atas daftar. Hanya satu yang boleh jadi `utama` dalam satu tampilan. */
export function AngkaRingkas({
  label,
  nilai,
  ket,
  nada = 'netral',
}: {
  label: string;
  nilai: string;
  ket?: string;
  nada?: 'netral' | 'peringatan';
}) {
  return (
    <div
      className={`rounded-card border px-4 py-3 ${nada === 'peringatan' ? 'border-amber-300 bg-amber-50' : 'border-line bg-surface'}`}
    >
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd
        className={`tabular mt-0.5 font-display text-xl font-extrabold sm:text-2xl ${nada === 'peringatan' ? 'text-amber-900' : ''}`}
      >
        {nilai}
      </dd>
      {ket && <dd className="mt-0.5 text-[11px] text-ink-muted">{ket}</dd>}
    </div>
  );
}
