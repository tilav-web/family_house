import api from '../lib/api'
import type { LoginResponse, AdminUser } from '../types'

export const authService = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { username, password }).then(r => r.data),
  getMe: () => api.get<AdminUser>('/auth/me').then(r => r.data),
  logout: () => {
    localStorage.removeItem('admin_token')
  },
}
