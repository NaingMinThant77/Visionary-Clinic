import { apiClient } from '@/api/client'
import type { Category } from '@/types'

export interface UpsertCategoryPayload {
  name: string
  description?: string
}

export async function listCategories() {
  const { data } = await apiClient.get<Category[]>('/categories')
  return data
}

export async function createCategory(payload: UpsertCategoryPayload) {
  const { data } = await apiClient.post<Category>('/categories', payload)
  return data
}

export async function updateCategory(
  id: number,
  payload: Partial<UpsertCategoryPayload & { isActive: boolean }>
) {
  const { data } = await apiClient.patch<Category>(`/categories/${id}`, payload)
  return data
}
