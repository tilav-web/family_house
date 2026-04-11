import api from '../lib/api'
import type { HotelInfo } from '../types'

type HotelInfoPayload = Pick<
  HotelInfo,
  'description' | 'heroText' | 'heroSubtext'
>

export const hotelInfoService = {
  getInfo: () => api.get<HotelInfo>('/hotel-info').then((response) => response.data),
  updateInfo: (data: HotelInfoPayload) =>
    api.patch<HotelInfo>('/hotel-info', data).then((response) => response.data),
  uploadAboutImage: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api
      .post<HotelInfo>('/hotel-info/upload-about-image', formData)
      .then((response) => response.data)
  },
  uploadHeroDesktop: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api
      .post<HotelInfo>('/hotel-info/upload-hero-desktop', formData)
      .then((response) => response.data)
  },
  uploadHeroMobile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api
      .post<HotelInfo>('/hotel-info/upload-hero-mobile', formData)
      .then((response) => response.data)
  },
}
