import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import {
  Plus, Trash2, ImagePlus, Pencil, Upload, ArrowRight,
  ChevronLeft, MapPin, Navigation, Info, Camera, Layers,
  CheckCircle2, X, Eye, EyeOff, Star, MousePointerClick,
} from 'lucide-react'
import { roomsService } from '../../services/rooms.service'
import type { PanoramaHotspot, PanoramaScene, Room, RoomPayload } from '../../types'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Skeleton } from '../../components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../../components/ui/dialog'
import { Tour360Viewer } from '../../components/Tour360Viewer'
import { useToast } from '../../components/ui/use-toast'

// ─── Form types ──────────────────────────────────────
interface RoomFormValues {
  uz_name: string; ru_name: string; en_name: string
  uz_description: string; ru_description: string; en_description: string
  uz_amenities: string; ru_amenities: string; en_amenities: string
  pricePerNight: number; currency: string; order: number; isActive: boolean
}
interface SceneFormValues {
  uz_title: string; ru_title: string; en_title: string
  initialYaw: number; initialPitch: number; initialHfov: number
  order: number; isDefault: boolean; isActive: boolean
  targetForwardId: string; targetForwardYaw: number
  targetRightId: string; targetRightYaw: number
  targetBackId: string; targetBackYaw: number
  targetLeftId: string; targetLeftYaw: number
}
interface HotspotFormValues {
  type: 'scene' | 'info'
  uz_label: string; ru_label: string; en_label: string
  yaw: number; pitch: number
  targetSceneId: string; targetYaw: number; targetPitch: number; targetHfov: number
  order: number
}

const roomDefaults: RoomFormValues = {
  uz_name: '', ru_name: '', en_name: '',
  uz_description: '', ru_description: '', en_description: '',
  uz_amenities: '', ru_amenities: '', en_amenities: '',
  pricePerNight: 0, currency: 'UZS', order: 0, isActive: true,
}
const sceneDefaults: SceneFormValues = {
  uz_title: '', ru_title: '', en_title: '',
  initialYaw: 0, initialPitch: 0, initialHfov: 100,
  order: 0, isDefault: false, isActive: true,
  targetForwardId: '', targetForwardYaw: 0,
  targetRightId: '', targetRightYaw: 90,
  targetBackId: '', targetBackYaw: 180,
  targetLeftId: '', targetLeftYaw: -90,
}
const hotspotDefaults: HotspotFormValues = {
  type: 'scene', uz_label: '', ru_label: '', en_label: '',
  yaw: 0, pitch: 0, targetSceneId: '', targetYaw: 0, targetPitch: 0, targetHfov: 100, order: 0,
}

function toRoomForm(r?: Room | null): RoomFormValues {
  if (!r) return roomDefaults
  return {
    uz_name: r.name.uz, ru_name: r.name.ru, en_name: r.name.en,
    uz_description: r.description?.uz ?? '', ru_description: r.description?.ru ?? '', en_description: r.description?.en ?? '',
    uz_amenities: r.amenities?.uz ?? '', ru_amenities: r.amenities?.ru ?? '', en_amenities: r.amenities?.en ?? '',
    pricePerNight: r.pricePerNight, currency: r.currency, order: r.order, isActive: r.isActive,
  }
}
function toSceneForm(s?: PanoramaScene | null): SceneFormValues {
  if (!s) return sceneDefaults
  return {
    uz_title: s.title.uz, ru_title: s.title.ru, en_title: s.title.en,
    initialYaw: s.initialYaw, initialPitch: s.initialPitch, initialHfov: s.initialHfov,
    order: s.order, isDefault: s.isDefault, isActive: s.isActive,
    targetForwardId: s.targetForwardId ?? '', targetForwardYaw: s.targetForwardYaw ?? 0,
    targetRightId: s.targetRightId ?? '', targetRightYaw: s.targetRightYaw ?? 90,
    targetBackId: s.targetBackId ?? '', targetBackYaw: s.targetBackYaw ?? 180,
    targetLeftId: s.targetLeftId ?? '', targetLeftYaw: s.targetLeftYaw ?? -90,
  }
}
function toHotspotForm(h?: PanoramaHotspot | null): HotspotFormValues {
  if (!h) return hotspotDefaults
  return {
    type: h.type, uz_label: h.label.uz, ru_label: h.label.ru, en_label: h.label.en,
    yaw: h.yaw, pitch: h.pitch, targetSceneId: h.targetSceneId ?? '',
    targetYaw: h.targetYaw ?? 0, targetPitch: h.targetPitch ?? 0, targetHfov: h.targetHfov ?? 100, order: h.order,
  }
}

// ─── Step indicator ─────────────────────────────────
function StepIndicator({ step, title, done, active }: {
  step: number; title: string; done: boolean; active: boolean
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${active ? 'bg-primary/10 text-primary' : done ? 'text-green-600' : 'text-muted-foreground'}`}>
      {done ? (
        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
      ) : (
        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${active ? 'bg-primary text-white' : 'border-2 border-muted-foreground/30'}`}>
          {step}
        </div>
      )}
      <span className={`text-sm font-medium ${active ? 'text-primary' : ''}`}>{title}</span>
    </div>
  )
}

