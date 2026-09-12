import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import useSWR from 'swr'
import { z } from 'zod'

import { getErrorMessage } from '@/api/client'
import { getAssignedBooking } from '@/api/doctorPortal'
import { upsertConsultation } from '@/api/consultations'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ErrorState } from '@/components/ErrorState'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Loading } from '@/components/Loading'
import { Textarea } from '@/components/ui/textarea'
import { BOOKING_STATUS_VARIANT, formatCurrency, formatFullDate } from '@/lib/utils'

const consultationSchema = z.object({
  consultationNotes: z.string().optional(),
  diagnosisDetails: z.string().optional(),
  prescription: z.string().optional(),
})
type ConsultationValues = z.infer<typeof consultationSchema>

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

  const form = useForm<ConsultationValues>({
    resolver: zodResolver(consultationSchema),
    values: {
      consultationNotes: booking?.consultation?.consultationNotes ?? '',
      diagnosisDetails: booking?.consultation?.diagnosisDetails ?? '',
      prescription: booking?.consultation?.prescription ?? '',
    },
  })

  async function onSubmit(values: ConsultationValues) {
    try {
      await upsertConsultation(bookingId, values)
      toast.success('Consultation notes saved.')
      mutate()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

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
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={BOOKING_STATUS_VARIANT[booking.status]} className="rounded-full">
              {booking.status}
            </Badge>
            {booking.dailySchedule && (
              <Badge variant="secondary" className="rounded-full">
                {booking.dailySchedule.status === 'CHECKED_IN'
                  ? 'Checked in'
                  : booking.dailySchedule.status === 'COMPLETED'
                    ? 'Completed'
                    : 'Absent'}
              </Badge>
            )}
          </div>
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
              <p className="text-muted-foreground">Patient notes</p>
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

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Consultation notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="consultationNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea rows={3} className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="diagnosisDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnosis</FormLabel>
                    <FormControl>
                      <Textarea rows={2} className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prescription</FormLabel>
                    <FormControl>
                      <Textarea rows={2} className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="rounded-full shadow-md shadow-primary/30"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Saving...' : 'Save notes'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
