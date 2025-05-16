import React, { useState, useEffect } from 'react'
import { X } from 'react-feather'
import { cn } from '../../lib/utils'

interface SheetProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'top' | 'right' | 'bottom' | 'left'
}

const Sheet = ({
  children,
  className,
  open,
  onOpenChange,
  ...props
}: SheetProps) => {
  const [isOpen, setIsOpen] = useState(open || false)
  
  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  const handleOpenChange = (value: boolean) => {
    setIsOpen(value)
    onOpenChange?.(value)
  }

  // Close the sheet when pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleOpenChange(false)
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Prevent scrolling when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/50",
        className
      )}
      onClick={() => handleOpenChange(false)}
      {...props}
    >
      {children}
    </div>
  )
}

const SheetContent = ({
  children,
  className,
  side = 'right',
  ...props
}: SheetProps & { side?: 'top' | 'right' | 'bottom' | 'left' }) => {
  const sideStyles = {
    top: 'animate-in slide-in-from-top w-full duration-300',
    right: 'animate-in slide-in-from-right h-full duration-300',
    bottom: 'animate-in slide-in-from-bottom w-full duration-300',
    left: 'animate-in slide-in-from-left h-full duration-300',
  }

  return (
    <div
      className={cn(
        "fixed bg-white dark:bg-gray-900 shadow-lg",
        {
          'top-0 left-0 right-0': side === 'top',
          'bottom-0 left-0 right-0': side === 'bottom',
          'top-0 bottom-0 right-0 w-3/4 max-w-sm': side === 'right',
          'top-0 bottom-0 left-0 w-3/4 max-w-sm': side === 'left',
        },
        sideStyles[side],
        className
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  )
}

const SheetHeader = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left p-4 border-b border-gray-200 dark:border-gray-700",
      className
    )}
    {...props}
  >
    {children}
  </div>
)

const SheetTitle = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn(
      "text-lg font-semibold text-gray-900 dark:text-gray-100",
      className
    )}
    {...props}
  >
    {children}
  </h3>
)

const SheetDescription = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn(
      "text-sm text-gray-500 dark:text-gray-400",
      className
    )}
    {...props}
  >
    {children}
  </p>
)

const SheetFooter = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-4 border-t border-gray-200 dark:border-gray-700",
      className
    )}
    {...props}
  >
    {children}
  </div>
)

const SheetClose = ({
  children,
  className,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={cn(
        "absolute top-4 right-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 dark:ring-offset-gray-950 dark:focus:ring-gray-300 dark:data-[state=open]:bg-gray-800",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children || <X className="h-4 w-4" />}
      <span className="sr-only">Close</span>
    </button>
  )
}

export {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
}