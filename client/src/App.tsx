import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import RoomDetailPage from './pages/RoomDetailPage'
import NewsDetailPage from './pages/NewsDetailPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminGuard from './components/AdminGuard'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminServicesPage from './pages/admin/AdminServicesPage'
import AdminRoomsPage from './pages/admin/AdminRoomsPage'
import AdminRoomEditPage from './pages/admin/AdminRoomEditPage'
import AdminNewsPage from './pages/admin/AdminNewsPage'
import AdminNewsEditPage from './pages/admin/AdminNewsEditPage'
import AdminTestimonialsPage from './pages/admin/AdminTestimonialsPage'
import AdminVideosPage from './pages/admin/AdminVideosPage'
import AdminContactsPage from './pages/admin/AdminContactsPage'
import AdminHotelInfoPage from './pages/admin/AdminHotelInfoPage'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/rooms/:id" element={<RoomDetailPage />} />
      <Route path="/news/:id" element={<NewsDetailPage />} />

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin/*"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
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
