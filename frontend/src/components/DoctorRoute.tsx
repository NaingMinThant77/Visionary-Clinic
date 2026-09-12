import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import useSWR from 'swr'
import axios from 'axios'

import { getMyDoctorProfile } from '@/api/doctorPortal'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { Loading } from '@/components/Loading'
import { useAuth } from '@/context/AuthContext'

export function DoctorRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const isDoctorRole = user?.role === 'DOCTOR'

  const {
    data: profile,
    error,
    isLoading: profileLoading,
    mutate,
  } = useSWR(isDoctorRole ? 'my-doctor-profile' : null, getMyDoctorProfile, {
    shouldRetryOnError: false,
  })

  if (isLoading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isDoctorRole) {
    return <Navigate to="/" replace />
  }

  if (profileLoading) {
    return <Loading label="Loading your doctor profile..." />
  }

  if (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined
    if (status === 404) {
      return (
        <EmptyState
          title="Your doctor profile isn't set up yet"
          description="An administrator needs to configure your specialization and license details before you can manage your schedule or view consultations."
        />
      )
    }
    return <ErrorState message="Couldn't load your doctor profile." onRetry={() => mutate()} />
  }

  if (!profile) {
    return <Loading label="Loading your doctor profile..." />
  }

  return <>{children}</>
}
