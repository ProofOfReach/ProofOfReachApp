/**
 * Simple date helper functions to avoid using the date-fns library
 * which is causing ESM vs CommonJS conflicts
 */

/**
 * Format a date with a specific format string
 */
const formatDateWithPattern = (date: Date, formatStr: string): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  if (formatStr === 'MMM d') {
    return `${months[date.getMonth()]} ${date.getDate()}`;
  }
  
  if (formatStr === 'yyyy-MM-dd') {
    return date.toISOString().split('T')[0];
  }
  
  return date.toLocaleDateString();
};

/**
 * Subtract days from a date
 */
const subtractDays = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() - days);
  return newDate;
};

/**
 * Add days to a date
 */
const addDaysToDate = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + days);
  return newDate;
};

/**
 * Format a date to a readable string
 * @param date Date string or Date object
 * @returns Formatted date string
 */
export const formatDate = (date: string | number | Date): string => {
  if (typeof date === 'string') {
    // Try to parse the date string
    const dateObj = new Date(date);
    if (!isNaN(dateObj.getTime())) {
      return formatDateWithPattern(dateObj, 'MMM d');
    }
    return date;
  }
  
  if (typeof date === 'number') {
    // Assume it's a timestamp
    return formatDateWithPattern(new Date(date), 'MMM d');
  }
  
  // It's already a Date object
  return formatDateWithPattern(date, 'MMM d');
};

/**
 * Format a number with thousands separators
 * @param num Number to format
 * @returns Formatted number string 
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Format a number as sats with appropriate symbol
 * @param sats Number of satoshis
 * @returns Formatted string with sats
 * @deprecated Use CurrencyAmount component instead for UI display
 */
export const formatSats = (sats: number): string => {
  if (sats >= 1000000) {
    return (sats / 1000000).toFixed(2) + 'M sats';
  }
  if (sats >= 1000) {
    return (sats / 1000).toFixed(1) + 'K sats';
  }
  return sats.toString() + ' sats';
};

/**
 * Format a percentage value
 * @param percent Percentage as a decimal (e.g. 0.12 for 12%)
 * @returns Formatted percentage string
 */
export const formatPercent = (percent: number): string => {
  return (percent * 100).toFixed(2) + '%';
};

/**
 * Generate color based on index for consistent chart colors
 * @param index Index in the data series
 * @returns Hex color string
 */
export const getChartColor = (index: number): string => {
  const colors = [
    '#10B981', // green-500
    '#0EA5E9', // sky-500
    '#8B5CF6', // violet-500
    '#EC4899', // pink-500
    '#F59E0B', // amber-500
    '#6366F1', // indigo-500
    '#EF4444', // red-500
    '#14B8A6', // teal-500
  ];
  
  return colors[index % colors.length];
};

/**
 * Generate mock chart data with random values within a given range
 * @param days Number of days to generate data for
 * @param metrics Array of metric names to include
 * @param baseValues Base values for each metric
 * @returns Array of data points
 */
export const generateChartData = (days: number, metrics: string[], baseValues: number[]): any[] => {
  const data = [];
  const today = new Date();
  
  // Start from the days ago and move toward today
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dataPoint: any = {
      date: formatDateWithPattern(date, 'yyyy-MM-dd'),
    };
    
    // Add each metric with slight variations
    metrics.forEach((metric, index) => {
      const baseValue = baseValues[index] || 100;
      const randomFactor = 0.3; // 30% variation
      const variation = baseValue * randomFactor * (Math.random() - 0.5);
      
      // Ensure values increase slightly as we get closer to today
      const trendFactor = 1 + ((days - i) / days) * 0.15; // Max 15% increase
      let value = (baseValue + variation) * trendFactor;
      
      // Round to appropriate precision
      value = Math.max(0, Math.round(value));
      
      dataPoint[metric] = value;
      
      // Calculate CTR if we have both impressions and clicks
      if (metric === 'clicks' && dataPoint['impressions']) {
        dataPoint['ctr'] = (value / dataPoint['impressions']) * 100;
      }
    });
    
    data.push(dataPoint);
  }
  
  return data;
};