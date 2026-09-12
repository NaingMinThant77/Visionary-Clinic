import { useState, type ChangeEvent } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { getErrorMessage, resolveAssetUrl } from '@/api/client'
import { changePassword, updateEmail, updateProfile, uploadAvatar } from '@/api/users'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/PasswordInput'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/context/AuthContext'
import { useMe } from '@/hooks/useMe'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  bio: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})
type ProfileValues = z.infer<typeof profileSchema>

const emailSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  currentPassword: z.string().min(1, 'Enter your current password'),
})
type EmailValues = z.infer<typeof emailSchema>

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
type PasswordValues = z.infer<typeof passwordSchema>

export function ProfilePage() {
  const { user } = useAuth()
  const { mutate } = useMe()
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName ?? '',
      bio: user?.bio ?? '',
      phone: user?.phone ?? '',
      address: user?.address ?? '',
    },
    // `defaultValues` above is only read on the very first render, which on a
    // hard refresh happens before `/users/me` resolves (user is still
    // undefined). `values` re-syncs the form whenever `user` changes -
    // keepDirtyValues so an in-progress edit isn't clobbered by that sync.
    values: user
      ? {
          fullName: user.fullName,
          bio: user.bio ?? '',
          phone: user.phone ?? '',
          address: user.address ?? '',
        }
      : undefined,
    resetOptions: { keepDirtyValues: true },
  })

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: user?.email ?? '', currentPassword: '' },
  })

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  async function onProfileSubmit(values: ProfileValues) {
    try {
      const updated = await updateProfile(values)
      mutate(updated)
      toast.success('Profile updated!')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  async function onEmailSubmit(values: EmailValues) {
    try {
      const updated = await updateEmail(values)
      mutate(updated)
      emailForm.reset({ email: updated.email, currentPassword: '' })
      toast.success('Email updated!')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  async function onPasswordSubmit(values: PasswordValues) {
    try {
      await changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword })
      passwordForm.reset({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Password changed!')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingAvatar(true)
    try {
      const { avatarUrl } = await uploadAvatar(file)
      mutate({ ...user!, avatarUrl })
      toast.success('Avatar updated!')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsUploadingAvatar(false)
      e.target.value = ''
    }
  }

  const memberSince = user
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Account settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile, email, and password.</p>
      </div>

      <Card className="relative overflow-hidden rounded-3xl border-primary/10 shadow-lg shadow-primary/5">
        <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-accent blur-3xl" />

        <CardContent className="relative flex flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left">
          <div className="relative shrink-0">
            <Avatar className="h-24 w-24 ring-4 ring-background shadow-md">
              <AvatarImage src={resolveAssetUrl(user?.avatarUrl)} alt={user?.fullName} />
              <AvatarFallback className="text-2xl">{user?.fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <label
              htmlFor="avatar-upload"
              className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-2 ring-background transition-transform hover:scale-105"
            >
              {isUploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              <span className="sr-only">Change photo</span>
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={isUploadingAvatar}
            />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-semibold">{user?.fullName}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {memberSince && <Badge variant="secondary">Member since {memberSince}</Badge>}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-2 rounded-full">
          <TabsTrigger value="profile" className="rounded-full">
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-full">
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Personal details</CardTitle>
              <CardDescription>This information is shown on cards you list.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea rows={3} placeholder="Tell us about yourself" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 555 000 0000" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="rounded-full shadow-md shadow-primary/30"
                    disabled={profileForm.formState.isSubmitting}
                  >
                    {profileForm.formState.isSubmitting ? 'Saving...' : 'Save changes'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Email address</CardTitle>
              <CardDescription>Update the email you use to sign in.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={emailForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current password</FormLabel>
                        <FormControl>
                          <PasswordInput placeholder="••••••••" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="rounded-full shadow-md shadow-primary/30"
                    disabled={emailForm.formState.isSubmitting}
                  >
                    {emailForm.formState.isSubmitting ? 'Updating...' : 'Update email'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Password</CardTitle>
              <CardDescription>Choose a strong password you don't use elsewhere.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current password</FormLabel>
                        <FormControl>
                          <PasswordInput placeholder="••••••••" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New password</FormLabel>
                        <FormControl>
                          <PasswordInput placeholder="••••••••" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm new password</FormLabel>
                        <FormControl>
                          <PasswordInput placeholder="••••••••" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="rounded-full shadow-md shadow-primary/30"
                    disabled={passwordForm.formState.isSubmitting}
                  >
                    {passwordForm.formState.isSubmitting ? 'Changing...' : 'Change password'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
