// This file is a re-export from card.tsx to resolve case sensitivity issues
// when building on case-sensitive file systems.
// Import and re-export the shadcn/ui Card components from the lowercase version
import { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';

// Re-export with both default and named exports to maintain compatibility
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
export default Card;