import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

type DialogContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

function useDialogContext() {
  const context = React.useContext(DialogContext)

  if (!context) {
    throw new Error('Dialog components must be used within <Dialog>')
  }

  return context
}

export interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(open ?? false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen)
      }

      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange],
  )

  React.useEffect(() => {
    if (isControlled) {
      setInternalOpen(open)
    }
  }, [isControlled, open])

  return (
    <DialogContext.Provider value={{ open: isOpen, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

type TriggerElementProps = {
  onClick?: React.MouseEventHandler<HTMLElement>
}

interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  children: React.ReactNode
}

export function DialogTrigger({
  asChild = false,
  children,
  onClick,
  ...props
}: DialogTriggerProps) {
  const { setOpen } = useDialogContext()

  const openDialog = (event: React.MouseEvent<HTMLElement>) => {
    onClick?.(event as React.MouseEvent<HTMLButtonElement>)
    if (!event.defaultPrevented) {
      setOpen(true)
    }
  }

  if (asChild && React.isValidElement<TriggerElementProps>(children)) {
    return React.cloneElement(children, {
      ...children.props,
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        children.props.onClick?.(event)
        if (!event.defaultPrevented) {
          openDialog(event)
        }
      },
    })
  }

  return (
    <button type="button" onClick={openDialog} {...props}>
      {children}
    </button>
  )
}

export function DialogPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(children, document.body)
}

interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  children?: React.ReactNode
}

export function DialogClose({
  asChild = false,
  children,
  onClick,
  className,
  ...props
}: DialogCloseProps) {
  const { setOpen } = useDialogContext()

  const closeDialog = (event: React.MouseEvent<HTMLElement>) => {
    onClick?.(event as React.MouseEvent<HTMLButtonElement>)
    if (!event.defaultPrevented) {
      setOpen(false)
    }
  }

  if (asChild && React.isValidElement<TriggerElementProps>(children)) {
    return React.cloneElement(children, {
      ...children.props,
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        children.props.onClick?.(event)
        if (!event.defaultPrevented) {
          closeDialog(event)
        }
      },
    })
  }

  return (
    <button type="button" className={className} onClick={closeDialog} {...props}>
      {children}
    </button>
  )
}

export const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/70 backdrop-blur-sm', className)}
    {...props}
  />
))
DialogOverlay.displayName = 'DialogOverlay'

export const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, onClick, ...props }, ref) => {
  const { open, setOpen } = useDialogContext()

  if (!open) {
    return null
  }

  return (
    <DialogPortal>
      <DialogOverlay onClick={() => setOpen(false)} />
      <div
        ref={ref}
        className={cn(
          'fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-border bg-white p-6 shadow-lg sm:rounded-lg',
          className,
        )}
        onClick={(event) => {
          event.stopPropagation()
          onClick?.(event)
        }}
        {...props}
      >
        {children}
      </div>
    </DialogPortal>
  )
})
DialogContent.displayName = 'DialogContent'

export const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

export const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
DialogTitle.displayName = 'DialogTitle'

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
))
DialogDescription.displayName = 'DialogDescription'
