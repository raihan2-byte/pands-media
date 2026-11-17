import { useState } from 'react';
import { izinPeran, namaMenu, namaPeran, type PeranSlug } from '../../../data/warung-maju';
import { useToko } from './store';
import { cls, Halaman, Lencana, Medan, Panel } from './ui';

export default function KelolaPengguna() {
  const t = useToko();
  const [form, setForm] = useState(false);

  function ubah(id: string, patch: Parameters<typeof t.ubahPengguna>[1]) {
    const h = t.ubahPengguna(id, patch);
    if (!h.ok) t.umumkan(h.pesan ?? 'Gagal mengubah pengguna.');
  }

  return (
    <Halaman
      judul="Pengguna"
      ringkas="Siapa saja yang boleh masuk dan apa yang boleh mereka lakukan."
      aksi={
        <button type="button" onClick={() => setForm(true)} className={cls.btnUtama}>
          + Tambah pengguna
        </button>
      }
    >
      <div className={`${cls.kartu} overflow-hidden`}>
        <table className="hidden w-full border-collapse text-left text-sm md:table">
          <thead className="border-b border-line bg-surface-alt text-[11px] tracking-wide text-ink-muted uppercase">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-semibold">Nama</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Peran</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Terakhir masuk</th>
              <th scope="col" className="px-4 py-2.5 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {t.pengguna.map((u) => {
              const saya = u.id === t.akun.id;
              return (
                <tr key={u.id} className={u.aktif ? '' : 'bg-surface-alt/70 text-ink-muted'}>
                  <td className="px-4 py-3">
                    <span className="font-medium">{u.nama}</span>
                    {saya && <span className="ml-2 text-xs text-ink-muted">(akun kamu)</span>}
                  </td>
                  <td className="px-4 py-3">
                    <label htmlFor={`peran-${u.id}`} className="sr-only">
                      Peran {u.nama}
                    </label>
                    <select
                      id={`peran-${u.id}`}
                      value={u.peran}
                      disabled={saya}
                      onChange={(e) => ubah(u.id, { peran: e.target.value as PeranSlug })}
                      className="h-10 rounded-control border border-line-strong bg-surface px-2 text-sm outline-none focus:border-brand disabled:bg-surface-alt disabled:text-ink-muted"
                    >
                      <option value="admin">Admin</option>
                      <option value="kasir">Kasir</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{u.terakhir}</td>
                  <td className="px-4 py-3 text-right">
                    {saya ? (
                      <Lencana nada="aman">Aktif</Lencana>
                    ) : (
                      <button
                        type="button"
                        onClick={() => ubah(u.id, { aktif: !u.aktif })}
                        aria-pressed={u.aktif}
                        className={`min-h-9 rounded-full border px-4 text-xs font-semibold ${
                          u.aktif ? 'border-brand/30 bg-brand-soft text-brand-strong' : 'border-line-strong text-ink-muted'
                        }`}
                      >
                        {u.aktif ? 'Aktif' : 'Nonaktif'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <ul className="divide-y divide-line md:hidden">
          {t.pengguna.map((u) => {
            const saya = u.id === t.akun.id;
            return (
              <li key={u.id} className={`p-4 ${u.aktif ? '' : 'bg-surface-alt/70'}`}>
                <p className="font-medium">
                  {u.nama} {saya && <span className="text-xs font-normal text-ink-muted">(akun kamu)</span>}
                </p>
                <p className="text-xs text-ink-muted">Terakhir masuk: {u.terakhir}</p>
                <div className="mt-2 flex items-center gap-2">
                  <select
                    value={u.peran}
                    disabled={saya}
                    aria-label={`Peran ${u.nama}`}
                    onChange={(e) => ubah(u.id, { peran: e.target.value as PeranSlug })}
                    className="h-10 rounded-control border border-line-strong bg-surface px-2 text-sm disabled:bg-surface-alt"
                  >
                    <option value="admin">Admin</option>
                    <option value="kasir">Kasir</option>
                  </select>
                  {!saya && (
                    <button
                      type="button"
                      onClick={() => ubah(u.id, { aktif: !u.aktif })}
                      aria-pressed={u.aktif}
                      className={`min-h-10 rounded-full border px-4 text-xs font-semibold ${
                        u.aktif ? 'border-brand/30 bg-brand-soft text-brand-strong' : 'border-line-strong text-ink-muted'
                      }`}
                    >
                      {u.aktif ? 'Aktif' : 'Nonaktif'}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <h2 className="mt-8 text-lg">Hak akses tiap peran</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {(['admin', 'kasir'] as const).map((p) => {
          const izin = izinPeran[p];
          return (
            <div key={p} className={`${cls.kartu} p-4`}>
              <h3 className="text-base">{namaPeran[p].nama}</h3>
              <p className="mt-1 text-sm text-ink-muted">{namaPeran[p].ringkas}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                {(Object.keys(namaMenu) as (keyof typeof namaMenu)[]).map((m) => {
                  const boleh = izin.menu.includes(m);
                  return (
                    <li
                      key={m}
                      className={`rounded-full border px-2.5 py-0.5 ${
                        boleh ? 'border-brand/30 bg-brand-soft text-brand-strong' : 'border-line text-ink-muted line-through'
                      }`}
                    >
                      {namaMenu[m]}
                    </li>
                  );
                })}
              </ul>
              <ul className="mt-3 flex flex-col gap-1 text-xs text-ink-muted">
                <li>{izin.lihatModal ? '✓' : '✕'} Melihat harga beli dan laba</li>
                <li>{izin.semuaTransaksi ? '✓' : '✕'} Melihat transaksi semua kasir</li>
                <li>{izin.batalkan ? '✓' : '✕'} Membatalkan transaksi</li>
              </ul>
            </div>
          );
        })}
      </div>

      {form && <FormTambah onTutup={() => setForm(false)} />}
    </Halaman>
  );
}

function FormTambah({ onTutup }: { onTutup: () => void }) {
  const t = useToko();
  const [nama, setNama] = useState('');
  const [peran, setPeran] = useState<PeranSlug>('kasir');
  const [salah, setSalah] = useState('');

  function simpan(e: React.FormEvent) {
    e.preventDefault();
    const h = t.tambahPengguna(nama, peran);
    if (!h.ok) {
      setSalah(h.pesan ?? '');
      return;
    }
    onTutup();
  }

  return (
    <Panel judul="Tambah pengguna" ukuran="sm" onTutup={onTutup}>
      <form onSubmit={simpan} className="flex flex-col gap-4">
        <Medan label="Nama" wajib salah={salah}>
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
        <Medan label="Peran" bantu={namaPeran[peran].ringkas}>
          {(a) => (
            <select {...a} value={peran} onChange={(e) => setPeran(e.target.value as PeranSlug)} className={cls.input}>
              <option value="kasir">Kasir</option>
              <option value="admin">Admin</option>
            </select>
          )}
        </Medan>
        <div className="flex gap-2">
          <button type="button" onClick={onTutup} className={`${cls.btn} flex-1`}>
            Batal
          </button>
          <button type="submit" className={`${cls.btnUtama} flex-1`}>
            Tambah
          </button>
        </div>
      </form>
    </Panel>
  );
}
