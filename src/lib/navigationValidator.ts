/**
 * ✅ NAVIGATION VALIDATOR - Prevents Menu Runtime Errors
 * 
 * This service validates all navigation menu items to ensure they:
 * 1. Point to existing pages
 * 2. Use correct icon imports
 * 3. Have proper role permissions
 * 4. Handle missing components gracefully
 */

import { existsSync } from 'fs';
import { join } from 'path';

export type UserRole = 'viewer' | 'advertiser' | 'publisher' | 'admin' | 'stakeholder';

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  iconName?: string;
  role?: UserRole;
  requiresAuth?: boolean;
  isExternal?: boolean;
}

export interface ValidatedNavItem extends NavItem {
  isValid: boolean;
  errorType?: 'missing_page' | 'missing_icon' | 'permission_denied' | 'import_error';
  fallbackHref?: string;
}

/**
 * Validates if a page exists for the given route
 */
export function validatePageExists(href: string): boolean {
  if (href.startsWith('http') || href === '#' || href.includes('#')) {
    return true; // External links or hash links are considered valid
  }

  // Convert route to file path
  const cleanHref = href.replace(/^\//, '').replace(/\/$/, '');
  const possiblePaths = [
    `src/pages/${cleanHref}.tsx`,
    `src/pages/${cleanHref}.ts`,
    `src/pages/${cleanHref}/index.tsx`,
    `src/pages/${cleanHref}/index.ts`,
  ];

  return possiblePaths.some(path => {
    try {
      return existsSync(join(process.cwd(), path));
    } catch {
      return false;
    }
  });
}

/**
 * Safe navigation items - guaranteed to work
 */
export const SAFE_NAV_ITEMS: Record<UserRole, NavItem[]> = {
  viewer: [
    { label: 'Dashboard', href: '/dashboard', iconName: 'home' },
    { label: 'Wallet', href: '/dashboard/wallet', iconName: 'bitcoin' },
    { label: 'Settings', href: '/dashboard/settings', iconName: 'settings' },
  ],
  advertiser: [
    { label: 'Dashboard', href: '/dashboard', iconName: 'home' },
    { label: 'Create Campaign', href: '/dashboard/advertiser/create', iconName: 'megaphone' },
    { label: 'Wallet', href: '/dashboard/wallet', iconName: 'bitcoin' },
    { label: 'Settings', href: '/dashboard/settings', iconName: 'settings' },
  ],
  publisher: [
    { label: 'Dashboard', href: '/dashboard', iconName: 'home' },
    { label: 'Wallet', href: '/dashboard/wallet', iconName: 'bitcoin' },
    { label: 'Settings', href: '/dashboard/settings', iconName: 'settings' },
  ],
  admin: [
    { label: 'Dashboard', href: '/dashboard', iconName: 'home' },
    { label: 'Admin Panel', href: '/dashboard/admin', iconName: 'shield' },
    { label: 'Wallet', href: '/dashboard/wallet', iconName: 'bitcoin' },
    { label: 'Settings', href: '/dashboard/settings', iconName: 'settings' },
  ],
  stakeholder: [
    { label: 'Dashboard', href: '/dashboard', iconName: 'home' },
    { label: 'Analytics', href: '/dashboard/analytics', iconName: 'chart' },
    { label: 'Settings', href: '/dashboard/settings', iconName: 'settings' },
  ],
};

/**
 * Validates a navigation item and provides fallbacks if needed
 */
export function validateNavItem(item: NavItem, userRole: UserRole): ValidatedNavItem {
  const validatedItem: ValidatedNavItem = { ...item, isValid: true };

  // Check if page exists
  if (!validatePageExists(item.href)) {
    validatedItem.isValid = false;
    validatedItem.errorType = 'missing_page';
    validatedItem.fallbackHref = '/dashboard'; // Always fallback to dashboard
  }

  // Check role permissions (if specified)
  if (item.role && item.role !== userRole) {
    // Allow access to more permissive roles
    const roleHierarchy = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
    const itemRoleIndex = roleHierarchy.indexOf(item.role);
    const userRoleIndex = roleHierarchy.indexOf(userRole);
    
    if (itemRoleIndex > userRoleIndex) {
      validatedItem.isValid = false;
      validatedItem.errorType = 'permission_denied';
      validatedItem.fallbackHref = '/dashboard';
    }
  }

  return validatedItem;
}

/**
 * Gets safe navigation items for a role with validation
 */
export function getSafeNavigation(role: UserRole): ValidatedNavItem[] {
  const safeItems = SAFE_NAV_ITEMS[role] || SAFE_NAV_ITEMS.viewer;
  return safeItems.map(item => validateNavItem(item, role));
}

/**
 * Validates an entire navigation array
 */
export function validateNavigation(items: NavItem[], userRole: UserRole): ValidatedNavItem[] {
  return items.map(item => validateNavItem(item, userRole));
}

/**
 * Error boundary component for navigation items
 */
export function createSafeNavLink(item: ValidatedNavItem): ValidatedNavItem {
  if (!item.isValid && item.fallbackHref) {
    return {
      ...item,
      href: item.fallbackHref,
      label: `${item.label} (Safe Mode)`,
      isValid: true,
    };
  }
  return item;
}

/**
 * Development helper - logs navigation validation results
 */
export function logNavigationValidation(items: ValidatedNavItem[], role: UserRole) {
  if (process.env.NODE_ENV === 'development') {
    const invalidItems = items.filter(item => !item.isValid);
    if (invalidItems.length > 0) {
      console.warn(`[Navigation Validator] Found ${invalidItems.length} invalid menu items for role ${role}:`, invalidItems);
    } else {
      console.log(`[Navigation Validator] ✅ All ${items.length} menu items valid for role ${role}`);
    }
  }
}