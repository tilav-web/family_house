import { useCallback, useEffect, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelection,
  $createParagraphNode,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  SELECTION_CHANGE_COMMAND,
  type ElementFormatType,
} from 'lexical'
import { $setBlocksType } from '@lexical/selection'
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  type HeadingTagType,
} from '@lexical/rich-text'
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  $isListNode,
} from '@lexical/list'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link,
  Unlink,
  Quote,
  Undo2,
  Redo2,
  Code,
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
} from 'lucide-react'

type BlockType = 'paragraph' | 'h1' | 'h2' | 'h3' | 'ul' | 'ol' | 'quote'

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        active
          ? 'bg-primary/10 text-primary'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-6 bg-slate-200 mx-1" />
}

interface ToolbarProps {
  onImageClick?: () => void
}

export function ToolbarPlugin({ onImageClick }: ToolbarProps) {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [isCode, setIsCode] = useState(false)
  const [isLink, setIsLink] = useState(false)
  const [blockType, setBlockType] = useState<BlockType>('paragraph')

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return

    setIsBold(selection.hasFormat('bold'))
    setIsItalic(selection.hasFormat('italic'))
    setIsUnderline(selection.hasFormat('underline'))
    setIsStrikethrough(selection.hasFormat('strikethrough'))
    setIsCode(selection.hasFormat('code'))

    const anchorNode = selection.anchor.getNode()
    const element =
      anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow()

    if ($isHeadingNode(element)) {
      setBlockType(element.getTag() as BlockType)
    } else if ($isListNode(element)) {
      const type = element.getListType()
      setBlockType(type === 'number' ? 'ol' : 'ul')
    } else {
      const parent = anchorNode.getParent()
      if (parent && $isListNode(parent)) {
        const grandparent = parent.getParent()
        if (grandparent && $isListNode(grandparent)) {
          setBlockType(grandparent.getListType() === 'number' ? 'ol' : 'ul')
        }
      } else {
        setBlockType(element.getType() === 'quote' ? 'quote' : 'paragraph')
      }
    }

    const node = selection.anchor.getNode()
    const parent = node.getParent()
    setIsLink($isLinkNode(parent) || $isLinkNode(node))
  }, [])

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar()
        return false
      },
      COMMAND_PRIORITY_CRITICAL,
    )
  }, [editor, updateToolbar])

  const formatHeading = (tag: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return
      if (blockType === tag) {
        $setBlocksType(selection, () => $createParagraphNode())
      } else {
        $setBlocksType(selection, () => $createHeadingNode(tag))
      }
    })
  }

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return
      if (blockType === 'quote') {
        $setBlocksType(selection, () => $createParagraphNode())
      } else {
        $setBlocksType(selection, () => $createQuoteNode())
      }
    })
  }

  const insertLink = () => {
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    } else {
      const url = prompt('URL kiriting:')
      if (url) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
      }
    }
  }

  const formatAlignment = (alignment: ElementFormatType) => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment)
  }

  const iconSize = 'h-4 w-4'

  return (
    <div className="flex items-center gap-0.5 px-3 py-2 border-b border-slate-200 bg-slate-50/80 flex-wrap">
      {/* Undo/Redo */}
      <ToolbarButton onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} title="Undo">
        <Undo2 className={iconSize} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} title="Redo">
        <Redo2 className={iconSize} />
      </ToolbarButton>

      <Divider />

      {/* Block type */}
      <ToolbarButton active={blockType === 'h1'} onClick={() => formatHeading('h1')} title="Heading 1">
        <Heading1 className={iconSize} />
      </ToolbarButton>
      <ToolbarButton active={blockType === 'h2'} onClick={() => formatHeading('h2')} title="Heading 2">
        <Heading2 className={iconSize} />
      </ToolbarButton>
      <ToolbarButton active={blockType === 'h3'} onClick={() => formatHeading('h3')} title="Heading 3">
        <Heading3 className={iconSize} />
      </ToolbarButton>

      <Divider />

      {/* Inline formatting */}
      <ToolbarButton
        active={isBold}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        title="Bold (Ctrl+B)"
      >
        <Bold className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        active={isItalic}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        title="Italic (Ctrl+I)"
      >
        <Italic className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        active={isUnderline}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        title="Underline (Ctrl+U)"
      >
        <Underline className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        active={isStrikethrough}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
        title="Strikethrough"
      >
        <Strikethrough className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        active={isCode}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
        title="Inline code"
      >
        <Code className={iconSize} />
      </ToolbarButton>

      <Divider />

      {/* Lists */}
      <ToolbarButton
        active={blockType === 'ul'}
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
        title="Bullet list"
      >
        <List className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        active={blockType === 'ol'}
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
        title="Numbered list"
      >
        <ListOrdered className={iconSize} />
      </ToolbarButton>
      <ToolbarButton active={blockType === 'quote'} onClick={formatQuote} title="Quote">
        <Quote className={iconSize} />
      </ToolbarButton>

      <Divider />

      {/* Alignment */}
      <ToolbarButton onClick={() => formatAlignment('left')} title="Align left">
        <AlignLeft className={iconSize} />
      </ToolbarButton>
      <ToolbarButton onClick={() => formatAlignment('center')} title="Align center">
        <AlignCenter className={iconSize} />
      </ToolbarButton>
      <ToolbarButton onClick={() => formatAlignment('right')} title="Align right">
        <AlignRight className={iconSize} />
      </ToolbarButton>

      <Divider />

      {/* Link */}
      <ToolbarButton active={isLink} onClick={insertLink} title={isLink ? 'Remove link' : 'Add link'}>
        {isLink ? <Unlink className={iconSize} /> : <Link className={iconSize} />}
      </ToolbarButton>

      {/* Image */}
      <ToolbarButton onClick={() => onImageClick?.()} title="Insert image">
        <ImageIcon className={iconSize} />
      </ToolbarButton>

      {/* Horizontal rule */}
      <ToolbarButton
        onClick={() => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)}
        title="Horizontal line"
      >
        <Minus className={iconSize} />
      </ToolbarButton>
    </div>
  )
}
