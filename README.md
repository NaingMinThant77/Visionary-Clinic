# Visionary Clinic (FITP_Visionary)

An OPD (outpatient department) booking and clinic-management system. Patients
search doctors and book appointments online; doctors manage their weekly
availability and record consultations; admins run the front desk — doctors,
schedules, insurance providers, bookings, attendance, expenses, and the
financial (profit & loss) report.

A NestJS + Prisma/PostgreSQL API (`backend/`) paired with a React + TypeScript
frontend (`frontend/`).

## Roles

The app has three roles, each with its own nav and routes, enforced both by
the frontend's route guards and the backend's auth guards.

### Patient
Search doctors, book an appointment (with insurance provider / payment type),
track bookings and payments, and manage a profile with avatar upload.

| | |
|---|---|
| ![Patient home](docs/screenshots/patient-home.png) | ![Find a doctor](docs/screenshots/patient-doctors.png) |
| **Home** | **Find Doctors** |
| ![Doctor detail / book](docs/screenshots/doctor-detail.png) | ![My appointments](docs/screenshots/patient-bookings.png) |
| **Doctor detail (book)** | **My Appointments** |
| ![Booking detail](docs/screenshots/booking-detail.png) | ![Profile](docs/screenshots/patient-profile.png) |
| **Booking detail** | **Profile** |

### Doctor
Manage weekly availability (day, time range, consultation fee, max patients
per session) and record consultations (notes, diagnosis, prescription) for
booked patients.

| | |
|---|---|
| ![Doctor home](docs/screenshots/doctor-home.png) | ![My Schedule](docs/screenshots/doctor-schedule.png) |
| **Home** | **My Schedule** |
| ![Consultations](docs/screenshots/doctor-consultations.png) | ![Consultation detail](docs/screenshots/doctor-consultation-detail.png) |
| **Consultations** | **Consultation detail** |
| ![Profile](docs/screenshots/doctor-profile.png) | |
| **Profile** | |

### Admin
Full back-office: manage doctors and their schedules, insurance providers,
expense categories and expenses, patient bookings and attendance (check-in),
and the OPD financial report.

| | |
|---|---|
| ![Admin home](docs/screenshots/admin-home.png) | ![Doctors](docs/screenshots/admin-doctors.png) |
| **Home** | **Doctors** |
| ![Doctor schedule (admin)](docs/screenshots/admin-doctor-schedule.png) | ![Bookings](docs/screenshots/admin-bookings.png) |
| **Doctor schedule** | **Bookings (check-in / attendance)** |
| ![Providers](docs/screenshots/admin-providers.png) | ![Categories](docs/screenshots/admin-categories.png) |
| **Insurance Providers** | **Expense Categories** |
| ![Expenses](docs/screenshots/admin-expenses.png) | ![Reports](docs/screenshots/admin-reports.png) |
| **Expenses** | **Financial Report** |
| ![Profile](docs/screenshots/admin-profile.png) | |
| **Profile** | |

### Auth (shared)

| | |
|---|---|
| ![Login](docs/screenshots/login.png) | ![Register](docs/screenshots/register.png) |
| **Login** | **Register** |

## Stack

**Backend** (`backend/`)
- NestJS 11 + Prisma ORM + PostgreSQL (Neon)
- Passport JWT auth, role-based guards (`PATIENT` / `DOCTOR` / `ADMIN`)
- Cloudinary for image uploads (avatars, doctor photos)

**Frontend** (`frontend/`)
- Vite + React 19 + TypeScript
- react-router-dom v7, axios, swr, react-hook-form + zod
- Tailwind CSS v3 + shadcn/ui (Radix primitives), recharts

## Domain model

`User` (role: patient/doctor/admin) → `Doctor` → `DoctorSchedule` (weekly
slots + fee). A `Booking` snapshots the patient's details and fee at
appointment time, optionally discounted by an insurance `Provider`, and
carries a `DailySchedule` (check-in/attendance), a `Consultation` (notes,
diagnosis, prescription), and one or more `Payment`s. `Expense`s (by
`Category`) are tracked separately so admin reports can compute OPD revenue
minus expenses = net profit for a date range.

See `backend/prisma/schema.prisma` for the full schema.

## Getting started

1. **Backend** — see [backend/README.md](backend/README.md) for full setup.
   Quick version:
   ```bash
   cd backend
   cp .env.example .env   # fill in DATABASE_URL/DIRECT_URL (Neon) + Cloudinary creds
   npm install
   npx prisma migrate deploy
   npx prisma db seed       # demo patient/doctors/admin, password123 for all
   npm run start:dev        # http://localhost:3000/api
   ```

2. **Frontend** — see [frontend/README.md](frontend/README.md) for full
   details.
   ```bash
   cd frontend
   cp .env.example .env   # VITE_API_URL=http://localhost:3000/api
   npm install
   npm run dev               # http://localhost:5173
   ```

### Demo accounts (seeded)

| Role    | Email                     | Password    |
|---------|---------------------------|-------------|
| Patient | patient@example.com       | password123 |
| Doctor  | dr.thanda@example.com     | password123 |
| Admin   | admin@example.com         | password123 |

(Three more doctors are seeded too — see `backend/prisma/seed.ts`.)
