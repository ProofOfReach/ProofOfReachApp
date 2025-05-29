'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'
import type { UserRole } from '@/lib/supabase/client'

interface AuthState {
  user: User | null
  session: Session | null
  userProfile: any | null
  role: UserRole
  loading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  signInWithNostr: (pubkey: string, role?: UserRole) => Promise<boolean>
  signOut: () => Promise<void>
  updateUserRole: (newRole: UserRole) => Promise<boolean>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

interface UnifiedAuthProviderProps {
  children: ReactNode
}

export function UnifiedAuthProvider({ children }: UnifiedAuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    userProfile: null,
    role: 'viewer',
    loading: true,
    isAuthenticated: false
  })

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setAuthState(prev => ({ ...prev, loading: false }))
          return
        }

        if (session?.user) {
          await updateAuthState(session.user, session)
        } else {
          // Check for legacy localStorage session
          const legacyRole = localStorage.getItem('currentRole') as UserRole || 'viewer'
          setAuthState(prev => ({ 
            ...prev, 
            role: legacyRole,
            loading: false 
          }))
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setAuthState(prev => ({ ...prev, loading: false }))
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        if (session?.user) {
          await updateAuthState(session.user, session)
        } else {
          setAuthState(prev => ({
            ...prev,
            user: null,
            session: null,
            userProfile: null,
            isAuthenticated: false,
            loading: false
          }))
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const updateAuthState = async (user: User, session: Session) => {
    try {
      // Get user profile and role from metadata or database
      const role = (user.user_metadata?.role as UserRole) || 'viewer'
      
      setAuthState({
        user,
        session,
        userProfile: user.user_metadata,
        role,
        loading: false,
        isAuthenticated: true
      })

      // Update localStorage for backward compatibility
      localStorage.setItem('currentRole', role)
    } catch (error) {
      console.error('Error updating auth state:', error)
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }

  const signInWithNostr = async (pubkey: string, role: UserRole = 'viewer'): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))

      // Create or sign in user with Supabase using Nostr pubkey as email
      // Use a proper email format that Supabase will accept
      const email = `${pubkey}@example.com`
      const password = pubkey // Use pubkey as password for simplicity
      
      // Try to sign in first
      let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      // If user doesn't exist, create account
      if (signInError && signInError.message?.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              pubkey,
              role,
              display_name: `User_${pubkey.slice(0, 8)}`
            }
          }
        })

        if (signUpError) {
          console.error('Error signing up:', signUpError)
          setAuthState(prev => ({ ...prev, loading: false }))
          return false
        }

        if (signUpData.user) {
          await updateAuthState(signUpData.user, signUpData.session!)
          return true
        }
      } else if (signInData.user) {
        await updateAuthState(signInData.user, signInData.session!)
        return true
      }

      setAuthState(prev => ({ ...prev, loading: false }))
      return false
    } catch (error) {
      console.error('Error in signInWithNostr:', error)
      setAuthState(prev => ({ ...prev, loading: false }))
      return false
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))
      
      await supabase.auth.signOut()
      
      // Clear localStorage
      localStorage.removeItem('currentRole')
      localStorage.removeItem('userProfile')
      
      setAuthState({
        user: null,
        session: null,
        userProfile: null,
        role: 'viewer',
        loading: false,
        isAuthenticated: false
      })
    } catch (error) {
      console.error('Error signing out:', error)
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }

  const updateUserRole = async (newRole: UserRole): Promise<boolean> => {
    try {
      if (!authState.user) return false

      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: { role: newRole }
      })

      if (error) {
        console.error('Error updating user role:', error)
        return false
      }

      setAuthState(prev => ({ ...prev, role: newRole }))
      localStorage.setItem('currentRole', newRole)
      return true
    } catch (error) {
      console.error('Error updating user role:', error)
      return false
    }
  }

  const refreshSession = async (): Promise<void> => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Error refreshing session:', error)
        return
      }

      if (session?.user) {
        await updateAuthState(session.user, session)
      }
    } catch (error) {
      console.error('Error refreshing session:', error)
    }
  }

  const contextValue: AuthContextType = {
    ...authState,
    signInWithNostr,
    signOut,
    updateUserRole,
    refreshSession
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useUnifiedAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useUnifiedAuth must be used within UnifiedAuthProvider')
  }
  return context
}

// Export for backward compatibility
export const useAuth = useUnifiedAuth