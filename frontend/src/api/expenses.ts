import { apiClient } from '@/api/client'
import type { Expense } from '@/types'

export interface UpsertExpensePayload {
  categoryId: number
  amount: number
  description?: string
  expenseDate: string
}

export async function listExpenses() {
  const { data } = await apiClient.get<Expense[]>('/expenses')
  return data
}

export async function createExpense(payload: UpsertExpensePayload) {
  const { data } = await apiClient.post<Expense>('/expenses', payload)
  return data
}

export async function updateExpense(id: number, payload: Partial<UpsertExpensePayload>) {
  const { data } = await apiClient.patch<Expense>(`/expenses/${id}`, payload)
  return data
}

export async function deleteExpense(id: number) {
  await apiClient.delete(`/expenses/${id}`)
}
