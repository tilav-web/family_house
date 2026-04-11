import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'

interface DashboardStats {
  totalRooms: number
  totalNews: number
  totalServices: number
  totalTestimonials: number
  totalVideos: number
  totalContacts: number
  unreadContacts: number
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get<DashboardStats>('/admin/stats').then(r => r.data),
  })

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="grid md:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    { title: 'Rooms', value: stats?.totalRooms || 0 },
    { title: 'News', value: stats?.totalNews || 0 },
    { title: 'Services', value: stats?.totalServices || 0 },
    { title: 'Testimonials', value: stats?.totalTestimonials || 0 },
    { title: 'Videos', value: stats?.totalVideos || 0 },
    { title: 'Contacts', value: stats?.totalContacts || 0 },
    { title: 'Unread', value: stats?.unreadContacts || 0, highlight: true },
  ]

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className={stat.highlight ? 'border-primary' : ''}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${stat.highlight ? 'text-primary' : ''}`}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
