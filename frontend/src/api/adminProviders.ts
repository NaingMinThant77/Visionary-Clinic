import { apiClient } from '@/api/client'
import type { AgreementType, Provider } from '@/types'

export interface UpsertProviderPayload {
  name: string
  coveragePercentage: number
  agreementType: AgreementType
  rule?: string
}

export async function listAllProviders() {
  const { data } = await apiClient.get<Provider[]>('/providers/admin')
  return data
}

export async function createProvider(payload: UpsertProviderPayload) {
  const { data } = await apiClient.post<Provider>('/providers', payload)
  return data
}

export async function updateProvider(
  id: number,
  payload: Partial<UpsertProviderPayload & { isActive: boolean }>
) {
  const { data } = await apiClient.patch<Provider>(`/providers/${id}`, payload)
  return data
}
