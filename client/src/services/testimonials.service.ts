import api from '../lib/api'
import type { Testimonial } from '../types'

type TestimonialPayload = Pick<
  Testimonial,
  'authorName' | 'authorPhotoUrl' | 'text' | 'rating' | 'order' | 'isActive'
>

export const testimonialsService = {
  findAll: () =>
    api.get<Testimonial[]>('/testimonials').then((response) => response.data),
  findAllAdmin: () =>
    api.get<Testimonial[]>('/testimonials/admin').then((response) => response.data),
  findOne: (id: string) =>
    api.get<Testimonial>(`/testimonials/${id}`).then((response) => response.data),
  findOneAdmin: (id: string) =>
    api.get<Testimonial>(`/testimonials/admin/${id}`).then((response) => response.data),
  create: (data: TestimonialPayload) =>
    api.post<Testimonial>('/testimonials/admin', data).then((response) => response.data),
  update: (id: string, data: Partial<TestimonialPayload>) =>
    api.patch<Testimonial>(`/testimonials/admin/${id}`, data).then((response) => response.data),
  delete: (id: string) => api.delete(`/testimonials/admin/${id}`),
  uploadPhoto: (id: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api
      .post<Testimonial>(`/testimonials/admin/${id}/photo`, formData)
      .then((response) => response.data)
  },
  reorder: (ids: string[]) =>
    api.patch('/testimonials/admin/reorder', { ids }).then((response) => response.data),
}
