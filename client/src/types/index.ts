export interface I18nField {
  uz: string
  ru: string
  en: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface RoomImage {
  id: string
  url: string
  order: number
  roomId: string
}

export type PanoramaHotspotType = 'scene' | 'info'

export interface PanoramaHotspot {
  id: string
  sceneId: string
  targetSceneId?: string | null
  type: PanoramaHotspotType
  label: I18nField
  yaw: number
  pitch: number
  iconUrl?: string | null
  targetYaw?: number | null
  targetPitch?: number | null
  targetHfov?: number | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface PanoramaScene {
  id: string
  roomId: string
  title: I18nField
  panoramaUrl?: string | null
  thumbnailUrl?: string | null
  initialYaw: number
  initialPitch: number
  initialHfov: number
  isDefault: boolean
  order: number
  isActive: boolean
  targetForwardId?: string | null
  targetForwardYaw?: number | null
  targetRightId?: string | null
  targetRightYaw?: number | null
  targetBackId?: string | null
  targetBackYaw?: number | null
  targetLeftId?: string | null
  targetLeftYaw?: number | null
  hotspots: PanoramaHotspot[]
  createdAt: string
  updatedAt: string
}

export interface PriceTier {
  guests: string
  price: number
}

export interface Room {
  id: string
  name: I18nField
  description: I18nField
  pricePerNight: number
  pricePerNightDouble?: number | null
  priceTiers?: PriceTier[] | null
  currency: string
  amenities: I18nField
  thumbnailUrl?: string | null
  order: number
  isActive: boolean
  images: RoomImage[]
  scenes: PanoramaScene[]
  createdAt: string
  updatedAt: string
}

export interface RoomPayload {
  name: I18nField
  description?: I18nField
  amenities?: I18nField
  pricePerNight: number
  pricePerNightDouble?: number | null
  priceTiers?: PriceTier[] | null
  currency?: string
  thumbnailUrl?: string
  order?: number
  isActive?: boolean
}

export interface PanoramaScenePayload {
  title: I18nField
  initialYaw?: number
  initialPitch?: number
  initialHfov?: number
  isDefault?: boolean
  order?: number
  isActive?: boolean
}

export interface PanoramaHotspotPayload {
  type: PanoramaHotspotType
  label: I18nField
  yaw: number
  pitch: number
  targetSceneId?: string
  iconUrl?: string
  targetYaw?: number
  targetPitch?: number
  targetHfov?: number
  order?: number
}

export interface Service {
  id: string
  iconName: string
  title: I18nField
  description: I18nField
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface News {
  id: string
  title: I18nField
  excerpt: I18nField
  content: I18nField
  thumbnailUrl?: string | null
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface Testimonial {
  id: string
  authorName: string
  authorPhotoUrl?: string | null
  authorCountry?: string | null
  text: I18nField
  rating: number
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Video {
  id: string
  instagramUrl?: string | null
  thumbnailUrl?: string | null
  previewVideoUrl?: string | null
  caption?: string | null
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Contact {
  id: string
  name: string
  phone: string
  email?: string | null
  message: string
  language: string
  isRead: boolean
  createdAt: string
}

export interface HotelInfo {
  id: string
  description: I18nField
  imageUrl?: string | null
  heroVideoDesktop?: string | null
  heroVideoMobile?: string | null
  heroPosterDesktop?: string | null
  heroPosterMobile?: string | null
  heroText?: I18nField | null
  heroSubtext?: I18nField | null
  phoneNumber?: string | null
  latitude?: number | null
  longitude?: number | null
  mapEmbedUrl?: string | null
  roomsCount?: number | null
}

export interface LoginResponse {
  access_token: string
}

export interface AdminUser {
  id: string
  username: string
  createdAt: string
}

export interface DashboardStats {
  rooms: number
  news: number
  services: number
  testimonials: number
  videos: number
  contacts: number
  totalRooms: number
  totalNews: number
  totalServices: number
  totalTestimonials: number
  totalVideos: number
  totalContacts: number
  unreadContacts: number
}
