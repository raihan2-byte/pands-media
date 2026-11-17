import { jam, rupiah, tanggalPendek, type Transaksi } from '../../../data/warung-maju';
import { useToko } from './store';
import { cls, Panel } from './ui';

/**
 * Struk belanja. Dipakai setelah pembayaran dan untuk cetak ulang dari riwayat.
 *
 * Elemen `#struk` adalah satu-satunya bagian yang ikut tercetak: halaman
 * pembungkusnya punya aturan @media print yang menyembunyikan sisanya dan
 * menyempitkan struk ke lebar kertas thermal 72 mm.
 */
export function Struk({
  t,
  onTutup,
  tombolTutup = 'Selesai',
}: {
  t: Transaksi;
  onTutup: () => void;
  tombolTutup?: string;
}) {
  const { pengaturan: p } = useToko();
  const batal = t.status === 'batal';
  const garis = <hr className="my-3 border-dashed border-ink/30" />;

  return (
    <Panel
      judul={batal ? 'Struk (dibatalkan)' : 'Struk pembayaran'}
      ukuran="sm"
      onTutup={onTutup}
      kaki={
        <div className="flex gap-2">
          <button type="button" onClick={() => window.print()} className={`${cls.btn} flex-1`}>
            Cetak
          </button>
          <button type="button" onClick={onTutup} className={`${cls.btnUtama} flex-1`} data-fokus-awal>
            {tombolTutup}
          </button>
        </div>
      }
    >
      <div id="struk" className="font-mono text-[13px] leading-relaxed">
        <div className="text-center">
          <p className="text-base font-bold">{p.nama}</p>
          <p>{p.alamat}</p>
          <p>{p.telepon}</p>
        </div>
        {garis}

        {batal && (
          <p className="mb-2 border border-red-700 py-1 text-center font-bold tracking-widest text-red-700">
            DIBATALKAN
          </p>
        )}

        <div className="flex justify-between">
          <span>{t.nomor}</span>
          <span>
            {tanggalPendek(t.waktu)} {jam(t.waktu)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Kasir</span>
          <span>{t.kasir}</span>
        </div>
        <div className="flex justify-between">
          <span>Pelanggan</span>
          <span>{t.pelanggan}</span>
        </div>
        {garis}

        <ul>
          {t.baris.map((b) => (
            <li key={b.kode} className="mt-1">
              <div>{b.nama}</div>
              <div className="flex justify-between">
                <span>
                  {b.jumlah} × {rupiah(b.harga)}
                </span>
                <span>{rupiah(b.jumlah * b.harga)}</span>
              </div>
            </li>
          ))}
        </ul>
        {garis}

        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{rupiah(t.subtotal)}</span>
        </div>
        {t.potPromo > 0 && (
          <div className="flex justify-between">
            <span>Promo {t.kodePromo}</span>
            <span>-{rupiah(t.potPromo)}</span>
          </div>
        )}
        {t.potManual > 0 && (
          <div className="flex justify-between">
            <span>Diskon</span>
            <span>-{rupiah(t.potManual)}</span>
          </div>
        )}
        {t.pajak > 0 && (
          <div className="flex justify-between">
            <span>Pajak</span>
            <span>{rupiah(t.pajak)}</span>
          </div>
        )}
        <div className="mt-1 flex justify-between font-bold">
          <span>TOTAL</span>
          <span>{rupiah(t.total)}</span>
        </div>
        <div className="flex justify-between">
          <span>{t.metode}</span>
          <span>{rupiah(t.bayar)}</span>
        </div>
        {t.metode === 'Tunai' && (
          <div className="flex justify-between">
            <span>Kembali</span>
            <span>{rupiah(t.kembali)}</span>
          </div>
        )}
        {garis}
        <p className="text-center">{p.footerStruk}</p>
        {batal && t.alasanBatal && (
          <p className="mt-2 text-center text-xs">Alasan batal: {t.alasanBatal}</p>
        )}
      </div>
    </Panel>
  );
}
