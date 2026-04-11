import { useEffect, useState } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListNode, ListItemNode } from '@lexical/list'
import { LinkNode, AutoLinkNode } from '@lexical/link'
import { CodeNode } from '@lexical/code'
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode'
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import type { EditorState, LexicalEditor as LexicalEditorType } from 'lexical'
import { ToolbarPlugin } from './ToolbarPlugin'
import { ImageNode } from './ImageNode'
import { ImagePlugin, ImageInsertDialog, INSERT_IMAGE_COMMAND } from './ImagePlugin'
import type { ImagePayload } from './ImageNode'

const editorNodes = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  AutoLinkNode,
  CodeNode,
  ImageNode,
  HorizontalRuleNode,
]

const theme = {
  paragraph: 'mb-2 leading-relaxed',
  heading: {
    h1: 'text-3xl font-bold mb-4 mt-6',
    h2: 'text-2xl font-bold mb-3 mt-5',
    h3: 'text-xl font-semibold mb-2 mt-4',
  },
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    code: 'bg-slate-100 text-sm font-mono px-1.5 py-0.5 rounded',
  },
  list: {
    ul: 'list-disc ml-6 mb-3',
    ol: 'list-decimal ml-6 mb-3',
    listitem: 'mb-1',
    nested: {
      listitem: 'list-none',
    },
  },
  link: 'text-primary underline hover:text-primary/80 cursor-pointer',
  quote: 'border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-4',
  code: 'bg-slate-900 text-slate-100 block p-4 rounded-lg font-mono text-sm my-4 overflow-x-auto',
  horizontalRule: 'my-6 border-t-2 border-slate-200',
}

interface Props {
  initialState?: string
  onChange?: (json: string) => void
  placeholder?: string
}

/** Restores serialized editor state when initialState changes */
function RestoreStatePlugin({ initialState }: { initialState?: string }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!initialState) return
    try {
      const parsed = JSON.parse(initialState)
      const editorState = editor.parseEditorState(parsed)
      editor.setEditorState(editorState)
    } catch {
      // not valid JSON — ignore (plain text)
    }
  }, [initialState, editor])

  return null
}

/** Bridge component to dispatch image insert command */
function ImageInsertBridge({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [editor] = useLexicalComposerContext()

  const handleInsert = (payload: ImagePayload) => {
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload)
  }

  return <ImageInsertDialog open={open} onClose={onClose} onInsert={handleInsert} />
}

export function LexicalEditor({ initialState, onChange, placeholder }: Props) {
  const [imageDialogOpen, setImageDialogOpen] = useState(false)

  const initialConfig = {
    namespace: 'NewsEditor',
    theme,
    nodes: editorNodes,
    onError: (error: Error) => console.error('Lexical error:', error),
  }

  const handleChange = (editorState: EditorState, _editor: LexicalEditorType) => {
    const json = JSON.stringify(editorState.toJSON())
    onChange?.(json)
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <ToolbarPlugin onImageClick={() => setImageDialogOpen(true)} />
        <div className="relative min-h-[300px]">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[300px] px-5 py-4 outline-none text-foreground" />
            }
            placeholder={
              <div className="absolute top-4 left-5 text-muted-foreground pointer-events-none">
                {placeholder || 'Yangilik matnini yozing...'}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
      </div>
      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin />
      <HorizontalRulePlugin />
      <ImagePlugin />
      <OnChangePlugin onChange={handleChange} />
      <RestoreStatePlugin initialState={initialState} />
      <ImageInsertBridge open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} />
    </LexicalComposer>
  )
}
