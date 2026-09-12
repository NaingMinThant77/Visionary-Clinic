import { UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import useSWR from 'swr'

import { getAssignedBookings } from '@/api/doctorPortal'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { Loading } from '@/components/Loading'
import { BOOKING_STATUS_VARIANT, formatFullDate } from '@/lib/utils'

export function DoctorConsultationsPage() {
  const { data: bookings, error, isLoading, mutate } = useSWR('assigned-bookings', getAssignedBookings)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Consultations</h1>
        <p className="text-sm text-muted-foreground">Patients booked into your schedule.</p>
      </div>

      {isLoading && <Loading label="Loading consultations..." />}

      {error && <ErrorState message="Couldn't load consultations." onRetry={() => mutate()} />}

      {!isLoading && !error && bookings?.length === 0 && (
        <EmptyState
          title="No consultations yet"
          description="Bookings from patients will show up here."
        />
      )}

      {!isLoading && !error && bookings && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Link key={booking.id} to={`/doctor/consultations/${booking.id}`}>
              <Card className="rounded-2xl transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UserRound className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{booking.fullName}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {formatFullDate(booking.appointmentDate)} · {booking.contactNumber}
                      </p>
                    </div>
                  </div>
                  <Badge variant={BOOKING_STATUS_VARIANT[booking.status]} className="rounded-full">
                    {booking.status}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
