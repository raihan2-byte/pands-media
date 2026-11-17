import { useEffect, useMemo, useState } from 'react';
import {
  barang as daftarBarang,
  gerakAwal,
  gudang,
  kategori,
  peran as daftarPeran,
  penggunaAwal,
  permintaanAwal,
  rupiah,
  rupiahSingkat,
  statusStok,
  type Barang,
  type Gerak,
  type JenisGerak,
  type KategoriSlug,
  type Lokasi,
  type PeranSlug,
  type Pengguna,
  type Permintaan,
  type StatusPermintaan,
} from '../../../data/gudang-sentosa';

/**
 * Layar stok Gudang Sentosa dengan empat peran pengguna.
 *
 * Satu komponen memegang stok, riwayat, permintaan, dan daftar pengguna
 * supaya angka di semua tab tidak pernah berbeda.
 *
 * Izin dipakai untuk menyembunyikan menu sekaligus menolak aksinya, bukan
 * hanya menyembunyikan tombol. Di sistem asli pemeriksaan yang sama harus
 * diulang di server, karena apa pun yang hidup di browser bisa diubah
 * pemakainya.
 *
 * Tidak ada server dan tidak ada basis data. Semua perubahan hilang saat
 * halaman dimuat ulang.
 */

type Status = 'semua' | 'menipis' | 'habis';
type Urut = 'nama' | 'stok-sedikit' | 'nilai-besar';
type Tab = 'stok' | 'permintaan' | 'riwayat' | 'pengguna';

const labelStatus: Record<ReturnType<typeof statusStok>, string> = {
  aman: 'Aman',
  menipis: 'Perlu dipesan',
  habis: 'Habis',
};

const inputCls =
  'h-10 w-full rounded-control border border-line bg-surface px-3 text-sm outline-none focus:border-brand';

