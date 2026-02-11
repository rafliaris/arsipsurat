import { Pie, PieChart, Label } from "recharts"
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
import { mockDisposisiStats } from "@/services/mockDashboardService"
import { useMemo } from "react"

export function DisposisiStatsChart({ loading }: { loading?: boolean }) {
    const totalDisposisi = useMemo(() => {
        return mockDisposisiStats.reduce((acc, curr) => acc + curr.value, 0)
    }, [])

    const chartConfig = {
        value: {
            label: "Disposisi",
        },
        segera: {
            label: "Segera",
            color: "hsl(var(--chart-1))",
        },
        penting: {
            label: "Penting",
            color: "hsl(var(--chart-2))",
        },
        rutin: {
            label: "Rutin",
            color: "hsl(var(--chart-3))",
        },
        rahasia: {
            label: "Rahasia",
            color: "hsl(var(--chart-4))",
        },
    } satisfies ChartConfig

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[250px] w-full">
                <div className="h-full w-full bg-muted/20 animate-pulse rounded-lg" />
            </div>
        )
    }

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Statistik Disposisi</CardTitle>
                <CardDescription>Berdasarkan Sifat Surat</CardDescription>
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
                            data={mockDisposisiStats}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            strokeWidth={5}
                        >
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
                                                    {totalDisposisi.toLocaleString()}
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
                <div className="flex items-center gap-2 font-medium leading-none">
                    Trending naik 5.2% bulan ini <span className="text-emerald-500">↗</span>
                </div>
                <div className="leading-none text-muted-foreground">
                    Menampilkan total disposisi berdasarkan sifat.
                </div>
            </CardFooter>
        </Card>
    )
}
