import { apiClient } from '@/api/client'
import type { AttendanceStatus, Booking } from '@/types'

export async function getBookingsForDate(date: string) {
  const { data } = await apiClient.get<Booking[]>('/admin/bookings', { params: { date } })
  return data
}

export async function checkInBooking(bookingId: number) {
  const { data } = await apiClient.post(`/admin/bookings/${bookingId}/check-in`)
  return data
}

export async function updateAttendance(
  bookingId: number,
  status: Extract<AttendanceStatus, 'COMPLETED' | 'ABSENT'>
) {
  const { data } = await apiClient.patch(`/admin/bookings/${bookingId}/attendance`, { status })
  return data
}
