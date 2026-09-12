export interface User {
  id: number
  email: string
  fullName: string
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
