import { useParams } from 'react-router-dom'
import useSWR from 'swr'

import { getAssignedBooking } from '@/api/doctorPortal'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ErrorState } from '@/components/ErrorState'
import { Loading } from '@/components/Loading'
import { BOOKING_STATUS_VARIANT, formatCurrency, formatFullDate } from '@/lib/utils'

export function DoctorConsultationDetailPage() {
  const { id } = useParams()
  const bookingId = Number(id)

  const {
    data: booking,
    error,
    isLoading,
    mutate,
  } = useSWR(
    Number.isFinite(bookingId) ? ['assigned-booking', bookingId] : null,
    () => getAssignedBooking(bookingId)
  )

  if (isLoading) {
    return <Loading label="Loading consultation..." />
  }

  if (error || !booking) {
    return <ErrorState message="Couldn't load this consultation." onRetry={() => mutate()} />
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="rounded-2xl">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="font-semibold">{booking.fullName}</p>
            <p className="text-sm text-muted-foreground">{formatFullDate(booking.appointmentDate)}</p>
          </div>
          <Badge variant={BOOKING_STATUS_VARIANT[booking.status]} className="rounded-full">
            {booking.status}
          </Badge>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Patient details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gender</span>
            <span>{booking.gender === 'MALE' ? 'Male' : 'Female'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date of birth</span>
            <span>{formatFullDate(booking.dob)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Contact number</span>
            <span>{booking.contactNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">NRC</span>
            <span>{booking.nrc}</span>
          </div>
          {booking.medicalNotes && (
            <div className="pt-2">
              <p className="text-muted-foreground">Notes</p>
              <p className="mt-1">{booking.medicalNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Billing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Consultation fee</span>
            <span>{formatCurrency(booking.consultationFee)}</span>
          </div>
          {booking.insuranceDiscount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Insurance discount {booking.provider ? `(${booking.provider.name})` : ''}
              </span>
              <span>- {formatCurrency(booking.insuranceDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paid so far</span>
            <span>{formatCurrency(booking.depositAmount)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-medium">
            <span>Balance due</span>
            <span>{formatCurrency(booking.leftAmount)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
