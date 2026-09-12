import { apiClient } from "@/api/client";
import type { Booking, Doctor, DoctorSchedule } from "@/types";

export interface UpsertSchedulePayload {
  dayOfWeek: DoctorSchedule["dayOfWeek"];
  startTime: string;
  endTime: string;
  maximumPatientSession: number;
  consultationFees: number;
}

export async function getMyDoctorProfile() {
  const { data } = await apiClient.get<Doctor>("/doctors/me");
  return data;
}

export async function getMySchedules() {
  const { data } = await apiClient.get<DoctorSchedule[]>(
    "/doctors/me/schedules",
  );
  console.log("data in my schedule", data);
  return data;
}

export async function createSchedule(payload: UpsertSchedulePayload) {
  const { data } = await apiClient.post<DoctorSchedule>(
    "/doctors/me/schedules",
    payload,
  );
  return data;
}

export async function updateSchedule(
  id: number,
  payload: Partial<UpsertSchedulePayload & { isActive: boolean }>,
) {
  const { data } = await apiClient.patch<DoctorSchedule>(
    `/doctors/me/schedules/${id}`,
    payload,
  );
  return data;
}

export async function deleteSchedule(id: number) {
  await apiClient.delete(`/doctors/me/schedules/${id}`);
}

export async function getAssignedBookings() {
  const { data } = await apiClient.get<Booking[]>("/bookings/assigned");
  return data;
}

export async function getAssignedBooking(id: number) {
  const { data } = await apiClient.get<Booking>(`/bookings/assigned/${id}`);
  return data;
}
