import { useMemo, useState } from 'react';
import {
  hitungPotonganPromo,
  rupiah,
  statusPromo,
  type Promo,
} from '../../../data/warung-maju';
import { useToko } from './store';
import {
  AngkaRingkas,
  cls,
  Halaman,
  IsianRupiah,
  Konfirmasi,
  Kosong,
  Lencana,
  Medan,
  Panel,
  Sakelar,
} from './ui';

const labelStatus = {
  aktif: { nada: 'aman', teks: 'Berlaku' },
  dijeda: { nada: 'netral', teks: 'Dijeda' },
  berakhir: { nada: 'bahaya', teks: 'Berakhir' },
  habis: { nada: 'peringatan', teks: 'Kuota habis' },
} as const;

function tulisTanggal(iso: string): string {
  if (!iso) return 'Tanpa batas waktu';
  const [y, b, d] = iso.split('-').map(Number);
  return `Sampai ${new Date(y, b - 1, d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

export default function KelolaPromo() {
  const t = useToko();
  const [form, setForm] = useState<{ ubah?: Promo } | null>(null);
  const [hapus, setHapus] = useState<Promo | null>(null);
  const [galatHapus, setGalatHapus] = useState('');
  const sekarang = t.sekarang();

  const ringkas = useMemo(() => {
    const status = t.promo.map((p) => statusPromo(p, sekarang));
    return {
      aktif: status.filter((s) => s === 'aktif').length,
      lain: status.filter((s) => s !== 'aktif').length,
      terpakai: t.promo.reduce((s, p) => s + p.terpakai, 0),
    };
  }, [t.promo, sekarang]);

  return (
    <Halaman
      judul="Promo"
      ringkas="Kode potongan yang bisa dipilih kasir saat pembayaran. Hanya promo yang berlaku yang bisa dipakai."
      aksi={
        <button type="button" onClick={() => setForm({})} className={cls.btnUtama}>
          + Buat promo
        </button>
      }
    >
      <dl className="grid grid-cols-3 gap-3">
        <AngkaRingkas label="Sedang berlaku" nilai={String(ringkas.aktif)} />
        <AngkaRingkas label="Dijeda / berakhir" nilai={String(ringkas.lain)} />
        <AngkaRingkas label="Total terpakai" nilai={String(ringkas.terpakai)} ket="kali" />
      </dl>

      {t.promo.length === 0 ? (
        <div className="mt-5">
          <Kosong
            judul="Belum ada promo"
            isi="Buat promo pertama, misalnya potongan 5% untuk semua barang."
            aksi={
              <button type="button" onClick={() => setForm({})} className={cls.btnUtama}>
                Buat promo
              </button>
            }
          />
        </div>
      ) : (
        <ul className="mt-5 grid gap-3 lg:grid-cols-2">
          {t.promo.map((p) => {
            const s = statusPromo(p, sekarang);
            const sisa = p.kuota > 0 ? Math.max(0, p.kuota - p.terpakai) : null;
            return (
              <li key={p.id} className={`${cls.kartu} flex flex-col p-4 ${s === 'aktif' ? '' : 'bg-surface-alt'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="tabular font-display text-xl leading-tight font-extrabold tracking-wide">
                      {p.kode}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-muted">{p.nama}</p>
                  </div>
                  <Lencana nada={labelStatus[s].nada}>{labelStatus[s].teks}</Lencana>
                </div>

                <dl className="tabular mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  <div>
                    <dt className="text-[11px] text-ink-muted">Potongan</dt>
                    <dd className="font-semibold">
                      {p.jenis === 'persen' ? `${p.nilai}%` : rupiah(p.nilai)}
                      {p.jenis === 'persen' && p.maksimal > 0 && (
                        <span className="font-normal text-ink-muted"> maks. {rupiah(p.maksimal)}</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-ink-muted">Belanja minimal</dt>
                    <dd className="font-semibold">{p.minimal > 0 ? rupiah(p.minimal) : 'Tanpa syarat'}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-ink-muted">Periode</dt>
                    <dd>{tulisTanggal(p.akhir)}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-ink-muted">Dipakai</dt>
                    <dd>
                      {p.terpakai}
                      {p.kuota > 0 ? ` dari ${p.kuota}` : ' kali'}
                    </dd>
                  </div>
                </dl>

                {sisa !== null && (
                  <div
                    className="mt-3 h-1.5 overflow-hidden rounded-full bg-line"
                    role="img"
                    aria-label={`Kuota terpakai ${p.terpakai} dari ${p.kuota}, sisa ${sisa}`}
                  >
                    <div
                      className={`h-full ${sisa === 0 ? 'bg-amber-500' : 'bg-brand'}`}
                      style={{ width: `${Math.min(100, (p.terpakai / p.kuota) * 100)}%` }}
                    />
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-1.5 border-t border-line pt-3">
                  <button type="button" onClick={() => setForm({ ubah: p })} className={cls.btnKecil}>
                    Ubah
                  </button>
                  <button type="button" onClick={() => t.jedaPromo(p.id)} className={cls.btnKecil}>
                    {p.aktif ? 'Jeda' : 'Aktifkan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGalatHapus('');
                      setHapus(p);
                    }}
                    className={`${cls.btnKecil} ml-auto text-red-700`}
                  >
                    Hapus
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {form && <FormPromo ubah={form.ubah} onTutup={() => setForm(null)} />}

      {hapus && (
        <Konfirmasi
          judul={`Hapus promo ${hapus.kode}?`}
          tombol="Ya, hapus"
          bahaya
          onBatal={() => setHapus(null)}
          onYa={() => {
            const h = t.hapusPromo(hapus.id);
            if (h.ok) setHapus(null);
            else setGalatHapus(h.pesan ?? '');
          }}
          isi={
            <>
              <p>Promo yang sudah pernah dipakai tidak bisa dihapus, hanya dijeda.</p>
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

function FormPromo({ ubah, onTutup }: { ubah?: Promo; onTutup: () => void }) {
  const t = useToko();
  const [kode, setKode] = useState(ubah?.kode ?? '');
  const [nama, setNama] = useState(ubah?.nama ?? '');
  const [jenis, setJenis] = useState<'persen' | 'nominal'>(ubah?.jenis ?? 'persen');
  const [nilai, setNilai] = useState(ubah?.nilai ?? 0);
  const [minimal, setMinimal] = useState(ubah?.minimal ?? 0);
  const [maksimal, setMaksimal] = useState(ubah?.maksimal ?? 0);
  const [akhir, setAkhir] = useState(ubah?.akhir ?? '');
  const [kuota, setKuota] = useState(ubah?.kuota ?? 0);
  const [aktif, setAktif] = useState(ubah?.aktif ?? true);
  const [salah, setSalah] = useState('');

  // Contoh hitungan, supaya pemilik langsung melihat akibat dari angkanya.
  const contoh = Math.max(minimal, 50000);
  const potong = nilai > 0
    ? hitungPotonganPromo({ jenis, nilai, maksimal } as Promo, contoh)
    : 0;

  function simpan() {
    const h = t.simpanPromo({ id: ubah?.id, kode, nama, jenis, nilai, minimal, maksimal, akhir, kuota, aktif });
    if (!h.ok) {
      setSalah(h.pesan ?? 'Gagal menyimpan.');
      return;
    }
    onTutup();
  }

  return (
    <Panel
      judul={ubah ? `Ubah promo ${ubah.kode}` : 'Buat promo'}
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
            <button type="button" onClick={onTutup} className={`${cls.btn} flex-1`}>
              Batal
            </button>
            <button type="button" onClick={simpan} className={`${cls.btnUtama} flex-1`}>
              {ubah ? 'Simpan perubahan' : 'Buat promo'}
            </button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <Medan label="Kode promo" wajib bantu="Yang dipilih kasir. Huruf besar, tanpa spasi.">
          {(a) => (
            <input
              {...a}
              type="text"
              value={kode}
              maxLength={14}
              onChange={(e) => {
                setKode(e.target.value.toUpperCase().replace(/\s/g, ''));
                setSalah('');
              }}
              className={`${cls.input} tabular tracking-wide`}
              data-fokus-awal
            />
          )}
        </Medan>

        <Medan label="Keterangan" wajib>
          {(a) => (
            <input
              {...a}
              type="text"
              value={nama}
              onChange={(e) => {
                setNama(e.target.value);
                setSalah('');
              }}
              placeholder="Misalnya: Hemat 5% semua barang"
              className={cls.input}
            />
          )}
        </Medan>

        <fieldset>
          <legend className="text-sm font-medium text-ink-muted">Jenis potongan</legend>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {(
              [
                ['persen', 'Persen (%)'],
                ['nominal', 'Nominal (Rp)'],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  setJenis(v);
                  setNilai(0);
                  setSalah('');
                }}
                aria-pressed={jenis === v}
                className={`min-h-11 rounded-control border font-semibold ${
                  jenis === v ? 'border-brand bg-brand-soft text-brand-strong' : 'border-line-strong text-ink-muted'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </fieldset>

        <Medan label={jenis === 'persen' ? 'Besar potongan' : 'Nilai potongan'} wajib>
          {(a) =>
            jenis === 'persen' ? (
              <div className="flex h-11 items-center rounded-control border border-line-strong bg-surface px-3 focus-within:border-brand">
                <input
                  {...a}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={100}
                  value={nilai || ''}
                  placeholder="0"
                  onChange={(e) => {
                    setNilai(Math.min(100, Math.max(0, Number(e.target.value))));
                    setSalah('');
                  }}
                  className="tabular h-full w-full bg-transparent text-sm outline-none"
                />
                <span className="ml-1.5 text-sm text-ink-muted">%</span>
              </div>
            ) : (
              <IsianRupiah {...a} nilai={nilai} onUbah={(n) => { setNilai(n); setSalah(''); }} />
            )
          }
        </Medan>

        <Medan label="Belanja minimal" bantu="Kosongkan kalau berlaku untuk berapa pun belanjanya.">
          {(a) => <IsianRupiah {...a} nilai={minimal} onUbah={setMinimal} />}
        </Medan>

        {jenis === 'persen' && (
          <Medan label="Potongan maksimal" bantu="Supaya persen besar tidak merugikan. Kosongkan kalau tanpa batas.">
            {(a) => <IsianRupiah {...a} nilai={maksimal} onUbah={setMaksimal} />}
          </Medan>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Medan label="Berlaku sampai" bantu="Kosong berarti tanpa batas.">
            {(a) => (
              <input {...a} type="date" value={akhir} onChange={(e) => setAkhir(e.target.value)} className={cls.input} />
            )}
          </Medan>
          <Medan label="Kuota pemakaian" bantu="0 berarti tanpa batas.">
            {(a) => (
              <input
                {...a}
                type="number"
                inputMode="numeric"
                min={0}
                value={kuota || ''}
                placeholder="0"
                onChange={(e) => setKuota(Math.max(0, Math.floor(Number(e.target.value))))}
                className={`${cls.input} tabular`}
              />
            )}
          </Medan>
        </div>

        {nilai > 0 && (
          <p className="tabular rounded-control bg-surface-alt px-3 py-2.5 text-sm text-ink-muted">
            Contoh: belanja <strong className="text-ink">{rupiah(contoh)}</strong> dapat potongan{' '}
            <strong className="text-brand-strong">{rupiah(potong)}</strong>, jadi bayar{' '}
            <strong className="text-ink">{rupiah(contoh - potong)}</strong>.
          </p>
        )}

        <div className="border-t border-line pt-4">
          <Sakelar
            label="Promo aktif"
            keterangan="Matikan untuk menjeda tanpa menghapus."
            nyala={aktif}
            onUbah={setAktif}
          />
        </div>
      </div>
    </Panel>
  );
}
