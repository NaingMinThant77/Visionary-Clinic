import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import type { DayOfWeek } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('en-US')} MMK`
}

const DAY_INDEX: Record<DayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
}

// Backend parses "YYYY-MM-DD" as UTC midnight and derives the day of week
// from it, so upcoming dates are generated in UTC to stay in sync.
export function getUpcomingDates(dayOfWeek: DayOfWeek, count = 4): string[] {
  const targetIndex = DAY_INDEX[dayOfWeek]
  const now = new Date()
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  const offsetToNext = (targetIndex - today.getUTCDay() + 7) % 7

  const dates: string[] = []
  for (let i = 0; i < count; i++) {
    const date = new Date(today.getTime() + (offsetToNext + i * 7) * 86_400_000)
    dates.push(date.toISOString().slice(0, 10))
  }
  return dates
}

// Formats a "YYYY-MM-DD" date string. Uses noon UTC so the local-timezone
// conversion never shifts the displayed calendar day.
export function formatDateLabel(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

// Same idea as formatDateLabel, but for a full ISO datetime string and
// including the year.
export function formatFullDate(isoDateTime: string): string {
  const isoDate = isoDateTime.slice(0, 10)
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
