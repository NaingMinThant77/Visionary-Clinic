import { CartesianGrid, Line, LineChart as RechartsLineChart, XAxis, YAxis } from 'recharts'

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

export interface LineChartDatum {
  label: string
  value: number
}

interface LineChartProps {
  data: LineChartDatum[]
  color?: string
}

const config = {
  value: { label: 'Cards', color: 'var(--chart-1)' },
} satisfies ChartConfig

export function LineChart({ data, color = 'var(--chart-1)' }: LineChartProps) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No data yet.</p>
  }

  return (
    <ChartContainer config={config} className="max-h-[220px] w-full">
      <RechartsLineChart data={data} margin={{ left: -16, right: 16, top: 16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          stroke="var(--chart-muted)"
          fontSize={11}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} stroke="var(--chart-muted)" fontSize={11} allowDecimals={false} />
        <ChartTooltip
          cursor={{ stroke: 'var(--chart-axis)', strokeWidth: 1 }}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Line
          dataKey="value"
          type="monotone"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: color, stroke: 'var(--chart-surface)', strokeWidth: 2 }}
        />
      </RechartsLineChart>
    </ChartContainer>
  )
}
