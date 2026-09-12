import useSWR from 'swr'

import { getCurrentUser } from '@/api/users'

export function useMe() {
  const hasToken = Boolean(localStorage.getItem('accessToken'))

  const { data, error, isLoading, mutate } = useSWR(hasToken ? 'me' : null, getCurrentUser, {
    shouldRetryOnError: false,
  })

  return { user: data, isLoading, error, mutate }
}
