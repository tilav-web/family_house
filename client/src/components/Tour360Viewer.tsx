import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Maximize2, Minimize2 } from 'lucide-react'
import 'pannellum/build/pannellum.css'
import type { PanoramaScene } from '../types'
import { Button } from './ui/button'
import { getLocalizedField } from '../lib/i18n-field'

type PannellumViewer = {
  destroy: () => void
  loadScene: (sceneId: string) => void
  resize: () => void
  on: (eventName: string, callback: (sceneId: string) => void) => void
  getScene: () => string
  mouseEventToCoords: (event: MouseEvent) => [number, number]
}

const TRANSITION_OUT_MS = 400
const TRANSITION_IN_MS = 500

type PannellumConfig = {
  default: {
    firstScene: string
    autoLoad: boolean
    sceneFadeDuration: number
    showControls: boolean
    showZoomCtrl: boolean
    showFullscreenCtrl: boolean
    mouseZoom: boolean
    draggable: boolean
  }
  scenes: Record<string, unknown>
}

declare global {
  interface Window {
    pannellum?: {
      viewer: (container: HTMLElement, config: PannellumConfig) => PannellumViewer
    }
  }
}

interface Tour360ViewerProps {
  scenes: PanoramaScene[]
  initialSceneId?: string
  onSceneChange?: (sceneId: string) => void
  onCoordinateSelect?: (coords: { pitch: number; yaw: number; sceneId: string }) => void
  heightClassName?: string
  showThumbnails?: boolean
  showFullscreenButton?: boolean
}

function createTooltip(
  hotspot: HTMLElement,
  args: { label: string; type: 'scene' | 'info' },
) {
  hotspot.classList.add('tour-hotspot', `tour-hotspot--${args.type}`)

  const label = document.createElement('span')
  label.className = 'tour-hotspot__label'
  label.textContent = args.label
  hotspot.appendChild(label)
}

