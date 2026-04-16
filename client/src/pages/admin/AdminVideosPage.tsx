import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { videosService } from '../../services/videos.service'
import type { Video } from '../../types'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { Input } from '../../components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import { Trash2, Plus, Upload, Film, ImageIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useToast } from '../../components/ui/use-toast'

interface VideoFormValues {
  caption: string
  order: number
  isActive: boolean
}

const defaultValues: VideoFormValues = {
  caption: '',
  order: 0,
  isActive: true,
}

export default function AdminVideosPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [uploadingVideoId, setUploadingVideoId] = useState<string | null>(null)
  const [uploadingThumbId, setUploadingThumbId] = useState<string | null>(null)
  const videoInputRef = useRef<Record<string, HTMLInputElement | null>>({})
  const thumbInputRef = useRef<Record<string, HTMLInputElement | null>>({})

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['admin', 'videos'],
    queryFn: () => videosService.findAllAdmin(),
  })

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues,
  })

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'videos'] })
    queryClient.invalidateQueries({ queryKey: ['videos'] })
  }

  const { mutate: saveVideo, isPending } = useMutation({
    mutationFn: (data: VideoFormValues) => {
      if (editingVideo) {
        return videosService.update(editingVideo.id, data)
      }
      return videosService.create(data)
    },
    onSuccess: () => {
      invalidateAll()
      toast({ description: editingVideo ? 'Video yangilandi' : 'Video yaratildi' })
      setIsDialogOpen(false)
      reset()
      setEditingVideo(null)
    },
  })

  const { mutate: deleteVideo, isPending: deletingVideo } = useMutation({
    mutationFn: (id: string) => videosService.delete(id),
    onSuccess: () => {
      invalidateAll()
      toast({ description: 'Video o\'chirildi' })
    },
  })

  const handleUploadVideo = async (id: string, file: File) => {
    setUploadingVideoId(id)
    try {
      await videosService.uploadPreviewVideo(id, file)
      invalidateAll()
      toast({ description: 'Video fayl yuklandi' })
    } catch {
      toast({ description: 'Video yuklashda xatolik', variant: 'destructive' })
    } finally {
      setUploadingVideoId(null)
    }
  }

  const handleUploadThumbnail = async (id: string, file: File) => {
    setUploadingThumbId(id)
    try {
      await videosService.uploadThumbnail(id, file)
      invalidateAll()
      toast({ description: 'Thumbnail yuklandi' })
    } catch {
      toast({ description: 'Thumbnail yuklashda xatolik', variant: 'destructive' })
    } finally {
      setUploadingThumbId(null)
    }
  }

  const handleEdit = (video: Video) => {
    setEditingVideo(video)
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

  const sortedVideos = [...videos].sort((a, b) => a.order - b.order)

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Videos</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Videos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewVideo}>
              <Plus className="mr-2 h-4 w-4" />
              Yangi video
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingVideo ? 'Videoni tahrirlash' : 'Yangi video'}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium">Sarlavha</label>
                <Input {...register('caption')} placeholder="Video nomi..." />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Tartib</label>
                <Input {...register('order', { valueAsNumber: true })} type="number" />
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                <input type="checkbox" {...register('isActive')} />
                Saytda ko'rsatish
              </label>

              <p className="text-xs text-muted-foreground">
                Video va thumbnail fayllarini saqlangandan keyin yuklang.
              </p>

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? 'Saqlanmoqda...' : 'Saqlash'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sortedVideos.map((video) => (
          <div
            key={video.id}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
          >
            {/* Preview */}
            <div className="relative aspect-[9/14] bg-slate-100">
              {video.previewVideoUrl ? (
                <video
                  src={video.previewVideoUrl}
                  className="h-full w-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => {
                    e.currentTarget.pause()
                    e.currentTarget.currentTime = 0
                  }}
                />
              ) : video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={video.caption || ''}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
                  <Film className="h-10 w-10" />
                  <p className="text-xs">Video yuklanmagan</p>
                </div>
              )}

              {/* Status badge */}
              <div
                className={`absolute left-3 top-3 rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                  video.isActive
                    ? 'bg-green-500/90 text-white'
                    : 'bg-slate-500/90 text-white'
                }`}
              >
                {video.isActive ? 'Active' : 'Inactive'}
              </div>

              <div className="absolute right-3 top-3 rounded-lg bg-black/50 px-2 py-1 text-[10px] font-semibold text-white">
                #{video.order}
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <p className="font-semibold text-slate-900 truncate">
                {video.caption || 'Nomsiz video'}
              </p>

              {/* Upload buttons */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <input
                  ref={(el) => { videoInputRef.current[video.id] = el }}
                  type="file"
                  accept="video/mp4,video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUploadVideo(video.id, file)
                    e.target.value = ''
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  disabled={uploadingVideoId === video.id}
                  onClick={() => videoInputRef.current[video.id]?.click()}
                >
                  {uploadingVideoId === video.id ? (
                    <div className="mr-1.5 h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                  ) : (
                    <Upload className="mr-1.5 h-3 w-3" />
                  )}
                  Video
                </Button>

                <input
                  ref={(el) => { thumbInputRef.current[video.id] = el }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUploadThumbnail(video.id, file)
                    e.target.value = ''
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  disabled={uploadingThumbId === video.id}
                  onClick={() => thumbInputRef.current[video.id]?.click()}
                >
                  {uploadingThumbId === video.id ? (
                    <div className="mr-1.5 h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                  ) : (
                    <ImageIcon className="mr-1.5 h-3 w-3" />
                  )}
                  Rasm
                </Button>
              </div>

              {/* Actions */}
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => handleEdit(video)}
                >
                  Tahrirlash
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deletingVideo}
                  onClick={() => deleteVideo(video.id)}
                >
                  {deletingVideo ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Trash2 className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <Film className="mx-auto mb-3 h-12 w-12 opacity-40" />
          <p>Hali video yo'q</p>
          <p className="mt-1 text-sm">Yangi video qo'shish uchun tugmani bosing</p>
        </div>
      )}
    </div>
  )
}
