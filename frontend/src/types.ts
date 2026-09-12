export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN'

export interface User {
  id: number
  email: string
  fullName: string
  role: UserRole
  bio: string | null
  phone: string | null
  address: string | null
  avatarUrl: string | null
  createdAt: string
}

export type CardCategory = 'electronics' | 'books' | 'clothing' | 'home' | 'sports' | 'toys'
export type CardCondition = 'new' | 'used'

export interface Card {
  id: number
  title: string
  description: string
  price: number
  category: CardCategory
  stock: number
  tags: string[]
  condition: CardCondition
  isFeatured: boolean
  releaseDate: string | null
  imageUrl: string | null
  ownerId: number
  createdAt: string
}

export interface CartItem {
  id: number
  cardId: number
  card: Card
  quantity: number
  userId: number
}

export interface CartResponse {
  items: CartItem[]
  total: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface ApiError {
  statusCode: number
  message: string | string[]
  error: string
}

export type Gender = 'MALE' | 'FEMALE'

export type PaymentType = 'CASH' | 'CARD' | 'KBZ_PAY' | 'WAVE_MONEY' | 'BANK_TRANSFER' | 'INSURANCE'

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

export type AgreementType = 'PERCENTAGE' | 'FIXED' | 'CUSTOM'

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'

export interface DoctorSchedule {
  id: number
  doctorId: number
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  maximumPatientSession: number
  consultationFees: number
  isActive: boolean
}

export interface Doctor {
  id: number
  specialization: string
  medicalLicenseNumber: string
  hospitalDepartment: string | null
  image: string | null
  user: {
    id: number
    fullName: string
    email?: string
    avatarUrl: string | null
    bio: string | null
  }
  schedules: DoctorSchedule[]
}

export interface Provider {
  id: number
  name: string
  coveragePercentage: number
  agreementType: AgreementType
  rule: string | null
  isActive: boolean
}

export interface Payment {
  id: number
  bookingId: number
  amount: number
  paymentType: PaymentType
  paymentStatus: PaymentStatus
  transactionReference: string | null
  paidAt: string | null
  createdAt: string
}

export type AttendanceStatus = 'CHECKED_IN' | 'COMPLETED' | 'ABSENT'

export interface DailySchedule {
  id: number
  bookingId: number
  scheduleDate: string
  status: AttendanceStatus
  token: string | null
  checkInAt: string | null
  completedAt: string | null
}

export interface Consultation {
  id: number
  bookingId: number
  doctorId: number
  consultationNotes: string | null
  diagnosisDetails: string | null
  prescription: string | null
}

export interface Booking {
  id: number
  userId: number
  doctorId: number
  providerId: number | null
  fullName: string
  dob: string
  gender: Gender
  contactNumber: string
  nrc: string
  medicalNotes: string | null
  paymentType: PaymentType
  depositAmount: number
  leftAmount: number
  consultationFee: number
  insuranceDiscount: number
  status: BookingStatus
  appointmentDate: string
  createdAt: string
  doctor: {
    id: number
    specialization: string
    hospitalDepartment: string | null
    image: string | null
    user: { id: number; fullName: string; avatarUrl: string | null }
  }
  provider: Provider | null
  payments: Payment[]
  consultation?: Consultation | null
  dailySchedule?: DailySchedule | null
}

export interface Category {
  id: number
  name: string
  description: string | null
  isActive: boolean
}

export interface Expense {
  id: number
  categoryId: number
  createdById: number | null
  amount: number
  description: string | null
  expenseDate: string
  category: Category
}

export interface OpdReport {
  reportDateFrom: string
  reportDateTo: string
  totalOPDRevenue: number
  totalConsultationFees: number
  totalInsuranceDiscount: number
  totalExpenses: number
  netProfit: number
}
