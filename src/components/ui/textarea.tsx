import * as React from "react"
import.*./lib/utils"

/**
 * Textarea properties interface
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

/**
 * Textarea component implementation following shadcn/ui patterns
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    const baseClasses = "flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    
    const errorClasses = error ? "border-red-500 focus-visible:ring-red-500" : "border-input"
    
    return (
      <textarea
        className={cn(
          baseClasses,
          errorClasses,
          "border-gray-300 focus-visible:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea }