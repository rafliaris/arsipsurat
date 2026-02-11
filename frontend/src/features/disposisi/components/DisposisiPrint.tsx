import React, { useEffect, useState } from "react";
import { type SuratMasuk } from "@/features/surat-masuk/types";
import { type Disposisi } from "@/features/disposisi/types";
import { mockDisposisiService } from "@/services/mockDisposisiService";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface DisposisiPrintProps {
    surat: SuratMasuk;
}

export const DisposisiPrint = React.forwardRef<HTMLDivElement, DisposisiPrintProps>(({ surat }, ref) => {
    const [disposisiList, setDisposisiList] = useState<Disposisi[]>([]);

    useEffect(() => {
        const fetchDisposisi = async () => {
            if (surat?.id) {
                const data = await mockDisposisiService.getBySuratMasukId(surat.id);
                setDisposisiList(data);
            }
        };
        fetchDisposisi();
    }, [surat?.id]);

    if (!surat) return null;

    return (
        <div ref={ref} className="p-8 font-serif text-black bg-white">
            {/* Kop Surat / Header */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="text-2xl font-bold uppercase">Pemerintah Kota Contoh</h1>
                <h2 className="text-xl font-bold uppercase">Dinas Kearsipan dan Perpustakaan</h2>
                <p>Jl. Contoh No. 123, Kota Contoh</p>
            </div>

            <div className="text-center font-bold mb-6 text-xl underline">LEMBAR DISPOSISI</div>

            {/* Surat Details Table */}
            <table className="w-full border-collapse border border-black mb-6 text-sm">
                <tbody>
                    <tr>
                        <td className="border border-black p-2 font-bold w-1/4">Surat Dari</td>
                        <td className="border border-black p-2">{surat.pengirim}</td>
                        <td className="border border-black p-2 font-bold w-1/4">Diterima Tanggal</td>
                        <td className="border border-black p-2">{format(new Date(surat.tanggal_terima), "dd MMM yyyy", { locale: id })}</td>
                    </tr>
                    <tr>
                        <td className="border border-black p-2 font-bold">No. Surat</td>
                        <td className="border border-black p-2">{surat.nomor_surat}</td>
                        <td className="border border-black p-2 font-bold">No. Agenda</td>
                        <td className="border border-black p-2">-</td>
                    </tr>
                    <tr>
                        <td className="border border-black p-2 font-bold">Tanggal Surat</td>
                        <td className="border border-black p-2">{format(new Date(surat.tanggal_surat), "dd MMM yyyy", { locale: id })}</td>
                        <td className="border border-black p-2 font-bold">Sifat</td>
                        <td className="border border-black p-2">{surat.status}</td>
                    </tr>
                    <tr>
                        <td className="border border-black p-2 font-bold">Perihal</td>
                        <td className="border border-black p-2" colSpan={3}>{surat.perihal}</td>
                    </tr>
                </tbody>
            </table>

            {/* Disposisi List */}
            <div className="mb-4 font-bold">Instruksi / Disposisi:</div>
            {disposisiList.length > 0 ? (
                <div className="space-y-4">
                    {disposisiList.map((d) => (
                        <div key={d.id} className="border border-black p-4 text-sm">
                            <div className="flex justify-between mb-2 border-b border-black border-dashed pb-2">
                                <span className="font-bold">Dari: {d.dari}</span>
                                <span className="font-bold">Kepada: {d.tujuan}</span>
                            </div>
                            <div className="mb-2">
                                <span className="font-bold">Instruksi:</span>
                                <p>{d.instruksi}</p>
                            </div>
                            <div className="flex justify-between text-xs mt-4">
                                <span>Sifat: {d.sifat}</span>
                                <span>Batas Waktu: {format(new Date(d.batas_waktu), "dd MMM yyyy", { locale: id })}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="italic text-center py-4 border border-black">Belum ada disposisi.</p>
            )}

            <div className="mt-8 text-xs text-right">
                Dicetak pada: {format(new Date(), "dd MMM yyyy HH:mm", { locale: id })}
            </div>
        </div>
    );
});
DisposisiPrint.displayName = "DisposisiPrint";
