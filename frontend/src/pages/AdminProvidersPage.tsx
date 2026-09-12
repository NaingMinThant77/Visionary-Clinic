import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import useSWR from 'swr'
import { z } from 'zod'

import { createProvider, listAllProviders, updateProvider } from '@/api/adminProviders'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { formatCurrency } from '@/lib/utils'
import type { Provider } from '@/types'

const providerSchema = z.object({
  name: z.string().min(2, 'Enter a provider name'),
  coveragePercentage: z.number().positive('Enter a coverage value greater than zero'),
  agreementType: z.enum(['PERCENTAGE', 'FIXED', 'CUSTOM']),
  rule: z.string().optional(),
})
type ProviderValues = z.infer<typeof providerSchema>

function ProviderFormDialog({
  open,
  onOpenChange,
  provider,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider: Provider | null
  onSaved: () => void
}) {
  const form = useForm<ProviderValues>({
    resolver: zodResolver(providerSchema),
    values: provider
      ? {
          name: provider.name,
          coveragePercentage: provider.coveragePercentage,
          agreementType: provider.agreementType,
          rule: provider.rule ?? '',
        }
      : { name: '', coveragePercentage: 0, agreementType: 'PERCENTAGE', rule: '' },
  })

  async function onSubmit(values: ProviderValues) {
    try {
      if (provider) {
        await updateProvider(provider.id, values)
        toast.success('Provider updated.')
      } else {
        await createProvider(values)
        toast.success('Provider added.')
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
          <DialogTitle>{provider ? 'Edit provider' : 'Add provider'}</DialogTitle>
          <DialogDescription>Insurance providers apply a discount at booking time.</DialogDescription>
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
                    <Input placeholder="AYA Sompo Insurance" className="rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="agreementType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agreement type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                        <SelectItem value="FIXED">Fixed amount</SelectItem>
                        <SelectItem value="CUSTOM">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="coveragePercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coverage (% or MMK)</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="rule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule notes (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Applies to outpatient visits only" className="rounded-xl" {...field} />
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
                {form.formState.isSubmitting ? 'Saving...' : provider ? 'Save changes' : 'Add provider'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function AdminProvidersPage() {
  const { data: providers, error, isLoading, mutate } = useSWR('admin-providers', listAllProviders)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Provider | null>(null)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(provider: Provider) {
    setEditing(provider)
    setFormOpen(true)
  }

  async function toggleActive(provider: Provider) {
    try {
      await updateProvider(provider.id, { isActive: !provider.isActive })
      mutate()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Insurance providers</h1>
          <p className="text-sm text-muted-foreground">Manage the providers patients can select at booking.</p>
        </div>
        <Button onClick={openCreate} className="rounded-full shadow-md shadow-primary/30">
          <Plus className="h-4 w-4" /> Add provider
        </Button>
      </div>

      {isLoading && <Loading label="Loading providers..." />}

      {error && <ErrorState message="Couldn't load providers." onRetry={() => mutate()} />}

      {!isLoading && !error && providers?.length === 0 && (
        <EmptyState
          title="No providers yet"
          description="Add an insurance provider to offer discounts at booking."
          action={
            <Button onClick={openCreate} className="rounded-full">
              Add provider
            </Button>
          }
        />
      )}

      {!isLoading && !error && providers && providers.length > 0 && (
        <div className="space-y-3">
          {providers.map((provider) => (
            <Card key={provider.id} className="rounded-2xl">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-medium">{provider.name}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-full">
                      {provider.agreementType}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {provider.agreementType === 'PERCENTAGE'
                        ? `${provider.coveragePercentage}% off`
                        : `${formatCurrency(provider.coveragePercentage)} off`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Switch checked={provider.isActive} onCheckedChange={() => toggleActive(provider)} />
                    {provider.isActive ? 'Active' : 'Inactive'}
                  </label>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => openEdit(provider)}
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

      <ProviderFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        provider={editing}
        onSaved={() => mutate()}
      />
    </div>
  )
}
