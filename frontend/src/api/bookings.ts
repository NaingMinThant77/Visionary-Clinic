import { apiClient } from '@/api/client'
import type { Booking, Gender, PaymentType } from '@/types'

export interface CreateBookingPayload {
  doctorId: number
  scheduleId: number
  appointmentDate: string
  fullName: string
  dob: string
  gender: Gender
  contactNumber: string
  nrc: string
  medicalNotes?: string
  paymentType: PaymentType
  providerId?: number
}

export async function createBooking(payload: CreateBookingPayload) {
  const { data } = await apiClient.post<Booking>('/bookings', payload)
  return data
}

export async function getMyBookings() {
  const { data } = await apiClient.get<Booking[]>('/bookings/me')
  return data
}

export async function getBooking(id: number) {
  const { data } = await apiClient.get<Booking>(`/bookings/${id}`)
  return data
}

export async function cancelBooking(id: number) {
  const { data } = await apiClient.patch<Booking>(`/bookings/${id}/cancel`)
  return data
}
