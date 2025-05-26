import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
/**
 * Combines class names using clsx and tailwind-merge
 * This is a utility function used by shadcn/ui components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number with commas for thousands separators
 */
export function formatNumber(num: number): string {
  if (num === undefined || num === null || isNaN(num)) {
    return '0'
  }
  return new Intl.NumberFormat('en-US').format(num)
}

/**
 * Formats a date string for display
 */
export function formatDate(dateString: string): string {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return dateString
  }
}