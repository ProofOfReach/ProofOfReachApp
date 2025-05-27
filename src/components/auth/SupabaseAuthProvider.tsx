/**
 * Enterprise Supabase Authentication Provider
 * 
 * Complete authentication provider for your decentralized ad marketplace
 * using enterprise-grade Supabase authentication.
 */

import React from 'react';
import { SupabaseAuthContext, useSupabaseAuthProvider } from '../../hooks/useSupabaseAuth';

interface SupabaseAuthProviderProps {
  children: React.ReactNode;
}

export const SupabaseAuthProvider: React.FC<SupabaseAuthProviderProps> = ({ children }) => {
  const authProvider = useSupabaseAuthProvider();

  return (
    <SupabaseAuthContext.Provider value={authProvider}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export default SupabaseAuthProvider;