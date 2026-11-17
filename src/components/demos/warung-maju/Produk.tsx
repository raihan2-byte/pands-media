import { useMemo, useState } from 'react';
import { rupiah, statusStok, waktuLengkap, type Produk } from '../../../data/warung-maju';
import { useToko, type MasukanProduk } from './store';
import {
  AngkaRingkas,
  cls,
  FotoProduk,
  Halaman,
  IsianRupiah,
  Konfirmasi,
  Kosong,
  Lencana,
  Medan,
  Panel,
  Sakelar,
} from './ui';

type Saring = 'semua' | 'aktif' | 'nonaktif' | 'menipis';

export default function KelolaProduk() {
  const t = useToko();
  const [cari, setCari] = useState('');
  const [kat, setKat] = useState('semua');
  const [saring, setSaring] = useState<Saring>('semua');
  const [form, setForm] = useState<{ ubah?: Produk } | null>(null);
  const [stok, setStok] = useState<Produk | null>(null);
  const [hapus, setHapus] = useState<Produk | null>(null);
  const [galatHapus, setGalatHapus] = useState('');

  const namaKategori = (id: string) => t.kategori.find((k) => k.id === id)?.nama ?? '—';

  const ringkas = useMemo(() => {
    const aktif = t.produk.filter((p) => p.aktif).length;
    const menipis = t.produk.filter((p) => p.aktif && statusStok(p.stok, p.minimum) !== 'aman').length;
    const nilai = t.produk.reduce((s, p) => s + p.stok * p.hargaBeli, 0);
    return { total: t.produk.length, aktif, menipis, nilai };
  }, [t.produk]);

  const tampil = useMemo(() => {
    const kata = cari.trim().toLowerCase();
    return t.produk
      .filter((p) => {
        if (kata && !`${p.nama} ${p.kode}`.toLowerCase().includes(kata)) return false;
        if (kat !== 'semua' && p.kategoriId !== kat) return false;
        if (saring === 'aktif') return p.aktif;
        if (saring === 'nonaktif') return !p.aktif;
        if (saring === 'menipis') return statusStok(p.stok, p.minimum) !== 'aman';
        return true;
      })
      .sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
  }, [t.produk, cari, kat, saring]);

  return (
    <Halaman
      judul="Produk"
      ringkas="Tambah, ubah, dan atur stok barang yang dijual di kasir."
      aksi={
        <button type="button" onClick={() => setForm({})} className={cls.btnUtama}>
          + Tambah produk
        </button>
      }
    >
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AngkaRingkas label="Jumlah produk" nilai={String(ringkas.total)} ket={`${ringkas.aktif} sedang dijual`} />
        <AngkaRingkas
          label="Perlu ditambah"
          nilai={String(ringkas.menipis)}
          ket="stok di bawah minimum"
          nada={ringkas.menipis > 0 ? 'peringatan' : 'netral'}
        />
        <AngkaRingkas label="Nilai stok" nilai={rupiah(ringkas.nilai)} ket="harga beli × sisa" />
        <AngkaRingkas label="Kategori" nilai={String(t.kategori.length)} ket="kelompok barang" />
      </dl>

      <div className={`${cls.kartu} mt-5 flex flex-col gap-3 p-3 sm:p-4`}>
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
          <div>
            <label htmlFor="cari-produk" className="sr-only">
              Cari produk atau kode
            </label>
            <input
              id="cari-produk"
              type="search"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari nama atau kode…"
              className={cls.input}
            />
          </div>
          <div>
            <label htmlFor="saring-kategori" className="sr-only">
              Kategori
            </label>
            <select id="saring-kategori" value={kat} onChange={(e) => setKat(e.target.value)} className={cls.input}>
              <option value="semua">Semua kategori</option>
              {t.kategori.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Saring status">
          {(
            [
              ['semua', 'Semua'],
              ['aktif', 'Dijual'],
              ['nonaktif', 'Nonaktif'],
              ['menipis', 'Perlu ditambah'],
            ] as const
          ).map(([nilai, label]) => (
            <button
              key={nilai}
              type="button"
              onClick={() => setSaring(nilai)}
              aria-pressed={saring === nilai}
              className={`min-h-10 rounded-full border px-4 text-sm font-semibold ${
                saring === nilai
                  ? 'border-brand bg-brand text-white'
                  : 'border-line-strong text-ink-muted hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
          <p aria-live="polite" className="ml-auto text-sm text-ink-muted">
            {tampil.length} dari {t.produk.length} produk
          </p>
        </div>
      </div>

      <div className={`${cls.kartu} mt-4 overflow-hidden`}>
        <table className="hidden w-full border-collapse text-left text-sm lg:table">
          <thead className="border-b border-line bg-surface-alt text-[11px] tracking-wide text-ink-muted uppercase">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-semibold">Produk</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Kategori</th>
              <th scope="col" className="px-4 py-2.5 text-right font-semibold">Harga jual</th>
              <th scope="col" className="px-4 py-2.5 text-right font-semibold">Harga beli</th>
              <th scope="col" className="px-4 py-2.5 text-right font-semibold">Stok</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Status</th>
              <th scope="col" className="px-4 py-2.5 text-right font-semibold">
                <span className="sr-only">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {tampil.map((p) => {
              const s = statusStok(p.stok, p.minimum);
              const margin = p.harga > 0 ? Math.round(((p.harga - p.hargaBeli) / p.harga) * 100) : 0;
              return (
                <tr key={p.kode} className={`hover:bg-surface-alt ${p.aktif ? '' : 'opacity-60'}`}>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-3">
                      <FotoProduk produk={p} className="size-11 shrink-0 rounded-control text-sm" />
                      <span className="min-w-0">
                        <span className="block font-medium">{p.nama}</span>
                        <span className="tabular block text-xs text-ink-muted">{p.kode}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-ink-muted">{namaKategori(p.kategoriId)}</td>
                  <td className="tabular px-4 py-2.5 text-right font-medium">{rupiah(p.harga)}</td>
                  <td className="tabular px-4 py-2.5 text-right text-ink-muted">
                    {rupiah(p.hargaBeli)}
                    <span className="block text-[11px]">laba {margin}%</span>
                  </td>
                  <td className="tabular px-4 py-2.5 text-right">
                    <span className="font-semibold">{p.stok}</span>
                    <span className="block text-[11px] text-ink-muted">min. {p.minimum}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="flex flex-wrap gap-1">
                      {!p.aktif && <Lencana>Nonaktif</Lencana>}
                      {p.aktif && s === 'aman' && <Lencana nada="aman">Dijual</Lencana>}
                      {p.aktif && s === 'menipis' && <Lencana nada="peringatan">Perlu ditambah</Lencana>}
                      {p.aktif && s === 'habis' && <Lencana nada="bahaya">Habis</Lencana>}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="flex justify-end gap-1.5">
                      <button type="button" onClick={() => setStok(p)} className={cls.btnKecil}>
                        Stok
                      </button>
                      <button type="button" onClick={() => setForm({ ubah: p })} className={cls.btnKecil}>
                        Ubah
                      </button>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <ul className="divide-y divide-line lg:hidden">
          {tampil.map((p) => {
            const s = statusStok(p.stok, p.minimum);
            return (
              <li key={p.kode} className={`p-4 ${p.aktif ? '' : 'opacity-60'}`}>
                <div className="flex items-start gap-3">
                  <FotoProduk produk={p} className="size-14 shrink-0 rounded-control text-base" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{p.nama}</p>
                    <p className="tabular text-xs text-ink-muted">
                      {p.kode} · {namaKategori(p.kategoriId)}
                    </p>
                    <p className="tabular mt-1 text-sm">
                      <span className="font-semibold">{rupiah(p.harga)}</span>
                      <span className="text-ink-muted"> · beli {rupiah(p.hargaBeli)}</span>
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="tabular font-display text-lg font-extrabold">{p.stok}</p>
                    <p className="text-[11px] text-ink-muted">min. {p.minimum}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="flex flex-wrap gap-1">
                    {!p.aktif && <Lencana>Nonaktif</Lencana>}
                    {p.aktif && s === 'aman' && <Lencana nada="aman">Dijual</Lencana>}
                    {p.aktif && s === 'menipis' && <Lencana nada="peringatan">Perlu ditambah</Lencana>}
                    {p.aktif && s === 'habis' && <Lencana nada="bahaya">Habis</Lencana>}
                  </span>
                  <span className="flex gap-1.5">
                    <button type="button" onClick={() => setStok(p)} className={cls.btnKecil}>
                      Stok
                    </button>
                    <button type="button" onClick={() => setForm({ ubah: p })} className={cls.btnKecil}>
                      Ubah
                    </button>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        {tampil.length === 0 && (
          <div className="p-6">
            <Kosong
              judul="Tidak ada produk yang cocok"
              isi="Coba ganti kata kunci atau saringannya."
              aksi={
                <button
                  type="button"
                  onClick={() => {
                    setCari('');
                    setKat('semua');
                    setSaring('semua');
                  }}
                  className={cls.btn}
                >
                  Hapus saringan
                </button>
              }
            />
          </div>
        )}
      </div>

      {form && (
        <FormProduk
          ubah={form.ubah}
          onTutup={() => setForm(null)}
          onHapus={(p) => {
            setForm(null);
            setGalatHapus('');
            setHapus(p);
          }}
        />
      )}
      {stok && <DialogStok produk={t.peta[stok.kode] ?? stok} onTutup={() => setStok(null)} />}
      {hapus && (
        <Konfirmasi
          judul={`Hapus ${hapus.nama}?`}
          tombol="Ya, hapus"
          bahaya
          onBatal={() => setHapus(null)}
          onYa={() => {
            const h = t.hapusProduk(hapus.kode);
            if (h.ok) setHapus(null);
            else setGalatHapus(h.pesan ?? '');
          }}
          isi={
            <>
              <p>Produk dihapus dari daftar dan tidak bisa dikembalikan.</p>
              {galatHapus && (
                <p role="alert" className="mt-3 font-medium text-red-700">
                  {galatHapus}
                </p>
              )}
            </>
          }
        />
      )}
    </Halaman>
  );
}

/* ------------------------------------------------------------------ */

function FormProduk({
  ubah,
  onTutup,
  onHapus,
}: {
  ubah?: Produk;
  onTutup: () => void;
  onHapus: (p: Produk) => void;
}) {
  const t = useToko();
  const [nama, setNama] = useState(ubah?.nama ?? '');
  const [kategoriId, setKategoriId] = useState(ubah?.kategoriId ?? t.kategori[0]?.id ?? '');
  const [kode, setKode] = useState(ubah?.kode ?? '');
  const [harga, setHarga] = useState(ubah?.harga ?? 0);
  const [hargaBeli, setHargaBeli] = useState(ubah?.hargaBeli ?? 0);
  const [stok, setStok] = useState(ubah?.stok ?? 0);
  const [minimum, setMinimum] = useState(ubah?.minimum ?? 10);
  const [foto, setFoto] = useState<string | undefined>(ubah?.foto);
  const [laris, setLaris] = useState(ubah?.laris ?? false);
  const [aktif, setAktif] = useState(ubah?.aktif ?? true);
  const [salah, setSalah] = useState('');
  const [salahFoto, setSalahFoto] = useState('');
  const [kategoriBaru, setKategoriBaru] = useState<string | null>(null);

  const laba = harga - hargaBeli;
  const margin = harga > 0 ? Math.round((laba / harga) * 100) : 0;

  function pilihFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setSalahFoto('Berkas harus berupa gambar (JPG, PNG, atau WebP).');
      return;
    }
    if (f.size > 3 * 1024 * 1024) {
      setSalahFoto('Ukuran foto maksimal 3 MB.');
      return;
    }
    setSalahFoto('');
    setFoto(URL.createObjectURL(f));
  }

  function tambahKategoriBaru() {
    if (kategoriBaru === null) return;
    const h = t.tambahKategori(kategoriBaru);
    if (!h.ok) {
      setSalah(h.pesan ?? '');
      return;
    }
    setSalah('');
    setKategoriBaru(null);
    // Kategori yang baru dibuat langsung terpilih.
    if (h.id) setKategoriId(h.id);
  }

  function simpan() {
    const m: MasukanProduk = {
      kode: ubah ? ubah.kode : kode,
      nama,
      kategoriId,
      harga,
      hargaBeli,
      stok,
      minimum,
      laris,
      aktif,
      foto,
    };
    const h = ubah ? t.ubahProduk(ubah.kode, m) : t.tambahProduk(m);
    if (!h.ok) {
      setSalah(h.pesan ?? 'Gagal menyimpan.');
      return;
    }
    onTutup();
  }

  return (
    <Panel
      judul={ubah ? `Ubah ${ubah.nama}` : 'Tambah produk'}
      deskripsi={ubah ? `Kode ${ubah.kode}` : 'Isi yang wajib dulu, sisanya bisa menyusul.'}
      posisi="kanan"
      onTutup={onTutup}
      kaki={
        <div>
          {salah !== '' && (
            <p role="alert" className="mb-2 text-sm font-medium text-red-700">
              {salah}
            </p>
          )}
          <div className="flex gap-2">
            {ubah && (
              <button type="button" onClick={() => onHapus(ubah)} className={`${cls.btn} text-red-700`}>
                Hapus
              </button>
            )}
            <button type="button" onClick={onTutup} className={`${cls.btn} ml-auto`}>
              Batal
            </button>
            <button type="button" onClick={simpan} className={cls.btnUtama}>
              {ubah ? 'Simpan perubahan' : 'Simpan produk'}
            </button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <FotoProduk
            produk={{ nama: nama || 'Produk', foto }}
            className="size-24 shrink-0 rounded-card text-2xl"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink-muted">Foto produk</p>
            <p className="mt-0.5 text-xs text-ink-muted">
              Opsional. Tanpa foto, kasir melihat huruf awal nama. Foto hanya dibaca browser dan tidak diunggah ke mana pun.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <label className={`${cls.btnKecil} cursor-pointer`}>
                {foto ? 'Ganti foto' : 'Pilih foto'}
                <input type="file" accept="image/*" onChange={pilihFoto} className="sr-only" />
              </label>
              {foto && (
                <button type="button" onClick={() => setFoto(undefined)} className={cls.btnKecil}>
                  Hapus foto
                </button>
              )}
            </div>
            {salahFoto && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-red-700">
                {salahFoto}
              </p>
            )}
          </div>
        </div>

        <Medan label="Nama produk" wajib>
          {(a) => (
            <input
              {...a}
              type="text"
              value={nama}
              onChange={(e) => {
                setNama(e.target.value);
                setSalah('');
              }}
              className={cls.input}
              data-fokus-awal
            />
          )}
        </Medan>

        <div>
          <Medan label="Kategori" wajib>
            {(a) => (
              <select
                {...a}
                value={kategoriId}
                onChange={(e) => setKategoriId(e.target.value)}
                className={cls.input}
              >
                {t.kategori.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            )}
          </Medan>
          {kategoriBaru === null ? (
            <button
              type="button"
              onClick={() => setKategoriBaru('')}
              className="mt-1.5 text-xs font-semibold text-brand hover:text-brand-strong"
            >
              Kategori belum ada? Buat baru
            </button>
          ) : (
            <div className="mt-2 flex gap-2">
              <label htmlFor="kategori-baru" className="sr-only">
                Nama kategori baru
              </label>
              <input
                id="kategori-baru"
                type="text"
                value={kategoriBaru}
                onChange={(e) => setKategoriBaru(e.target.value)}
                placeholder="Nama kategori baru"
                className={cls.input}
              />
              <button
                type="button"
                onClick={tambahKategoriBaru}
                className={cls.btn}
              >
                Buat
              </button>
            </div>
          )}
        </div>

        {!ubah && (
          <Medan label="Kode produk" bantu="Kosongkan supaya dibuatkan otomatis, mis. PRD031.">
            {(a) => (
              <input
                {...a}
                type="text"
                value={kode}
                onChange={(e) => setKode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                className={`${cls.input} tabular`}
                maxLength={12}
              />
            )}
          </Medan>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Medan label="Harga jual" wajib>
            {(a) => <IsianRupiah {...a} nilai={harga} onUbah={setHarga} />}
          </Medan>
          <Medan label="Harga beli">
            {(a) => <IsianRupiah {...a} nilai={hargaBeli} onUbah={setHargaBeli} />}
          </Medan>
        </div>

        {harga > 0 && (
          <p
            className={`tabular rounded-control px-3 py-2 text-sm ${
              laba < 0 ? 'bg-red-50 font-medium text-red-800' : 'bg-surface-alt text-ink-muted'
            }`}
          >
            {laba < 0
              ? `Harga jual di bawah harga beli. Rugi ${rupiah(-laba)} tiap barang.`
              : `Laba ${rupiah(laba)} tiap barang (${margin}%).`}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          {!ubah ? (
            <Medan label="Stok awal">
              {(a) => (
                <input
                  {...a}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={stok || ''}
                  placeholder="0"
                  onChange={(e) => setStok(Math.max(0, Math.floor(Number(e.target.value))))}
                  className={`${cls.input} tabular`}
                />
              )}
            </Medan>
          ) : (
            <Medan label="Stok saat ini" bantu="Ubah lewat tombol Stok.">
              {(a) => <input {...a} value={ubah.stok} disabled className={`${cls.input} tabular`} readOnly />}
            </Medan>
          )}
          <Medan label="Batas minimum" bantu="Di bawah ini ditandai perlu ditambah.">
            {(a) => (
              <input
                {...a}
                type="number"
                inputMode="numeric"
                min={0}
                value={minimum}
                onChange={(e) => setMinimum(Math.max(0, Math.floor(Number(e.target.value))))}
                className={`${cls.input} tabular`}
              />
            )}
          </Medan>
        </div>

        <div className="flex flex-col gap-4 border-t border-line pt-4">
          <Sakelar
            label="Dijual di kasir"
            keterangan="Matikan untuk menyembunyikan tanpa menghapus riwayatnya."
            nyala={aktif}
            onUbah={setAktif}
          />
          <Sakelar
            label="Tampil di tab Laris"
            keterangan="Barang yang paling sering dipesan, muncul paling depan di kasir."
            nyala={laris}
            onUbah={setLaris}
          />
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */

const ALASAN_MASUK = ['Kulakan', 'Retur dari pembeli', 'Koreksi hasil hitung'];
const ALASAN_KELUAR = ['Rusak', 'Kedaluwarsa', 'Hilang', 'Dipakai sendiri', 'Koreksi hasil hitung'];

function DialogStok({ produk: p, onTutup }: { produk: Produk; onTutup: () => void }) {
  const t = useToko();
  const [arah, setArah] = useState<1 | -1>(1);
  const [jumlah, setJumlah] = useState(0);
  const [alasan, setAlasan] = useState('');
  const [salah, setSalah] = useState('');

  const riwayat = t.mutasi.filter((m) => m.kode === p.kode).slice(0, 5);
  const sesudah = p.stok + arah * jumlah;

  function simpan() {
    const h = t.sesuaikanStok(p.kode, arah * jumlah, alasan);
    if (!h.ok) {
      setSalah(h.pesan ?? '');
      return;
    }
    setJumlah(0);
    setAlasan('');
    setSalah('');
  }

  return (
    <Panel
      judul={`Stok ${p.nama}`}
      deskripsi={`${p.kode} · minimum ${p.minimum}`}
      ukuran="md"
      onTutup={onTutup}
      kaki={
        <div>
          {salah !== '' && (
            <p role="alert" className="mb-2 text-sm font-medium text-red-700">
              {salah}
            </p>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onTutup} className={`${cls.btn} flex-1`}>
              Tutup
            </button>
            <button type="button" onClick={simpan} className={`${cls.btnUtama} flex-1`}>
              Simpan penyesuaian
            </button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="tabular rounded-card bg-surface-alt px-4 py-3 text-sm">
          Stok sekarang <strong className="font-display text-2xl">{p.stok}</strong>
        </p>

        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Jenis penyesuaian">
          {(
            [
              [1, 'Barang masuk'],
              [-1, 'Barang keluar'],
            ] as const
          ).map(([nilai, label]) => (
            <button
              key={nilai}
              type="button"
              onClick={() => {
                setArah(nilai);
                setAlasan('');
                setSalah('');
              }}
              aria-pressed={arah === nilai}
              className={`min-h-11 rounded-control border font-semibold ${
                arah === nilai ? 'border-brand bg-brand-soft text-brand-strong' : 'border-line-strong text-ink-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <Medan label="Jumlah">
          {(a) => (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setJumlah((n) => Math.max(0, n - 1))}
                aria-label="Kurangi jumlah"
                className="grid size-11 shrink-0 place-items-center rounded-control border border-line-strong text-lg font-bold hover:bg-surface-alt"
              >
                &minus;
              </button>
              <input
                {...a}
                type="number"
                inputMode="numeric"
                min={0}
                value={jumlah || ''}
                placeholder="0"
                onChange={(e) => {
                  setJumlah(Math.max(0, Math.floor(Number(e.target.value))));
                  setSalah('');
                }}
                className={`${cls.input} text-center tabular`}
                data-fokus-awal
              />
              <button
                type="button"
                onClick={() => setJumlah((n) => n + 1)}
                aria-label="Tambah jumlah"
                className="grid size-11 shrink-0 place-items-center rounded-control border border-line-strong text-lg font-bold hover:bg-surface-alt"
              >
                +
              </button>
            </div>
          )}
        </Medan>

        <div>
          <Medan label="Alasan" wajib>
            {(a) => (
              <input
                {...a}
                type="text"
                value={alasan}
                onChange={(e) => {
                  setAlasan(e.target.value);
                  setSalah('');
                }}
                placeholder="Tulis atau pilih di bawah"
                className={cls.input}
              />
            )}
          </Medan>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(arah === 1 ? ALASAN_MASUK : ALASAN_KELUAR).map((a) => (
              <button key={a} type="button" onClick={() => setAlasan(a)} className={cls.btnKecil}>
                {a}
              </button>
            ))}
          </div>
        </div>

        <p
          className={`tabular flex justify-between rounded-control px-3 py-2.5 text-sm ${
            sesudah < 0 ? 'bg-red-50 font-medium text-red-800' : 'bg-surface-alt'
          }`}
        >
          <span className="text-ink-muted">Stok setelah disimpan</span>
          <span className="font-semibold">{sesudah}</span>
        </p>

        <div>
          <h3 className="text-base">Penyesuaian terakhir</h3>
          {riwayat.length === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">Belum ada penyesuaian untuk barang ini.</p>
          ) : (
            <ul className="mt-1 divide-y divide-line">
              {riwayat.map((m) => (
                <li key={m.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0">
                    <span className="block">{m.alasan}</span>
                    <span className="tabular block text-xs text-ink-muted">
                      {waktuLengkap(m.waktu)} · {m.oleh}
                    </span>
                  </span>
                  <span
                    className={`tabular shrink-0 font-semibold ${m.delta > 0 ? 'text-brand-strong' : 'text-red-700'}`}
                  >
                    {m.delta > 0 ? '+' : '−'}
                    {Math.abs(m.delta)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Panel>
  );
}
