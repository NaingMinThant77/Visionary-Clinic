import { apiClient } from '@/api/client'
import type { Provider } from '@/types'

export async function listProviders() {
  const { data } = await apiClient.get<Provider[]>('/providers')
  return data
}
