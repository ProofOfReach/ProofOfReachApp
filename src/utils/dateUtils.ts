/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Format a date to show how long ago it was (e.g. "2 days ago")
 * @param date The date to format
 * @param options Formatting options
 * @returns Formatted string
 */
export function formatRelativeTime(date: Date | string | number, options: { addSuffix?: boolean } = {}): string {
  // Convert to Date object if necessary
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  // Format result
  let result = '';
  let suffix = options.addSuffix ? ' ago' : '';
  
  if (years > 0) {
    result = `${years} ${years === 1 ? 'year' : 'years'}`;
  } else if (months > 0) {
    result = `${months} ${months === 1 ? 'month' : 'months'}`;
  } else if (days > 0) {
    result = `${days} ${days === 1 ? 'day' : 'days'}`;
  } else if (hours > 0) {
    result = `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  } else if (minutes > 0) {
    result = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  } else {
    result = `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
  }
  
  return options.addSuffix ? result + suffix : result;
}

/**
 * Format date to ISO string
 * @param date Date to format
 * @returns Formatted ISO string
 */
export function formatISODate(date: Date | string | number): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toISOString();
}

/**
 * Format date to locale string
 * @param date Date to format
 * @param locales Locale to use (default: browser locale)
 * @param options Formatting options
 * @returns Formatted date string
 */
export function formatLocaleDate(
  date: Date | string | number,
  locales?: string | string[],
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString(locales, options);
}