import { useRef, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand, type LexicalCommand } from 'lexical'
import { useEffect } from 'react'
import { $createImageNode, type ImagePayload } from './ImageNode'
import { ImageIcon, Upload, Link, X } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import api from '../../lib/api'

export const INSERT_IMAGE_COMMAND: LexicalCommand<ImagePayload> = createCommand('INSERT_IMAGE_COMMAND')

export function ImagePlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand<ImagePayload>(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        const imageNode = $createImageNode(payload)
        $insertNodes([imageNode])
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}

/** Dialog for inserting images */
interface ImageDialogProps {
  open: boolean
  onClose: () => void
  onInsert: (payload: ImagePayload) => void
}

export function ImageInsertDialog({ open, onClose, onInsert }: ImageDialogProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const [url, setUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post<{ url: string }>('/api/news/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onInsert({ src: res.data.url, altText: caption || file.name, caption })
      resetAndClose()
    } catch {
      // Fallback: use object URL for preview (won't persist after reload in production)
      const objectUrl = URL.createObjectURL(file)
      onInsert({ src: objectUrl, altText: caption || file.name, caption })
      resetAndClose()
    } finally {
      setUploading(false)
    }
  }

  const handleUrlInsert = () => {
    if (!url.trim()) return
    onInsert({ src: url, altText: caption || 'Image', caption })
    resetAndClose()
  }

  const resetAndClose = () => {
    setUrl('')
    setCaption('')
    setMode('upload')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={resetAndClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Rasm qo'shish</h3>
          <button onClick={resetAndClose} className="p-1 rounded-lg hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              mode === 'upload' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Upload className="h-4 w-4" />
            Yuklash
          </button>
          <button
            onClick={() => setMode('url')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              mode === 'url' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Link className="h-4 w-4" />
            URL orqali
          </button>
        </div>

        {/* Upload mode */}
        {mode === 'upload' && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full h-40 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-primary hover:text-primary transition-colors"
            >
              <ImageIcon className="h-10 w-10" />
              <span className="text-sm font-medium">
                {uploading ? 'Yuklanmoqda...' : 'Rasm tanlash uchun bosing'}
              </span>
              <span className="text-xs">JPG, PNG, WebP</span>
            </button>
          </div>
        )}

        {/* URL mode */}
        {mode === 'url' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Rasm URL</label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Izoh (ixtiyoriy)</label>
              <Input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Rasm tavsifi"
              />
            </div>
            {url && (
              <div className="rounded-xl overflow-hidden bg-slate-50 p-2">
                <img
                  src={url}
                  alt="Preview"
                  className="max-h-40 mx-auto rounded-lg"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
            )}
            <Button onClick={handleUrlInsert} className="w-full" disabled={!url.trim()}>
              Qo'shish
            </Button>
          </div>
        )}

        {/* Caption for upload mode */}
        {mode === 'upload' && (
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1.5">Izoh (ixtiyoriy)</label>
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Rasm tavsifi"
            />
          </div>
        )}
      </div>
    </div>
  )
}
