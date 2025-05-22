import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from './context/RoleContext';

// Map of paths to the roles that can access them
const ROLE_PATH_MAP: Record<string, UserRole[]> = {
  '/dashboard/advertiser': ['advertiser', 'admin'],
  '/dashboard/publisher': ['publisher', 'admin'],
  '/dashboard/admin': ['admin'],
  '/dashboard/stakeholder': ['stakeholder', 'admin'],
  '/dashboard/developer': ['user', 'advertiser', 'publisher', 'admin', 'stakeholder'],
  // The base user dashboard is accessible to all authenticated users
  '/dashboard/user': ['user', 'advertiser', 'publisher', 'admin', 'stakeholder'],
};

// Protected routes that should only be accessible in the dev environment
const PROTECTED_ROUTES = [
  '/dashboard',
  '/app', 
  '/ads',
  '/publisher',
  '/advertiser',
  '/onboarding'
];

// List of public routes accessible on all domains
const PUBLIC_ROUTES = [
  '/',
  '/terms',
  '/privacy',
  '/api/waitlist',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/site.webmanifest'
];

/**
 * Next.js middleware for domain-based and role-based access control
 * This runs before the page renders and redirects users based on domain and role
 */
export function middleware(request: NextRequest) {
  // Skip middleware in local development mode to make development easier
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }
  
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  // Check for simulation setting in localStorage
  // Note: localStorage is not accessible in middleware, so we use cookies
  const simulatedDomain = request.cookies.get('SIMULATE_DEV_DOMAIN')?.value;
  
  // Domain-based access control
  const isDev = hostname.startsWith('dev.') || 
                process.env.ENABLE_FULL_ACCESS === 'true' ||
                hostname.includes('replit.dev') ||
                simulatedDomain === 'true';
  
  // If this is the production domain (not dev)
  if (!isDev) {
    // Check if the path is a protected route
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );
    
    // If trying to access protected route on main domain, redirect to home
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Allow access to public routes on main domain
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );
    
    if (isPublicRoute) {
      return NextResponse.next();
    }
  }
  
  // If we get here, either it's the dev domain or a public route
  
  // For dashboard routes, we still apply role-based access control
  if (pathname.startsWith('/dashboard')) {
    // Find the matching path pattern
    const matchingPath = Object.keys(ROLE_PATH_MAP).find(path => 
      pathname === path || pathname.startsWith(`${path}/`)
    );
    
    // If no matching path in the role map, continue
    if (!matchingPath) {
      return NextResponse.next();
    }
    
    // Get the list of required roles for this path
    const requiredRoles = ROLE_PATH_MAP[matchingPath];
    
    // Check if test mode is enabled
    const isTestMode = request.cookies.get('isTestMode')?.value === 'true';
    
    // In test mode, allow access to all paths
    if (isTestMode) {
      return NextResponse.next();
    }
    
    // Get the current role from the cookie
    const currentRole = request.cookies.get('currentRole')?.value as UserRole | undefined;
    
    // If no role is set or the current role doesn't have access, redirect to the base dashboard
    if (!currentRole || !requiredRoles.includes(currentRole)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  // Allow access
  return NextResponse.next();
}

// Define which paths this middleware runs on
export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|assets|favicon.ico).*)'],
};