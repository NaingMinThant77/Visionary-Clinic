import { apiClient } from '@/api/client'
import type { User } from '@/types'

export interface UpdateProfilePayload {
  fullName?: string
  bio?: string
  phone?: string
  address?: string
  avatarUrl?: string
}

export async function getCurrentUser() {
  const { data } = await apiClient.get<User>('/users/me')
  return data
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const { data } = await apiClient.patch<User>('/users/me', payload)
  return data
}

export async function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await apiClient.post<{ avatarUrl: string }>('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export interface UpdateEmailPayload {
  email: string
  currentPassword: string
}

export async function updateEmail(payload: UpdateEmailPayload) {
  const { data } = await apiClient.patch<User>('/users/me/email', payload)
  return data
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export async function changePassword(payload: ChangePasswordPayload) {
  await apiClient.patch('/users/me/password', payload)
}
