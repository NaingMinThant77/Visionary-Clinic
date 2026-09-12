import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { Loading } from '@/components/Loading'
import { useAuth } from '@/context/AuthContext'

export function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
