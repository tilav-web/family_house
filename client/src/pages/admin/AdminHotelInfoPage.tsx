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
    latitude: hotelInfo.latitude?.toString() ?? '',
    longitude: hotelInfo.longitude?.toString() ?? '',
  }
}

function buildGoogleMapsEmbedUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3100!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z!5e0!3m2!1suz!2suz!4v1700000000000`
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

        {/* Xarita koordinatalari */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Joylashuv (Xarita)</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Latitude (kenglik)</label>
              <Input
                {...register('latitude')}
                type="number"
                step="any"
                placeholder="38.8606"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Masalan: 38.8606
              </p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Longitude (uzunlik)</label>
              <Input
                {...register('longitude')}
                type="number"
                step="any"
                placeholder="65.8008"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Masalan: 65.8008
              </p>
            </div>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Google Maps dan koordinatalarni olish: xaritada mehmonxonani toping, o'ng tugma bosing va koordinatalarni nusxalang.
          </p>

          {/* Xarita preview */}
          {hasValidCoords && (
            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
              <iframe
                src={buildGoogleMapsEmbedUrl(previewLat, previewLng)}
                title="Map preview"
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
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
            <p className="mb-2 text-sm font-medium">Hero desktop video</p>
            {hotelInfo?.heroVideoDesktop && (
              <video
                src={hotelInfo.heroVideoDesktop}
                className="mb-3 aspect-video w-full rounded-lg object-cover"
                controls
              />
            )}
            <input
              type="file"
              accept="video/*"
              disabled={uploadingField === 'desktop'}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                setUploadingField('desktop')
                hotelInfoService
                  .uploadHeroDesktop(file)
                  .then(() => {
                    queryClient.invalidateQueries({ queryKey: ['hotelInfo'] })
                    toast({ description: 'Desktop hero video uploaded' })
                  })
                  .catch(() => {
                    toast({ description: 'Video upload failed', variant: 'destructive' })
                  })
                  .finally(() => setUploadingField(null))
              }}
            />
            {uploadingField === 'desktop' && <p className="mt-1 text-xs text-primary animate-pulse">Yuklanmoqda...</p>}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-2 text-sm font-medium">Hero mobile video</p>
            {hotelInfo?.heroVideoMobile && (
              <video
                src={hotelInfo.heroVideoMobile}
                className="mb-3 aspect-video w-full rounded-lg object-cover"
                controls
              />
            )}
            <input
              type="file"
              accept="video/*"
              disabled={uploadingField === 'mobile'}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                setUploadingField('mobile')
                hotelInfoService
                  .uploadHeroMobile(file)
                  .then(() => {
                    queryClient.invalidateQueries({ queryKey: ['hotelInfo'] })
                    toast({ description: 'Mobile hero video uploaded' })
                  })
                  .catch(() => {
                    toast({ description: 'Video upload failed', variant: 'destructive' })
                  })
                  .finally(() => setUploadingField(null))
              }}
            />
            {uploadingField === 'mobile' && <p className="mt-1 text-xs text-primary animate-pulse">Yuklanmoqda...</p>}
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
