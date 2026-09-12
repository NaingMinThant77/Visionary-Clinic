import { apiClient } from '@/api/client'
import type { Consultation } from '@/types'

export interface UpsertConsultationPayload {
  consultationNotes?: string
  diagnosisDetails?: string
  prescription?: string
}

export async function upsertConsultation(bookingId: number, payload: UpsertConsultationPayload) {
  const { data } = await apiClient.put<Consultation>(`/bookings/${bookingId}/consultation`, payload)
  return data
}
