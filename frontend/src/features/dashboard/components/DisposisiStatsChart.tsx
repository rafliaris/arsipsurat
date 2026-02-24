import { Pie, PieChart, Label, Cell } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { useEffect, useState, useMemo } from "react"
import { dashboardService } from "@/services/dashboardService"
import type { ChartDataPoint } from "@/features/dashboard/types"

const CHART_COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
]

export function DisposisiStatsChart({ loading: parentLoading }: { loading?: boolean }) {
    const [data, setData] = useState<ChartDataPoint[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        dashboardService.getChartsByKategori("masuk")
            .then(setData)
            .catch(() => setData([]))
            .finally(() => setLoading(false))
    }, [])

    const total = useMemo(() => data.reduce((acc, d) => acc + d.value, 0), [data])

    // Build ChartConfig dynamically from real data
    const chartConfig: ChartConfig = useMemo(() => {
        const cfg: ChartConfig = { value: { label: "Surat" } }
        data.forEach((d, i) => {
            cfg[d.label.toLowerCase().replace(/\s+/g, "_")] = {
                label: d.label,
                color: d.color ?? CHART_COLORS[i % CHART_COLORS.length],
            }
        })
        return cfg
    }, [data])

    if (parentLoading || loading) {
        return (
            <div className="flex items-center justify-center h-[250px] w-full">
                <div className="h-full w-full bg-muted/20 animate-pulse rounded-lg" />
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                    <CardTitle>Sebaran Kategori Surat</CardTitle>
                    <CardDescription>Berdasarkan Kategori Surat Masuk</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center min-h-[200px] text-muted-foreground text-sm">
                    Belum ada data
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Sebaran Kategori Surat</CardTitle>
                <CardDescription>Berdasarkan Kategori Surat Masuk</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="label"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={entry.label}
                                    fill={entry.color ?? CHART_COLORS[index % CHART_COLORS.length]}
                                />
                            ))}
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {total.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground text-xs"
                                                >
                                                    Total
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="leading-none text-muted-foreground">
                    Menampilkan distribusi surat masuk per kategori.
                </div>
            </CardFooter>
        </Card>
    )
}
