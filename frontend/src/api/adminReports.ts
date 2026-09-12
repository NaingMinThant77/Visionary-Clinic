import { apiClient } from '@/api/client'
import type { OpdReport } from '@/types'

export async function getOpdReport(from: string, to: string) {
  const { data } = await apiClient.get<OpdReport>('/admin/reports/opd', { params: { from, to } })
  return data
}
