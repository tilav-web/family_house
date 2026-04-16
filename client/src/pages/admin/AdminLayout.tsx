import { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import {
  LayoutDashboard,
  Settings,
  DoorOpen,
  Newspaper,
  MessageSquare,
  Video,
  Mail,
  Info,
  Menu,
  X,
  House,
  LogOut,
  Shield,
} from 'lucide-react'
import { authService } from '../../services/auth.service'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Settings, label: 'Services', href: '/admin/services' },
  { icon: DoorOpen, label: 'Rooms', href: '/admin/rooms' },
  { icon: Newspaper, label: 'News', href: '/admin/news' },
  { icon: MessageSquare, label: 'Testimonials', href: '/admin/testimonials' },
  { icon: Video, label: 'Videos', href: '/admin/videos' },
  { icon: Mail, label: 'Contacts', href: '/admin/contacts' },
  { icon: Info, label: 'Hotel Info', href: '/admin/hotel-info' },
  { icon: Shield, label: 'Sozlamalar', href: '/admin/settings' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
      document.body.style.pointerEvents = ''
      document.documentElement.style.overflow = ''
    }
  }, [])

  const handleLogout = () => {
    authService.logout()
    navigate('/admin/login')
  }

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">Family House</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2">
          {navItems.map(({ icon: Icon, label, href }) => (
            <button
              key={href}
              onClick={() => navigate(href)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === href
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">{label}</span>}
            </button>
          ))}
        </nav>

        <div className="space-y-2 p-4 border-t border-slate-700">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start border-slate-700 bg-slate-950 text-slate-100 hover:bg-slate-800 hover:text-white"
            onClick={() => navigate('/')}
          >
            <House className="h-4 w-4" />
            {sidebarOpen && 'View Site'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && 'Logout'}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
