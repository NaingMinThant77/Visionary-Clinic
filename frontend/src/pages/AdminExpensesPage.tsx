import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import useSWR from 'swr'
import { z } from 'zod'

import { getErrorMessage } from '@/api/client'
import { listCategories } from '@/api/categories'
import { createExpense, deleteExpense, listExpenses, updateExpense } from '@/api/expenses'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/Loading'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency, formatFullDate } from '@/lib/utils'
import type { Expense } from '@/types'

const expenseSchema = z.object({
  categoryId: z.string().min(1, 'Choose a category'),
  amount: z.number().positive('Enter an amount greater than zero'),
  description: z.string().optional(),
  expenseDate: z.string().min(1, 'Choose a date'),
})
type ExpenseValues = z.infer<typeof expenseSchema>

function ExpenseFormDialog({
  open,
  onOpenChange,
  expense,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: Expense | null
  onSaved: () => void
}) {
  const { data: categories } = useSWR('admin-categories', listCategories)

  const form = useForm<ExpenseValues>({
    resolver: zodResolver(expenseSchema),
    values: expense
      ? {
          categoryId: expense.categoryId.toString(),
          amount: expense.amount,
          description: expense.description ?? '',
          expenseDate: expense.expenseDate.slice(0, 10),
        }
      : {
          categoryId: '',
          amount: 0,
          description: '',
          expenseDate: new Date().toISOString().slice(0, 10),
        },
  })

  async function onSubmit(values: ExpenseValues) {
    const payload = { ...values, categoryId: Number(values.categoryId) }
    try {
      if (expense) {
        await updateExpense(expense.id, payload)
        toast.success('Expense updated.')
      } else {
        await createExpense(payload)
        toast.success('Expense logged.')
      }
      onOpenChange(false)
      onSaved()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>{expense ? 'Edit expense' : 'Log expense'}</DialogTitle>
          <DialogDescription>Track clinic spending by category.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (MMK)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        className="rounded-xl"
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expenseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Input className="rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                className="rounded-full shadow-md shadow-primary/30"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Saving...' : expense ? 'Save changes' : 'Log expense'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function AdminExpensesPage() {
  const { data: expenses, error, isLoading, mutate } = useSWR('admin-expenses', listExpenses)
  const { data: categories } = useSWR('admin-categories', listCategories)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filteredExpenses = expenses?.filter(
    (expense) => categoryFilter === 'all' || expense.categoryId.toString() === categoryFilter
  )

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(expense: Expense) {
    setEditing(expense)
    setFormOpen(true)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteExpense(deleteTarget.id)
      toast.success('Expense removed.')
      mutate()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Expenses</h1>
          <p className="text-sm text-muted-foreground">Log and track clinic spending.</p>
        </div>
        <Button onClick={openCreate} className="rounded-full shadow-md shadow-primary/30">
          <Plus className="h-4 w-4" /> Log expense
        </Button>
      </div>

      {expenses && expenses.length > 0 && (
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-fit min-w-[10rem] rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {isLoading && <Loading label="Loading expenses..." />}

      {error && <ErrorState message="Couldn't load expenses." onRetry={() => mutate()} />}

      {!isLoading && !error && expenses?.length === 0 && (
        <EmptyState
          title="No expenses yet"
          description="Log your first expense to start tracking spending."
          action={
            <Button onClick={openCreate} className="rounded-full">
              Log expense
            </Button>
          }
        />
      )}

      {!isLoading && !error && expenses && expenses.length > 0 && filteredExpenses?.length === 0 && (
        <EmptyState title="No expenses in this category" description="Try a different category." />
      )}

      {!isLoading && !error && filteredExpenses && filteredExpenses.length > 0 && (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => (
            <Card key={expense.id} className="rounded-2xl">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-medium">{formatCurrency(expense.amount)}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-full">
                      {expense.category.name}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatFullDate(expense.expenseDate)}
                    </span>
                  </div>
                  {expense.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{expense.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => openEdit(expense)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteTarget(expense)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ExpenseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        expense={editing}
        onSaved={() => mutate()}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this expense?"
        description="This can't be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}
