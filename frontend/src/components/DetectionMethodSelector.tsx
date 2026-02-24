/**
 * DetectionMethod selector — shared radio card component
 * Used in SuratMasukForm and SuratKeluarForm upload step.
 */

export type DetectionMethod = "ai" | "regex" | "hybrid" | "ocr_only" | "manual"

interface MethodOption {
    id: DetectionMethod
    icon: string
    label: string
    description: string
    badge?: string
    /** disable when API key not configured */
    requiresAI?: boolean
}

export const DETECTION_METHODS: MethodOption[] = [
    {
        id: "hybrid",
        icon: "⚡",
        label: "AI + Regex",
        description: "AI sebagai primary, regex mengisi field yang masih kosong",
        badge: "Rekomendasi",
        requiresAI: true,
    },
    {
        id: "ai",
        icon: "🤖",
        label: "AI (OpenRouter)",
        description: "Paling akurat — LLM memahami konteks surat secara semantik",
        requiresAI: true,
    },
    {
        id: "regex",
        icon: "🔍",
        label: "Regex / Pattern",
        description: "Cepat & offline — berbasis pola teks terstruktur",
    },
    {
        id: "ocr_only",
        icon: "📄",
        label: "OCR Only",
        description: "Hanya ekstrak teks mentah, isi form secara manual",
    },
    {
        id: "manual",
        icon: "✍️",
        label: "Manual",
        description: "Skip OCR & deteksi — langsung ke form kosong",
    },
]

interface DetectionMethodSelectorProps {
    value: DetectionMethod
    onChange: (method: DetectionMethod) => void
    aiAvailable: boolean
}

export function DetectionMethodSelector({
    value,
    onChange,
    aiAvailable,
}: DetectionMethodSelectorProps) {
    return (
        <div className="w-full max-w-2xl mx-auto mb-6">
            <p className="text-sm font-medium text-muted-foreground mb-3 text-center">
                Pilih metode deteksi otomatis
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {DETECTION_METHODS.map((m) => {
                    const disabled = m.requiresAI && !aiAvailable
                    const selected = value === m.id
                    return (
                        <button
                            key={m.id}
                            type="button"
                            disabled={disabled}
                            onClick={() => !disabled && onChange(m.id)}
                            title={disabled ? "Memerlukan OPENROUTER_API_KEY" : m.description}
                            className={[
                                "relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all duration-150",
                                selected
                                    ? "border-primary bg-primary/10 shadow-sm"
                                    : "border-muted hover:border-primary/40 hover:bg-accent/40",
                                disabled
                                    ? "opacity-40 cursor-not-allowed"
                                    : "cursor-pointer",
                            ].join(" ")}
                        >
                            {/* Recommended badge */}
                            {m.badge && (
                                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                    {m.badge}
                                </span>
                            )}

                            <span className="text-2xl leading-none">{m.icon}</span>
                            <span className={`text-xs font-semibold leading-tight ${selected ? "text-primary" : ""}`}>
                                {m.label}
                            </span>
                            <span className="text-[10px] text-muted-foreground leading-tight hidden sm:block">
                                {m.description}
                            </span>

                            {/* Selected indicator */}
                            {selected && (
                                <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-primary" />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
