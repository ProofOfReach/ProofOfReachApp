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

/**
 * Next.js middleware for role-based access control
 * This runs before the page renders and redirects users if they don't have the required role
 */
export function middleware(request: NextRequest) {
  // Skip middleware in development mode to make development easier
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }
  
  // Check if the request is for a role-protected route
  const { pathname } = request.nextUrl;
  
  // Find the matching path pattern
  const matchingPath = Object.keys(ROLE_PATH_MAP).find(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // If no matching path, continue
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
  
  // Allow access
  return NextResponse.next();
}

// Define which paths this middleware runs on
export const config = {
  matcher: ['/dashboard/:path*'],
};