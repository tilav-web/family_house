import api from '../lib/api'
import type { Service } from '../types'

type ServicePayload = Pick<Service, 'iconName' | 'title' | 'description' | 'order' | 'isActive'>

export const servicesService = {
  findAll: () => api.get<Service[]>('/services').then((response) => response.data),
  findAllAdmin: () => api.get<Service[]>('/services/admin').then((response) => response.data),
  findOne: (id: string) => api.get<Service>(`/services/${id}`).then((response) => response.data),
  findOneAdmin: (id: string) =>
    api.get<Service>(`/services/admin/${id}`).then((response) => response.data),
  create: (data: ServicePayload) =>
    api.post<Service>('/services/admin', data).then((response) => response.data),
  update: (id: string, data: Partial<ServicePayload>) =>
    api.patch<Service>(`/services/admin/${id}`, data).then((response) => response.data),
  delete: (id: string) => api.delete(`/services/admin/${id}`),
  reorder: (ids: string[]) =>
    api.patch('/services/admin/reorder', { ids }).then((response) => response.data),
}
