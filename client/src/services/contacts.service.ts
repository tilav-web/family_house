import api from '../lib/api'
import type { Contact, PaginatedResponse } from '../types'

type ContactPayload = Pick<Contact, 'name' | 'phone' | 'message' | 'language'> & {
  email?: string
}

export const contactsService = {
  create: (data: ContactPayload) =>
    api.post<Contact>('/contacts', data).then((response) => response.data),
  findAll: (page = 1, limit = 20) =>
    api
      .get<PaginatedResponse<Contact>>('/contacts/admin', { params: { page, limit } })
      .then((response) => response.data),
  findOne: (id: string) =>
    api.get<Contact>(`/contacts/admin/${id}`).then((response) => response.data),
  markAsRead: (id: string) =>
    api.patch<Contact>(`/contacts/admin/${id}/read`).then((response) => response.data),
  delete: (id: string) => api.delete(`/contacts/admin/${id}`),
}
