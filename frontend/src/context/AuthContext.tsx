import { createContext, useContext, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { login as loginRequest, register as registerRequest } from '@/api/auth'
import { useMe } from '@/hooks/useMe'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | undefined
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (fullName: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoading, mutate } = useMe()
  const [isBusy, setIsBusy] = useState(false)
  const navigate = useNavigate()

  async function login(email: string, password: string) {
    setIsBusy(true)
    try {
      const { accessToken, user } = await loginRequest({ email, password })
      localStorage.setItem('accessToken', accessToken)
      await mutate(user)
      navigate('/')
    } finally {
      setIsBusy(false)
    }
  }

  async function register(fullName: string, email: string, password: string) {
    setIsBusy(true)
    try {
      const { accessToken, user } = await registerRequest({ fullName, email, password })
      localStorage.setItem('accessToken', accessToken)
      await mutate(user)
      navigate('/')
    } finally {
      setIsBusy(false)
    }
  }

  function logout() {
    localStorage.removeItem('accessToken')
    mutate(undefined)
    navigate('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading: isLoading || isBusy,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
