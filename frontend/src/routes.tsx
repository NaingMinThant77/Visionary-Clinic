import { createBrowserRouter } from 'react-router-dom'

import { DoctorRoute } from '@/components/DoctorRoute'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { BookingDetailPage } from '@/pages/BookingDetailPage'
import { BookingsPage } from '@/pages/BookingsPage'
import { DoctorConsultationDetailPage } from '@/pages/DoctorConsultationDetailPage'
import { DoctorConsultationsPage } from '@/pages/DoctorConsultationsPage'
import { DoctorDetailPage } from '@/pages/DoctorDetailPage'
import { DoctorSchedulePage } from '@/pages/DoctorSchedulePage'
import { DoctorsPage } from '@/pages/DoctorsPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { RegisterPage } from '@/pages/RegisterPage'
import { HomePage } from '@/pages/HomePage'
import { Tab1 } from './pages/Tab1'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'doctors', element: <DoctorsPage /> },
      { path: 'doctors/:id', element: <DoctorDetailPage /> },
      {
        path: 'bookings',
        element: (
          <ProtectedRoute>
            <BookingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'bookings/:id',
        element: (
          <ProtectedRoute>
            <BookingDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'doctor/schedule',
        element: (
          <DoctorRoute>
            <DoctorSchedulePage />
          </DoctorRoute>
        ),
      },
      {
        path: 'doctor/consultations',
        element: (
          <DoctorRoute>
            <DoctorConsultationsPage />
          </DoctorRoute>
        ),
      },
      {
        path: 'doctor/consultations/:id',
        element: (
          <DoctorRoute>
            <DoctorConsultationDetailPage />
          </DoctorRoute>
        ),
      },
      {
        path: 'cards/new',
        element: (
          <ProtectedRoute>
            <Tab1 />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
