import { apiClient } from '@/api/client'
import type { AuthResponse, User } from '@/types'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  fullName: string
  email: string
  password: string
}

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload)
  return data
}

export async function register(payload: RegisterPayload) {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', payload)
  return data
}

export async function getMe() {
  const { data } = await apiClient.get<User>('/auth/me')
  return data
}
