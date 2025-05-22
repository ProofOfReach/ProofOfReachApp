import { useState, useEffect, ReactNode } from 'react';

/**
 * ClientOnly component to only render children in the browser
 * This prevents hydration issues for components that use browser-only APIs
 */
export default function ClientOnly({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}