export function Tour360Viewer({
  scenes,
  initialSceneId,
  onSceneChange,
  onCoordinateSelect,
  heightClassName = 'h-[420px]',
  showThumbnails = true,
  showFullscreenButton = true,
}: Tour360ViewerProps) {
  const { i18n } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<PannellumViewer | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeSceneId, setActiveSceneId] = useState<string | null>(initialSceneId ?? null)
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'out' | 'in'>('idle')
  const transitionRef = useRef(false)

  const availableScenes = useMemo(
    () =>
      [...scenes]
        .filter((scene) => scene.isActive && scene.panoramaUrl)
        .sort((left, right) => left.order - right.order),
    [scenes],
  )

  const startingSceneId = useMemo(() => {
    if (!availableScenes.length) return null
    if (initialSceneId && availableScenes.some((scene) => scene.id === initialSceneId)) {
      return initialSceneId
    }
    return availableScenes.find((scene) => scene.isDefault)?.id ?? availableScenes[0].id
  }, [availableScenes, initialSceneId])

  const activeScene = useMemo(
    () => availableScenes.find((scene) => scene.id === activeSceneId) ?? null,
    [availableScenes, activeSceneId],
  )

  useEffect(() => {
    setActiveSceneId(startingSceneId)
  }, [startingSceneId])

  const smoothLoadScene = useCallback((sceneId: string) => {
    if (transitionRef.current || !viewerRef.current) return
    if (viewerRef.current.getScene() === sceneId) return

    transitionRef.current = true
    setTransitionPhase('out')

    setTimeout(() => {
      viewerRef.current?.loadScene(sceneId)
      setTransitionPhase('in')

      setTimeout(() => {
        setTransitionPhase('idle')
        transitionRef.current = false
      }, TRANSITION_IN_MS)
    }, TRANSITION_OUT_MS)
  }, [])

  const handleSceneSelect = (sceneId: string) => {
    smoothLoadScene(sceneId)
    setActiveSceneId(sceneId)
  }

  useEffect(() => {
    if (!containerRef.current || !startingSceneId || !availableScenes.length) {
      return
    }

    let isCancelled = false
    const container = containerRef.current

    const handleCoordinateSelection = (event: MouseEvent) => {
      if (!onCoordinateSelect || !viewerRef.current) return
      if ((event.target as HTMLElement | null)?.closest('.pnlm-hotspot-base')) return

      const [pitch, yaw] = viewerRef.current.mouseEventToCoords(event)
      onCoordinateSelect({
        pitch: Number(pitch.toFixed(2)),
        yaw: Number(yaw.toFixed(2)),
        sceneId: viewerRef.current.getScene(),
      })
    }

    const initializeViewer = async () => {
      await import('pannellum/build/pannellum.js')

      if (isCancelled || !containerRef.current || !window.pannellum) {
        return
      }

      container.innerHTML = ''

      const config: PannellumConfig = {
        default: {
          firstScene: startingSceneId,
          autoLoad: true,
          sceneFadeDuration: 0,
          showControls: true,
          showZoomCtrl: true,
          showFullscreenCtrl: false,
          mouseZoom: true,
          draggable: true,
        },
        scenes: Object.fromEntries(
          availableScenes.map((scene) => [
            scene.id,
            {
              title: getLocalizedField(scene.title, i18n.language),
              type: 'equirectangular',
              panorama: scene.panoramaUrl,
              yaw: scene.initialYaw,
              pitch: scene.initialPitch,
              hfov: scene.initialHfov,
              hotSpots: [...scene.hotspots]
                .sort((left, right) => left.order - right.order)
                .map((hotspot) => {
                  const label = getLocalizedField(hotspot.label, i18n.language)
                  const baseHotspot = {
                    id: hotspot.id,
                    pitch: hotspot.pitch,
                    yaw: hotspot.yaw,
                    text: label,
                    createTooltipFunc: createTooltip,
                    createTooltipArgs: {
                      label,
                      type: hotspot.type,
                    },
                  }

                  if (hotspot.type === 'scene' && hotspot.targetSceneId) {
                    return {
                      ...baseHotspot,
                      type: 'info',
                      clickHandlerFunc: () => {
                        smoothLoadScene(hotspot.targetSceneId!)
                      },
                      clickHandlerArgs: {},
                    }
                  }

                  return {
                    ...baseHotspot,
                    type: 'info',
                  }
                }),
            },
          ]),
        ),
      }

      const viewer = window.pannellum.viewer(containerRef.current, config)
      viewerRef.current = viewer

      viewer.on('scenechange', (nextSceneId) => {
        setActiveSceneId(nextSceneId)
        onSceneChange?.(nextSceneId)
      })

      container.addEventListener('click', handleCoordinateSelection)
    }

    void initializeViewer()

    return () => {
      isCancelled = true
      container.removeEventListener('click', handleCoordinateSelection)
      viewerRef.current?.destroy()
      viewerRef.current = null
    }
  }, [availableScenes, i18n.language, onCoordinateSelect, onSceneChange, smoothLoadScene, startingSceneId])

  useEffect(() => {
    const handleResize = () => viewerRef.current?.resize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!availableScenes.length) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--client-line)] bg-[var(--client-panel-strong)] p-8 text-center text-muted-foreground">
        360 panorama hali yuklanmagan
      </div>
    )
  }

  return (
    <div className={`relative space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4' : ''}`}>
      <div className={`relative overflow-hidden rounded-lg ${heightClassName}`}>
        <div ref={containerRef} className={`h-full w-full ${onCoordinateSelect ? 'cursor-crosshair' : ''}`} />

        {/* Scene transition overlay */}
        <div
          className={`scene-transition-overlay ${
            transitionPhase === 'out' ? 'is-transitioning' :
            transitionPhase === 'in' ? 'is-entering' : ''
          }`}
        />

        {showFullscreenButton && (
          <Button
            size="icon"
            variant="secondary"
            className="absolute right-4 top-4 z-10 rounded-lg bg-[var(--client-panel-strong)]"
            onClick={() => setIsFullscreen((current) => !current)}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        )}

        {activeScene && (
          <div className="absolute left-4 top-4 z-10 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            {getLocalizedField(activeScene.title, i18n.language)}
          </div>
        )}
      </div>

      {showThumbnails && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {availableScenes.map((scene) => {
            const isActiveScene = scene.id === activeScene?.id
            const title = getLocalizedField(scene.title, i18n.language)

            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => handleSceneSelect(scene.id)}
                className={`overflow-hidden rounded-xl border text-left transition ${
                  isActiveScene
                    ? 'border-primary shadow-[0_18px_42px_var(--client-shadow)]'
                    : 'border-[var(--client-line)] hover:border-primary/40'
                }`}
              >
                <div className="aspect-[16/9] bg-slate-200">
                  {scene.thumbnailUrl ? (
                    <img src={scene.thumbnailUrl} alt={title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">
                      Thumbnail yo'q
                    </div>
                  )}
                </div>
                <div className="space-y-1 bg-[var(--client-panel-strong)] p-4">
                  <p className="font-semibold text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground">
                    {scene.hotspots.length} hotspot
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