// ─── Main component ──────────────────────────────────
export default function AdminRoomEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [langTab, setLangTab] = useState('uz')

  // Dialog states
  const [sceneDialogOpen, setSceneDialogOpen] = useState(false)
  const [hotspotDialogOpen, setHotspotDialogOpen] = useState(false)
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null)
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null)
  const [editingHotspotId, setEditingHotspotId] = useState<string | null>(null)
  const [sceneLangTab, setSceneLangTab] = useState('uz')
  const [hotspotLangTab, setHotspotLangTab] = useState('uz')
  const [placementMode, setPlacementMode] = useState(false)

  const { data: room, isLoading } = useQuery({
    queryKey: ['admin', 'room', id],
    queryFn: () => (id ? roomsService.findOneAdmin(id) : null),
    enabled: !!id,
  })

  const images = useMemo(() => [...(room?.images ?? [])].sort((a, b) => a.order - b.order), [room?.images])
  const scenes = useMemo(() => [...(room?.scenes ?? [])].sort((a, b) => a.order - b.order), [room?.scenes])

  const activeSceneId = useMemo(() => {
    if (!scenes.length) return null
    if (selectedSceneId && scenes.some((s) => s.id === selectedSceneId)) return selectedSceneId
    return scenes.find((s) => s.isDefault)?.id ?? scenes[0].id
  }, [scenes, selectedSceneId])

  const activeScene = scenes.find((s) => s.id === activeSceneId) ?? null
  const editScene = scenes.find((s) => s.id === editingSceneId) ?? null
  const editHotspot = activeScene?.hotspots.find((h) => h.id === editingHotspotId) ?? null

  const roomForm = useForm<RoomFormValues>({ defaultValues: roomDefaults })
  const sceneForm = useForm<SceneFormValues>({ defaultValues: sceneDefaults })
  const hotspotForm = useForm<HotspotFormValues>({ defaultValues: hotspotDefaults })
  const { errors: roomErrors } = roomForm.formState
  const { errors: sceneErrors } = sceneForm.formState
  const hotspotType = useWatch({ control: hotspotForm.control, name: 'type' })

  useEffect(() => { roomForm.reset(toRoomForm(room)) }, [room, roomForm])
  useEffect(() => { sceneForm.reset(toSceneForm(editScene)) }, [editScene, sceneForm])
  useEffect(() => { hotspotForm.reset(toHotspotForm(editHotspot)) }, [editHotspot, hotspotForm])

  const refresh = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: ['admin', 'rooms'] }),
    queryClient.invalidateQueries({ queryKey: ['admin', 'room', id] }),
    queryClient.invalidateQueries({ queryKey: ['rooms'] }),
    queryClient.invalidateQueries({ queryKey: ['room', id] }),
  ])

  // Step tracking
  const stepRoom = !!id
  const stepImages = images.length > 0
  const stepScenes = scenes.some((s) => s.panoramaUrl)

  // ─── Mutations ───
  const { mutate: saveRoom, isPending: savingRoom } = useMutation({
    mutationFn: (d: RoomFormValues) => {
      const p: RoomPayload = {
        name: { uz: d.uz_name, ru: d.ru_name, en: d.en_name },
        description: { uz: d.uz_description, ru: d.ru_description, en: d.en_description },
        amenities: { uz: d.uz_amenities, ru: d.ru_amenities, en: d.en_amenities },
        pricePerNight: d.pricePerNight, currency: d.currency, order: d.order, isActive: d.isActive,
      }
      return id ? roomsService.update(id, p) : roomsService.create(p)
    },
    onSuccess: async (saved) => {
      await refresh()
      toast({ description: 'Xona saqlandi!' })
      navigate(`/admin/rooms/${saved.id}/edit`)
    },
    onError: () => toast({ description: 'Xatolik yuz berdi', variant: 'destructive' }),
  })

  const { mutate: saveScene, isPending: savingScene } = useMutation({
    mutationFn: (d: SceneFormValues) => {
      if (!id) throw new Error('Room kerak')
      const p = {
        title: { uz: d.uz_title, ru: d.ru_title, en: d.en_title },
        initialYaw: d.initialYaw, initialPitch: d.initialPitch, initialHfov: d.initialHfov,
        order: d.order, isDefault: d.isDefault, isActive: d.isActive,
        targetForwardId: d.targetForwardId || null,
        targetForwardYaw: d.targetForwardId ? d.targetForwardYaw : null,
        targetRightId: d.targetRightId || null,
        targetRightYaw: d.targetRightId ? d.targetRightYaw : null,
        targetBackId: d.targetBackId || null,
        targetBackYaw: d.targetBackId ? d.targetBackYaw : null,
        targetLeftId: d.targetLeftId || null,
        targetLeftYaw: d.targetLeftId ? d.targetLeftYaw : null,
      }
      return editingSceneId ? roomsService.updateScene(id, editingSceneId, p) : roomsService.createScene(id, p)
    },
    onSuccess: async (saved) => {
      await refresh()
      setEditingSceneId(null)
      setSelectedSceneId(saved.id)
      setSceneDialogOpen(false)
      toast({ description: editingSceneId ? 'Scene yangilandi!' : 'Scene yaratildi!' })
    },
    onError: () => toast({ description: 'Scene xatolik', variant: 'destructive' }),
  })

  const { mutate: saveHotspot, isPending: savingHotspot } = useMutation({
    mutationFn: (d: HotspotFormValues) => {
      if (!id || !activeSceneId) throw new Error('Scene kerak')
      const p = {
        type: d.type, label: { uz: d.uz_label, ru: d.ru_label, en: d.en_label },
        yaw: d.yaw, pitch: d.pitch,
        targetSceneId: d.type === 'scene' ? d.targetSceneId : undefined,
        targetYaw: d.type === 'scene' ? d.targetYaw : undefined,
        targetPitch: d.type === 'scene' ? d.targetPitch : undefined,
        targetHfov: d.type === 'scene' ? d.targetHfov : undefined,
        order: d.order,
      }
      return editingHotspotId
        ? roomsService.updateHotspot(id, activeSceneId, editingHotspotId, p)
        : roomsService.createHotspot(id, activeSceneId, p)
    },
    onSuccess: async () => {
      await refresh()
      setEditingHotspotId(null)
      hotspotForm.reset(hotspotDefaults)
      setHotspotDialogOpen(false)
      toast({ description: editingHotspotId ? 'Hotspot yangilandi!' : 'Hotspot qo\'shildi!' })
    },
    onError: () => toast({ description: 'Hotspot xatolik', variant: 'destructive' }),
  })

  // ─── Helpers ───
  const uploadImages = async (files: FileList | null) => {
    if (!id || !files?.length) return
    try { await roomsService.addImages(id, Array.from(files)); await refresh(); toast({ description: 'Rasmlar yuklandi!' }) }
    catch { toast({ description: 'Yuklash xatolik', variant: 'destructive' }) }
  }
  const deleteImage = async (imgId: string) => {
    if (!id) return
    try { await roomsService.deleteImage(id, imgId); await refresh(); toast({ description: "Rasm o'chirildi" }) }
    catch { toast({ description: 'Xatolik', variant: 'destructive' }) }
  }
  const uploadSceneFile = async (sceneId: string, type: 'panorama' | 'thumbnail', file: File | null) => {
    if (!id || !file) return
    try {
      if (type === 'panorama') await roomsService.uploadScenePanorama(id, sceneId, file)
      else await roomsService.uploadSceneThumbnail(id, sceneId, file)
      await refresh()
      toast({ description: type === 'panorama' ? '360° rasm yuklandi!' : 'Thumbnail yuklandi!' })
    } catch { toast({ description: 'Yuklash xatolik', variant: 'destructive' }) }
  }
  const deleteScene = async (sceneId: string) => {
    if (!id) return
    try {
      await roomsService.deleteScene(id, sceneId); await refresh()
      if (selectedSceneId === sceneId) setSelectedSceneId(null)
      toast({ description: "Scene o'chirildi" })
    } catch { toast({ description: 'Xatolik', variant: 'destructive' }) }
  }
  const deleteHotspot = async (hotspotId: string) => {
    if (!id || !activeSceneId) return
    try {
      await roomsService.deleteHotspot(id, activeSceneId, hotspotId); await refresh()
      toast({ description: "Hotspot o'chirildi" })
    } catch { toast({ description: 'Xatolik', variant: 'destructive' }) }
  }

  const openSceneDialog = (sceneId?: string) => {
    setEditingSceneId(sceneId ?? null)
    if (!sceneId) sceneForm.reset(sceneDefaults)
    setSceneLangTab('uz')
    setSceneDialogOpen(true)
  }
  const openHotspotDialog = (hotspotId?: string) => {
    setEditingHotspotId(hotspotId ?? null)
    if (!hotspotId) hotspotForm.reset(hotspotDefaults)
    setHotspotLangTab('uz')
    setHotspotDialogOpen(true)
  }

  if (isLoading && id) return <div className="p-8"><Skeleton className="h-96" /></div>

  return (
    <div className="max-w-6xl p-8 space-y-8">
      {/* ── Header ── */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/rooms')} className="mb-3 -ml-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="mr-1 h-4 w-4" /> Barcha xonalar
        </Button>
        <h1 className="text-3xl font-bold">{id ? room?.name?.uz || "Xonani tahrirlash" : "Yangi xona qo'shish"}</h1>
        {!id && <p className="text-muted-foreground mt-1">Xona ma'lumotlarini to'ldiring, keyin rasmlar va 360° tur qo'shasiz</p>}
      </div>

      {/* ── Progress steps ── */}
      {id && (
        <div className="flex flex-wrap gap-2 p-1 rounded-2xl bg-slate-50 border">
          <StepIndicator step={1} title="Ma'lumotlar" done={stepRoom} active={!stepImages && !stepScenes} />
          <StepIndicator step={2} title="Rasmlar" done={stepImages} active={stepRoom && !stepScenes} />
          <StepIndicator step={3} title="360° Sceneler" done={stepScenes} active={stepRoom && stepImages && !stepScenes} />
          <StepIndicator step={4} title="Yo'nalishlar" done={false} active={stepScenes} />
        </div>
      )}

      {/* ═══════════ QADAM 1: Xona ma'lumotlari ═══════════ */}
      <section className="rounded-2xl border border-slate-200 p-6 bg-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <Info className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Xona ma'lumotlari</h2>
            <p className="text-sm text-muted-foreground">Nomi, tavsifi, narxi va qulayliklari</p>
          </div>
        </div>

        <form onSubmit={roomForm.handleSubmit((d) => saveRoom(d))} className="space-y-6">
          <Tabs value={langTab} onValueChange={setLangTab}>
            <TabsList>
              <TabsTrigger value="uz">O'zbekcha</TabsTrigger>
              <TabsTrigger value="ru">Ruscha</TabsTrigger>
              <TabsTrigger value="en">Inglizcha</TabsTrigger>
            </TabsList>
            {(['uz', 'ru', 'en'] as const).map((lang) => (
              <TabsContent key={lang} value={lang} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Xona nomi ({lang.toUpperCase()}) {lang === 'uz' && <span className="text-red-400">*</span>}
                  </label>
                  <Input
                    {...roomForm.register(`${lang}_name`, lang === 'uz' ? { required: 'Xona nomi majburiy' } : undefined)}
                    placeholder={lang === 'uz' ? "Masalan: Oilaviy uy" : lang === 'ru' ? "Семейный дом" : "Family House"}
                  />
                  {lang === 'uz' && roomErrors.uz_name && (
                    <p className="mt-1 text-xs text-red-500">{roomErrors.uz_name.message}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Tavsif ({lang.toUpperCase()})</label>
                  <Textarea {...roomForm.register(`${lang}_description`)} rows={3} placeholder="Xona haqida qisqa ma'lumot" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Qulayliklar ({lang.toUpperCase()})</label>
                  <Textarea {...roomForm.register(`${lang}_amenities`)} rows={2} placeholder="Wi-Fi, TV, Konditsioner (vergul bilan ajrating)" />
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Narx (tuniga) <span className="text-red-400">*</span></label>
              <Input
                {...roomForm.register('pricePerNight', {
                  valueAsNumber: true,
                  required: 'Narx majburiy',
                  min: { value: 0, message: "Narx 0 dan katta bo'lsin" },
                })}
                type="number"
                placeholder="350000"
              />
              {roomErrors.pricePerNight && (
                <p className="mt-1 text-xs text-red-500">{roomErrors.pricePerNight.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Valyuta</label>
              <Input {...roomForm.register('currency')} placeholder="UZS" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tartib raqami</label>
              <Input {...roomForm.register('order', { valueAsNumber: true })} type="number" />
            </div>
            <label className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm cursor-pointer hover:bg-slate-50 transition-colors">
              <input type="checkbox" {...roomForm.register('isActive')} className="rounded" />
              Saytda ko'rinsin
            </label>
          </div>

          <Button type="submit" disabled={savingRoom} size="lg">
            {savingRoom ? 'Saqlanmoqda...' : id ? 'Saqlash' : "Xonani yaratish va davom etish"}
          </Button>
        </form>
      </section>

      {/* ── Avval saqlang ── */}
      {!id && (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center text-muted-foreground">
          <Layers className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <p className="text-lg font-medium">Avval xonani saqlang</p>
          <p className="text-sm mt-1">Keyin rasmlar, 360° sceneler va hotspotlar qo'sha olasiz</p>
        </div>
      )}

      {id && (
        <>
          {/* ═══════════ QADAM 2: Xona rasmlari ═══════════ */}
          <section className="rounded-2xl border border-slate-200 p-6 bg-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <ImagePlus className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Xona rasmlari</h2>
                  <p className="text-sm text-muted-foreground">Foydalanuvchilar galereyada ko'radigan rasmlar</p>
                </div>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
                <Upload className="h-4 w-4" />
                Rasm yuklash
                <input type="file" accept="image/*" multiple className="hidden"
                  onChange={(e) => { uploadImages(e.target.files); e.target.value = '' }}
                />
              </label>
            </div>

            {images.length === 0 ? (
              <label className="flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed border-slate-300 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                <Upload className="h-8 w-8 text-slate-300 mb-2" />
                <span className="text-sm font-medium text-muted-foreground">Rasmlarni bu yerga yuklang</span>
                <span className="text-xs text-muted-foreground mt-1">JPG, PNG — bir nechta rasm tanlash mumkin</span>
                <input type="file" accept="image/*" multiple className="hidden"
                  onChange={(e) => { uploadImages(e.target.files); e.target.value = '' }}
                />
              </label>
            ) : (
              <div className="flex flex-wrap gap-3">
                {images.map((img, i) => (
                  <div key={img.id} className="relative group w-36 h-24 rounded-xl overflow-hidden border hover:shadow-md transition-shadow">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium">
                        Asosiy
                      </span>
                    )}
                    <button
                      onClick={() => deleteImage(img.id)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ═══════════ QADAM 3: 360° Sceneler ═══════════ */}
          <section className="rounded-2xl border border-slate-200 p-6 bg-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                  <Camera className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">360° Sceneler</h2>
                  <p className="text-sm text-muted-foreground">Uyning har bir xonasi uchun alohida scene yarating</p>
                </div>
              </div>
              <Button onClick={() => openSceneDialog()} className="gap-2">
                <Plus className="h-4 w-4" /> Scene qo'shish
              </Button>
            </div>

            {/* Explanation box */}
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 mb-6 text-sm text-amber-800">
              <strong>Qanday ishlaydi:</strong> Har bir xona (koridor, oshxona, yotoqxona...) alohida scene bo'ladi.
              Scene yaratib, unga Insta360 (.insp) fayl yuklang — tizim avtomatik 360° panoramaga aylantiradi.
            </div>

            {scenes.length === 0 ? (
              <button
                onClick={() => openSceneDialog()}
                className="flex flex-col items-center justify-center w-full h-44 rounded-xl border-2 border-dashed border-slate-300 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
              >
                <Camera className="h-10 w-10 text-slate-300 mb-3" />
                <span className="text-sm font-medium text-muted-foreground">Birinchi scene yarating</span>
                <span className="text-xs text-muted-foreground mt-1">Masalan: "Koridor", "Oshxona", "Yotoqxona"</span>
              </button>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {scenes.map((scene) => (
                  <div
                    key={scene.id}
                    className={`relative rounded-xl border-2 overflow-hidden transition-all ${
                      activeSceneId === scene.id
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Thumbnail area */}
                    <div
                      className="h-28 bg-slate-100 cursor-pointer relative"
                      onClick={() => setSelectedSceneId(scene.id)}
                    >
                      {scene.thumbnailUrl || scene.panoramaUrl ? (
                        <img src={scene.thumbnailUrl || scene.panoramaUrl!} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-300">
                          <Camera className="h-8 w-8" />
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex gap-1.5">
                        {scene.isDefault && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-medium">
                            <Star className="h-2.5 w-2.5" /> Boshlang'ich
                          </span>
                        )}
                        {!scene.isActive && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-600 text-white text-[10px] font-medium">
                            <EyeOff className="h-2.5 w-2.5" /> Yashirin
                          </span>
                        )}
                      </div>

                      {!scene.panoramaUrl && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white text-xs font-medium bg-amber-500 px-2.5 py-1 rounded-full">
                            360° rasm kerak
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <p className="font-semibold text-sm mb-2">{scene.title.uz || 'Nomsiz scene'}</p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {scene.hotspots?.length ?? 0} ta hotspot
                        </span>
                        <div className="flex items-center gap-1">
                          {/* Upload panorama */}
                          <label
                            className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-400 hover:text-primary transition-colors"
                            title="360° rasm yuklash (.insp)"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Upload className="h-3.5 w-3.5" />
                            <input type="file" accept=".insp,image/*" className="hidden"
                              onChange={(e) => { e.stopPropagation(); uploadSceneFile(scene.id, 'panorama', e.target.files?.[0] ?? null); e.target.value = '' }}
                            />
                          </label>
                          {/* Edit */}
                          <button
                            onClick={(e) => { e.stopPropagation(); openSceneDialog(scene.id) }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                            title="Tahrirlash"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteScene(scene.id) }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add scene card */}
                <button
                  onClick={() => openSceneDialog()}
                  className="flex flex-col items-center justify-center h-full min-h-[180px] rounded-xl border-2 border-dashed border-slate-300 hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <Plus className="h-6 w-6 mb-2 text-slate-400" />
                  <span className="text-sm font-medium text-muted-foreground">Yana scene qo'shish</span>
                </button>
              </div>
            )}
          </section>

          {/* ═══════════ QADAM 4: 360° Preview va Hotspotlar ═══════════ */}
          {scenes.some((s) => s.panoramaUrl) && (
            <section className="rounded-2xl border border-slate-200 p-6 bg-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                  <Navigation className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Hotspotlar — xonalarni bog'lash</h2>
                  <p className="text-sm text-muted-foreground">Panoramada kerakli joyni bosing — hotspot o'sha yerda paydo bo'ladi</p>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 mb-6 text-sm text-blue-800 flex items-start gap-2">
                <MousePointerClick className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Qanday ishlaydi:</strong> Panoramada eshik yoki o'tish joyini bosing — pitch va yaw avtomatik olinadi.
                  Hotspot noto'g'ri joyda bo'lsa, panoramani to'g'ri joyga olib bosing — koordinata yangilanadi.
                </span>
              </div>

              {/* Scene tabs */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {scenes.filter((s) => s.panoramaUrl).map((scene) => (
                  <button
                    key={scene.id}
                    onClick={() => setSelectedSceneId(scene.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeSceneId === scene.id
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {scene.title.uz || 'Nomsiz'}
                    {(scene.hotspots?.length ?? 0) > 0 && (
                      <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        activeSceneId === scene.id ? 'bg-white/20' : 'bg-slate-200'
                      }`}>
                        {scene.hotspots.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Hotspot qo'shish / joyini o'zgartirish tugmalari */}
              <div className="flex items-center gap-3 mb-4">
                <Button
                  variant={placementMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    if (placementMode) {
                      setPlacementMode(false)
                    } else {
                      // Yangi hotspot uchun
                      setEditingHotspotId(null)
                      hotspotForm.reset(hotspotDefaults)
                      setPlacementMode(true)
                    }
                  }}
                  className={`gap-2 ${placementMode ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                >
                  <MousePointerClick className="h-4 w-4" />
                  {placementMode
                    ? editingHotspotId
                      ? "Yangi joyni bosing — hotspot ko'chadi"
                      : "Panoramada joyni bosing — hotspot paydo bo'ladi"
                    : "Hotspot qo'shish"
                  }
                </Button>
                {placementMode && (
                  <button
                    onClick={() => setPlacementMode(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Bekor qilish
                  </button>
                )}
              </div>

              {/* 360 Preview */}
              <div className={`rounded-xl overflow-hidden border-2 mb-6 transition-colors ${placementMode ? 'border-orange-400 shadow-[0_0_0_2px_rgba(251,146,60,0.3)]' : 'border-slate-200'}`}>
                <Tour360Viewer
                  scenes={scenes}
                  initialSceneId={activeSceneId ?? undefined}
                  onSceneChange={setSelectedSceneId}
                  onCoordinateSelect={placementMode ? ({ pitch, yaw, sceneId }) => {
                    setSelectedSceneId(sceneId)
                    if (editingHotspotId) {
                      // Mavjud hotspot ni ko'chirish
                      hotspotForm.setValue('pitch', pitch)
                      hotspotForm.setValue('yaw', yaw)
                      setHotspotDialogOpen(true)
                    } else {
                      // Yangi hotspot yaratish
                      hotspotForm.reset(hotspotDefaults)
                      hotspotForm.setValue('pitch', pitch)
                      hotspotForm.setValue('yaw', yaw)
                      setHotspotDialogOpen(true)
                    }
                    setPlacementMode(false)
                  } : undefined}
                  heightClassName="h-[500px]"
                />
              </div>

              {/* Hotspot list */}
              {activeScene && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">
                      {activeScene.title.uz} — hotspotlar
                      <span className="text-muted-foreground font-normal ml-2">
                        ({activeScene.hotspots?.length ?? 0} ta)
                      </span>
                    </h3>
                  </div>

                  {(activeScene.hotspots?.length ?? 0) === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border rounded-xl border-dashed">
                      <Navigation className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm font-medium">Hali hotspot yo'q</p>
                      <p className="text-xs mt-1">Tepada "Hotspot qo'shish" ni bosing, keyin panoramada joyni bosing</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {[...activeScene.hotspots].sort((a, b) => a.order - b.order).map((h) => {
                        const target = scenes.find((s) => s.id === h.targetSceneId)
                        return (
                          <div key={h.id} className="flex items-center justify-between rounded-xl border px-4 py-3 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                h.type === 'scene' ? 'bg-primary/10 text-primary' : 'bg-blue-100 text-blue-600'
                              }`}>
                                {h.type === 'scene' ? <ArrowRight className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{h.label.uz || 'Nomsiz hotspot'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {h.type === 'scene' && target
                                    ? `→ ${target.title.uz}`
                                    : h.type === 'info'
                                    ? "Ma'lumot"
                                    : 'Manzil tanlanmagan'
                                  }
                                  <span className="ml-2 text-slate-400">yaw: {h.yaw.toFixed(1)}°, pitch: {h.pitch.toFixed(1)}°</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                title="Joyini o'zgartirish — panoramada bosing"
                                onClick={() => {
                                  setEditingHotspotId(h.id)
                                  hotspotForm.reset(toHotspotForm(h))
                                  setPlacementMode(true)
                                }}
                                className="p-1.5 rounded-lg hover:bg-orange-50 text-slate-400 hover:text-orange-600 transition-colors"
                              >
                                <MapPin className="h-3.5 w-3.5" />
                              </button>
                              <button
                                title="Tahrirlash"
                                onClick={() => openHotspotDialog(h.id)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                title="O'chirish"
                                onClick={() => deleteHotspot(h.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* ═══════════ DIALOG: Scene yaratish/tahrirlash ═══════════ */}
      <Dialog open={sceneDialogOpen} onOpenChange={setSceneDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSceneId ? "Scene tahrirlash" : "Yangi scene qo'shish"}</DialogTitle>
            <DialogDescription>
              {editingSceneId
                ? "Scene ma'lumotlarini o'zgartiring"
                : "Uyning har bir xonasi uchun alohida scene yarating. Masalan: Koridor, Oshxona, Yotoqxona"
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={sceneForm.handleSubmit((d) => saveScene(d))} className="space-y-5">
            {/* Scene name tabs */}
            <Tabs value={sceneLangTab} onValueChange={setSceneLangTab}>
              <TabsList className="w-full">
                <TabsTrigger value="uz" className="flex-1">O'zbekcha</TabsTrigger>
                <TabsTrigger value="ru" className="flex-1">Ruscha</TabsTrigger>
                <TabsTrigger value="en" className="flex-1">Inglizcha</TabsTrigger>
              </TabsList>
              {(['uz', 'ru', 'en'] as const).map((lang) => (
                <TabsContent key={lang} value={lang} className="mt-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Scene nomi ({lang.toUpperCase()}) {lang === 'uz' && <span className="text-red-400">*</span>}
                    </label>
                    <Input
                      {...sceneForm.register(`${lang}_title`, lang === 'uz' ? { required: "Scene nomi majburiy" } : undefined)}
                      placeholder={lang === 'uz' ? "Masalan: Koridor" : lang === 'ru' ? "Коридор" : "Hallway"}
                    />
                    {lang === 'uz' && sceneErrors.uz_title && (
                      <p className="mt-1 text-xs text-red-500">{sceneErrors.uz_title.message}</p>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Camera settings */}
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Boshlang'ich kamera pozitsiyasi (ixtiyoriy)
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Yaw (gorizontal)</label>
                  <Input {...sceneForm.register('initialYaw', { valueAsNumber: true })} type="number" step="0.1" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Pitch (vertikal)</label>
                  <Input {...sceneForm.register('initialPitch', { valueAsNumber: true })} type="number" step="0.1" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Zoom (HFOV)</label>
                  <Input {...sceneForm.register('initialHfov', { valueAsNumber: true })} type="number" step="0.1" />
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-50 transition-colors">
                <input type="checkbox" {...sceneForm.register('isDefault')} className="rounded" />
                <Star className="h-3.5 w-3.5 text-amber-500" />
                Boshlang'ich scene
              </label>
              <label className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-50 transition-colors">
                <input type="checkbox" {...sceneForm.register('isActive')} className="rounded" />
                <Eye className="h-3.5 w-3.5 text-green-500" />
                Saytda ko'rinsin
              </label>
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Tartib:</label>
                <Input {...sceneForm.register('order', { valueAsNumber: true })} type="number" className="w-20" />
              </div>
            </div>

            {/* Yo'nalishlar — 4 tomondan boshqa scene ga o'tish */}
            {editingSceneId && scenes.length > 1 && (
              <div className="pt-3 border-t">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Navigation className="h-4 w-4" />
                  Yo'nalishlar (qaysi scene ga o'tadi)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { field: 'targetForwardId' as const, yawField: 'targetForwardYaw' as const, label: '⬆ Oldinga', defaultYaw: 0 },
                    { field: 'targetBackId' as const, yawField: 'targetBackYaw' as const, label: '⬇ Ortga', defaultYaw: 180 },
                    { field: 'targetLeftId' as const, yawField: 'targetLeftYaw' as const, label: '⬅ Chapga', defaultYaw: -90 },
                    { field: 'targetRightId' as const, yawField: 'targetRightYaw' as const, label: '➡ O\'ngga', defaultYaw: 90 },
                  ]).map(({ field, yawField, label, defaultYaw }) => (
                    <div key={field}>
                      <label className="mb-1 block text-xs font-medium">{label}</label>
                      <select
                        {...sceneForm.register(field)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        onChange={(e) => {
                          sceneForm.setValue(field, e.target.value)
                          if (e.target.value && !sceneForm.getValues(yawField)) {
                            sceneForm.setValue(yawField, defaultYaw)
                          }
                        }}
                      >
                        <option value="">— yo'q —</option>
                        {scenes
                          .filter((s) => s.id !== editingSceneId)
                          .map((s) => (
                            <option key={s.id} value={s.id}>{s.title.uz || s.title.ru || s.title.en}</option>
                          ))
                        }
                      </select>
                      {sceneForm.watch(field) && (
                        <div className="mt-1">
                          <label className="block text-[10px] text-muted-foreground">Strelka joyi (yaw°)</label>
                          <Input
                            {...sceneForm.register(yawField, { valueAsNumber: true })}
                            type="number" step="1" className="h-8 text-xs"
                            placeholder={`${defaultYaw}°`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Yaw — strelka panoramada qayerda ko'rinishini belgilaydi (0° = markaz, 90° = o'ng, -90° = chap, 180° = orqa)
                </p>
              </div>
            )}

            {/* Upload for existing scene */}
            {editingSceneId && (
              <div className="flex gap-3 pt-3 border-t">
                <label className="inline-flex items-center gap-2 cursor-pointer rounded-lg border px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors">
                  <Camera className="h-4 w-4 text-violet-500" />
                  360° rasm yuklash (.insp)
                  <input type="file" accept=".insp,image/*" className="hidden"
                    onChange={(e) => { uploadSceneFile(editingSceneId, 'panorama', e.target.files?.[0] ?? null); e.target.value = '' }}
                  />
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer rounded-lg border px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors">
                  <ImagePlus className="h-4 w-4 text-emerald-500" />
                  Thumbnail
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => { uploadSceneFile(editingSceneId, 'thumbnail', e.target.files?.[0] ?? null); e.target.value = '' }}
                  />
                </label>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSceneDialogOpen(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={savingScene}>
                {savingScene ? 'Saqlanmoqda...' : editingSceneId ? 'Saqlash' : "Yaratish"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══════════ DIALOG: Hotspot yaratish/tahrirlash ═══════════ */}
      <Dialog open={hotspotDialogOpen} onOpenChange={setHotspotDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingHotspotId ? "Hotspot tahrirlash" : "Yangi hotspot"}</DialogTitle>
            <DialogDescription>
              Panoramada bosgan joyingiz koordinatalari avtomatik to'ldirildi
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={hotspotForm.handleSubmit((d) => {
            if (d.type === 'scene' && !d.targetSceneId) {
              toast({ description: "Qaysi scene'ga o'tishini tanlang!", variant: 'destructive' })
              return
            }
            saveHotspot(d)
          })} className="space-y-5">

            {/* Type selection */}
            <div>
              <label className="mb-2 block text-sm font-medium">Hotspot turi</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${
                  hotspotType === 'scene' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input type="radio" value="scene" {...hotspotForm.register('type')} className="sr-only" />
                  <ArrowRight className={`h-5 w-5 ${hotspotType === 'scene' ? 'text-primary' : 'text-slate-400'}`} />
                  <div>
                    <p className="text-sm font-medium">Boshqa xonaga o'tish</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${
                  hotspotType === 'info' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input type="radio" value="info" {...hotspotForm.register('type')} className="sr-only" />
                  <Info className={`h-5 w-5 ${hotspotType === 'info' ? 'text-blue-500' : 'text-slate-400'}`} />
                  <div>
                    <p className="text-sm font-medium">Ma'lumot ko'rsatish</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Labels */}
            <Tabs value={hotspotLangTab} onValueChange={setHotspotLangTab}>
              <TabsList className="w-full">
                <TabsTrigger value="uz" className="flex-1">UZ</TabsTrigger>
                <TabsTrigger value="ru" className="flex-1">RU</TabsTrigger>
                <TabsTrigger value="en" className="flex-1">EN</TabsTrigger>
              </TabsList>
              {(['uz', 'ru', 'en'] as const).map((lang) => (
                <TabsContent key={lang} value={lang} className="mt-3">
                  <Input
                    {...hotspotForm.register(`${lang}_label`)}
                    placeholder={hotspotType === 'scene' ? "Masalan: Oshxonaga o'tish" : "Masalan: Konditsioner"}
                  />
                </TabsContent>
              ))}
            </Tabs>

            {/* Koordinatalar (avtomatik to'ldiriladi) */}
            <div className="rounded-lg bg-slate-50 border px-4 py-3">
              <label className="mb-2 block text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Koordinatalar (panoramada bosib o'zgartirish mumkin)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] text-muted-foreground">Yaw (gorizontal °)</label>
                  <Input {...hotspotForm.register('yaw', { valueAsNumber: true })} type="number" step="any" className="h-9" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-muted-foreground">Pitch (vertikal °)</label>
                  <Input {...hotspotForm.register('pitch', { valueAsNumber: true })} type="number" step="any" className="h-9" />
                </div>
              </div>
            </div>

            {/* Target scene */}
            {hotspotType === 'scene' && (
              <div>
                <label className="mb-2 block text-sm font-medium">Qaysi xonaga o'tsin?</label>
                <div className="grid grid-cols-2 gap-2">
                  {scenes.filter((s) => s.id !== activeScene?.id).map((s) => {
                    const selected = hotspotForm.watch('targetSceneId') === s.id
                    return (
                      <button
                        key={s.id} type="button"
                        onClick={() => hotspotForm.setValue('targetSceneId', s.id)}
                        className={`text-left rounded-xl border-2 p-3 transition-all ${
                          selected ? 'border-primary bg-primary/5 shadow-[0_0_0_1px_var(--primary)]' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {selected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                          <p className={`text-sm font-medium ${selected ? 'text-primary' : ''}`}>{s.title.uz || 'Nomsiz'}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Tartib:</label>
              <Input {...hotspotForm.register('order', { valueAsNumber: true })} type="number" className="w-20 h-9" />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setHotspotDialogOpen(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={savingHotspot}>
                {savingHotspot ? 'Saqlanmoqda...' : editingHotspotId ? 'Saqlash' : "Qo'shish"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
