import { createBrowserRouter } from "react-router-dom";

import { AdminRoute } from "@/components/AdminRoute";
import { DoctorRoute } from "@/components/DoctorRoute";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminBookingsPage } from "@/pages/AdminBookingsPage";
import { AdminCategoriesPage } from "@/pages/AdminCategoriesPage";
import { AdminDoctorSchedulePage } from "@/pages/AdminDoctorSchedulePage";
import { AdminDoctorsPage } from "@/pages/AdminDoctorsPage";
import { AdminExpensesPage } from "@/pages/AdminExpensesPage";
import { AdminProvidersPage } from "@/pages/AdminProvidersPage";
import { AdminReportsPage } from "@/pages/AdminReportsPage";
import { BookingDetailPage } from "@/pages/BookingDetailPage";
import { BookingsPage } from "@/pages/BookingsPage";
import { DoctorConsultationDetailPage } from "@/pages/DoctorConsultationDetailPage";
import { DoctorConsultationsPage } from "@/pages/DoctorConsultationsPage";
import { DoctorDetailPage } from "@/pages/DoctorDetailPage";
import { DoctorSchedulePage } from "@/pages/DoctorSchedulePage";
import { DoctorsPage } from "@/pages/DoctorsPage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RegisterPage } from "@/pages/RegisterPage";
import { HomePage } from "@/pages/HomePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "doctors", element: <DoctorsPage /> },
      { path: "doctors/:id", element: <DoctorDetailPage /> },
      {
        path: "bookings",
        element: (
          <ProtectedRoute>
            <BookingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "bookings/:id",
        element: (
          <ProtectedRoute>
            <BookingDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "doctor/schedule",
        element: (
          <DoctorRoute>
            <DoctorSchedulePage />
          </DoctorRoute>
        ),
      },
      {
        path: "doctor/consultations",
        element: (
          <DoctorRoute>
            <DoctorConsultationsPage />
          </DoctorRoute>
        ),
      },
      {
        path: "doctor/consultations/:id",
        element: (
          <DoctorRoute>
            <DoctorConsultationDetailPage />
          </DoctorRoute>
        ),
      },
      {
        path: "admin/doctors",
        element: (
          <AdminRoute>
            <AdminDoctorsPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/doctors/:id/schedule",
        element: (
          <AdminRoute>
            <AdminDoctorSchedulePage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/bookings",
        element: (
          <AdminRoute>
            <AdminBookingsPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/providers",
        element: (
          <AdminRoute>
            <AdminProvidersPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/categories",
        element: (
          <AdminRoute>
            <AdminCategoriesPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/expenses",
        element: (
          <AdminRoute>
            <AdminExpensesPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/reports",
        element: (
          <AdminRoute>
            <AdminReportsPage />
          </AdminRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
