import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import {
  Plus, Trash2, ImagePlus, Pencil, Upload, Eye, ArrowRight,
  ChevronLeft, MapPin, Navigation, Info, Camera, Layers,
} from 'lucide-react'
import { roomsService } from '../../services/rooms.service'
import type { PanoramaHotspot, PanoramaScene, Room, RoomPayload } from '../../types'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Skeleton } from '../../components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
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

// ─── Step header ─────────────────────────────────────
function StepHeader({ step, title, description, icon: Icon }: {
  step: number; title: string; description: string; icon: React.ElementType
}) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white font-bold text-sm">
        {step}
      </div>
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
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
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null)
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null)
  const [editingHotspotId, setEditingHotspotId] = useState<string | null>(null)
  const [showSceneForm, setShowSceneForm] = useState(false)
  const [showHotspotForm, setShowHotspotForm] = useState(false)
  const sceneFormRef = useRef<HTMLDivElement>(null)
  const hotspotFormRef = useRef<HTMLDivElement>(null)

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
      }
      return editingSceneId ? roomsService.updateScene(id, editingSceneId, p) : roomsService.createScene(id, p)
    },
    onSuccess: async (saved) => {
      await refresh()
      setEditingSceneId(saved.id); setSelectedSceneId(saved.id)
      setShowSceneForm(false)
      toast({ description: 'Scene saqlandi!' })
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
      setEditingHotspotId(null); hotspotForm.reset(hotspotDefaults)
      setShowHotspotForm(false)
      toast({ description: 'Hotspot saqlandi!' })
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
      if (editingSceneId === sceneId) { setEditingSceneId(null); setShowSceneForm(false) }
      if (selectedSceneId === sceneId) setSelectedSceneId(null)
      toast({ description: "Scene o'chirildi" })
    } catch { toast({ description: 'Xatolik', variant: 'destructive' }) }
  }
  const deleteHotspot = async (hotspotId: string) => {
    if (!id || !activeSceneId) return
    try {
      await roomsService.deleteHotspot(id, activeSceneId, hotspotId); await refresh()
      if (editingHotspotId === hotspotId) { setEditingHotspotId(null); setShowHotspotForm(false) }
      toast({ description: "Hotspot o'chirildi" })
    } catch { toast({ description: 'Xatolik', variant: 'destructive' }) }
  }

  const openSceneEditor = (sceneId?: string) => {
    setEditingSceneId(sceneId ?? null)
    if (!sceneId) sceneForm.reset(sceneDefaults)
    setShowSceneForm(true)
    setTimeout(() => sceneFormRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }
  const openHotspotEditor = (hotspotId?: string) => {
    setEditingHotspotId(hotspotId ?? null)
    if (!hotspotId) hotspotForm.reset(hotspotDefaults)
    setShowHotspotForm(true)
    setTimeout(() => hotspotFormRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  if (isLoading && id) return <div className="p-8"><Skeleton className="h-96" /></div>

  return (
    <div className="max-w-6xl p-8 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/rooms')} className="mb-3">
            <ChevronLeft className="mr-1 h-4 w-4" /> Xonalar
          </Button>
          <h1 className="text-3xl font-bold">{id ? "Xonani tahrirlash" : "Yangi xona qo'shish"}</h1>
        </div>
      </div>

      {/* ═══════════ QADAM 1: Xona ma'lumotlari ═══════════ */}
      <div className="rounded-2xl border border-slate-200 p-6 bg-white">
        <StepHeader step={1} title="Xona ma'lumotlari" description="Xona nomi, tavsifi, narxi va qulayliklarini kiriting" icon={Info} />

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
                  <label className="mb-1.5 block text-sm font-medium">Xona nomi ({lang.toUpperCase()})</label>
                  <Input {...roomForm.register(`${lang}_name`)} placeholder="Masalan: Lyuks xona" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Tavsif ({lang.toUpperCase()})</label>
                  <Textarea {...roomForm.register(`${lang}_description`)} rows={3} placeholder="Xona haqida qisqa ma'lumot" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Qulayliklar ({lang.toUpperCase()})</label>
                  <Textarea {...roomForm.register(`${lang}_amenities`)} rows={2} placeholder="Wi-Fi, TV, Konditsioner" />
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Narx (tuniga)</label>
              <Input {...roomForm.register('pricePerNight', { valueAsNumber: true })} type="number" placeholder="350000" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Valyuta</label>
              <Input {...roomForm.register('currency')} placeholder="UZS" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tartib</label>
              <Input {...roomForm.register('order', { valueAsNumber: true })} type="number" />
            </div>
            <label className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm cursor-pointer">
              <input type="checkbox" {...roomForm.register('isActive')} className="rounded" />
              Saytda ko'rinsin
            </label>
          </div>

          <Button type="submit" disabled={savingRoom}>
            {savingRoom ? 'Saqlanmoqda...' : id ? 'Yangilash' : "Xonani yaratish"}
          </Button>
        </form>
      </div>

      {!id && (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center text-muted-foreground">
          <p className="text-lg font-medium">Avval xonani saqlang</p>
          <p className="text-sm mt-1">Keyin rasmlar, 360° sceneler va hotspotlar qo'sha olasiz</p>
        </div>
      )}

      {id && (
        <>
          {/* ═══════════ QADAM 2: Xona rasmlari ═══════════ */}
          <div className="rounded-2xl border border-slate-200 p-6 bg-white">
            <StepHeader step={2} title="Xona rasmlari" description="Oddiy rasmlar — foydalanuvchilar xona sahifasida ko'radi" icon={ImagePlus} />

            <div className="flex flex-wrap gap-4">
              {images.map((img) => (
                <div key={img.id} className="relative group w-40 h-28 rounded-xl overflow-hidden border">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => deleteImage(img.id)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}

              <label className="flex w-40 h-28 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 cursor-pointer hover:border-primary hover:text-primary transition-colors">
                <div className="text-center">
                  <Upload className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-xs">Rasm yuklash</span>
                </div>
                <input type="file" accept="image/*" multiple className="hidden"
                  onChange={(e) => { uploadImages(e.target.files); e.target.value = '' }}
                />
              </label>
            </div>
          </div>

          {/* ═══════════ QADAM 3: 360° Sceneler ═══════════ */}
          <div className="rounded-2xl border border-slate-200 p-6 bg-white">
            <StepHeader step={3} title="360° Sceneler" description="Har bir xona uchun bir nechta 360° panorama scene yarating (masalan: kirish, yotoqxona, hammom)" icon={Camera} />

            {/* Scene cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {scenes.map((scene) => (
                <div
                  key={scene.id}
                  onClick={() => setSelectedSceneId(scene.id)}
                  className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all ${
                    activeSceneId === scene.id ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="h-24 rounded-lg overflow-hidden bg-slate-100 mb-3">
                    {scene.thumbnailUrl || scene.panoramaUrl ? (
                      <img src={scene.thumbnailUrl || scene.panoramaUrl!} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-300">
                        <Camera className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  <p className="font-semibold text-sm">{scene.title.uz || 'Nomsiz scene'}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {scene.isDefault && <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">Boshlang'ich</span>}
                    <span>{scene.hotspots?.length ?? 0} hotspot</span>
                    {!scene.panoramaUrl && <span className="text-amber-500">⚠ 360° rasm yo'q</span>}
                  </div>

                  {/* Upload 360 + actions */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}>
                      <Camera className="h-3.5 w-3.5" />
                      {scene.panoramaUrl ? '360° rasm almashtirish' : '360° rasm yuklash'}
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => { e.stopPropagation(); uploadSceneFile(scene.id, 'panorama', e.target.files?.[0] ?? null); e.target.value = '' }}
                      />
                    </label>
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); openSceneEditor(scene.id) }}
                        className="p-1.5 rounded-lg hover:bg-slate-100">
                        <Pencil className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteScene(scene.id) }}
                        className="p-1.5 rounded-lg hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add scene button */}
              <button
                onClick={() => openSceneEditor()}
                className="flex flex-col items-center justify-center h-44 rounded-xl border-2 border-dashed border-slate-300 hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Yangi scene qo'shish</span>
              </button>
            </div>

            {/* Scene form */}
            {showSceneForm && (
              <div ref={sceneFormRef} className="rounded-xl border border-primary/30 bg-primary/5 p-6">
                <h3 className="font-bold mb-4">{editingSceneId ? "Scene tahrirlash" : "Yangi scene yaratish"}</h3>

                <form onSubmit={sceneForm.handleSubmit((d) => saveScene(d))} className="space-y-5">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Nomi (UZ)</label>
                      <Input {...sceneForm.register('uz_title')} placeholder="Masalan: Kirish" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Nomi (RU)</label>
                      <Input {...sceneForm.register('ru_title')} placeholder="Вход" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Nomi (EN)</label>
                      <Input {...sceneForm.register('en_title')} placeholder="Entrance" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-4 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Boshlang'ich Yaw</label>
                      <Input {...sceneForm.register('initialYaw', { valueAsNumber: true })} type="number" step="0.1" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Boshlang'ich Pitch</label>
                      <Input {...sceneForm.register('initialPitch', { valueAsNumber: true })} type="number" step="0.1" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Zoom (HFOV)</label>
                      <Input {...sceneForm.register('initialHfov', { valueAsNumber: true })} type="number" step="0.1" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Tartib</label>
                      <Input {...sceneForm.register('order', { valueAsNumber: true })} type="number" />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" {...sceneForm.register('isDefault')} className="rounded" />
                      Boshlang'ich scene (foydalanuvchi shu yerdan boshlaydi)
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" {...sceneForm.register('isActive')} className="rounded" />
                      Faol
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={savingScene}>
                      {savingScene ? 'Saqlanmoqda...' : editingSceneId ? 'Yangilash' : 'Yaratish'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowSceneForm(false)}>Bekor</Button>
                  </div>
                </form>

                {/* Upload buttons for existing scene */}
                {editingSceneId && (
                  <div className="flex gap-4 mt-5 pt-5 border-t">
                    <label className="inline-flex items-center gap-2 cursor-pointer rounded-xl border px-4 py-2.5 text-sm hover:bg-slate-50">
                      <Camera className="h-4 w-4 text-primary" />
                      360° rasm yuklash
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => { uploadSceneFile(editingSceneId, 'panorama', e.target.files?.[0] ?? null); e.target.value = '' }}
                      />
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer rounded-xl border px-4 py-2.5 text-sm hover:bg-slate-50">
                      <ImagePlus className="h-4 w-4 text-primary" />
                      Thumbnail yuklash
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => { uploadSceneFile(editingSceneId, 'thumbnail', e.target.files?.[0] ?? null); e.target.value = '' }}
                      />
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ═══════════ QADAM 4: 360° Ko'rish va Hotspotlar ═══════════ */}
          {scenes.some((s) => s.panoramaUrl) && (
            <div className="rounded-2xl border border-slate-200 p-6 bg-white">
              <StepHeader step={4} title="Hotspotlar — scene'larni bog'lash" description="360° ko'rinishda kerakli joyni bosing → hotspot qo'shing → boshqa scene'ga bog'lang" icon={Navigation} />

              {/* 360 Preview */}
              <div className="rounded-xl overflow-hidden border border-slate-200 mb-6">
                <Tour360Viewer
                  scenes={scenes}
                  initialSceneId={activeSceneId ?? undefined}
                  onSceneChange={setSelectedSceneId}
                  onCoordinateSelect={({ pitch, yaw, sceneId }) => {
                    setSelectedSceneId(sceneId)
                    hotspotForm.setValue('pitch', pitch)
                    hotspotForm.setValue('yaw', yaw)
                    openHotspotEditor()
                  }}
                  heightClassName="h-[500px]"
                />
              </div>

              <p className="text-sm text-muted-foreground mb-4 bg-blue-50 text-blue-700 rounded-lg px-4 py-2.5">
                💡 <strong>Qanday ishlaydi:</strong> 360° rasmda kerakli joyni bosing — koordinata avtomatik olinadi.
                Keyin pastdagi formada hotspot turini tanlang va qaysi scene'ga o'tishini belgilang.
              </p>

              {/* Active scene info */}
              {activeScene && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-muted-foreground mb-3">
                    Hozirgi scene: <strong className="text-foreground">{activeScene.title.uz}</strong>
                    {' '} — {activeScene.hotspots?.length ?? 0} ta hotspot
                  </p>

                  {/* Existing hotspots */}
                  {(activeScene.hotspots?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {[...activeScene.hotspots].sort((a, b) => a.order - b.order).map((h) => {
                        const target = scenes.find((s) => s.id === h.targetSceneId)
                        return (
                          <div key={h.id} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm bg-slate-50">
                            {h.type === 'scene' ? <ArrowRight className="h-3.5 w-3.5 text-primary" /> : <Info className="h-3.5 w-3.5 text-blue-500" />}
                            <span className="font-medium">{h.label.uz}</span>
                            {target && <span className="text-muted-foreground">→ {target.title.uz}</span>}
                            <button onClick={() => openHotspotEditor(h.id)} className="p-0.5 hover:text-primary"><Pencil className="h-3 w-3" /></button>
                            <button onClick={() => deleteHotspot(h.id)} className="p-0.5 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {!showHotspotForm && (
                    <Button variant="outline" onClick={() => openHotspotEditor()}>
                      <Plus className="mr-2 h-4 w-4" /> Hotspot qo'shish
                    </Button>
                  )}
                </div>
              )}

              {/* Hotspot form */}
              {showHotspotForm && activeScene && (
                <div ref={hotspotFormRef} className="rounded-xl border border-primary/30 bg-primary/5 p-6">
                  <h3 className="font-bold mb-4">{editingHotspotId ? "Hotspot tahrirlash" : "Yangi hotspot qo'shish"}</h3>

                  <form onSubmit={hotspotForm.handleSubmit((d) => {
                    if (d.type === 'scene' && !d.targetSceneId) {
                      toast({ description: "Qaysi scene'ga o'tishini tanlang!", variant: 'destructive' })
                      return
                    }
                    saveHotspot(d)
                  })} className="space-y-5">

                    {/* Type */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Hotspot turi</label>
                        <select {...hotspotForm.register('type')}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="scene">🔀 Boshqa scene'ga o'tish</option>
                          <option value="info">ℹ️ Ma'lumot ko'rsatish</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Tartib</label>
                        <Input {...hotspotForm.register('order', { valueAsNumber: true })} type="number" />
                      </div>
                    </div>

                    {/* Labels */}
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Nomi (UZ)</label>
                        <Input {...hotspotForm.register('uz_label')} placeholder="Yotoqxonaga o'tish" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Nomi (RU)</label>
                        <Input {...hotspotForm.register('ru_label')} placeholder="Перейти в спальню" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Nomi (EN)</label>
                        <Input {...hotspotForm.register('en_label')} placeholder="Go to bedroom" />
                      </div>
                    </div>

                    {/* Position */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Yaw (360° rasmda bosib olinadi)</label>
                        <Input {...hotspotForm.register('yaw', { valueAsNumber: true })} type="number" step="0.1" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Pitch (360° rasmda bosib olinadi)</label>
                        <Input {...hotspotForm.register('pitch', { valueAsNumber: true })} type="number" step="0.1" />
                      </div>
                    </div>

                    {/* Target scene (only for scene type) */}
                    {hotspotType === 'scene' && (
                      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
                        <p className="text-sm font-medium">Qaysi scene'ga o'tsin?</p>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {scenes.filter((s) => s.id !== activeScene.id).map((s) => {
                            const selected = hotspotForm.getValues('targetSceneId') === s.id
                            return (
                              <button
                                key={s.id} type="button"
                                onClick={() => hotspotForm.setValue('targetSceneId', s.id)}
                                className={`text-left rounded-lg border-2 p-3 transition-all text-sm ${
                                  selected ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-400'
                                }`}
                              >
                                <p className="font-medium">{s.title.uz || 'Nomsiz'}</p>
                                {s.panoramaUrl && <p className="text-xs text-muted-foreground mt-0.5">360° rasm bor</p>}
                              </button>
                            )
                          })}
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4 pt-3 border-t">
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">O'tganda kamera Yaw</label>
                            <Input {...hotspotForm.register('targetYaw', { valueAsNumber: true })} type="number" step="0.1" />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">O'tganda kamera Pitch</label>
                            <Input {...hotspotForm.register('targetPitch', { valueAsNumber: true })} type="number" step="0.1" />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">O'tganda Zoom (HFOV)</label>
                            <Input {...hotspotForm.register('targetHfov', { valueAsNumber: true })} type="number" step="0.1" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button type="submit" disabled={savingHotspot}>
                        {savingHotspot ? 'Saqlanmoqda...' : editingHotspotId ? 'Yangilash' : "Qo'shish"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowHotspotForm(false)}>Bekor</Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
