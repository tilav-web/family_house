import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { MapPin } from 'lucide-react'
import { hotelInfoService } from '../../services/hotel-info.service'
import type { HotelInfo } from '../../types'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Skeleton } from '../../components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { useToast } from '../../components/ui/use-toast'

interface HotelInfoFormValues {
  uz_description: string
  ru_description: string
  en_description: string
  uz_heroText: string
  ru_heroText: string
  en_heroText: string
  uz_heroSubtext: string
  ru_heroSubtext: string
  en_heroSubtext: string
  phoneNumber: string
  mapEmbedUrl: string
  latitude: string
  longitude: string
}

const defaultValues: HotelInfoFormValues = {
  uz_description: '',
  ru_description: '',
  en_description: '',
  uz_heroText: '',
  ru_heroText: '',
  en_heroText: '',
  uz_heroSubtext: '',
  ru_heroSubtext: '',
  en_heroSubtext: '',
  phoneNumber: '',
  mapEmbedUrl: '',
  latitude: '',
  longitude: '',
}

function toFormValues(hotelInfo?: HotelInfo | null): HotelInfoFormValues {
  if (!hotelInfo) {
    return defaultValues
  }

  return {
    uz_description: hotelInfo.description.uz,
    ru_description: hotelInfo.description.ru,
    en_description: hotelInfo.description.en,
    uz_heroText: hotelInfo.heroText?.uz ?? '',
    ru_heroText: hotelInfo.heroText?.ru ?? '',
    en_heroText: hotelInfo.heroText?.en ?? '',
    uz_heroSubtext: hotelInfo.heroSubtext?.uz ?? '',
    ru_heroSubtext: hotelInfo.heroSubtext?.ru ?? '',
    en_heroSubtext: hotelInfo.heroSubtext?.en ?? '',
    phoneNumber: hotelInfo.phoneNumber ?? '',
    mapEmbedUrl: hotelInfo.mapEmbedUrl ?? '',
    latitude: hotelInfo.latitude?.toString() ?? '',
    longitude: hotelInfo.longitude?.toString() ?? '',
  }
}

// Iframe HTML dan src URL ni ajratib olish. Foydalanuvchi to'liq iframe yoki URL kiritishi mumkin.
function extractIframeSrc(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''
  // Agar <iframe ...> ko'rinishida bo'lsa — src atributini ajratamiz
  const match = trimmed.match(/src=["']([^"']+)["']/i)
  if (match) return match[1]
  // Aks holda URL deb hisoblaymiz
  return trimmed
}

