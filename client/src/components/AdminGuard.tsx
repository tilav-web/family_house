import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

interface AdminGuardProps {
  children: ReactNode
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const location = useLocation()
  const token = localStorage.getItem('admin_token')

  if (!token) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}
