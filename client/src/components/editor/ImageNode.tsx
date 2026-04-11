import type { JSX } from 'react'
import type {
  DOMConversionMap,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical'
import { $applyNodeReplacement, DecoratorNode } from 'lexical'

export interface ImagePayload {
  src: string
  altText?: string
  width?: number
  height?: number
  caption?: string
}

type SerializedImageNode = Spread<
  {
    src: string
    altText: string
    width?: number
    height?: number
    caption?: string
  },
  SerializedLexicalNode
>

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string
  __altText: string
  __width: number | undefined
  __height: number | undefined
  __caption: string | undefined

  static getType(): string {
    return 'image'
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__caption,
      node.__key,
    )
  }

  constructor(
    src: string,
    altText?: string,
    width?: number,
    height?: number,
    caption?: string,
    key?: NodeKey,
  ) {
    super(key)
    this.__src = src
    this.__altText = altText || ''
    this.__width = width
    this.__height = height
    this.__caption = caption
  }

  createDOM(config: EditorConfig): HTMLElement {
    const figure = document.createElement('figure')
    figure.className = 'my-6 text-center'
    return figure
  }

  updateDOM(): false {
    return false
  }

  exportDOM(): DOMExportOutput {
    const figure = document.createElement('figure')
    figure.className = 'my-6 text-center'
    const img = document.createElement('img')
    img.src = this.__src
    img.alt = this.__altText
    img.className = 'rounded-xl max-w-full mx-auto'
    if (this.__width) img.width = this.__width
    if (this.__height) img.height = this.__height
    figure.appendChild(img)
    if (this.__caption) {
      const figcaption = document.createElement('figcaption')
      figcaption.className = 'text-sm text-slate-500 mt-2'
      figcaption.textContent = this.__caption
      figure.appendChild(figcaption)
    }
    return { element: figure }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: (domNode: HTMLElement) => {
          const img = domNode as HTMLImageElement
          const node = $createImageNode({
            src: img.src,
            altText: img.alt,
            width: img.width || undefined,
            height: img.height || undefined,
          })
          return { node }
        },
        priority: 0,
      }),
    }
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    return $createImageNode({
      src: serializedNode.src,
      altText: serializedNode.altText,
      width: serializedNode.width,
      height: serializedNode.height,
      caption: serializedNode.caption,
    })
  }

  exportJSON(): SerializedImageNode {
    return {
      type: 'image',
      version: 1,
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      caption: this.__caption,
    }
  }

  decorate(): JSX.Element {
    return (
      <figure className="my-6 text-center">
        <img
          src={this.__src}
          alt={this.__altText}
          width={this.__width}
          height={this.__height}
          className="rounded-xl max-w-full mx-auto shadow-md"
          draggable={false}
        />
        {this.__caption && (
          <figcaption className="text-sm text-slate-500 mt-3 italic">
            {this.__caption}
          </figcaption>
        )}
      </figure>
    )
  }
}

export function $createImageNode(payload: ImagePayload): ImageNode {
  return $applyNodeReplacement(
    new ImageNode(
      payload.src,
      payload.altText,
      payload.width,
      payload.height,
      payload.caption,
    ),
  )
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode
}
