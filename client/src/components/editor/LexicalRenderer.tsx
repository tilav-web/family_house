import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
} from 'lexical'
import { useEffect } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListNode, ListItemNode } from '@lexical/list'
import { LinkNode, AutoLinkNode } from '@lexical/link'
import { CodeNode } from '@lexical/code'
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { ImageNode } from './ImageNode'

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
  paragraph: 'mb-4 text-lg leading-relaxed text-foreground/90',
  heading: {
    h1: 'text-3xl font-bold mb-4 mt-8 text-foreground',
    h2: 'text-2xl font-bold mb-3 mt-6 text-foreground',
    h3: 'text-xl font-semibold mb-2 mt-5 text-foreground',
  },
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    code: 'bg-slate-100 text-sm font-mono px-1.5 py-0.5 rounded text-primary',
  },
  list: {
    ul: 'list-disc ml-6 mb-4 space-y-1',
    ol: 'list-decimal ml-6 mb-4 space-y-1',
    listitem: 'text-foreground/90 text-lg leading-relaxed',
    nested: {
      listitem: 'list-none',
    },
  },
  link: 'text-primary underline hover:text-primary/80',
  quote:
    'my-6 rounded-r-lg border-l-4 border-primary/30 bg-background/75 py-2 pl-5 text-lg italic text-muted-foreground',
  code: 'my-6 block overflow-x-auto rounded-lg bg-slate-900 p-5 font-mono text-sm text-slate-100',
  horizontalRule: 'my-8 border-t border-[var(--client-line)]',
}

/** Loads serialized editor state */
function LoadStatePlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!content) return
    try {
      const parsed = JSON.parse(content)
      const editorState = editor.parseEditorState(parsed)
      editor.setEditorState(editorState)
    } catch {
      // Plain text fallback — insert as paragraph
      editor.update(() => {
        const root = $getRoot()
        root.clear()
        const lines = content.split('\n')
        for (const line of lines) {
          const p = $createParagraphNode()
          if (line.trim()) {
            p.append($createTextNode(line))
          }
          root.append(p)
        }
      })
    }
  }, [content, editor])

  return null
}

interface Props {
  content: string
  className?: string
}

export function LexicalRenderer({ content, className }: Props) {
  if (!content) return null

  const initialConfig = {
    namespace: 'NewsRenderer',
    theme,
    nodes: editorNodes,
    editable: false,
    onError: (error: Error) => console.error('Lexical render error:', error),
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable className={className || ''} />}
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <LoadStatePlugin content={content} />
    </LexicalComposer>
  )
}
