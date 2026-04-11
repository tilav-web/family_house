import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Upload, ImageIcon } from 'lucide-react'
import { newsService } from '../../services/news.service'
import type { News } from '../../types'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Skeleton } from '../../components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { useToast } from '../../components/ui/use-toast'
import { LexicalEditor } from '../../components/editor/LexicalEditor'

interface NewsFormValues {
  uz_title: string
  ru_title: string
  en_title: string
  uz_excerpt: string
  ru_excerpt: string
  en_excerpt: string
  isPublished: boolean
}

const defaultValues: NewsFormValues = {
  uz_title: '',
  ru_title: '',
  en_title: '',
  uz_excerpt: '',
  ru_excerpt: '',
  en_excerpt: '',
  isPublished: false,
}

function toFormValues(news?: News | null): NewsFormValues {
  if (!news) return defaultValues
  return {
    uz_title: news.title.uz,
    ru_title: news.title.ru,
    en_title: news.title.en,
    uz_excerpt: news.excerpt.uz,
    ru_excerpt: news.excerpt.ru,
    en_excerpt: news.excerpt.en,
    isPublished: news.isPublished,
  }
}

export default function AdminNewsEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedTab, setSelectedTab] = useState('uz')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Lexical content state per language
  const [contentUz, setContentUz] = useState('')
  const [contentRu, setContentRu] = useState('')
  const [contentEn, setContentEn] = useState('')

  const { data: news, isLoading } = useQuery({
    queryKey: ['admin', 'news', id],
    queryFn: () => (id ? newsService.findOneAdmin(id) : null),
    enabled: !!id,
  })

  const { register, handleSubmit, reset } = useForm<NewsFormValues>({
    defaultValues,
  })

  useEffect(() => {
    if (news) {
      reset(toFormValues(news))
      setContentUz(news.content.uz || '')
      setContentRu(news.content.ru || '')
      setContentEn(news.content.en || '')
    }
  }, [news, reset])

  const { mutate: saveNews, isPending } = useMutation({
    mutationFn: (data: NewsFormValues) => {
      const newsData = {
        title: { uz: data.uz_title, ru: data.ru_title, en: data.en_title },
        excerpt: { uz: data.uz_excerpt, ru: data.ru_excerpt, en: data.en_excerpt },
        content: { uz: contentUz, ru: contentRu, en: contentEn },
        isPublished: data.isPublished,
      }
      return id ? newsService.update(id, newsData) : newsService.create(newsData)
    },
    onSuccess: (savedNews) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'news'] })
      queryClient.invalidateQueries({ queryKey: ['news'] })
      toast({ description: 'Yangilik saqlandi' })
      navigate(`/admin/news/${savedNews.id}/edit`)
    },
    onError: () => {
      toast({ description: 'Saqlashda xatolik', variant: 'destructive' })
    },
  })

  const { mutate: uploadThumbnail } = useMutation({
    mutationFn: (file: File) => newsService.uploadThumbnail(id!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'news', id] })
      toast({ description: 'Rasm yuklandi' })
    },
    onError: () => {
      toast({ description: 'Rasm yuklashda xatolik', variant: 'destructive' })
    },
  })

  if (isLoading && id) {
    return (
      <div className="p-8">
        <Skeleton className="h-96" />
      </div>
    )
  }

  const onSubmit = (data: NewsFormValues) => saveNews(data)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && id) uploadThumbnail(file)
  }

  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-8 text-3xl font-bold">
        {id ? 'Yangilikni tahrirlash' : 'Yangilik qo\'shish'}
      </h1>

      {/* Thumbnail upload (only for existing news) */}
      {id && (
        <div className="mb-8">
          <label className="mb-2 block text-sm font-medium">Asosiy rasm</label>
          <div className="flex items-start gap-6">
            <div className="relative w-64 h-40 bg-slate-100 rounded-xl overflow-hidden border-2 border-dashed border-slate-300">
              {news?.thumbnailUrl ? (
                <img
                  src={news.thumbnailUrl}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <ImageIcon className="h-8 w-8 mb-2" />
                  <span className="text-xs">Rasm yo'q</span>
                </div>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Rasm yuklash
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG. Tavsiya: 1200x630px
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="uz">O'zbekcha</TabsTrigger>
            <TabsTrigger value="ru">Ruscha</TabsTrigger>
            <TabsTrigger value="en">Inglizcha</TabsTrigger>
          </TabsList>

          {/* UZ */}
          <TabsContent value="uz" className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">Sarlavha (UZ)</label>
              <Input {...register('uz_title')} placeholder="Yangilik sarlavhasi" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Qisqa tavsif (UZ)</label>
              <Textarea
                {...register('uz_excerpt')}
                rows={2}
                placeholder="Bosh sahifada ko'rinadigan qisqa matn"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">To'liq matn (UZ)</label>
              <LexicalEditor
                key={`uz-${news?.id || 'new'}`}
                initialState={contentUz}
                onChange={setContentUz}
                placeholder="Yangilik matnini yozing..."
              />
            </div>
          </TabsContent>

          {/* RU */}
          <TabsContent value="ru" className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">Sarlavha (RU)</label>
              <Input {...register('ru_title')} placeholder="Заголовок новости" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Qisqa tavsif (RU)</label>
              <Textarea
                {...register('ru_excerpt')}
                rows={2}
                placeholder="Краткое описание для главной страницы"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">To'liq matn (RU)</label>
              <LexicalEditor
                key={`ru-${news?.id || 'new'}`}
                initialState={contentRu}
                onChange={setContentRu}
                placeholder="Напишите текст новости..."
              />
            </div>
          </TabsContent>

          {/* EN */}
          <TabsContent value="en" className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">Sarlavha (EN)</label>
              <Input {...register('en_title')} placeholder="News title" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Qisqa tavsif (EN)</label>
              <Textarea
                {...register('en_excerpt')}
                rows={2}
                placeholder="Short description for homepage"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">To'liq matn (EN)</label>
              <LexicalEditor
                key={`en-${news?.id || 'new'}`}
                initialState={contentEn}
                onChange={setContentEn}
                placeholder="Write news content..."
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Publish toggle */}
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 cursor-pointer hover:border-primary/30 transition-colors">
          <input
            type="checkbox"
            {...register('isPublished')}
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
          />
          <div>
            <span className="text-sm font-medium text-foreground">Saytda chop etish</span>
            <p className="text-xs text-muted-foreground">
              Faollashtirilsa, yangilik foydalanuvchilarga ko'rinadi
            </p>
          </div>
        </label>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saqlanmoqda...' : 'Saqlash'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/news')}>
            Bekor qilish
          </Button>
        </div>
      </form>
    </div>
  )
}
