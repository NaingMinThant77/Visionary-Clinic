import { useState } from 'react'
import { CalendarCheck, CircleSlash, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import useSWR from 'swr'

import { checkInBooking, getBookingsForDate, updateAttendance } from '@/api/adminAttendance'
import { getErrorMessage } from '@/api/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/Loading'
import { BOOKING_STATUS_VARIANT, formatCurrency } from '@/lib/utils'
import type { AttendanceStatus } from '@/types'

const ATTENDANCE_VARIANT: Record<AttendanceStatus, 'default' | 'secondary' | 'destructive'> = {
  CHECKED_IN: 'default',
  COMPLETED: 'secondary',
  ABSENT: 'destructive',
}

const ATTENDANCE_LABEL: Record<AttendanceStatus, string> = {
  CHECKED_IN: 'Checked in',
  COMPLETED: 'Completed',
  ABSENT: 'Absent',
}

function todayIso(): string {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).toISOString().slice(0, 10)
}

export function AdminBookingsPage() {
  const [date, setDate] = useState(todayIso())
  const { data: bookings, error, isLoading, mutate } = useSWR(
    ['admin-bookings', date],
    () => getBookingsForDate(date)
  )

  async function handleCheckIn(bookingId: number) {
    try {
      await checkInBooking(bookingId)
      toast.success('Patient checked in.')
      mutate()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  async function handleAttendance(bookingId: number, status: 'COMPLETED' | 'ABSENT') {
    try {
      await updateAttendance(bookingId, status)
      toast.success(status === 'COMPLETED' ? 'Marked completed.' : 'Marked absent.')
      mutate()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Daily bookings</h1>
        <p className="text-sm text-muted-foreground">
          Oversee appointments and patient check-ins for a given day.
        </p>
      </div>

      <Input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-fit rounded-xl"
      />

      {isLoading && <Loading label="Loading bookings..." />}

      {error && <ErrorState message="Couldn't load bookings for this date." onRetry={() => mutate()} />}

      {!isLoading && !error && bookings?.length === 0 && (
        <EmptyState title="No bookings on this date" description="Try a different date." />
      )}

      {!isLoading && !error && bookings && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card key={booking.id} className="rounded-2xl">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <p className="font-medium">{booking.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.doctor.user.fullName} · {booking.doctor.specialization}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(booking.leftAmount)} due
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={BOOKING_STATUS_VARIANT[booking.status]} className="rounded-full">
                    {booking.status}
                  </Badge>
                  {booking.dailySchedule && (
                    <Badge variant={ATTENDANCE_VARIANT[booking.dailySchedule.status]} className="rounded-full">
                      {ATTENDANCE_LABEL[booking.dailySchedule.status]}
                    </Badge>
                  )}

                  {(!booking.dailySchedule || booking.dailySchedule.status === 'ABSENT') && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => handleCheckIn(booking.id)}
                    >
                      <LogIn className="h-4 w-4" /> Check in
                    </Button>
                  )}
                  {booking.dailySchedule?.status === 'CHECKED_IN' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => handleAttendance(booking.id, 'COMPLETED')}
                    >
                      <CalendarCheck className="h-4 w-4" /> Complete
                    </Button>
                  )}
                  {booking.dailySchedule?.status !== 'ABSENT' && booking.dailySchedule?.status !== 'COMPLETED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleAttendance(booking.id, 'ABSENT')}
                    >
                      <CircleSlash className="h-4 w-4" /> Absent
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
