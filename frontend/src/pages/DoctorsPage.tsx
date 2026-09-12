import { useState } from 'react'
import { Search, Stethoscope } from 'lucide-react'
import { Link } from 'react-router-dom'
import useSWR from 'swr'

import { searchDoctors } from '@/api/doctors'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/Loading'
import { resolveAssetUrl } from '@/api/client'
import { useDebounce } from '@/hooks/useDebounce'
import { formatCurrency } from '@/lib/utils'

export function DoctorsPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)

  const { data: doctors, error, isLoading, mutate } = useSWR(
    ['doctors', debouncedSearch],
    () => searchDoctors({ search: debouncedSearch || undefined })
  )

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Find a doctor</h1>
        <p className="text-sm text-muted-foreground">
          Search by name, specialization, or department to book an appointment.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search doctors, specializations, departments..."
          className="rounded-full pl-9"
        />
      </div>

      {isLoading && <Loading label="Searching doctors..." />}

      {error && <ErrorState message="Couldn't load doctors." onRetry={() => mutate()} />}

      {!isLoading && !error && doctors?.length === 0 && (
        <EmptyState title="No doctors found" description="Try a different search term." />
      )}

      {!isLoading && !error && doctors && doctors.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {doctors.map((doctor) => {
            const fees = doctor.schedules.map((s) => s.consultationFees)
            const minFee = fees.length ? Math.min(...fees) : null

            return (
              <Link key={doctor.id} to={`/doctors/${doctor.id}`}>
                <Card className="h-full rounded-2xl transition-shadow hover:shadow-md">
                  <CardContent className="flex gap-4 p-5">
                    <Avatar className="h-14 w-14 shrink-0 ring-2 ring-primary/10">
                      <AvatarImage
                        src={resolveAssetUrl(doctor.user.avatarUrl)}
                        alt={doctor.user.fullName}
                      />
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        <Stethoscope className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p className="truncate font-semibold">{doctor.user.fullName}</p>
                      <Badge variant="secondary" className="rounded-full">
                        {doctor.specialization}
                      </Badge>
                      {doctor.hospitalDepartment && (
                        <p className="truncate text-xs text-muted-foreground">
                          {doctor.hospitalDepartment}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {doctor.schedules.length > 0 ? (
                          <>
                            {doctor.schedules.length} slot{doctor.schedules.length > 1 ? 's' : ''}/week
                            {minFee !== null && <> · from {formatCurrency(minFee)}</>}
                          </>
                        ) : (
                          'No schedules yet'
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
