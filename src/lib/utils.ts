/**
 * Enhanced className merging function with basic conflict resolution
 * This replicates some functionality of clsx and tailwind-merge without external dependencies
 * 
 * Features:
 * - Filters out falsy values
 * - Handles objects where keys are class names and values determine inclusion
 * - Resolves basic Tailwind conflicts (only keeping the last value for same property)
 */
export function cn(...inputs: (string | undefined | null | false | Record<string, boolean>)[]) {
  // Process all inputs to handle objects and filter falsy values
  const classes = inputs.flatMap(input => {
    if (!input) return [];
    
    // Handle objects like { 'class-name': true, 'other-class': false }
    if (typeof input === 'object' && !Array.isArray(input)) {
      return Object.entries(input)
        .filter(([_, value]) => Boolean(value))
        .map(([key]) => key);
    }
    
    return [input];
  }).filter(Boolean);
  
  // Join all classes with space
  const joinedClasses = classes.join(' ');
  
  // Split into individual class names
  const allClasses = joinedClasses.split(/\s+/).filter(Boolean);
  
  // Create a map to track class conflicts (simplified version of tailwind-merge)
  const classMap = new Map();
  const prefixRegex = /^(bg|text|border|rounded|p|m|w|h|flex|grid|shadow|transition|transform)-/;
  
  // Process each class to handle basic conflicts
  allClasses.forEach(cls => {
    // Check if this class has a prefix that might conflict
    const match = cls.match(prefixRegex);
    if (match) {
      const [, prefix] = match;
      // Store by prefix to avoid conflicts (last one wins)
      classMap.set(prefix, cls);
    } else {
      // For non-prefixed classes, store by full name
      classMap.set(cls, cls);
    }
  });
  
  // Get the final class list from the map
  return Array.from(classMap.values()).join(' ');
}