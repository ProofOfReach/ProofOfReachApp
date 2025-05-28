import React, { createContext, useContext, ReactNode } from 'react'
import { useNostrAuth, NostrAuthState } from '@/hooks/useNostrAuth'
import { UserRole, UserProfile } from '@/lib/supabase'

interface AuthContextType {
  user: { id: string; pubkey: string } | null
  userProfile: UserProfile | null
  role: UserRole
  loading: boolean
  updateUserRole: (newRole: UserRole) => Promise<boolean>
  signOut: () => Promise<boolean>
  isAuthenticated: boolean
  connectNostr: () => Promise<boolean>
  hasNostrExtension: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider')
  }
  return context
}

interface SupabaseAuthProviderProps {
  children: ReactNode
}

export function SupabaseAuthProvider({ children }: SupabaseAuthProviderProps) {
  const authState = useNostrAuth()

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  )
}