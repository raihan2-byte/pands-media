import { useState } from 'react';
import { useToko } from './store';
import { cls, Halaman, Konfirmasi, Kosong, Medan, Panel } from './ui';

export default function KelolaKategori() {
  const t = useToko();
  const [baru, setBaru] = useState('');
  const [salahBaru, setSalahBaru] = useState('');
  const [ubah, setUbah] = useState<{ id: string; nama: string } | null>(null);
  const [hapus, setHapus] = useState<{ id: string; nama: string } | null>(null);
  const [galatHapus, setGalatHapus] = useState('');

  const jumlah = (id: string) => t.produk.filter((p) => p.kategoriId === id).length;

  function tambah(e: React.FormEvent) {
    e.preventDefault();
    const h = t.tambahKategori(baru);
    if (!h.ok) {
      setSalahBaru(h.pesan ?? '');
      return;
    }
    setBaru('');
    setSalahBaru('');
  }

  return (
    <Halaman
      judul="Kategori"
      ringkas="Kelompok barang di kasir. Urutannya sama dengan tombol kategori di layar kasir."
    >
      <form onSubmit={tambah} className={`${cls.kartu} p-4`}>
        <Medan label="Tambah kategori baru" salah={salahBaru} bantu="Contoh: Frozen Food, Rokok, Perlengkapan Rumah.">
          {(a) => (
            <div className="flex gap-2">
              <input
                {...a}
                type="text"
                value={baru}
                onChange={(e) => {
                  setBaru(e.target.value);
                  setSalahBaru('');
                }}
                placeholder="Nama kategori"
                className={cls.input}
              />
              <button type="submit" className={cls.btnUtama}>
                Tambah
              </button>
            </div>
          )}
        </Medan>
      </form>

      {t.kategori.length === 0 ? (
        <div className="mt-4">
          <Kosong judul="Belum ada kategori" isi="Buat satu dulu, baru produk bisa dikelompokkan." />
        </div>
      ) : (
        <ol className={`${cls.kartu} mt-4 divide-y divide-line overflow-hidden`}>
          {t.kategori.map((k, i) => {
            const n = jumlah(k.id);
            return (
              <li key={k.id} className="flex items-center gap-3 px-4 py-3">
                <span className="tabular w-6 shrink-0 text-sm text-ink-muted">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{k.nama}</span>
                  <span className="tabular block text-xs text-ink-muted">{n} produk</span>
                </span>

                <span className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => t.geserKategori(k.id, -1)}
                    disabled={i === 0}
                    aria-label={`Naikkan ${k.nama}`}
                    className="grid size-9 place-items-center rounded-control border border-line-strong hover:bg-surface-alt disabled:opacity-35"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => t.geserKategori(k.id, 1)}
                    disabled={i === t.kategori.length - 1}
                    aria-label={`Turunkan ${k.nama}`}
                    className="grid size-9 place-items-center rounded-control border border-line-strong hover:bg-surface-alt disabled:opacity-35"
                  >
                    ↓
                  </button>
                  <button type="button" onClick={() => setUbah({ id: k.id, nama: k.nama })} className={`${cls.btnKecil} ml-1`}>
                    Ubah
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGalatHapus('');
                      setHapus({ id: k.id, nama: k.nama });
                    }}
                    className={`${cls.btnKecil} text-red-700`}
                  >
                    Hapus
                  </button>
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {ubah && <FormUbah awal={ubah} onTutup={() => setUbah(null)} />}

      {hapus && (
        <Konfirmasi
          judul={`Hapus kategori ${hapus.nama}?`}
          tombol="Ya, hapus"
          bahaya
          onBatal={() => setHapus(null)}
          onYa={() => {
            const h = t.hapusKategori(hapus.id);
            if (h.ok) setHapus(null);
            else setGalatHapus(h.pesan ?? '');
          }}
          isi={
            <>
              <p>Kategori yang masih berisi produk tidak bisa dihapus.</p>
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

function FormUbah({ awal, onTutup }: { awal: { id: string; nama: string }; onTutup: () => void }) {
  const t = useToko();
  const [nama, setNama] = useState(awal.nama);
  const [salah, setSalah] = useState('');

  function simpan(e: React.FormEvent) {
    e.preventDefault();
    const h = t.ubahKategori(awal.id, nama);
    if (!h.ok) {
      setSalah(h.pesan ?? '');
      return;
    }
    onTutup();
  }

  return (
    <Panel judul="Ubah kategori" ukuran="sm" onTutup={onTutup}>
      <form onSubmit={simpan} className="flex flex-col gap-4">
        <Medan label="Nama kategori" wajib salah={salah}>
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
        <div className="flex gap-2">
          <button type="button" onClick={onTutup} className={`${cls.btn} flex-1`}>
            Batal
          </button>
          <button type="submit" className={`${cls.btnUtama} flex-1`}>
            Simpan
          </button>
        </div>
      </form>
    </Panel>
  );
}