export default function AdminHotelInfoPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedTab, setSelectedTab] = useState('uz')

  const { data: hotelInfo, isLoading } = useQuery({
    queryKey: ['hotelInfo'],
    queryFn: () => hotelInfoService.getInfo(),
  })

  const [uploadingField, setUploadingField] = useState<string | null>(null)

  const { register, handleSubmit, reset, watch } = useForm<HotelInfoFormValues>({
    defaultValues,
  })

  const watchedLat = watch('latitude')
  const watchedLng = watch('longitude')
  const previewLat = parseFloat(watchedLat)
  const previewLng = parseFloat(watchedLng)
  const hasValidCoords = !isNaN(previewLat) && !isNaN(previewLng) && previewLat !== 0 && previewLng !== 0

  useEffect(() => {
    reset(toFormValues(hotelInfo))
  }, [hotelInfo, reset])

  const { mutate: updateHotelInfo, isPending } = useMutation({
    mutationFn: (data: HotelInfoFormValues) => {
      const lat = parseFloat(data.latitude)
      const lng = parseFloat(data.longitude)

      return hotelInfoService.updateInfo({
        description: {
          uz: data.uz_description,
          ru: data.ru_description,
          en: data.en_description,
        },
        heroText: {
          uz: data.uz_heroText,
          ru: data.ru_heroText,
          en: data.en_heroText,
        },
        heroSubtext: {
          uz: data.uz_heroSubtext,
          ru: data.ru_heroSubtext,
          en: data.en_heroSubtext,
        },
        phoneNumber: data.phoneNumber || undefined,
        mapEmbedUrl: data.mapEmbedUrl ? extractIframeSrc(data.mapEmbedUrl) : undefined,
        latitude: isNaN(lat) ? undefined : lat,
        longitude: isNaN(lng) ? undefined : lng,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotelInfo'] })
      toast({ description: 'Hotel info updated successfully' })
    },
    onError: () => {
      toast({ description: 'Error updating hotel info', variant: 'destructive' })
    },
  })

  if (isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-96" />
      </div>
    )
  }

  const onSubmit = (data: HotelInfoFormValues) => {
    updateHotelInfo(data)
  }

  return (
    <div className="max-w-4xl p-8">
      <h1 className="mb-8 text-3xl font-bold">Hotel Information</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="uz">Uzbek</TabsTrigger>
            <TabsTrigger value="ru">Russian</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>

          <TabsContent value="uz" className="mt-4 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Description (UZ)</label>
              <Textarea {...register('uz_description')} rows={6} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Hero Title (UZ)</label>
              <Input {...register('uz_heroText')} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Hero Subtitle (UZ)</label>
              <Input {...register('uz_heroSubtext')} />
            </div>
          </TabsContent>

          <TabsContent value="ru" className="mt-4 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Description (RU)</label>
              <Textarea {...register('ru_description')} rows={6} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Hero Title (RU)</label>
              <Input {...register('ru_heroText')} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Hero Subtitle (RU)</label>
              <Input {...register('ru_heroSubtext')} />
            </div>
          </TabsContent>

          <TabsContent value="en" className="mt-4 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Description (EN)</label>
              <Textarea {...register('en_description')} rows={6} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Hero Title (EN)</label>
              <Input {...register('en_heroText')} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Hero Subtitle (EN)</label>
              <Input {...register('en_heroSubtext')} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Aloqa ma'lumotlari */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Aloqa ma'lumotlari</h2>
          <div>
            <label className="mb-2 block text-sm font-medium">Telefon raqam</label>
            <Input
              {...register('phoneNumber')}
              placeholder="+998 90 123 45 67"
              type="tel"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Saytning header va footer qismida ko'rsatiladi
            </p>
          </div>
        </div>

        {/* Xarita (Google Maps iframe) */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Joylashuv (Xarita)</h2>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Google Maps iframe / URL</label>
            <Textarea
              {...register('mapEmbedUrl')}
              rows={4}
              placeholder={`<iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>`}
              className="font-mono text-xs"
            />
            <div className="mt-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-800">
              <strong>Qanday olish:</strong>
              <ol className="mt-1 ml-4 list-decimal space-y-0.5">
                <li>Google Maps da mehmonxonani toping</li>
                <li>"Share" / "Ulashish" tugmasini bosing</li>
                <li>"Embed a map" / "Xaritani joylash" tabini tanlang</li>
                <li>HTML kodni nusxalang va shu yerga joylang</li>
              </ol>
            </div>
          </div>

          {/* Xarita preview */}
          {watch('mapEmbedUrl') && (
            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
              <p className="bg-slate-50 px-3 py-1.5 text-xs font-medium text-muted-foreground">Preview:</p>
              <iframe
                src={extractIframeSrc(watch('mapEmbedUrl'))}
                title="Map preview"
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}

          {/* SEO uchun koordinatalar (ixtiyoriy) */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
              SEO uchun koordinatalar (ixtiyoriy)
            </summary>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium">Latitude</label>
                <Input {...register('latitude')} type="number" step="any" placeholder="38.8606" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Longitude</label>
                <Input {...register('longitude')} type="number" step="any" placeholder="65.8008" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Qidiruv tizimlari (Google) uchun ishlatiladi — JSON-LD strukturali ma'lumotlarda
            </p>
            {hasValidCoords && (
              <p className="mt-1 text-xs text-green-600">
                ✓ Koordinatalar kiritilgan: {previewLat}, {previewLng}
              </p>
            )}
          </details>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-2 text-sm font-medium">About image</p>
            {hotelInfo?.imageUrl && (
              <img
                src={hotelInfo.imageUrl}
                alt="About"
                className="mb-3 aspect-video w-full rounded-lg object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              disabled={uploadingField === 'about'}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                setUploadingField('about')
                hotelInfoService
                  .uploadAboutImage(file)
                  .then(() => {
                    queryClient.invalidateQueries({ queryKey: ['hotelInfo'] })
                    toast({ description: 'About image uploaded' })
                  })
                  .catch(() => {
                    toast({ description: 'Image upload failed', variant: 'destructive' })
                  })
                  .finally(() => setUploadingField(null))
              }}
            />
            {uploadingField === 'about' && <p className="mt-1 text-xs text-primary animate-pulse">Yuklanmoqda...</p>}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-2 text-sm font-medium">Hero poster (desktop)</p>
            <p className="mb-2 text-xs text-muted-foreground">
              Video yuklanishidan oldin chiqib turadigan rasm (gorizontal)
            </p>
            {hotelInfo?.heroPosterDesktop && (
              <img
                src={hotelInfo.heroPosterDesktop}
                alt="Hero desktop poster"
                className="mb-3 aspect-video w-full rounded-lg object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              disabled={uploadingField === 'posterDesktop'}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                setUploadingField('posterDesktop')
                hotelInfoService
                  .uploadHeroPosterDesktop(file)
                  .then(() => {
                    queryClient.invalidateQueries({ queryKey: ['hotelInfo'] })
                    toast({ description: 'Desktop poster uploaded' })
                  })
                  .catch(() => {
                    toast({ description: 'Image upload failed', variant: 'destructive' })
                  })
                  .finally(() => setUploadingField(null))
              }}
            />
            {uploadingField === 'posterDesktop' && <p className="mt-1 text-xs text-primary animate-pulse">Yuklanmoqda...</p>}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-2 text-sm font-medium">Hero poster (mobile)</p>
            <p className="mb-2 text-xs text-muted-foreground">
              Video yuklanishidan oldin chiqib turadigan rasm (vertikal)
            </p>
            {hotelInfo?.heroPosterMobile && (
              <img
                src={hotelInfo.heroPosterMobile}
                alt="Hero mobile poster"
                className="mb-3 aspect-[9/16] w-32 rounded-lg object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              disabled={uploadingField === 'posterMobile'}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                setUploadingField('posterMobile')
                hotelInfoService
                  .uploadHeroPosterMobile(file)
                  .then(() => {
                    queryClient.invalidateQueries({ queryKey: ['hotelInfo'] })
                    toast({ description: 'Mobile poster uploaded' })
                  })
                  .catch(() => {
                    toast({ description: 'Image upload failed', variant: 'destructive' })
                  })
                  .finally(() => setUploadingField(null))
              }}
            />
            {uploadingField === 'posterMobile' && <p className="mt-1 text-xs text-primary animate-pulse">Yuklanmoqda...</p>}
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
