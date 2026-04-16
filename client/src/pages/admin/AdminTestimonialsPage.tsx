import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { testimonialsService } from '../../services/testimonials.service'
import type { Testimonial } from '../../types'
import { Button } from '../../components/ui/button'
import { Card, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import { Trash2, Plus, Star, Upload, UserCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useToast } from '../../components/ui/use-toast'

interface TestimonialFormValues {
  authorName: string
  uz_text: string
  ru_text: string
  en_text: string
  rating: number
  order: number
  isActive: boolean
}

const defaultValues: TestimonialFormValues = {
  authorName: '',
  uz_text: '',
  ru_text: '',
  en_text: '',
  rating: 5,
  order: 0,
  isActive: true,
}

export default function AdminTestimonialsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['admin', 'testimonials'],
    queryFn: () => testimonialsService.findAllAdmin(),
  })

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues,
  })

  const { mutate: saveTestimonial, isPending } = useMutation({
    mutationFn: (data: TestimonialFormValues) => {
      const testimonialData = {
        authorName: data.authorName,
        text: {
          uz: data.uz_text,
          ru: data.ru_text,
          en: data.en_text,
        },
        rating: data.rating,
        order: data.order,
        isActive: data.isActive,
      }

      if (editingTestimonial) {
        return testimonialsService.update(editingTestimonial.id, testimonialData)
      }
      return testimonialsService.create(testimonialData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] })
      queryClient.invalidateQueries({ queryKey: ['testimonials'] })
      toast({ description: 'Fikr saqlandi' })
      setIsDialogOpen(false)
      reset()
      setEditingTestimonial(null)
    },
  })

  const { mutate: uploadPhoto, isPending: uploadingPhoto } = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      testimonialsService.uploadPhoto(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] })
      queryClient.invalidateQueries({ queryKey: ['testimonials'] })
      toast({ description: 'Rasm yuklandi' })
    },
    onError: () => {
      toast({ description: 'Rasm yuklashda xatolik', variant: 'destructive' })
    },
  })

  const { mutate: deleteTestimonial, isPending: deletingTestimonial } = useMutation({
    mutationFn: (id: string) => testimonialsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] })
      queryClient.invalidateQueries({ queryKey: ['testimonials'] })
      toast({ description: "Fikr o'chirildi" })
    },
  })

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setValue('authorName', testimonial.authorName)
    setValue('uz_text', testimonial.text.uz)
    setValue('ru_text', testimonial.text.ru)
    setValue('en_text', testimonial.text.en)
    setValue('rating', testimonial.rating)
    setValue('order', testimonial.order)
    setValue('isActive', testimonial.isActive)
    setIsDialogOpen(true)
  }

  const handleNewTestimonial = () => {
    setEditingTestimonial(null)
    reset(defaultValues)
    setIsDialogOpen(true)
  }

  const handlePhotoUpload = (testimonialId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadPhoto({ id: testimonialId, file })
  }

  const onSubmit = (data: TestimonialFormValues) => {
    saveTestimonial(data)
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Fikrlar</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mijozlar fikrlari</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewTestimonial}>
              <Plus className="mr-2 h-4 w-4" />
              Fikr qo'shish
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? "Fikrni tahrirlash" : "Yangi fikr qo'shish"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Author info + photo */}
              <div className="flex items-start gap-5">
                {/* Photo */}
                <div className="shrink-0">
                  <div className="relative h-20 w-20 rounded-full overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300">
                    {editingTestimonial?.authorPhotoUrl ? (
                      <img
                        src={editingTestimonial.authorPhotoUrl}
                        alt={editingTestimonial.authorName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-300">
                        <UserCircle className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  {editingTestimonial && (
                    <>
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(editingTestimonial.id, e)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Upload className="h-3 w-3" />
                        Rasm yuklash
                      </button>
                    </>
                  )}
                </div>

                {/* Name + Rating */}
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Muallif ismi</label>
                    <Input {...register('authorName')} placeholder="Ism familiya" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Baho (1-5)</label>
                    <div className="flex items-center gap-2">
                      <Input
                        {...register('rating', { valueAsNumber: true })}
                        type="number"
                        min="1"
                        max="5"
                        className="w-20"
                      />
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < (editingTestimonial?.rating ?? 5)
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-slate-200 text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {!editingTestimonial && (
                <p className="text-xs text-muted-foreground bg-slate-50 rounded-lg px-3 py-2">
                  Rasm yuklash uchun avval saqlang, keyin tahrirlash orqali rasm qo'shing
                </p>
              )}

              {/* Multilingual text */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Fikr matni (UZ)</label>
                  <Textarea {...register('uz_text')} rows={3} placeholder="O'zbek tilida..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Fikr matni (RU)</label>
                  <Textarea {...register('ru_text')} rows={3} placeholder="На русском..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Fikr matni (EN)</label>
                  <Textarea {...register('en_text')} rows={3} placeholder="In English..." />
                </div>
              </div>

              {/* Order + Active */}
              <div className="flex items-center gap-4">
                <div className="w-24">
                  <label className="block text-sm font-medium mb-1.5">Tartib</label>
                  <Input {...register('order', { valueAsNumber: true })} type="number" />
                </div>
                <label className="flex items-center gap-2 mt-5 cursor-pointer">
                  <input type="checkbox" {...register('isActive')} className="rounded" />
                  <span className="text-sm">Faol</span>
                </label>
              </div>

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? 'Saqlanmoqda...' : 'Saqlash'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Testimonials list */}
      <div className="grid gap-4">
        {(Array.isArray(testimonials) ? testimonials : []).map((testimonial) => (
          <Card key={testimonial.id}>
            <CardHeader className="flex flex-row items-center gap-4">
              {/* Photo */}
              <div className="relative h-14 w-14 shrink-0 rounded-full overflow-hidden bg-slate-100">
                {testimonial.authorPhotoUrl ? (
                  <img
                    src={testimonial.authorPhotoUrl}
                    alt={testimonial.authorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-300">
                    <UserCircle className="h-8 w-8" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base">{testimonial.authorName}</CardTitle>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < testimonial.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-200 text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    #{testimonial.order} {testimonial.isActive ? '' : '(nofaol)'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 truncate">
                  {testimonial.text.uz}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => handleEdit(testimonial)}>
                  Tahrirlash
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deletingTestimonial}
                  onClick={() => deleteTestimonial(testimonial.id)}
                >
                  {deletingTestimonial ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
