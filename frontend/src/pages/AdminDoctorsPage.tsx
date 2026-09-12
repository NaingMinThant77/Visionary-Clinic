import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarClock, Pencil, Plus, Stethoscope } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import useSWR from 'swr'
import { z } from 'zod'

import { createDoctor, updateDoctor } from '@/api/adminDoctors'
import { getErrorMessage, resolveAssetUrl } from '@/api/client'
import { searchDoctors } from '@/api/doctors'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { PasswordInput } from '@/components/PasswordInput'
import type { Doctor } from '@/types'

const createSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, "Enter the doctor's full name"),
  specialization: z.string().min(2, 'Enter a specialization'),
  medicalLicenseNumber: z.string().min(1, 'Enter a medical license number'),
  hospitalDepartment: z.string().optional(),
  image: z.string().optional(),
})
type CreateValues = z.infer<typeof createSchema>

const updateSchema = z.object({
  specialization: z.string().min(2, 'Enter a specialization'),
  medicalLicenseNumber: z.string().min(1, 'Enter a medical license number'),
  hospitalDepartment: z.string().optional(),
  image: z.string().optional(),
})
type UpdateValues = z.infer<typeof updateSchema>

function CreateDoctorDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      specialization: '',
      medicalLicenseNumber: '',
      hospitalDepartment: '',
      image: '',
    },
  })

  async function onSubmit(values: CreateValues) {
    try {
      await createDoctor({
        ...values,
        hospitalDepartment: values.hospitalDepartment || undefined,
        image: values.image || undefined,
      })
      toast.success('Doctor added.')
      form.reset()
      onOpenChange(false)
      onSaved()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Add doctor</DialogTitle>
          <DialogDescription>
            Creates a login for the doctor and their professional profile.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. Jane Doe" className="rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="doctor@example.com" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temporary password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="••••••••" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialization</FormLabel>
                    <FormControl>
                      <Input placeholder="Cardiology" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medicalLicenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical license number</FormLabel>
                    <FormControl>
                      <Input placeholder="MMC-10001" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="hospitalDepartment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Cardiology Department" className="rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." className="rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                className="rounded-full shadow-md shadow-primary/30"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Adding...' : 'Add doctor'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function EditDoctorDialog({
  doctor,
  onOpenChange,
  onSaved,
}: {
  doctor: Doctor | null
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const form = useForm<UpdateValues>({
    resolver: zodResolver(updateSchema),
    values: doctor
      ? {
          specialization: doctor.specialization,
          medicalLicenseNumber: doctor.medicalLicenseNumber,
          hospitalDepartment: doctor.hospitalDepartment ?? '',
          image: doctor.image ?? '',
        }
      : undefined,
  })

  async function onSubmit(values: UpdateValues) {
    if (!doctor) return
    try {
      await updateDoctor(doctor.id, {
        ...values,
        hospitalDepartment: values.hospitalDepartment || undefined,
        image: values.image || undefined,
      })
      toast.success('Doctor updated.')
      onOpenChange(false)
      onSaved()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <Dialog open={Boolean(doctor)} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Edit doctor profile</DialogTitle>
          <DialogDescription>{doctor?.user.fullName}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialization</FormLabel>
                  <FormControl>
                    <Input className="rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="medicalLicenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medical license number</FormLabel>
                  <FormControl>
                    <Input className="rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hospitalDepartment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department (optional)</FormLabel>
                  <FormControl>
                    <Input className="rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo URL (optional)</FormLabel>
                  <FormControl>
                    <Input className="rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                className="rounded-full shadow-md shadow-primary/30"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function AdminDoctorsPage() {
  const { data: doctors, error, isLoading, mutate } = useSWR('admin-doctors', () => searchDoctors())
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Doctor | null>(null)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Doctors</h1>
          <p className="text-sm text-muted-foreground">Configure doctor profiles for the clinic.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="rounded-full shadow-md shadow-primary/30">
          <Plus className="h-4 w-4" /> Add doctor
        </Button>
      </div>

      {isLoading && <Loading label="Loading doctors..." />}

      {error && <ErrorState message="Couldn't load doctors." onRetry={() => mutate()} />}

      {!isLoading && !error && doctors?.length === 0 && (
        <EmptyState
          title="No doctors yet"
          description="Add your first doctor to start accepting bookings."
          action={
            <Button onClick={() => setCreateOpen(true)} className="rounded-full">
              Add doctor
            </Button>
          }
        />
      )}

      {!isLoading && !error && doctors && doctors.length > 0 && (
        <div className="space-y-3">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="rounded-2xl">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarImage src={resolveAssetUrl(doctor.image)} alt={doctor.user.fullName} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      <Stethoscope className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{doctor.user.fullName}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="rounded-full">
                        {doctor.specialization}
                      </Badge>
                      <span className="truncate text-xs text-muted-foreground">
                        {doctor.medicalLicenseNumber}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="rounded-full" asChild>
                    <Link to={`/admin/doctors/${doctor.id}/schedule`}>
                      <CalendarClock className="h-4 w-4" /> Schedule
                    </Link>
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full" onClick={() => setEditing(doctor)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateDoctorDialog open={createOpen} onOpenChange={setCreateOpen} onSaved={() => mutate()} />
      <EditDoctorDialog
        doctor={editing}
        onOpenChange={(open) => !open && setEditing(null)}
        onSaved={() => mutate()}
      />
    </div>
  )
}
