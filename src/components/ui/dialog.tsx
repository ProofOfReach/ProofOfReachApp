import * as React from "react"
import { X } from "react-feather"

import "./lib/utils"

// Interface for dialog props
interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

// Dialog context to manage state
const DialogContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {},
})

// Root Dialog component
export function Dialog({ children, ...props }: DialogProps) {
  const [open, setOpen] = React.useState(props.open || false)

  // Update open state when props change
  React.useEffect(() => {
    if (props.open !== undefined) {
      setOpen(props.open)
    }
  }, [props.open])

  // Notify parent when state changes
  React.useEffect(() => {
    props.onOpenChange?.(open)
  }, [open, props])

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

// Dialog trigger component
interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export function DialogTrigger({ asChild, ...props }: DialogTriggerProps) {
  const { setOpen } = React.useContext(DialogContext)

  if (asChild) {
    const Comp = React.cloneElement(props.children as React.ReactElement, {
      onClick: (e: React.MouseEvent) => {
        setOpen(true)
        ;(props.children as React.ReactElement).props.onClick?.(e)
      },
    })
    return Comp
  }

  return (
    <button 
      type="button" 
      onClick={() => setOpen(true)} 
      {...props}
    />
  )
}

// Dialog portal component (backdrop and positioning)
interface DialogPortalProps {
  children?: React.ReactNode
  className?: string
}

export function DialogPortal({ children, className }: DialogPortalProps) {
  const { open } = React.useContext(DialogContext)

  if (!open) return null
  
  // Create portal directly in the component
  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center p-4",
      className
    )}>
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      {children}
    </div>
  )
}

// Dialog overlay (backdrop)
interface DialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DialogOverlay({ className, ...props }: DialogOverlayProps) {
  const { open, setOpen } = React.useContext(DialogContext)

  if (!open) return null

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 bg-black/50", 
        className
      )} 
      onClick={() => setOpen(false)}
      {...props} 
    />
  )
}

// Dialog content component
interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DialogContent({ children, className, ...props }: DialogContentProps) {
  const { open, setOpen } = React.useContext(DialogContext)
  const contentRef = React.useRef<HTMLDivElement>(null)

  if (!open) return null

  return (
    <div 
      ref={contentRef}
      className={cn(
        "fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg",
        className
      )} 
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
      <button
        className="absolute top-3 right-3 inline-flex items-center justify-center rounded-full w-8 h-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        onClick={() => setOpen(false)}
        type="button"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Dialog header component
interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className
      )}
      {...props}
    />
  )
}

// Dialog footer component
interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...props}
    />
  )
}

// Dialog title component
interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
}

// Dialog description component
interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <p
      className={cn(
        "text-sm text-gray-500 dark:text-gray-400",
        className
      )}
      {...props}
    />
  )
}

// Export a DialogClose component for convenience
interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function DialogClose({ className, ...props }: DialogCloseProps) {
  const { setOpen } = React.useContext(DialogContext)
  
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4",
        className
      )}
      onClick={() => setOpen(false)}
      {...props}
    />
  )
}