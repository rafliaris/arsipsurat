import React, { useEffect, useState } from "react";
import { type SuratMasuk } from "@/features/surat-masuk/types";
import { type Disposisi } from "@/features/disposisi/types";
import { disposisiService } from "@/services/disposisiService";
import { settingsService } from "@/services/settingsService";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface DisposisiPrintProps {
    surat: SuratMasuk;
}

interface OrgInfo {
    org_name: string;
    org_unit: string;
    org_address: string;
}

const DEFAULT_ORG: OrgInfo = {
    org_name: "KEPOLISIAN NEGARA REPUBLIK INDONESIA",
    org_unit: "DAERAH NUSA TENGGARA BARAT",
    org_address: "Jl. Majapahit No. 2, Mataram",
};

export const DisposisiPrint = React.forwardRef<HTMLDivElement, DisposisiPrintProps>(({ surat }, ref) => {
    const [disposisiList, setDisposisiList] = useState<Disposisi[]>([]);
    const [org, setOrg] = useState<OrgInfo>(DEFAULT_ORG);

    // Fetch disposisi for this surat
    useEffect(() => {
        if (!surat?.id) return;
        disposisiService.getAll({ surat_type: "masuk" }).then((data) => {
            setDisposisiList(data.filter((d) => d.surat_masuk_id === surat.id));
        });
    }, [surat?.id]);

    // Fetch public org settings
    useEffect(() => {
        settingsService.getPublic().then((settings) => {
            const get = (key: string) =>
                settings.find((s) => s.setting_key === key)?.setting_value ?? "";
            const org_name = get("org_name") || DEFAULT_ORG.org_name;
            const org_unit = get("org_unit") || DEFAULT_ORG.org_unit;
            const org_address = get("org_address") || DEFAULT_ORG.org_address;
            setOrg({ org_name, org_unit, org_address });
        }).catch(() => {/* use defaults silently */ });
    }, []);

    if (!surat) return null;

    return (
        <div ref={ref} className="p-8 font-serif text-black bg-white min-h-screen">
            {/* ── Kop Surat ──────────────────────────────────────────── */}
            <div className="flex items-start border-b-4 border-black pb-4 mb-6 gap-4">
                {/* Logo placeholder */}
                <div className="w-20 h-20 border-2 border-black flex items-center justify-center text-xs text-center shrink-0">
                    LOGO
                </div>
                <div className="text-center flex-1">
                    <h1 className="text-base font-bold uppercase leading-tight">{org.org_name}</h1>
                    <h2 className="text-sm font-bold uppercase leading-tight">{org.org_unit}</h2>
                    <p className="text-xs mt-1">{org.org_address}</p>
                </div>
                {/* Spacer to balance logo */}
                <div className="w-20 shrink-0" />
            </div>

            {/* ── Judul ──────────────────────────────────────────────── */}
            <div className="text-center font-bold mb-6 text-lg underline tracking-widest">
                LEMBAR DISPOSISI
            </div>

            {/* ── Info Surat ─────────────────────────────────────────── */}
            <table className="w-full border-collapse border border-black mb-6 text-sm">
                <tbody>
                    <tr>
                        <td className="border border-black p-2 font-bold w-1/4 bg-gray-50">Surat Dari</td>
                        <td className="border border-black p-2">{surat.pengirim}</td>
                        <td className="border border-black p-2 font-bold w-1/4 bg-gray-50">Diterima Tanggal</td>
                        <td className="border border-black p-2">
                            {format(new Date(surat.tanggal_terima), "dd MMMM yyyy", { locale: id })}
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-black p-2 font-bold bg-gray-50">No. Surat</td>
                        <td className="border border-black p-2">{surat.nomor_surat || "–"}</td>
                        <td className="border border-black p-2 font-bold bg-gray-50">Tanggal Surat</td>
                        <td className="border border-black p-2">
                            {format(new Date(surat.tanggal_surat), "dd MMMM yyyy", { locale: id })}
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-black p-2 font-bold bg-gray-50">Perihal</td>
                        <td className="border border-black p-2" colSpan={3}>{surat.perihal}</td>
                    </tr>
                    <tr>
                        <td className="border border-black p-2 font-bold bg-gray-50">Kategori</td>
                        <td className="border border-black p-2">{surat.kategori?.nama ?? "–"}</td>
                        <td className="border border-black p-2 font-bold bg-gray-50">Prioritas</td>
                        <td className="border border-black p-2 uppercase">{surat.priority ?? "–"}</td>
                    </tr>
                </tbody>
            </table>

            {/* ── Instruksi / Disposisi ──────────────────────────────── */}
            <div className="mb-3 font-bold text-sm">Instruksi / Disposisi:</div>
            {disposisiList.length > 0 ? (
                <div className="space-y-3">
                    {disposisiList.map((d, idx) => (
                        <div key={d.id} className="border border-black text-sm">
                            <div className="flex justify-between items-center p-2 border-b border-black bg-gray-50">
                                <span className="font-bold text-xs">#{idx + 1}</span>
                                <span className="font-bold text-xs">
                                    Status: {d.status}
                                </span>
                                <span className="text-xs">
                                    {format(new Date(d.created_at), "dd MMM yyyy HH:mm", { locale: id })}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 divide-x divide-black">
                                <div className="p-2">
                                    <div className="text-xs text-gray-500 mb-1">Dari</div>
                                    <div className="font-medium">User #{d.from_user_id}</div>
                                </div>
                                <div className="p-2">
                                    <div className="text-xs text-gray-500 mb-1">Kepada</div>
                                    <div className="font-medium">User #{d.to_user_id}</div>
                                </div>
                            </div>
                            <div className="p-2 border-t border-black">
                                <div className="text-xs text-gray-500 mb-1">Instruksi</div>
                                <p className="whitespace-pre-wrap">{d.instruksi}</p>
                            </div>
                            {d.keterangan && (
                                <div className="p-2 border-t border-black border-dashed">
                                    <div className="text-xs text-gray-500 mb-1">Keterangan</div>
                                    <p className="italic">{d.keterangan}</p>
                                </div>
                            )}
                            {d.deadline && (
                                <div className="p-2 border-t border-black border-dashed text-xs">
                                    Batas Waktu: <strong>{format(new Date(d.deadline), "dd MMMM yyyy", { locale: id })}</strong>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="border border-black p-6 text-center italic text-gray-500 text-sm">
                    Belum ada disposisi untuk surat ini.
                </div>
            )}

            {/* ── Footer ─────────────────────────────────────────────── */}
            <div className="mt-10 flex justify-between text-xs text-gray-500">
                <span>Total disposisi: {disposisiList.length}</span>
                <span>Dicetak pada: {format(new Date(), "dd MMMM yyyy HH:mm", { locale: id })}</span>
            </div>
        </div>
    );
});
DisposisiPrint.displayName = "DisposisiPrint";
