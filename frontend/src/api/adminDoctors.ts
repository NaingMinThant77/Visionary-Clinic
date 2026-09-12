import { apiClient } from '@/api/client'
import type { Doctor, DoctorSchedule } from '@/types'

export interface CreateDoctorPayload {
  email: string
  password: string
  fullName: string
  specialization: string
  medicalLicenseNumber: string
  hospitalDepartment?: string
  image?: string
}

export interface UpdateDoctorPayload {
  specialization?: string
  medicalLicenseNumber?: string
  hospitalDepartment?: string
  image?: string
}

export async function createDoctor(payload: CreateDoctorPayload) {
  const { data } = await apiClient.post<Doctor>('/doctors', payload)
  return data
}

export async function updateDoctor(id: number, payload: UpdateDoctorPayload) {
  const { data } = await apiClient.patch<Doctor>(`/doctors/${id}`, payload)
  return data
}

export interface UpsertSchedulePayload {
  dayOfWeek: DoctorSchedule['dayOfWeek']
  startTime: string
  endTime: string
  maximumPatientSession: number
  consultationFees: number
}

export async function getDoctorSchedules(doctorId: number) {
  const { data } = await apiClient.get<DoctorSchedule[]>(`/doctors/${doctorId}/schedules`)
  return data
}

export async function createDoctorSchedule(doctorId: number, payload: UpsertSchedulePayload) {
  const { data } = await apiClient.post<DoctorSchedule>(`/doctors/${doctorId}/schedules`, payload)
  return data
}

export async function updateDoctorSchedule(
  doctorId: number,
  scheduleId: number,
  payload: Partial<UpsertSchedulePayload & { isActive: boolean }>
) {
  const { data } = await apiClient.patch<DoctorSchedule>(
    `/doctors/${doctorId}/schedules/${scheduleId}`,
    payload
  )
  return data
}

export async function deleteDoctorSchedule(doctorId: number, scheduleId: number) {
  await apiClient.delete(`/doctors/${doctorId}/schedules/${scheduleId}`)
}
