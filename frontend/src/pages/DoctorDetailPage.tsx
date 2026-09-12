import { zodResolver } from '@hookform/resolvers/zod'
import { Stethoscope } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import useSWR from 'swr'
import { z } from 'zod'

import { resolveAssetUrl, getErrorMessage } from '@/api/client'
import { getDoctor } from '@/api/doctors'
import { createBooking } from '@/api/bookings'
import { listProviders } from '@/api/providers'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/Loading'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/context/AuthContext'
import { cn, formatCurrency, formatDateLabel, getUpcomingDates } from '@/lib/utils'
import { useState } from 'react'
import type { DayOfWeek } from '@/types'

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
}

const PAYMENT_TYPE_OPTIONS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'KBZ_PAY', label: 'KBZ Pay' },
  { value: 'WAVE_MONEY', label: 'Wave Money' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'INSURANCE', label: 'Insurance' },
] as const

const bookingSchema = z.object({
  fullName: z.string().min(2, "Enter the patient's full name"),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE']),
  contactNumber: z.string().min(5, 'Enter a valid contact number'),
  nrc: z.string().min(1, 'NRC is required'),
  medicalNotes: z.string().optional(),
  paymentType: z.enum(['CASH', 'CARD', 'KBZ_PAY', 'WAVE_MONEY', 'BANK_TRANSFER', 'INSURANCE']),
  providerId: z.string(),
})
type BookingValues = z.infer<typeof bookingSchema>

export function DoctorDetailPage() {
  const { id } = useParams()
  const doctorId = Number(id)
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const {
    data: doctor,
    error,
    isLoading,
    mutate,
  } = useSWR(Number.isFinite(doctorId) ? ['doctor', doctorId] : null, () => getDoctor(doctorId))
  const { data: providers } = useSWR('providers', listProviders)

  const [scheduleId, setScheduleId] = useState<number | null>(null)
  const [date, setDate] = useState<string | null>(null)

  const selectedSchedule = doctor?.schedules.find((s) => s.id === scheduleId) ?? null
  const upcomingDates = selectedSchedule ? getUpcomingDates(selectedSchedule.dayOfWeek) : []

  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fullName: user?.fullName ?? '',
      dob: '',
      gender: 'MALE',
      contactNumber: user?.phone ?? '',
      nrc: '',
      medicalNotes: '',
      paymentType: 'CASH',
      providerId: 'none',
    },
  })

  async function onSubmit(values: BookingValues) {
    if (!selectedSchedule || !date) return

    try {
      const booking = await createBooking({
        doctorId,
        scheduleId: selectedSchedule.id,
        appointmentDate: date,
        fullName: values.fullName,
        dob: values.dob,
        gender: values.gender,
        contactNumber: values.contactNumber,
        nrc: values.nrc,
        medicalNotes: values.medicalNotes || undefined,
        paymentType: values.paymentType,
        providerId: values.providerId !== 'none' ? Number(values.providerId) : undefined,
      })
      toast.success('Appointment booked!')
      navigate(`/bookings/${booking.id}`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (isLoading) {
    return <Loading label="Loading doctor..." />
  }

  if (error || !doctor) {
    return <ErrorState message="Couldn't load this doctor." onRetry={() => mutate()} />
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="rounded-2xl">
        <CardContent className="flex gap-4 p-6">
          <Avatar className="h-20 w-20 shrink-0 ring-2 ring-primary/10">
            <AvatarImage src={resolveAssetUrl(doctor.user.avatarUrl)} alt={doctor.user.fullName} />
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              <Stethoscope className="h-7 w-7" />
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold">{doctor.user.fullName}</h1>
            <Badge variant="secondary" className="rounded-full">
              {doctor.specialization}
            </Badge>
            {doctor.hospitalDepartment && (
              <p className="text-sm text-muted-foreground">{doctor.hospitalDepartment}</p>
            )}
            {doctor.user.bio && <p className="text-sm text-muted-foreground">{doctor.user.bio}</p>}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Choose a schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {doctor.schedules.length === 0 ? (
            <EmptyState title="No schedules available" description="Check back later." />
          ) : (
            <RadioGroup
              value={scheduleId?.toString() ?? ''}
              onValueChange={(value) => {
                setScheduleId(Number(value))
                setDate(null)
              }}
              className="gap-3"
            >
              {doctor.schedules.map((schedule) => (
                <label
                  key={schedule.id}
                  htmlFor={`schedule-${schedule.id}`}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors',
                    scheduleId === schedule.id ? 'border-primary bg-primary/5' : 'hover:bg-accent'
                  )}
                >
                  <RadioGroupItem value={schedule.id.toString()} id={`schedule-${schedule.id}`} />
                  <div className="flex-1">
                    <p className="font-medium">
                      {DAY_LABELS[schedule.dayOfWeek]} · {schedule.startTime} – {schedule.endTime}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(schedule.consultationFees)} · up to{' '}
                      {schedule.maximumPatientSession} patients/day
                    </p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          )}

          {selectedSchedule && (
            <div>
              <p className="mb-2 text-sm font-medium">Pick a date</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {upcomingDates.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDate(d)}
                    className={cn(
                      'rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
                      date === d ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent'
                    )}
                  >
                    {formatDateLabel(d)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSchedule && date && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Patient details</CardTitle>
          </CardHeader>
          <CardContent>
            {!isAuthenticated ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <p className="text-sm text-muted-foreground">Log in to book this appointment.</p>
                <Button asChild className="rounded-full">
                  <Link to="/login">Log in</Link>
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient full name</FormLabel>
                        <FormControl>
                          <Input className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="dob"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of birth</FormLabel>
                          <FormControl>
                            <Input type="date" className="rounded-xl" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <FormControl>
                            <RadioGroup
                              value={field.value}
                              onValueChange={field.onChange}
                              className="flex gap-4 pt-1"
                            >
                              <label className="flex items-center gap-2 text-sm">
                                <RadioGroupItem value="MALE" /> Male
                              </label>
                              <label className="flex items-center gap-2 text-sm">
                                <RadioGroupItem value="FEMALE" /> Female
                              </label>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="contactNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact number</FormLabel>
                          <FormControl>
                            <Input placeholder="09xxxxxxxxx" className="rounded-xl" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nrc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NRC number</FormLabel>
                          <FormControl>
                            <Input placeholder="12/AAA(N)123456" className="rounded-xl" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="medicalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes for the doctor (optional)</FormLabel>
                        <FormControl>
                          <Textarea rows={3} className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="paymentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment method</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PAYMENT_TYPE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="providerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Insurance provider (optional)</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">No insurance</SelectItem>
                              {providers?.map((provider) => (
                                <SelectItem key={provider.id} value={provider.id.toString()}>
                                  {provider.name} (
                                  {provider.agreementType === 'PERCENTAGE'
                                    ? `${provider.coveragePercentage}% off`
                                    : `${formatCurrency(provider.coveragePercentage)} off`}
                                  )
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="rounded-xl bg-muted p-4 text-sm">
                    <p className="flex justify-between">
                      <span>Consultation fee</span>
                      <span className="font-medium">{formatCurrency(selectedSchedule.consultationFees)}</span>
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-full shadow-md shadow-primary/30"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? 'Booking...' : 'Book appointment'}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
