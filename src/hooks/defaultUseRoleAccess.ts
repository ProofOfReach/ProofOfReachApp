/**
 * Default Role Access Hook
 * Provides basic role access functionality
 */

import { useState } from 'react';
import { UserRole } from '../types/role';

export interface RoleAccessReturn {
  hasRole: (role: UserRole) => boolean;
  isLoading: boolean;
  currentRole: UserRole | null;
}

export function defaultUseRoleAccess(): RoleAccessReturn {
  const [currentRole] = useState<UserRole | null>('viewer');
  const [isLoading] = useState(false);
  
  const hasRole = (role: UserRole): boolean => {
    return currentRole === role;
  };

  return {
    hasRole,
    isLoading,
    currentRole
  };
}

export default defaultUseRoleAccess;