export default function Inventaris() {
  /* ---------------- peran dan pengguna ---------------- */
  const [peranAktif, setPeranAktif] = useState<PeranSlug>('admin');
  const [pengguna, setPengguna] = useState<Pengguna[]>(penggunaAwal);

  const izin = useMemo(
    () => daftarPeran.find((p) => p.slug === peranAktif)!.izin,
    [peranAktif],
  );
  const namaPeran = daftarPeran.find((p) => p.slug === peranAktif)!;
  /* Akun contoh yang sedang "dipakai" untuk peran terpilih. */
  const akun = useMemo(
    () =>
      pengguna.find((u) => u.peran === peranAktif && u.aktif) ??
      penggunaAwal.find((u) => u.peran === peranAktif)!,
    [pengguna, peranAktif],
  );

  /* ---------------- data gudang ---------------- */
  const [stok, setStok] = useState<Record<string, number>>(() =>
    Object.fromEntries(daftarBarang.map((b) => [b.kode, b.stok])),
  );
  const [minimum, setMinimum] = useState<Record<string, number>>(() =>
    Object.fromEntries(daftarBarang.map((b) => [b.kode, b.minimum])),
  );
  const [gerak, setGerak] = useState<Gerak[]>(gerakAwal);
  const [permintaan, setPermintaan] = useState<Permintaan[]>(permintaanAwal);
  const [nomorGerak, setNomorGerak] = useState(126);
  const [nomorMinta, setNomorMinta] = useState(43);

  /* ---------------- tampilan ---------------- */
  const [tab, setTab] = useState<Tab>('stok');
  const [cari, setCari] = useState('');
  const [kat, setKat] = useState<KategoriSlug | 'semua'>('semua');
  const [lok, setLok] = useState<Lokasi | 'semua'>('semua');
  const [status, setStatus] = useState<Status>('semua');
  const [urut, setUrut] = useState<Urut>('nama');
  const [saringMinta, setSaringMinta] = useState<StatusPermintaan | 'semua'>('menunggu');
  const [saringGerak, setSaringGerak] = useState<JenisGerak | 'semua'>('semua');

  const [terpilih, setTerpilih] = useState<string | null>(null);
  const [jenis, setJenis] = useState<JenisGerak>('masuk');
  const [jumlah, setJumlah] = useState(0);
  const [catatan, setCatatan] = useState('');
  const [salah, setSalah] = useState('');
  const [kabar, setKabar] = useState('');

  const peta = useMemo(
    () => Object.fromEntries(daftarBarang.map((b) => [b.kode, b])) as Record<string, Barang>,
    [],
  );

  /* Peran tanpa izin semua lokasi hanya melihat lokasinya sendiri. */
  const lokasiEfektif: Lokasi | 'semua' = izin.semuaLokasi ? lok : akun.lokasi;

  const terlihat = useMemo(
    () =>
      daftarBarang.filter(
        (b) => lokasiEfektif === 'semua' || b.lokasi === lokasiEfektif,
      ),
    [lokasiEfektif],
  );

  const ringkas = useMemo(() => {
    const nilai = terlihat.reduce((t, b) => t + stok[b.kode] * b.hargaBeli, 0);
    const perluPesan = terlihat.filter(
      (b) => statusStok(stok[b.kode], minimum[b.kode]) !== 'aman',
    ).length;
    const menunggu = permintaan.filter((p) => p.status === 'menunggu').length;
    const hariIni = gerak.length - gerakAwal.length;
    return { nilai, perluPesan, menunggu, hariIni, sku: terlihat.length };
  }, [terlihat, stok, minimum, gerak.length, permintaan]);

  const tampil = useMemo(() => {
    const kata = cari.trim().toLowerCase();
    const hasil = terlihat.filter((b) => {
      const s = statusStok(stok[b.kode], minimum[b.kode]);
      if (kata && !`${b.nama} ${b.kode} ${b.rak} ${b.pemasok}`.toLowerCase().includes(kata))
        return false;
      if (kat !== 'semua' && b.kategori !== kat) return false;
      if (status === 'menipis' && s !== 'menipis') return false;
      if (status === 'habis' && s !== 'habis') return false;
      return true;
    });

    return hasil.sort((a, b) => {
      if (urut === 'stok-sedikit') {
        return stok[a.kode] - minimum[a.kode] - (stok[b.kode] - minimum[b.kode]);
      }
      if (urut === 'nilai-besar') {
        return stok[b.kode] * b.hargaBeli - stok[a.kode] * a.hargaBeli;
      }
      return a.nama.localeCompare(b.nama, 'id');
    });
  }, [terlihat, cari, kat, status, urut, stok, minimum]);

  const brg = terpilih ? peta[terpilih] : null;
  const riwayatBarang = useMemo(
    () => (terpilih ? [...gerak].reverse().filter((g) => g.kode === terpilih) : []),
    [gerak, terpilih],
  );

  const daftarGerak = useMemo(
    () =>
      [...gerak]
        .reverse()
        .filter((g) => saringGerak === 'semua' || g.jenis === saringGerak)
        .filter((g) => lokasiEfektif === 'semua' || peta[g.kode].lokasi === lokasiEfektif),
    [gerak, saringGerak, lokasiEfektif, peta],
  );

  const daftarMinta = useMemo(
    () =>
      [...permintaan]
        .sort((a, b) => (a.status === 'menunggu' ? -1 : 1) - (b.status === 'menunggu' ? -1 : 1))
        .filter((p) => saringMinta === 'semua' || p.status === saringMinta),
    [permintaan, saringMinta],
  );

  /* Tab yang tidak boleh dibuka peran ini dikembalikan ke Stok. */
  useEffect(() => {
    if (tab === 'pengguna' && !izin.kelolaPengguna) setTab('stok');
    if (tab === 'permintaan' && !izin.setujuiPermintaan && !izin.ajukanPermintaan) setTab('stok');
  }, [tab, izin]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && terpilih) setTerpilih(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [terpilih]);

  function waktuSekarang() {
    return new Date().toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function buka(kode: string) {
    setTerpilih(kode);
    setJenis(izin.catatLangsung ? 'masuk' : 'keluar');
    setJumlah(0);
    setCatatan('');
    setSalah('');
  }

  /** Mencatat pergerakan dan mengubah stok. Dipakai juga saat menyetujui. */
  function catat(kode: string, j: JenisGerak, n: number, ket: string, oleh: string) {
    const baru: Gerak = {
      id: `GRK-${nomorGerak}`,
      waktu: waktuSekarang(),
      kode,
      jenis: j,
      jumlah: n,
      catatan: ket,
      petugas: oleh,
    };
    setStok((s) => ({ ...s, [kode]: j === 'masuk' ? s[kode] + n : s[kode] - n }));
    setGerak((g) => [...g, baru]);
    setNomorGerak((x) => x + 1);
  }

  function simpanGerak() {
    if (!brg) return;
    // Izin diperiksa lagi di sini, bukan cuma saat menggambar tombolnya.
    if (!izin.catatLangsung) {
      setSalah('Peran ini tidak boleh mengubah stok secara langsung.');
      return;
    }
    if (jumlah <= 0) {
      setSalah('Jumlah harus lebih dari 0.');
      return;
    }
    if (jenis === 'keluar' && jumlah > stok[brg.kode]) {
      setSalah(`Stok ${brg.nama} tinggal ${stok[brg.kode]} ${brg.satuan}.`);
      return;
    }
    if (catatan.trim() === '') {
      setSalah(
        jenis === 'masuk'
          ? 'Tulis asal barang, misalnya nomor surat jalan.'
          : 'Tulis tujuan barang, misalnya nama toko pemesan.',
      );
      return;
    }

    catat(brg.kode, jenis, jumlah, catatan.trim(), akun.nama);
    setKabar(`${jumlah} ${brg.satuan} ${brg.nama} dicatat ${jenis}.`);
    setJumlah(0);
    setCatatan('');
    setSalah('');
  }

  function ajukan() {
    if (!brg) return;
    if (!izin.ajukanPermintaan) {
      setSalah('Peran ini tidak boleh mengajukan permintaan.');
      return;
    }
    if (jumlah <= 0) {
      setSalah('Jumlah harus lebih dari 0.');
      return;
    }
    if (catatan.trim() === '') {
      setSalah('Tulis tujuan barang, misalnya nama toko pemesan.');
      return;
    }

    setPermintaan((p) => [
      {
        id: `REQ-0${nomorMinta}`,
        kode: brg.kode,
        jumlah,
        catatan: catatan.trim(),
        pemohon: akun.nama,
        waktu: waktuSekarang(),
        status: 'menunggu',
      },
      ...p,
    ]);
    setNomorMinta((n) => n + 1);
    setKabar(`Permintaan ${jumlah} ${brg.satuan} ${brg.nama} dikirim ke kepala gudang.`);
    setJumlah(0);
    setCatatan('');
    setSalah('');
  }

  function putuskan(id: string, setuju: boolean, alasan?: string) {
    if (!izin.setujuiPermintaan) return;
    const p = permintaan.find((x) => x.id === id);
    if (!p || p.status !== 'menunggu') return;

    if (setuju) {
      if (p.jumlah > stok[p.kode]) {
        setKabar(
          `Tidak bisa disetujui: sisa ${peta[p.kode].nama} tinggal ${stok[p.kode]}.`,
        );
        return;
      }
      catat(p.kode, 'keluar', p.jumlah, `${p.id} — ${p.catatan}`, akun.nama);
    }

    setPermintaan((list) =>
      list.map((x) =>
        x.id === id
          ? {
              ...x,
              status: setuju ? 'disetujui' : 'ditolak',
              penilai: akun.nama,
              alasan: setuju ? undefined : (alasan ?? 'Tidak disetujui'),
            }
          : x,
      ),
    );
    setKabar(`Permintaan ${id} ${setuju ? 'disetujui' : 'ditolak'}.`);
  }

  function ulangDemo() {
    setStok(Object.fromEntries(daftarBarang.map((b) => [b.kode, b.stok])));
    setMinimum(Object.fromEntries(daftarBarang.map((b) => [b.kode, b.minimum])));
    setGerak(gerakAwal);
    setPermintaan(permintaanAwal);
    setPengguna(penggunaAwal);
    setNomorGerak(126);
    setNomorMinta(43);
    setTerpilih(null);
    setKabar('Demo dikembalikan ke keadaan awal.');
  }

  const tabTersedia: { nilai: Tab; label: string; lencana?: number }[] = [
    { nilai: 'stok', label: 'Stok' },
    ...(izin.setujuiPermintaan || izin.ajukanPermintaan
      ? [
          {
            nilai: 'permintaan' as Tab,
            label: 'Permintaan',
            lencana: izin.setujuiPermintaan ? ringkas.menunggu : undefined,
          },
        ]
      : []),
    { nilai: 'riwayat', label: 'Riwayat' },
    ...(izin.kelolaPengguna ? [{ nilai: 'pengguna' as Tab, label: 'Pengguna' }] : []),
  ];

  const judulTab: Record<Tab, string> = {
    stok: 'Daftar stok',
    permintaan: 'Permintaan barang keluar',
    riwayat: 'Riwayat pergerakan',
    pengguna: 'Pengguna & hak akses',
  };

  return (
    <div className="min-h-[calc(100dvh-2.75rem)] bg-surface-alt lg:grid lg:grid-cols-[15rem_1fr]">
      <p aria-live="polite" className="sr-only">
        {kabar}
      </p>

      {/* Panel samping gelap. Di layar lebar menempel, di ponsel jadi baris
          menu yang bisa digeser. */}
      <aside className="bg-brand-strong text-white lg:sticky lg:top-11 lg:flex lg:h-[calc(100dvh-2.75rem)] lg:flex-col">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-control bg-accent font-display text-sm font-bold text-brand-strong"
            aria-hidden="true"
          >
            GS
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-sm leading-tight font-bold">
              {gudang.nama}
            </span>
            <span className="block truncate text-[11px] text-white/60">
              Pencatatan stok · {gudang.kota}
            </span>
          </span>
        </div>

        <nav
          aria-label="Bagian aplikasi"
          className="flex gap-1 overflow-x-auto border-t border-white/10 px-2 py-2 lg:flex-col lg:gap-0.5 lg:overflow-visible"
        >
          {tabTersedia.map((t) => {
            const aktif = tab === t.nilai;
            return (
              <button
                key={t.nilai}
                type="button"
                onClick={() => setTab(t.nilai)}
                aria-current={aktif ? 'page' : undefined}
                className={[
                  'relative flex min-h-11 shrink-0 items-center gap-2.5 rounded-control px-3 text-sm font-medium whitespace-nowrap',
                  'transition-colors duration-150 motion-reduce:transition-none lg:w-full',
                  aktif ? 'bg-white/10 text-white' : 'text-white/65 hover:bg-white/5 hover:text-white',
                ].join(' ')}
              >
                {/* Penanda aktif berupa batang, bukan warna teks saja. */}
                <span
                  aria-hidden="true"
                  className={[
                    'absolute left-0 h-5 w-0.5 rounded-full bg-accent',
                    aktif ? 'block' : 'hidden',
                  ].join(' ')}
                />
                <IkonTab nama={t.nilai} />
                {t.label}
                {t.lencana !== undefined && t.lencana > 0 && (
                  <span className="tabular ml-auto grid min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-brand-strong">
                    {t.lencana}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto hidden border-t border-white/10 px-4 py-3 lg:block">
          <p className="text-[11px] tracking-wide text-white/50 uppercase">Masuk sebagai</p>
          <p className="mt-0.5 text-sm font-semibold">{akun.nama}</p>
          <p className="text-[11px] text-white/60">
            {namaPeran.nama}
            {!izin.semuaLokasi && ` · ${akun.lokasi}`}
          </p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <h1 className="font-display text-base leading-tight font-bold">
              {judulTab[tab]}
            </h1>
            <p className="truncate text-xs text-ink-muted">{namaPeran.ringkas}</p>
          </div>

          {/* Pengalih peran. Ini alat demo, bukan menu yang ada di sistem
              asli — di sana peran ditentukan saat masuk. */}
          <div className="flex items-center gap-2">
            <label htmlFor="peran" className="text-xs text-ink-muted">
              Lihat sebagai
            </label>
            <select
              id="peran"
              value={peranAktif}
              onChange={(e) => {
                setPeranAktif(e.target.value as PeranSlug);
                setTerpilih(null);
                setKabar('');
              }}
              className="h-10 rounded-control border border-line-strong bg-surface px-3 text-sm font-semibold outline-none focus:border-brand"
            >
              {daftarPeran.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.nama}
                </option>
              ))}
            </select>
          </div>
        </header>

      <div className="px-4 py-5 sm:px-6">
        {tab === 'stok' && (
          <>
            <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Kartu k="Jenis barang" v={String(ringkas.sku)} ket="SKU terdaftar" />
              {izin.lihatNilai ? (
                <Kartu
                  k="Nilai stok"
                  v={rupiahSingkat(ringkas.nilai)}
                  ket="harga beli × sisa"
                />
              ) : (
                <Kartu
                  k="Lokasi kerja"
                  v={izin.semuaLokasi ? 'Semua' : akun.lokasi.replace('Gudang ', '')}
                  ket="sesuai penugasan"
                />
              )}
              <Kartu
                k="Perlu dipesan"
                v={String(ringkas.perluPesan)}
                ket="di bawah batas minimum"
                tanda={ringkas.perluPesan > 0}
              />
              <Kartu
                k={izin.setujuiPermintaan ? 'Menunggu persetujuan' : 'Dicatat hari ini'}
                v={String(izin.setujuiPermintaan ? ringkas.menunggu : ringkas.hariIni)}
                ket={izin.setujuiPermintaan ? 'permintaan masuk' : 'masuk & keluar'}
                tanda={izin.setujuiPermintaan && ringkas.menunggu > 0}
              />
            </dl>

            <div className="mt-5 flex flex-col gap-3 rounded-card border border-line bg-surface p-3 sm:p-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <label htmlFor="cari" className="sr-only">
                    Cari barang, kode, rak, atau pemasok
                  </label>
                  <input
                    id="cari"
                    type="search"
                    value={cari}
                    onChange={(e) => setCari(e.target.value)}
                    placeholder="Cari nama, kode, rak, pemasok…"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label htmlFor="kategori" className="sr-only">
                    Kategori
                  </label>
                  <select
                    id="kategori"
                    value={kat}
                    onChange={(e) => setKat(e.target.value as KategoriSlug | 'semua')}
                    className={inputCls}
                  >
                    <option value="semua">Semua kategori</option>
                    {kategori.map((k) => (
                      <option key={k.slug} value={k.slug}>
                        {k.nama}
                      </option>
                    ))}
                  </select>
                </div>

                {izin.semuaLokasi ? (
                  <div>
                    <label htmlFor="lokasi" className="sr-only">
                      Lokasi gudang
                    </label>
                    <select
                      id="lokasi"
                      value={lok}
                      onChange={(e) => setLok(e.target.value as Lokasi | 'semua')}
                      className={inputCls}
                    >
                      <option value="semua">Semua lokasi</option>
                      {gudang.lokasi.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="flex h-10 items-center rounded-control bg-surface-alt px-3 text-sm text-ink-muted">
                    Terkunci di {akun.lokasi}
                  </p>
                )}

                <div>
                  <label htmlFor="urut" className="sr-only">
                    Urutkan
                  </label>
                  <select
                    id="urut"
                    value={urut}
                    onChange={(e) => setUrut(e.target.value as Urut)}
                    className={inputCls}
                  >
                    <option value="nama">Urut nama</option>
                    <option value="stok-sedikit">Paling dekat habis</option>
                    {izin.lihatNilai && <option value="nilai-besar">Nilai stok terbesar</option>}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    { nilai: 'semua', label: 'Semua' },
                    { nilai: 'menipis', label: 'Perlu dipesan' },
                    { nilai: 'habis', label: 'Habis' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.nilai}
                    type="button"
                    onClick={() => setStatus(f.nilai)}
                    aria-pressed={status === f.nilai}
                    className={[
                      'min-h-10 rounded-full border px-4 text-sm font-semibold',
                      status === f.nilai
                        ? 'border-brand bg-brand text-white'
                        : 'border-line text-ink-muted hover:text-ink',
                    ].join(' ')}
                  >
                    {f.label}
                  </button>
                ))}

                <p aria-live="polite" className="ml-auto text-sm text-ink-muted">
                  {tampil.length} dari {terlihat.length} barang
                </p>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-card border border-line bg-surface">
              <table className="hidden w-full border-collapse text-left text-sm lg:table">
                <thead className="sticky top-0 z-10 border-b border-line bg-surface-alt text-[11px] tracking-wide text-ink-muted uppercase">
                  <tr>
                    <th
                      scope="col"
                      aria-sort={urut === 'nama' ? 'ascending' : 'none'}
                      className="px-4 py-2.5 font-semibold"
                    >
                      Barang
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Lokasi</th>
                    <th
                      scope="col"
                      aria-sort={urut === 'stok-sedikit' ? 'ascending' : 'none'}
                      className="px-4 py-2.5 text-right font-semibold"
                    >
                      Sisa
                    </th>
                    <th scope="col" className="px-4 py-2.5 text-right font-semibold">Minimum</th>
                    {izin.lihatNilai && (
                      <th
                        scope="col"
                        aria-sort={urut === 'nilai-besar' ? 'descending' : 'none'}
                        className="px-4 py-2.5 text-right font-semibold"
                      >
                        Nilai stok
                      </th>
                    )}
                    <th scope="col" className="px-4 py-2.5 font-semibold">Status</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-semibold">
                      <span className="sr-only">Aksi</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {tampil.map((b) => {
                    const sisa = stok[b.kode];
                    const s = statusStok(sisa, minimum[b.kode]);
                    return (
                      <tr key={b.kode} className="hover:bg-surface-alt">
                        <td className="px-4 py-2.5">
                          <span className="block font-medium">{b.nama}</span>
                          <span className="tabular block text-xs text-ink-muted">
                            {b.kode} · {b.pemasok}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-ink-muted">
                          <span className="tabular block">{b.rak}</span>
                          <span className="block text-xs">{b.lokasi}</span>
                        </td>
                        <td className="tabular px-4 py-2.5 text-right">
                          <span className="font-semibold">{sisa}</span>{' '}
                          <span className="text-xs text-ink-muted">{b.satuan}</span>
                        </td>
                        <td className="tabular px-4 py-2.5 text-right text-ink-muted">
                          {minimum[b.kode]}
                        </td>
                        {izin.lihatNilai && (
                          <td className="tabular px-4 py-2.5 text-right">
                            {rupiah(sisa * b.hargaBeli)}
                          </td>
                        )}
                        <td className="px-4 py-2.5">
                          <Lencana status={s} />
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => buka(b.kode)}
                            className="min-h-9 rounded-control border border-line px-3 text-xs font-semibold hover:bg-surface-alt"
                          >
                            {izin.catatLangsung
                              ? 'Catat'
                              : izin.ajukanPermintaan
                                ? 'Ajukan'
                                : 'Lihat'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <ul className="divide-y divide-line lg:hidden">
                {tampil.map((b) => {
                  const sisa = stok[b.kode];
                  const s = statusStok(sisa, minimum[b.kode]);
                  return (
                    <li key={b.kode}>
                      <button
                        type="button"
                        onClick={() => buka(b.kode)}
                        className="flex w-full items-start justify-between gap-3 p-4 text-left hover:bg-surface-alt"
                      >
                        <span className="min-w-0">
                          <span className="block font-medium">{b.nama}</span>
                          <span className="tabular block text-xs text-ink-muted">
                            {b.kode} · rak {b.rak} · {b.lokasi}
                          </span>
                          <span className="mt-1.5 block">
                            <Lencana status={s} />
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="tabular block font-display text-lg font-extrabold">
                            {sisa}
                          </span>
                          <span className="block text-xs text-ink-muted">{b.satuan}</span>
                          <span className="tabular block text-xs text-ink-muted">
                            min. {minimum[b.kode]}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {tampil.length === 0 && (
                <p className="p-8 text-center text-sm text-ink-muted">
                  Tidak ada barang yang cocok dengan saringan ini.
                </p>
              )}
            </div>
          </>
        )}

        {tab === 'permintaan' && (
          <section>
            <h2 className="text-lg">Permintaan barang keluar</h2>
            <p className="mt-1 text-sm text-ink-muted">
              {izin.setujuiPermintaan
                ? 'Diajukan admin penjualan. Stok baru berkurang setelah kamu setujui.'
                : 'Permintaan yang kamu ajukan. Stok berkurang setelah kepala gudang menyetujui.'}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {(
                [
                  { nilai: 'menunggu', label: 'Menunggu' },
                  { nilai: 'disetujui', label: 'Disetujui' },
                  { nilai: 'ditolak', label: 'Ditolak' },
                  { nilai: 'semua', label: 'Semua' },
                ] as const
              ).map((f) => (
                <button
                  key={f.nilai}
                  type="button"
                  onClick={() => setSaringMinta(f.nilai)}
                  aria-pressed={saringMinta === f.nilai}
                  className={[
                    'min-h-10 rounded-full border px-4 text-sm font-semibold',
                    saringMinta === f.nilai
                      ? 'border-brand bg-brand text-white'
                      : 'border-line text-ink-muted hover:text-ink',
                  ].join(' ')}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <ul className="mt-4 flex flex-col gap-3">
              {daftarMinta.map((p) => (
                <BarisPermintaan
                  key={p.id}
                  permintaan={p}
                  barang={peta[p.kode]}
                  sisa={stok[p.kode]}
                  bolehPutuskan={izin.setujuiPermintaan}
                  onPutus={putuskan}
                />
              ))}
            </ul>

            {daftarMinta.length === 0 && (
              <p className="mt-4 rounded-card border border-line bg-surface p-8 text-center text-sm text-ink-muted">
                Tidak ada permintaan di saringan ini.
              </p>
            )}
          </section>
        )}

        {tab === 'riwayat' && (
          <section>
            <h2 className="text-lg">Riwayat pergerakan</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Tiap baris mencatat siapa yang melakukannya. Catatan lama tidak bisa
              dihapus atau diubah, hanya dikoreksi dengan pencatatan baru.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {(
                [
                  { nilai: 'semua', label: 'Semua' },
                  { nilai: 'masuk', label: 'Masuk' },
                  { nilai: 'keluar', label: 'Keluar' },
                ] as const
              ).map((f) => (
                <button
                  key={f.nilai}
                  type="button"
                  onClick={() => setSaringGerak(f.nilai)}
                  aria-pressed={saringGerak === f.nilai}
                  className={[
                    'min-h-10 rounded-full border px-4 text-sm font-semibold',
                    saringGerak === f.nilai
                      ? 'border-brand bg-brand text-white'
                      : 'border-line text-ink-muted hover:text-ink',
                  ].join(' ')}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <ul className="mt-4 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
              {daftarGerak.map((g) => (
                <li key={g.id} className="flex items-start justify-between gap-3 p-4">
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <PilGerak jenis={g.jenis} />
                      <span className="tabular text-sm font-semibold">
                        {g.jenis === 'masuk' ? '+' : '−'}
                        {g.jumlah} {peta[g.kode].satuan}
                      </span>
                      <span className="text-sm">{peta[g.kode].nama}</span>
                    </span>
                    <span className="mt-1 block text-xs text-ink-muted">{g.catatan}</span>
                    <span className="tabular block text-xs text-ink-muted">
                      {g.waktu} · oleh {g.petugas}
                    </span>
                  </span>
                  <span className="tabular shrink-0 text-xs text-ink-muted">{g.id}</span>
                </li>
              ))}
            </ul>

            {daftarGerak.length === 0 && (
              <p className="mt-4 rounded-card border border-line bg-surface p-8 text-center text-sm text-ink-muted">
                Belum ada pergerakan di saringan ini.
              </p>
            )}
          </section>
        )}

        {tab === 'pengguna' && izin.kelolaPengguna && (
          <KelolaPengguna
            pengguna={pengguna}
            setPengguna={setPengguna}
            akun={akun}
            onKabar={setKabar}
          />
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-ink-muted">
            Demo ini tanpa server. Perubahan hidup di browser saja dan kembali ke
            awal saat halaman dimuat ulang.
          </p>
          <button
            type="button"
            onClick={ulangDemo}
            className="min-h-10 rounded-control border border-line bg-surface px-4 text-sm font-semibold hover:bg-surface-alt"
          >
            Kembalikan demo ke awal
          </button>
        </div>
        </div>
      </div>

      {/* Panel detail barang. Isinya menyesuaikan izin peran. */}
      {brg && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-ink/50"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setTerpilih(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Detail ${brg.nama}`}
            className="masuk-kanan flex h-dvh w-full flex-col bg-surface shadow-card-hover sm:w-[28rem]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div className="min-w-0">
                <p className="tabular text-xs text-ink-muted">{brg.kode}</p>
                <h2 className="text-lg leading-tight">{brg.nama}</h2>
                <p className="text-xs text-ink-muted">
                  Rak {brg.rak} · {brg.lokasi} · {brg.pemasok}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTerpilih(null)}
                aria-label="Tutup detail barang"
                className="-mt-1 -mr-2 grid size-11 shrink-0 place-items-center rounded-control text-xl text-ink-muted hover:bg-surface-alt"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <dl className={`grid gap-3 ${izin.lihatNilai ? 'grid-cols-3' : 'grid-cols-2'}`}>
                <div className="rounded-card border border-line px-3 py-2.5">
                  <dt className="text-[11px] text-ink-muted">Sisa</dt>
                  <dd className="tabular font-display text-xl font-extrabold">
                    {stok[brg.kode]}
                  </dd>
                  <dd className="text-[11px] text-ink-muted">{brg.satuan}</dd>
                </div>
                <div className="rounded-card border border-line px-3 py-2.5">
                  <dt className="text-[11px] text-ink-muted">Minimum</dt>
                  <dd className="tabular font-display text-xl font-extrabold">
                    {minimum[brg.kode]}
                  </dd>
                  <dd className="text-[11px] text-ink-muted">{brg.satuan}</dd>
                </div>
                {izin.lihatNilai && (
                  <div className="rounded-card border border-line px-3 py-2.5">
                    <dt className="text-[11px] text-ink-muted">Nilai</dt>
                    <dd className="tabular font-display text-base font-extrabold">
                      {rupiahSingkat(stok[brg.kode] * brg.hargaBeli)}
                    </dd>
                    <dd className="text-[11px] text-ink-muted">
                      @{rupiahSingkat(brg.hargaBeli)}
                    </dd>
                  </div>
                )}
              </dl>

              {brg.isi && (
                <p className="mt-3 text-sm text-ink-muted">
                  Satu {brg.satuan} berisi {brg.isi}.
                </p>
              )}

              {izin.ubahMinimum && (
                <div className="mt-4 rounded-card border border-line p-3">
                  <label
                    htmlFor="batas"
                    className="block text-sm font-medium text-ink-muted"
                  >
                    Ubah batas minimum
                  </label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      id="batas"
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={minimum[brg.kode]}
                      onChange={(e) =>
                        setMinimum((m) => ({
                          ...m,
                          [brg.kode]: Math.max(0, Number(e.target.value)),
                        }))
                      }
                      className="tabular h-10 w-28 rounded-control border border-line bg-surface px-3 text-center text-sm outline-none focus:border-brand"
                    />
                    <span className="text-sm text-ink-muted">
                      {brg.satuan}. Di bawah ini barang ditandai perlu dipesan.
                    </span>
                  </div>
                </div>
              )}

              {izin.catatLangsung ? (
                <>
                  <h3 className="mt-6 text-base">Catat pergerakan</h3>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {(['masuk', 'keluar'] as const).map((j) => (
                      <button
                        key={j}
                        type="button"
                        onClick={() => {
                          setJenis(j);
                          setSalah('');
                        }}
                        aria-pressed={jenis === j}
                        className={[
                          'min-h-11 rounded-control border font-semibold capitalize',
                          jenis === j
                            ? 'border-brand bg-brand-soft text-brand-strong'
                            : 'border-line text-ink-muted hover:bg-surface-alt',
                        ].join(' ')}
                      >
                        Barang {j}
                      </button>
                    ))}
                  </div>
                </>
              ) : izin.ajukanPermintaan ? (
                <>
                  <h3 className="mt-6 text-base">Ajukan barang keluar</h3>
                  <p className="mt-1 text-sm text-ink-muted">
                    Permintaanmu masuk ke kepala gudang. Stok belum berkurang
                    sampai disetujui.
                  </p>
                </>
              ) : (
                <p className="mt-6 rounded-card border border-line bg-surface-alt p-4 text-sm text-ink-muted">
                  Peran ini hanya bisa melihat. Hubungi kepala gudang untuk
                  mengubah stok.
                </p>
              )}

              {(izin.catatLangsung || izin.ajukanPermintaan) && (
                <>
                  <div className="mt-3">
                    <label htmlFor="jumlah" className="block text-sm font-medium text-ink-muted">
                      Jumlah ({brg.satuan})
                    </label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setJumlah((n) => Math.max(0, n - 1))}
                        aria-label="Kurangi jumlah"
                        className="grid size-11 shrink-0 place-items-center rounded-control border border-line text-lg font-bold hover:bg-surface-alt"
                      >
                        &minus;
                      </button>
                      <input
                        id="jumlah"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={jumlah || ''}
                        placeholder="0"
                        onChange={(e) => {
                          setJumlah(Math.max(0, Number(e.target.value)));
                          setSalah('');
                        }}
                        className="tabular h-11 w-full rounded-control border border-line bg-surface px-3 text-center text-base outline-none focus:border-brand"
                      />
                      <button
                        type="button"
                        onClick={() => setJumlah((n) => n + 1)}
                        aria-label="Tambah jumlah"
                        className="grid size-11 shrink-0 place-items-center rounded-control border border-line text-lg font-bold hover:bg-surface-alt"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label htmlFor="catatan" className="block text-sm font-medium text-ink-muted">
                      {jenis === 'masuk' && izin.catatLangsung
                        ? 'Asal barang'
                        : 'Tujuan barang'}
                    </label>
                    <input
                      id="catatan"
                      type="text"
                      value={catatan}
                      placeholder={
                        jenis === 'masuk' && izin.catatLangsung
                          ? 'Kiriman PT Sinar Pangan, surat jalan 4482'
                          : 'Pesanan Toko Berkah'
                      }
                      onChange={(e) => {
                        setCatatan(e.target.value);
                        setSalah('');
                      }}
                      className="mt-1.5 h-11 w-full rounded-control border border-line bg-surface px-3 text-sm outline-none focus:border-brand"
                    />
                  </div>

                  {izin.catatLangsung && (
                    <p className="tabular mt-3 flex justify-between rounded-control bg-surface-alt px-3 py-2.5 text-sm">
                      <span className="text-ink-muted">Sisa setelah dicatat</span>
                      <span className="font-semibold">
                        {jenis === 'masuk'
                          ? stok[brg.kode] + jumlah
                          : stok[brg.kode] - jumlah}{' '}
                        {brg.satuan}
                      </span>
                    </p>
                  )}

                  {salah !== '' && (
                    <p role="alert" className="mt-2 text-sm font-medium text-red-700">
                      {salah}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={izin.catatLangsung ? simpanGerak : ajukan}
                    className="mt-3 min-h-12 w-full rounded-control bg-brand font-bold text-white hover:bg-brand-strong"
                  >
                    {izin.catatLangsung ? 'Simpan pencatatan' : 'Kirim permintaan'}
                  </button>
                </>
              )}

              <h3 className="mt-7 text-base">Riwayat barang ini</h3>
              {riwayatBarang.length === 0 ? (
                <p className="mt-2 text-sm text-ink-muted">
                  Belum ada pergerakan yang tercatat.
                </p>
              ) : (
                <ul className="mt-2 divide-y divide-line">
                  {riwayatBarang.map((g) => (
                    <li key={g.id} className="flex items-start justify-between gap-3 py-3">
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <PilGerak jenis={g.jenis} />
                          <span className="tabular text-sm font-semibold">
                            {g.jenis === 'masuk' ? '+' : '−'}
                            {g.jumlah} {brg.satuan}
                          </span>
                        </span>
                        <span className="mt-1 block text-xs text-ink-muted">{g.catatan}</span>
                        <span className="tabular block text-xs text-ink-muted">
                          {g.waktu} · {g.petugas}
                        </span>
                      </span>
                      <span className="tabular shrink-0 text-xs text-ink-muted">{g.id}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** Ikon menu samping. Satu keluarga garis, tebal sama. */
function IkonTab({ nama }: { nama: Tab }) {
  const jalur: Record<Tab, string> = {
    stok: 'M3 7.5 10 4l7 3.5M3 7.5v5L10 16l7-3.5v-5M3 7.5 10 11l7-3.5M10 11v5',
    permintaan: 'M4 5h12M4 10h12M4 15h7M14 13l2 2 3-3',
    riwayat: 'M10 5v5l3 2M3 10a7 7 0 1 0 2-4.9M3 4v3h3',
    pengguna: 'M7 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM2.5 16a4.5 4.5 0 0 1 9 0M14 9.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM13 12.5c2 0 4 1.3 4 3.5',
  };
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4.5 shrink-0"
      aria-hidden="true"
    >
      <path d={jalur[nama]} />
    </svg>
  );
}

function Kartu({
  k,
  v,
  ket,
  tanda = false,
}: {
  k: string;
  v: string;
  ket: string;
  tanda?: boolean;
}) {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-card border px-4 py-3 pl-5',
        tanda ? 'border-amber-300 bg-amber-50' : 'border-line bg-surface',
      ].join(' ')}
    >
      {/* Batang kiri: penanda tanpa bayangan, sesuai gaya datar. */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-1 ${tanda ? 'bg-amber-500' : 'bg-brand-light/40'}`}
      />
      <dt className="text-[11px] tracking-wide text-ink-muted uppercase">{k}</dt>
      <dd
        className={[
          'tabular mt-1 font-display text-xl leading-none font-bold sm:text-2xl',
          tanda ? 'text-amber-900' : '',
        ].join(' ')}
      >
        {v}
      </dd>
      <dd className="mt-1 text-[11px] text-ink-muted">{ket}</dd>
    </div>
  );
}

function Lencana({ status }: { status: ReturnType<typeof statusStok> }) {
  /* Warna saja tidak cukup: tiap status punya tulisannya sendiri. */
  const gaya =
    status === 'habis'
      ? 'bg-red-50 text-red-800 border-red-200'
      : status === 'menipis'
        ? 'bg-amber-50 text-amber-900 border-amber-200'
        : 'bg-surface-alt text-ink-muted border-line';

  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${gaya}`}
    >
      {labelStatus[status]}
    </span>
  );
}

function PilGerak({ jenis }: { jenis: JenisGerak }) {
  return (
    <span
      className={[
        'rounded-full px-2 py-0.5 text-[11px] font-bold capitalize',
        jenis === 'masuk'
          ? 'bg-brand-soft text-brand-strong'
          : 'bg-accent-soft text-accent-strong',
      ].join(' ')}
    >
      {jenis}
    </span>
  );
}

function BarisPermintaan({
  permintaan: p,
  barang: b,
  sisa,
  bolehPutuskan,
  onPutus,
}: {
  permintaan: Permintaan;
  barang: Barang;
  sisa: number;
  bolehPutuskan: boolean;
  onPutus: (id: string, setuju: boolean, alasan?: string) => void;
}) {
  const [tolak, setTolak] = useState(false);
  const [alasan, setAlasan] = useState('');
  const cukup = p.jumlah <= sisa;

  return (
    <li className="rounded-card border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <span className="tabular text-xs text-ink-muted">{p.id}</span>
            <StatusMinta status={p.status} />
          </p>
          <p className="mt-1 font-medium">
            {b.nama}{' '}
            <span className="tabular text-ink-muted">
              — {p.jumlah} {b.satuan}
            </span>
          </p>
          <p className="mt-0.5 text-sm text-ink-muted">{p.catatan}</p>
          <p className="tabular mt-1 text-xs text-ink-muted">
            Diajukan {p.pemohon} · {p.waktu}
            {p.penilai && ` · diputuskan ${p.penilai}`}
          </p>
          {p.alasan && (
            <p className="mt-1 text-xs font-medium text-red-700">Alasan: {p.alasan}</p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="tabular text-sm">
            Sisa <span className="font-semibold">{sisa}</span> {b.satuan}
          </p>
          {p.status === 'menunggu' && !cukup && (
            <p className="mt-0.5 text-xs font-medium text-red-700">Stok tidak cukup</p>
          )}
        </div>
      </div>

      {bolehPutuskan && p.status === 'menunggu' && (
        <div className="mt-3 border-t border-line pt-3">
          {tolak ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor={`alasan-${p.id}`} className="sr-only">
                Alasan menolak
              </label>
              <input
                id={`alasan-${p.id}`}
                type="text"
                value={alasan}
                placeholder="Alasan menolak, misalnya tunggu kiriman pemasok"
                onChange={(e) => setAlasan(e.target.value)}
                className={inputCls}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTolak(false)}
                  className="min-h-10 shrink-0 rounded-control border border-line px-4 text-sm font-semibold hover:bg-surface-alt"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => onPutus(p.id, false, alasan.trim() || undefined)}
                  className="min-h-10 shrink-0 rounded-control bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700"
                >
                  Tolak
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onPutus(p.id, true)}
                disabled={!cukup}
                className="min-h-10 rounded-control bg-brand px-4 text-sm font-bold text-white hover:bg-brand-strong disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-muted"
              >
                Setujui &amp; keluarkan
              </button>
              <button
                type="button"
                onClick={() => setTolak(true)}
                className="min-h-10 rounded-control border border-line px-4 text-sm font-semibold hover:bg-surface-alt"
              >
                Tolak
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function StatusMinta({ status }: { status: StatusPermintaan }) {
  const gaya =
    status === 'menunggu'
      ? 'bg-amber-50 text-amber-900 border-amber-200'
      : status === 'disetujui'
        ? 'bg-brand-soft text-brand-strong border-brand/30'
        : 'bg-red-50 text-red-800 border-red-200';
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${gaya}`}
    >
      {status}
    </span>
  );
}

function KelolaPengguna({
  pengguna,
  setPengguna,
  akun,
  onKabar,
}: {
  pengguna: Pengguna[];
  setPengguna: React.Dispatch<React.SetStateAction<Pengguna[]>>;
  akun: Pengguna;
  onKabar: (s: string) => void;
}) {
  const [nama, setNama] = useState('');
  const [peranBaru, setPeranBaru] = useState<PeranSlug>('staf');
  const [lokasiBaru, setLokasiBaru] = useState<Lokasi>(gudang.lokasi[0]);
  const [salah, setSalah] = useState('');

  function tambah() {
    if (nama.trim().length < 3) {
      setSalah('Tulis nama lengkap, minimal 3 huruf.');
      return;
    }
    const id = `U-${String(pengguna.length + 1).padStart(2, '0')}`;
    setPengguna((list) => [
      ...list,
      {
        id,
        nama: nama.trim(),
        peran: peranBaru,
        lokasi: lokasiBaru,
        aktif: true,
        terakhir: 'Belum pernah masuk',
      },
    ]);
    onKabar(`${nama.trim()} ditambahkan sebagai ${peranBaru}.`);
    setNama('');
    setSalah('');
  }

  return (
    <section>
      <h2 className="text-lg">Pengguna</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Hanya admin yang bisa membuka bagian ini. Menonaktifkan pengguna
        membuatnya tidak bisa masuk, tapi catatan lamanya tetap tersimpan.
      </p>

      <div className="mt-4 overflow-hidden rounded-card border border-line bg-surface">
        <table className="hidden w-full border-collapse text-left text-sm lg:table">
          <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-semibold">Nama</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Peran</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Lokasi</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Terakhir masuk</th>
              <th scope="col" className="px-4 py-2.5 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {pengguna.map((u) => (
              <tr key={u.id} className={u.aktif ? '' : 'bg-surface-alt/60'}>
                <td className="px-4 py-2.5">
                  <span className="block font-medium">{u.nama}</span>
                  <span className="tabular block text-xs text-ink-muted">{u.id}</span>
                </td>
                <td className="px-4 py-2.5">
                  <label htmlFor={`peran-${u.id}`} className="sr-only">
                    Peran {u.nama}
                  </label>
                  <select
                    id={`peran-${u.id}`}
                    value={u.peran}
                    disabled={u.id === akun.id}
                    onChange={(e) =>
                      setPengguna((list) =>
                        list.map((x) =>
                          x.id === u.id ? { ...x, peran: e.target.value as PeranSlug } : x,
                        ),
                      )
                    }
                    className="h-9 rounded-control border border-line bg-surface px-2 text-sm outline-none focus:border-brand disabled:bg-surface-alt disabled:text-ink-muted"
                  >
                    {daftarPeran.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.nama}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2.5">
                  <label htmlFor={`lok-${u.id}`} className="sr-only">
                    Lokasi {u.nama}
                  </label>
                  <select
                    id={`lok-${u.id}`}
                    value={u.lokasi}
                    onChange={(e) =>
                      setPengguna((list) =>
                        list.map((x) =>
                          x.id === u.id ? { ...x, lokasi: e.target.value as Lokasi } : x,
                        ),
                      )
                    }
                    className="h-9 rounded-control border border-line bg-surface px-2 text-sm outline-none focus:border-brand"
                  >
                    {gudang.lokasi.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="tabular px-4 py-2.5 text-ink-muted">{u.terakhir}</td>
                <td className="px-4 py-2.5 text-right">
                  {u.id === akun.id ? (
                    <span className="text-xs text-ink-muted">Akun kamu</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setPengguna((list) =>
                          list.map((x) => (x.id === u.id ? { ...x, aktif: !x.aktif } : x)),
                        )
                      }
                      aria-pressed={u.aktif}
                      className={[
                        'min-h-9 rounded-full border px-3 text-xs font-semibold',
                        u.aktif
                          ? 'border-brand/30 bg-brand-soft text-brand-strong'
                          : 'border-line text-ink-muted',
                      ].join(' ')}
                    >
                      {u.aktif ? 'Aktif' : 'Nonaktif'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <ul className="divide-y divide-line lg:hidden">
          {pengguna.map((u) => (
            <li key={u.id} className="p-4">
              <p className="font-medium">{u.nama}</p>
              <p className="tabular text-xs text-ink-muted">
                {u.id} · {u.lokasi} · {u.terakhir}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <select
                  value={u.peran}
                  disabled={u.id === akun.id}
                  aria-label={`Peran ${u.nama}`}
                  onChange={(e) =>
                    setPengguna((list) =>
                      list.map((x) =>
                        x.id === u.id ? { ...x, peran: e.target.value as PeranSlug } : x,
                      ),
                    )
                  }
                  className="h-10 rounded-control border border-line bg-surface px-2 text-sm disabled:bg-surface-alt disabled:text-ink-muted"
                >
                  {daftarPeran.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.nama}
                    </option>
                  ))}
                </select>
                {u.id !== akun.id && (
                  <button
                    type="button"
                    onClick={() =>
                      setPengguna((list) =>
                        list.map((x) => (x.id === u.id ? { ...x, aktif: !x.aktif } : x)),
                      )
                    }
                    aria-pressed={u.aktif}
                    className={[
                      'min-h-10 rounded-full border px-4 text-xs font-semibold',
                      u.aktif
                        ? 'border-brand/30 bg-brand-soft text-brand-strong'
                        : 'border-line text-ink-muted',
                    ].join(' ')}
                  >
                    {u.aktif ? 'Aktif' : 'Nonaktif'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-card border border-line bg-surface p-4">
        <h3 className="text-base">Tambah pengguna</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
          <div>
            <label htmlFor="nama-baru" className="sr-only">
              Nama pengguna baru
            </label>
            <input
              id="nama-baru"
              type="text"
              value={nama}
              placeholder="Nama pengguna"
              onChange={(e) => {
                setNama(e.target.value);
                setSalah('');
              }}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="peran-baru" className="sr-only">
              Peran
            </label>
            <select
              id="peran-baru"
              value={peranBaru}
              onChange={(e) => setPeranBaru(e.target.value as PeranSlug)}
              className={inputCls}
            >
              {daftarPeran.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.nama}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="lokasi-baru" className="sr-only">
              Lokasi
            </label>
            <select
              id="lokasi-baru"
              value={lokasiBaru}
              onChange={(e) => setLokasiBaru(e.target.value as Lokasi)}
              className={inputCls}
            >
              {gudang.lokasi.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={tambah}
            className="min-h-10 rounded-control bg-brand px-5 text-sm font-bold text-white hover:bg-brand-strong"
          >
            Tambah
          </button>
        </div>
        {salah !== '' && (
          <p role="alert" className="mt-2 text-sm font-medium text-red-700">
            {salah}
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {daftarPeran.map((p) => (
          <div key={p.slug} className="rounded-card border border-line bg-surface p-4">
            <h3 className="text-base">{p.nama}</h3>
            <p className="mt-1 text-sm text-ink-muted">{p.ringkas}</p>
            <ul className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
              {[
                ['Lihat harga', p.izin.lihatNilai],
                ['Ubah stok', p.izin.catatLangsung],
                ['Ajukan keluar', p.izin.ajukanPermintaan],
                ['Setujui', p.izin.setujuiPermintaan],
                ['Ubah minimum', p.izin.ubahMinimum],
                ['Kelola pengguna', p.izin.kelolaPengguna],
                ['Semua lokasi', p.izin.semuaLokasi],
              ].map(([label, boleh]) => (
                <li
                  key={label as string}
                  className={[
                    'rounded-full border px-2 py-0.5',
                    boleh
                      ? 'border-brand/30 bg-brand-soft text-brand-strong'
                      : 'border-line text-ink-muted line-through',
                  ].join(' ')}
                >
                  {label as string}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
