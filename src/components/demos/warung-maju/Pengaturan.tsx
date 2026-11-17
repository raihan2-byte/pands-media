import { useState } from 'react';
import { pengaturanAwal, SEMUA_METODE, type Metode, type Pengaturan } from '../../../data/warung-maju';
import { useToko } from './store';
import { cls, Halaman, Konfirmasi, Medan, Sakelar } from './ui';

export default function PengaturanToko() {
  const t = useToko();
  const [f, setF] = useState<Pengaturan>(t.pengaturan);
  const [salah, setSalah] = useState('');
  const [reset, setReset] = useState(false);

  const berubah = JSON.stringify(f) !== JSON.stringify(t.pengaturan);

  function ubah<K extends keyof Pengaturan>(k: K, v: Pengaturan[K]) {
    setF((x) => ({ ...x, [k]: v }));
    setSalah('');
  }

  function simpan(e: React.FormEvent) {
    e.preventDefault();
    if (f.nama.trim().length < 3) return setSalah('Tulis nama warung, minimal 3 huruf.');
    if (f.pajak < 0 || f.pajak > 25) return setSalah('Pajak harus antara 0 dan 25 persen.');
    if (!SEMUA_METODE.some((m) => f.metodeAktif[m])) return setSalah('Aktifkan minimal satu metode pembayaran.');
    t.ubahPengaturan({ ...f, nama: f.nama.trim() });
    t.umumkan('Pengaturan disimpan.');
    setSalah('');
  }

  return (
    <Halaman judul="Pengaturan" ringkas="Identitas warung, struk, pajak, dan aturan kasir.">
      <form onSubmit={simpan} className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-4">
          <section className={`${cls.kartu} p-4 sm:p-5`}>
            <h2 className="text-base">Identitas warung</h2>
            <p className="text-xs text-ink-muted">Tampil di kepala struk.</p>
            <div className="mt-4 flex flex-col gap-4">
              <Medan label="Nama warung" wajib>
                {(a) => <input {...a} type="text" value={f.nama} onChange={(e) => ubah('nama', e.target.value)} className={cls.input} />}
              </Medan>
              <Medan label="Alamat">
                {(a) => <input {...a} type="text" value={f.alamat} onChange={(e) => ubah('alamat', e.target.value)} className={cls.input} />}
              </Medan>
              <Medan label="Telepon">
                {(a) => <input {...a} type="tel" value={f.telepon} onChange={(e) => ubah('telepon', e.target.value)} className={cls.input} />}
              </Medan>
              <Medan label="Catatan kaki struk" bantu="Kalimat penutup di bagian bawah struk.">
                {(a) => <input {...a} type="text" value={f.footerStruk} onChange={(e) => ubah('footerStruk', e.target.value)} className={cls.input} />}
              </Medan>
            </div>
          </section>

          <section className={`${cls.kartu} p-4 sm:p-5`}>
            <h2 className="text-base">Pembayaran dan pajak</h2>
            <div className="mt-4 flex flex-col gap-5">
              <div>
                <p className="text-sm font-medium text-ink-muted">Metode yang dipakai di kasir</p>
                <div className="mt-3 flex flex-col gap-4">
                  {SEMUA_METODE.map((m: Metode) => (
                    <Sakelar
                      key={m}
                      label={m}
                      nyala={f.metodeAktif[m]}
                      onUbah={(b) => ubah('metodeAktif', { ...f.metodeAktif, [m]: b })}
                    />
                  ))}
                </div>
              </div>

              <Medan label="Pajak yang ditambahkan ke tagihan" bantu="0 berarti tanpa pajak. Dihitung setelah promo dan diskon.">
                {(a) => (
                  <div className="flex h-11 w-40 items-center rounded-control border border-line-strong bg-surface px-3 focus-within:border-brand">
                    <input
                      {...a}
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={25}
                      value={f.pajak || ''}
                      placeholder="0"
                      onChange={(e) => ubah('pajak', Math.max(0, Number(e.target.value)))}
                      className="tabular h-full w-full bg-transparent text-sm outline-none"
                    />
                    <span className="ml-1.5 text-sm text-ink-muted">%</span>
                  </div>
                )}
              </Medan>
            </div>
          </section>

          <section className={`${cls.kartu} p-4 sm:p-5`}>
            <h2 className="text-base">Aturan kasir</h2>
            <div className="mt-4">
              <Sakelar
                label="Kasir boleh memberi diskon manual"
                keterangan="Kalau mati, kolom diskon manual hanya muncul untuk admin."
                nyala={f.kasirBolehDiskon}
                onUbah={(b) => ubah('kasirBolehDiskon', b)}
              />
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={!berubah} className={cls.btnUtama}>
              Simpan pengaturan
            </button>
            {berubah && (
              <button type="button" onClick={() => setF(t.pengaturan)} className={cls.btn}>
                Batalkan perubahan
              </button>
            )}
            {salah && (
              <p role="alert" className="text-sm font-medium text-red-700">
                {salah}
              </p>
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-5 lg:self-start">
          <section className={`${cls.kartu} p-4`}>
            <h2 className="text-base">Pratinjau kepala struk</h2>
            <div className="mt-3 rounded-control bg-surface-alt p-4 text-center font-mono text-[13px] leading-relaxed">
              <p className="text-base font-bold">{f.nama || '—'}</p>
              <p>{f.alamat}</p>
              <p>{f.telepon}</p>
              <hr className="my-3 border-dashed border-ink/30" />
              <p className="text-xs">… isi belanja …</p>
              <hr className="my-3 border-dashed border-ink/30" />
              <p>{f.footerStruk}</p>
            </div>
          </section>

          <section className={`${cls.kartu} p-4`}>
            <h2 className="text-base">Data demo</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Semua perubahan di demo ini hidup di browser dan hilang saat halaman dimuat ulang. Kembalikan sekarang
              kalau datanya sudah berantakan.
            </p>
            <button type="button" onClick={() => setReset(true)} className={`${cls.btn} mt-3 w-full`}>
              Kembalikan demo ke awal
            </button>
          </section>
        </aside>
      </form>

      {reset && (
        <Konfirmasi
          judul="Kembalikan demo ke awal?"
          tombol="Ya, kembalikan"
          onBatal={() => setReset(false)}
          onYa={() => {
            t.reset();
            setReset(false);
            setF(pengaturanAwal);
          }}
          isi="Produk, promo, transaksi, dan pengaturan yang kamu ubah akan kembali ke isi bawaan."
        />
      )}
    </Halaman>
  );
}
