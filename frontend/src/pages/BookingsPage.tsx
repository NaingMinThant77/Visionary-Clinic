import { CalendarClock } from 'lucide-react'
import { Link } from 'react-router-dom'
import useSWR from 'swr'

import { getMyBookings } from '@/api/bookings'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { Loading } from '@/components/Loading'
import type { BookingStatus } from '@/types'
import { formatCurrency, formatFullDate } from '@/lib/utils'

const STATUS_VARIANT: Record<BookingStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'outline',
  CONFIRMED: 'default',
  CANCELLED: 'destructive',
  COMPLETED: 'secondary',
}

export function BookingsPage() {
  const { data: bookings, error, isLoading, mutate } = useSWR('bookings/me', getMyBookings)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My appointments</h1>
        <p className="text-sm text-muted-foreground">Track your upcoming visits and payments.</p>
      </div>

      {isLoading && <Loading label="Loading your appointments..." />}

      {error && <ErrorState message="Couldn't load your appointments." onRetry={() => mutate()} />}

      {!isLoading && !error && bookings?.length === 0 && (
        <EmptyState
          title="No appointments yet"
          description="Book your first appointment with a doctor."
          action={
            <Button asChild className="rounded-full">
              <Link to="/doctors">Find a doctor</Link>
            </Button>
          }
        />
      )}

      {!isLoading && !error && bookings && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Link key={booking.id} to={`/bookings/${booking.id}`}>
              <Card className="rounded-2xl transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CalendarClock className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{booking.doctor.user.fullName}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {booking.doctor.specialization} · {formatFullDate(booking.appointmentDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge variant={STATUS_VARIANT[booking.status]} className="rounded-full">
                      {booking.status}
                    </Badge>
                    {booking.leftAmount > 0 && booking.status !== 'CANCELLED' && (
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(booking.leftAmount)} due
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
