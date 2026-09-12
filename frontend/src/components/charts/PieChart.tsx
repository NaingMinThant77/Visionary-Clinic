import { Cell, Pie, PieChart as RechartsPieChart } from 'recharts'

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

export interface PieChartDatum {
  label: string
  value: number
  color: string
}

interface PieChartProps {
  data: PieChartDatum[]
}

export function PieChart({ data }: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No data yet.</p>
  }

  const config = data.reduce<ChartConfig>((acc, d) => {
    acc[d.label] = { label: d.label, color: d.color }
    return acc
  }, {})

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center">
      <ChartContainer config={config} className="mx-auto aspect-square max-h-[220px] w-full max-w-[220px]">
        <RechartsPieChart>
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value, name) => {
                  const pct = total > 0 ? (((value as number) / total) * 100).toFixed(0) : '0'
                  return (
                    <div className="flex flex-1 items-center justify-between gap-4 leading-none">
                      <span className="capitalize text-muted-foreground">{name}</span>
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {value} · {pct}%
                      </span>
                    </div>
                  )
                }}
              />
            }
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius="60%"
            outerRadius="100%"
            paddingAngle={2}
            strokeWidth={2}
            stroke="var(--chart-surface)"
          >
            {data.map((d) => (
              <Cell key={d.label} fill={d.color} />
            ))}
          </Pie>
        </RechartsPieChart>
      </ChartContainer>

      <ul className="grid w-full grid-cols-1 gap-x-4 gap-y-1.5 sm:w-auto">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2 rounded-md px-1.5 py-0.5 text-sm">
            <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="capitalize text-foreground">{d.label}</span>
            <span className="ml-auto pl-3 tabular-nums text-muted-foreground">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
