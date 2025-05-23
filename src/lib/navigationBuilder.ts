import { ReactNode } from 'react';
import '@/components/ui/nav-group';

// Define role type for type safety
export type UserRole = 'viewer' | 'advertiser' | 'publisher' | 'admin' | 'stakeholder';

// Define icon names
export type IconName = 
  | 'home' 
  | 'settings' 
  | 'viewer' 
  | 'chart' 
  | 'file' 
  | 'shield'
  | 'edit' 
  | 'dollar' 
  | 'code' 
  | 'check' 
  | 'pie' 
  | 'logout'
  | 'megaphone'
  | 'sats'
  | 'bitcoin';

// Extended NavItem with icon name
export interface NavItemWithIconName extends Omit<NavItem, 'icon'> {
  iconName: IconName;
}

/**
 * Interface for a navigation section which groups related menu items
 */
export interface NavSection {
  title: string;
  items: NavItemWithIconName[];
}

/**
 * Builds navigation sections for a given role
 * @param role The user role
 * @param currentPath Current active path
 * @returns Array of navigation sections
 */
export function buildNavigation(role: UserRole, currentPath: string): NavSection[] {
  // Common navigation items available to all roles
  const commonItems: NavItemWithIconName[] = [
    {
      label: 'Dashboard',
      href: `/dashboard`,
      iconName: 'home',
      active: currentPath === `/dashboard`
    },
    {
      label: 'Settings',
      href: `/dashboard/settings`,
      iconName: 'settings',
      active: currentPath === `/dashboard/settings`
    }
  ];

  // Role-specific main navigation items
  const mainItems: Record<UserRole, NavItemWithIconName[]> = {
    viewer: [
      {
        label: 'Nostr Feed',
        href: '/nostr-feed',
        iconName: 'pie',
        active: currentPath === '/nostr-feed'
      },
      {
        label: 'My Wallet',
        href: '/dashboard/wallet',
        iconName: 'bitcoin',
        active: currentPath === '/dashboard/wallet'
      }
    ],
    advertiser: [
      {
        label: 'Campaigns',
        href: '/dashboard/campaigns',
        iconName: 'megaphone',
        active: currentPath === '/dashboard/campaigns'
      },
      {
        label: 'Analytics',
        href: '/dashboard/analytics',
        iconName: 'chart',
        active: currentPath === '/dashboard/analytics'
      },
      {
        label: 'Billing',
        href: '/dashboard/billing',
        iconName: 'bitcoin',
        active: currentPath === '/dashboard/billing'
      }
    ],
    publisher: [
      {
        label: 'Ad Spaces',
        href: '/dashboard/spaces',
        iconName: 'file',
        active: currentPath === '/dashboard/spaces'
      },
      {
        label: 'Approvals',
        href: '/dashboard/approvals',
        iconName: 'check',
        active: currentPath === '/dashboard/approvals'
      },
      {
        label: 'Analytics',
        href: '/dashboard/analytics',
        iconName: 'chart',
        active: currentPath === '/dashboard/analytics'
      },
      {
        label: 'Earnings',
        href: '/dashboard/earnings',
        iconName: 'bitcoin',
        active: currentPath === '/dashboard/earnings'
      }
    ],
    admin: [
      {
        label: 'Users',
        href: '/dashboard/users',
        iconName: 'viewer',
        active: currentPath === '/dashboard/users'
      },
      {
        label: 'Campaigns',
        href: '/dashboard/campaigns',
        iconName: 'megaphone',
        active: currentPath === '/dashboard/campaigns'
      },
      {
        label: 'Role Management',
        href: '/dashboard/role-management',
        iconName: 'shield',
        active: currentPath === '/dashboard/role-management'
      }
    ],
    stakeholder: [
      {
        label: 'Analytics',
        href: '/dashboard/analytics',
        iconName: 'chart',
        active: currentPath === '/dashboard/analytics'
      },
      {
        label: 'Financials',
        href: '/dashboard/financials',
        iconName: 'dollar',
        active: currentPath === '/dashboard/financials'
      }
    ]
  };

  // Developer tools available to all roles
  const developerItems: NavItemWithIconName[] = [
    {
      label: 'Developer',
      href: '/dashboard/developer',
      iconName: 'code',
      active: currentPath === '/dashboard/developer'
    },
    {
      label: 'Component Examples',
      href: '/examples',
      iconName: 'code',
      active: currentPath === '/examples' || currentPath.startsWith('/examples/')
    }
  ];

  // Build sections
  return [
    {
      title: 'Menu',
      items: [...commonItems, ...mainItems[role]]
    },
    {
      title: 'Developer Tools',
      items: developerItems
    }
  ];
}

/**
 * Creates a logout navigation item
 * @param onLogout Logout callback function
 * @returns Logout navigation item
 */
export function createLogoutItem(onLogout: () => void): NavItemWithIconName {
  return {
    label: 'Logout',
    href: '#logout',
    iconName: 'logout',
    active: false
  };
}

/**
 * Gets icon and color for a specific role
 * @param role User role
 * @returns Object containing icon name and color classes
 */
export function getRoleIconAndColor(role: string): { 
  iconName: IconName; 
  bgColor: string; 
  textColor: string; 
  label: string;
} {
  const roleConfig: Record<UserRole, {
    iconName: IconName;
    bgColor: string;
    textColor: string;
    label: string;
  }> = {
    viewer: {
      iconName: 'viewer',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-300',
      label: 'Viewer'
    },
    advertiser: {
      iconName: 'megaphone',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      textColor: 'text-orange-700 dark:text-orange-300',
      label: 'Advertiser'
    },
    publisher: {
      iconName: 'edit',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-300',
      label: 'Publisher'
    },
    admin: {
      iconName: 'shield',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      textColor: 'text-purple-700 dark:text-purple-300',
      label: 'Admin'
    },
    stakeholder: {
      iconName: 'dollar',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/20',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      label: 'Stakeholder'
    }
  };

  return roleConfig[role];
}