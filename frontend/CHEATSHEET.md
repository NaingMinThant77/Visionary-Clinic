# Competition Cheatsheet

Fast copy-paste-and-retype reference for the patterns used in this repo. Practice typing
these from memory — that's the whole point.

## 1. React Router v6/v7 (`createBrowserRouter`)

```tsx
// src/routes.tsx
import { createBrowserRouter } from 'react-router-dom'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />, // has <Outlet /> for children
    children: [
      { index: true, element: <HomePage /> },
      { path: 'items/:id', element: <ItemPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

// src/App.tsx
import { RouterProvider } from 'react-router-dom'
function App() {
  return <RouterProvider router={router} />
}
```

Useful hooks: `useParams<{ id: string }>()`, `useNavigate()`, `useSearchParams()`,
`<Link to="/x">`, `<Navigate to="/login" replace />`.

## 2. Axios instance with interceptors

```ts
// src/api/client.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

## 3. SWR data-fetching hook

```ts
// src/hooks/useThing.ts
import useSWR from 'swr'
import { apiClient } from '@/api/client'

export function useThing(id: number) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['thing', id] : null,
    async () => (await apiClient.get(`/things/${id}`)).data
  )
  return { thing: data, isLoading, error, mutate }
}
```

Key idea: the *key* passed to `useSWR` (string, array, or `null` to skip) is what SWR
uses to dedupe/cache. Pass `null` to conditionally skip fetching.

## 4. react-hook-form + zod

```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})
type FormValues = z.infer<typeof schema>

const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: { email: '', password: '' },
})

function onSubmit(values: FormValues) {
  console.log(values)
}

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>
```

### Checkbox group bound to a `string[]` field

```tsx
<FormField
  control={form.control}
  name="tags"
  render={() => (
    <FormItem>
      <FormLabel>Tags</FormLabel>
      {TAG_OPTIONS.map((tag) => (
        <FormField
          key={tag}
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value?.includes(tag)}
                  onCheckedChange={(checked) =>
                    checked
                      ? field.onChange([...field.value, tag])
                      : field.onChange(field.value?.filter((v) => v !== tag))
                  }
                />
              </FormControl>
              <FormLabel className="font-normal">{tag}</FormLabel>
            </FormItem>
          )}
        />
      ))}
    </FormItem>
  )}
/>
```

### Radio group

```tsx
<FormField
  control={form.control}
  name="condition"
  render={({ field }) => (
    <FormItem>
      <FormControl>
        <RadioGroup onValueChange={field.onChange} defaultValue={field.value}>
          <FormItem className="flex items-center gap-2 space-y-0">
            <FormControl><RadioGroupItem value="new" /></FormControl>
            <FormLabel className="font-normal">New</FormLabel>
          </FormItem>
        </RadioGroup>
      </FormControl>
    </FormItem>
  )}
/>
```

### zod `coerce` for number inputs (needs two generics on `useForm`)

Native `<input type="number">` gives you a string; `z.coerce.number()` converts it.
Because of that, the form's *input* shape and *output* shape differ — tell `useForm`
about both so field types line up:

```ts
type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

const form = useForm<FormInput, unknown, FormOutput>({
  resolver: zodResolver(schema),
})
// form.handleSubmit(onSubmit) now calls onSubmit with FormOutput (numbers, coerced)
```

## 5. shadcn/ui Dialog / Sheet

```tsx
<Dialog>
  <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    ...
  </DialogContent>
</Dialog>

<Sheet>
  <SheetTrigger asChild><Button>Open cart</Button></SheetTrigger>
  <SheetContent side="right">
    <SheetHeader><SheetTitle>Cart</SheetTitle></SheetHeader>
    ...
  </SheetContent>
</Sheet>
```

## 6. Fetch-with-pagination pattern

```tsx
const [searchParams, setSearchParams] = useSearchParams()
const page = Number(searchParams.get('page') ?? '1')

const { data } = useSWR(['things', page], () =>
  apiClient.get('/things', { params: { page, limit: 8 } }).then((r) => r.data)
)
// data = { data: T[], total, page, limit, totalPages }

function goToPage(p: number) {
  const next = new URLSearchParams(searchParams)
  next.set('page', String(p))
  setSearchParams(next)
}
```

Render `<Pagination>` from shadcn with links/buttons that call `goToPage`, disabling
Previous/Next at the boundaries and marking the current page with `isActive`.

## 7. Protected route

```tsx
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <Loading />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}
```

## 8. Toasts on every mutation (sonner)

```tsx
import { toast } from 'sonner'

try {
  await apiClient.post('/things', values)
  toast.success('Created!')
} catch (error) {
  toast.error(getErrorMessage(error))
}
```

Remember to render `<Toaster />` once near the root of the app.
