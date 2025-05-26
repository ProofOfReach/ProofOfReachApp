/**
 * Default Role Access Hook for the Nostr Ad Marketplace
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export interface RoleAccessHook {
  currentRole: string;
  availableRoles: string[];
  setRole: (role: string) => Promise<boolean>;
  checkRole: (role: string) => { isAllowed: boolean };
  checkRouteAccess: () => { isAllowed: boolean };
  enforceRouteAccess: () => boolean;
}

/**
 * Default implementation of role access hook
 */
export default function defaultUseRoleAccess(): RoleAccessHook {
  const [currentRole, setCurrentRole] = useState<string>('viewer');
  const router = useRouter();

  const availableRoles = ['viewer', 'advertiser', 'publisher', 'admin'];

  useEffect(() => {
    // Listen for role change events
    const handleRoleChange = (event: any) => {
      if (event.detail?.to) {
        setCurrentRole(event.detail.to);
      }
    };

    document.addEventListener('roleSwitched', handleRoleChange);
    return () => {
      document.removeEventListener('roleSwitched', handleRoleChange);
    };
  }, []);

  const setRole = async (role: string): Promise<boolean> => {
    try {
      setCurrentRole(role);
      return true;
    } catch (error) {
      console.error('Error setting role:', error);
      return false;
    }
  };

  const checkRole = (role: string) => {
    return { isAllowed: availableRoles.includes(role) };
  };

  const checkRouteAccess = () => {
    const pathname = router.pathname;
    
    // Simple route access logic
    if (pathname.includes('/admin') && currentRole !== 'admin') {
      return { isAllowed: false };
    }
    
    return { isAllowed: true };
  };

  const enforceRouteAccess = (): boolean => {
    const access = checkRouteAccess();
    
    if (!access.isAllowed) {
      router.push('/dashboard');
      return false;
    }
    
    return true;
  };

  return {
    currentRole,
    availableRoles,
    setRole,
    checkRole,
    checkRouteAccess,
    enforceRouteAccess
  };
}

export { defaultUseRoleAccess };