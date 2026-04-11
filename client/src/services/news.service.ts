import api from '../lib/api'
import type { News, PaginatedResponse } from '../types'

type NewsPayload = Pick<News, 'title' | 'excerpt' | 'content' | 'thumbnailUrl' | 'isPublished'>

export const newsService = {
  findAll: (page = 1, limit = 10) =>
    api
      .get<PaginatedResponse<News>>('/news', { params: { page, limit } })
      .then((response) => response.data),
  findAllAdmin: (page = 1, limit = 10) =>
    api
      .get<PaginatedResponse<News>>('/news/admin', { params: { page, limit } })
      .then((response) => response.data),
  findOne: (id: string) => api.get<News>(`/news/${id}`).then((response) => response.data),
  findOneAdmin: (id: string) =>
    api.get<News>(`/news/admin/${id}`).then((response) => response.data),
  create: (data: NewsPayload) =>
    api.post<News>('/news/admin', data).then((response) => response.data),
  update: (id: string, data: Partial<NewsPayload>) =>
    api.patch<News>(`/news/admin/${id}`, data).then((response) => response.data),
  delete: (id: string) => api.delete(`/news/admin/${id}`),
  uploadThumbnail: (id: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api
      .post<News>(`/news/admin/${id}/thumbnail`, formData)
      .then((response) => response.data)
  },
}
