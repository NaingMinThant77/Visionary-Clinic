import { useState } from 'react'
import useSWR from 'swr'

import { getOpdReport } from '@/api/adminReports'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorState } from '@/components/ErrorState'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/Loading'
import { formatCurrency } from '@/lib/utils'

function firstOfMonthIso(): string {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString().slice(0, 10)
}

function todayIso(): string {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).toISOString().slice(0, 10)
}

export function AdminReportsPage() {
  const [from, setFrom] = useState(firstOfMonthIso())
  const [to, setTo] = useState(todayIso())

  const { data: report, error, isLoading, mutate } = useSWR(
    ['opd-report', from, to],
    () => getOpdReport(from, to)
  )

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Financial report</h1>
        <p className="text-sm text-muted-foreground">
          OPD revenue (patient payments + insurance claims) against expenses for a date range.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">From</label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">To</label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl" />
        </div>
      </div>

      {isLoading && <Loading label="Crunching numbers..." />}

      {error && <ErrorState message="Couldn't load the report." onRetry={() => mutate()} />}

      {!isLoading && !error && report && (
        <Card className="rounded-2xl">
          <CardContent className="space-y-3 p-6 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid by patients</span>
              <span>{formatCurrency(report.totalConsultationFees - report.totalInsuranceDiscount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Insurance claims</span>
              <span>{formatCurrency(report.totalInsuranceDiscount)}</span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="font-medium">Total OPD revenue</span>
              <span className="font-medium">{formatCurrency(report.totalOPDRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expenses</span>
              <span>- {formatCurrency(report.totalExpenses)}</span>
            </div>
            <div className="flex justify-between border-t pt-3 text-base font-semibold">
              <span>Net profit</span>
              <span className={report.netProfit >= 0 ? 'text-primary' : 'text-destructive'}>
                {formatCurrency(report.netProfit)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
