import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import useSWR from 'swr'
import { z } from 'zod'

import { createCategory, listCategories, updateCategory } from '@/api/categories'
import { getErrorMessage } from '@/api/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'
import type { Category } from '@/types'

const categorySchema = z.object({
  name: z.string().min(2, 'Enter a category name'),
  description: z.string().optional(),
})
type CategoryValues = z.infer<typeof categorySchema>

function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category | null
  onSaved: () => void
}) {
  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    values: category
      ? { name: category.name, description: category.description ?? '' }
      : { name: '', description: '' },
  })

  async function onSubmit(values: CategoryValues) {
    try {
      if (category) {
        await updateCategory(category.id, values)
        toast.success('Category updated.')
      } else {
        await createCategory(values)
        toast.success('Category added.')
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
          <DialogTitle>{category ? 'Edit category' : 'Add category'}</DialogTitle>
          <DialogDescription>Expense categories group your clinic's spending.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="medicalSupplies" className="rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                {form.formState.isSubmitting ? 'Saving...' : category ? 'Save changes' : 'Add category'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function AdminCategoriesPage() {
  const { data: categories, error, isLoading, mutate } = useSWR('admin-categories', listCategories)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(category: Category) {
    setEditing(category)
    setFormOpen(true)
  }

  async function toggleActive(category: Category) {
    try {
      await updateCategory(category.id, { isActive: !category.isActive })
      mutate()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Expense categories</h1>
          <p className="text-sm text-muted-foreground">Group expenses like supplies, utilities, and salaries.</p>
        </div>
        <Button onClick={openCreate} className="rounded-full shadow-md shadow-primary/30">
          <Plus className="h-4 w-4" /> Add category
        </Button>
      </div>

      {isLoading && <Loading label="Loading categories..." />}

      {error && <ErrorState message="Couldn't load categories." onRetry={() => mutate()} />}

      {!isLoading && !error && categories?.length === 0 && (
        <EmptyState
          title="No categories yet"
          description="Add a category before logging expenses."
          action={
            <Button onClick={openCreate} className="rounded-full">
              Add category
            </Button>
          }
        />
      )}

      {!isLoading && !error && categories && categories.length > 0 && (
        <div className="space-y-3">
          {categories.map((category) => (
            <Card key={category.id} className="rounded-2xl">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-medium">{category.name}</p>
                  {category.description && (
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Switch checked={category.isActive} onCheckedChange={() => toggleActive(category)} />
                    {category.isActive ? (
                      <Badge variant="secondary" className="rounded-full">
                        Active
                      </Badge>
                    ) : (
                      'Inactive'
                    )}
                  </label>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => openEdit(category)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editing}
        onSaved={() => mutate()}
      />
    </div>
  )
}
