import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { roomsService } from '../../services/rooms.service'
import { EmptyState } from '../../components/admin/EmptyState'
import { Button } from '../../components/ui/button'
import { Card, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { Trash2, Plus, Edit } from 'lucide-react'
import { useToast } from '../../components/ui/use-toast'
import { getLocalizedField } from '../../lib/i18n-field'

export default function AdminRoomsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['admin', 'rooms'],
    queryFn: () => roomsService.findAllAdmin(),
  })

  const { mutate: deleteRoom, isPending: deletingRoom } = useMutation({
    mutationFn: (id: string) => roomsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'rooms'] })
      toast({ description: 'Room deleted' })
    },
  })

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Rooms</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Rooms</h1>
        <Button onClick={() => navigate('/admin/rooms/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Room
        </Button>
      </div>

      {rooms.length === 0 ? (
        <EmptyState title="Hozircha xonalar yo'q" description="Yangi xona qo'shish uchun yuqoridagi tugmani bosing" />
      ) : (
      <div className="grid gap-4">
        {rooms.map((room) => (
          <Card key={room.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{room.name.uz}</CardTitle>
                <p className="mt-1 text-sm text-slate-600">
                  {room.pricePerNight} {room.currency}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {getLocalizedField(room.description, 'uz') || 'No description'}
                </p>
                <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">
                  {room.scenes.length} scenes • {room.images.length} gallery images •{' '}
                  {room.isActive ? 'active' : 'inactive'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/rooms/${room.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deletingRoom}
                  onClick={() => deleteRoom(room.id)}
                >
                  {deletingRoom ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
      )}
    </div>
  )
}
