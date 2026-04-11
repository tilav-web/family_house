import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { videosService } from '../../services/videos.service'
import type { Video } from '../../types'
import { Button } from '../../components/ui/button'
import { Card, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { Input } from '../../components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import { Trash2, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useToast } from '../../components/ui/use-toast'

interface VideoFormValues {
  instagramUrl: string
  caption: string
  order: number
  isActive: boolean
}

const defaultValues: VideoFormValues = {
  instagramUrl: '',
  caption: '',
  order: 0,
  isActive: true,
}

export default function AdminVideosPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['admin', 'videos'],
    queryFn: () => videosService.findAllAdmin(),
  })

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues,
  })

  const { mutate: saveVideo, isPending } = useMutation({
    mutationFn: (data: VideoFormValues) => {
      if (editingVideo) {
        return videosService.update(editingVideo.id, data)
      }
      return videosService.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'videos'] })
      queryClient.invalidateQueries({ queryKey: ['videos'] })
      toast({ description: 'Video saved successfully' })
      setIsDialogOpen(false)
      reset()
      setEditingVideo(null)
    },
  })

  const { mutate: deleteVideo } = useMutation({
    mutationFn: (id: string) => videosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'videos'] })
      queryClient.invalidateQueries({ queryKey: ['videos'] })
      toast({ description: 'Video deleted' })
    },
  })

  const handleEdit = (video: Video) => {
    setEditingVideo(video)
    setValue('instagramUrl', video.instagramUrl ?? '')
    setValue('caption', video.caption ?? '')
    setValue('order', video.order)
    setValue('isActive', video.isActive)
    setIsDialogOpen(true)
  }

  const handleNewVideo = () => {
    setEditingVideo(null)
    reset(defaultValues)
    setIsDialogOpen(true)
  }

  const onSubmit = (data: VideoFormValues) => {
    saveVideo(data)
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Videos</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Videos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewVideo}>
              <Plus className="mr-2 h-4 w-4" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingVideo ? 'Edit Video' : 'Add Video'}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Instagram URL</label>
                <Input {...register('instagramUrl')} placeholder="https://instagram.com/..." />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Caption</label>
                <Input {...register('caption')} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Order</label>
                <Input {...register('order', { valueAsNumber: true })} type="number" />
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                <input type="checkbox" {...register('isActive')} />
                Visible on public website
              </label>

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? 'Saving...' : 'Save'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {videos.map((video) => (
          <Card key={video.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">{video.caption || 'Untitled'}</CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  order {video.order} • {video.isActive ? 'active' : 'inactive'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(video)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteVideo(video.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
