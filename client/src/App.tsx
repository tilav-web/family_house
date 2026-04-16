import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ClientLayout from './components/layout/ClientLayout'
import HomePage from './pages/HomePage'
import RoomDetailPage from './pages/RoomDetailPage'
import NewsDetailPage from './pages/NewsDetailPage'

// Admin routes — lazy loaded (faqat kerak bo'lganda yuklanadi)
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))
const AdminGuard = lazy(() => import('./components/AdminGuard'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminServicesPage = lazy(() => import('./pages/admin/AdminServicesPage'))
const AdminRoomsPage = lazy(() => import('./pages/admin/AdminRoomsPage'))
const AdminRoomEditPage = lazy(() => import('./pages/admin/AdminRoomEditPage'))
const AdminNewsPage = lazy(() => import('./pages/admin/AdminNewsPage'))
const AdminNewsEditPage = lazy(() => import('./pages/admin/AdminNewsEditPage'))
const AdminTestimonialsPage = lazy(() => import('./pages/admin/AdminTestimonialsPage'))
const AdminVideosPage = lazy(() => import('./pages/admin/AdminVideosPage'))
const AdminContactsPage = lazy(() => import('./pages/admin/AdminContactsPage'))
const AdminHotelInfoPage = lazy(() => import('./pages/admin/AdminHotelInfoPage'))

function AdminFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public routes — ClientLayout bilan (theme, header, footer) */}
      <Route element={<ClientLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/rooms/:id" element={<RoomDetailPage />} />
        <Route path="/news/:id" element={<NewsDetailPage />} />
      </Route>

      {/* Admin routes — lazy loaded */}
      <Route
        path="/admin/login"
        element={
          <Suspense fallback={<AdminFallback />}>
            <AdminLoginPage />
          </Suspense>
        }
      />
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<AdminFallback />}>
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          </Suspense>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="services" element={<AdminServicesPage />} />
        <Route path="rooms" element={<AdminRoomsPage />} />
        <Route path="rooms/new" element={<AdminRoomEditPage />} />
        <Route path="rooms/:id/edit" element={<AdminRoomEditPage />} />
        <Route path="news" element={<AdminNewsPage />} />
        <Route path="news/new" element={<AdminNewsEditPage />} />
        <Route path="news/:id/edit" element={<AdminNewsEditPage />} />
        <Route path="testimonials" element={<AdminTestimonialsPage />} />
        <Route path="videos" element={<AdminVideosPage />} />
        <Route path="contacts" element={<AdminContactsPage />} />
        <Route path="hotel-info" element={<AdminHotelInfoPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
