import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

// Uploaded files (avatars, card images) are served by the backend outside the
// `/api` prefix, as plain relative paths like `/uploads/avatar-1.png`. Left
// as-is, the browser resolves that against the frontend's own origin instead
// of the backend's - this turns it into an absolute URL against the backend.
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

export function resolveAssetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (/^https?:\/\//.test(path)) return path
  return `${API_ORIGIN}${path}`
}

// Attach the JWT (if we have one) to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// If the backend says our token is no good, clear it and bounce to /login.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// The backend returns { statusCode, message, error } where message can be a
// string or string[] (class-validator). Normalize it to a single string.
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (Array.isArray(message)) return message.join(', ')
    if (typeof message === 'string') return message
  }
  return 'Something went wrong. Please try again.'
}
