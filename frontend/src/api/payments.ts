import { apiClient } from '@/api/client'
import type { Booking, Payment, PaymentType } from '@/types'

export interface ProcessPaymentPayload {
  amount: number
  paymentType: PaymentType
  transactionReference?: string
}

export async function processPayment(bookingId: number, payload: ProcessPaymentPayload) {
  const { data } = await apiClient.post<Booking>(`/bookings/${bookingId}/payments`, payload)
  return data
}

export async function getPayments(bookingId: number) {
  const { data } = await apiClient.get<Payment[]>(`/bookings/${bookingId}/payments`)
  return data
}
