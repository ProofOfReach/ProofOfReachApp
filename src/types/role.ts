export type UserRole = 'viewer' | 'advertiser' | 'publisher' | 'admin' | 'stakeholder';

export interface RoleCapabilities {
  canCreateAds: boolean;
  canManageOwnAds: boolean;
  canApproveAds: boolean;
  canViewAnalytics: boolean;
  canManageRoles: boolean;
  canViewFinancialReports: boolean;
  canManageSystem: boolean;
}

export interface TestModeState {
  isActive: boolean;
  expiryTime: number | null;
  currentRole: string;
  availableRoles: string[];
  lastUpdated: number;
}

export const STORAGE_KEYS = {
  TEST_MODE: 'testMode',
  USER_ROLE: 'userRole',
  AUTH_TOKEN: 'authToken',
} as const;