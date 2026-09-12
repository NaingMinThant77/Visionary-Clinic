import { apiClient } from '@/api/client'
import type { Doctor } from '@/types'

export interface SearchDoctorsParams {
  search?: string
  specialization?: string
}

export async function searchDoctors(params: SearchDoctorsParams = {}) {
  const { data } = await apiClient.get<Doctor[]>('/doctors', { params })
  return data
}

export async function getDoctor(id: number) {
  const { data } = await apiClient.get<Doctor>(`/doctors/${id}`)
  return data
}
