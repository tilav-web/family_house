import api from '../lib/api'
import type { Video } from '../types'

type VideoPayload = Pick<
  Video,
  'instagramUrl' | 'thumbnailUrl' | 'previewVideoUrl' | 'caption' | 'order' | 'isActive'
>

export const videosService = {
  findAll: () => api.get<Video[]>('/videos').then((response) => response.data),
  findAllAdmin: () => api.get<Video[]>('/videos/admin').then((response) => response.data),
  findOne: (id: string) => api.get<Video>(`/videos/${id}`).then((response) => response.data),
  findOneAdmin: (id: string) =>
    api.get<Video>(`/videos/admin/${id}`).then((response) => response.data),
  create: (data: VideoPayload) =>
    api.post<Video>('/videos/admin', data).then((response) => response.data),
  update: (id: string, data: Partial<VideoPayload>) =>
    api.patch<Video>(`/videos/admin/${id}`, data).then((response) => response.data),
  delete: (id: string) => api.delete(`/videos/admin/${id}`),
  uploadThumbnail: (id: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api
      .post<Video>(`/videos/admin/${id}/thumbnail`, formData)
      .then((response) => response.data)
  },
  uploadPreviewVideo: (id: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api
      .post<Video>(`/videos/admin/${id}/preview-video`, formData)
      .then((response) => response.data)
  },
  reorder: (ids: string[]) =>
    api.patch('/videos/admin/reorder', { ids }).then((response) => response.data),
}
