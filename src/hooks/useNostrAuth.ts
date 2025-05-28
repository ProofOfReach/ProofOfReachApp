import { useEffect, useState } from 'react'
import { supabase, UserRole, UserProfile } from '@/lib/supabase'
import { logger } from '@/lib/logger'

interface NostrAPI {
  getPublicKey(): Promise<string>
  signEvent(event: any): Promise<any>
}

declare global {
  interface Window {
    nostr?: NostrAPI
  }
}

export interface NostrAuthState {
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

export function useNostrAuth(): NostrAuthState {
  const [user, setUser] = useState<{ id: string; pubkey: string } | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasNostrExtension, setHasNostrExtension] = useState(false)

  // Check for Nostr extension on mount
  useEffect(() => {
    const checkNostrExtension = () => {
      if (typeof window !== 'undefined') {
        setHasNostrExtension(!!window.nostr)
      }
    }
    
    checkNostrExtension()
    
    // Check again after a short delay in case extension loads async
    const timer = setTimeout(checkNostrExtension, 100)
    return () => clearTimeout(timer)
  }, [])

  // Try to restore session from localStorage on mount
  useEffect(() => {
    const restoreSession = async () => {
      if (typeof window === 'undefined') return
      
      const storedPubkey = localStorage.getItem('nostr_pubkey')
      if (storedPubkey) {
        try {
          await authenticateWithPubkey(storedPubkey)
        } catch (error) {
          logger.log('Error restoring Nostr session:', error as Record<string, any>)
          localStorage.removeItem('nostr_pubkey')
        }
      }
      setLoading(false)
    }
    
    restoreSession()
  }, [])

  const authenticateWithPubkey = async (pubkey: string) => {
    try {
      // Use pubkey as user ID for Supabase
      const userData = { id: pubkey, pubkey }
      setUser(userData)
      
      // Store pubkey for session persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('nostr_pubkey', pubkey)
      }
      
      // Fetch or create user profile
      await fetchUserProfile(pubkey)
      return true
    } catch (error) {
      logger.log('Error authenticating with pubkey:', error)
      return false
    }
  }

  const fetchUserProfile = async (pubkey: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', pubkey)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
        return
      }

      if (data) {
        setUserProfile(data)
      } else {
        // Create default profile using pubkey as ID
        const newProfile = {
          id: pubkey,
          role: 'viewer' as UserRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single()

        if (createError) {
          console.error('Error creating user profile:', createError)
          // Create a local profile as fallback
          setUserProfile(newProfile)
        } else {
          setUserProfile(createdProfile)
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
      // Create a local profile as fallback
      setUserProfile({
        id: pubkey,
        role: 'viewer' as UserRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
  }

  const connectNostr = async (): Promise<boolean> => {
    if (!window.nostr) {
      console.error('Nostr extension not found')
      return false
    }

    try {
      setLoading(true)
      const pubkey = await window.nostr.getPublicKey()
      const success = await authenticateWithPubkey(pubkey)
      
      if (success) {
        logger.log('✅ Nostr authentication successful:', pubkey)
      }
      
      return success
    } catch (error) {
      console.error('Error connecting to Nostr:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (newRole: UserRole): Promise<boolean> => {
    if (!user || !userProfile) return false

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating user role:', error)
        // Update local state even if DB update fails
        setUserProfile(prev => prev ? { ...prev, role: newRole } : null)
        return false
      }

      setUserProfile(data)
      
      // Update localStorage for consistency
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentRole', newRole)
      }
      
      logger.log('✅ User role updated successfully:', newRole)
      return true
    } catch (error) {
      console.error('Error in updateUserRole:', error)
      // Update local state as fallback
      setUserProfile(prev => prev ? { ...prev, role: newRole } : null)
      return false
    }
  }

  const signOut = async (): Promise<boolean> => {
    try {
      setUser(null)
      setUserProfile(null)
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nostr_pubkey')
        localStorage.removeItem('currentRole')
        localStorage.removeItem('selectedRole')
        localStorage.removeItem('onboardingComplete')
      }
      
      logger.log('✅ User signed out successfully')
      return true
    } catch (error) {
      console.error('Error signing out:', error)
      return false
    }
  }

  return {
    user,
    userProfile,
    role: userProfile?.role || 'viewer',
    loading,
    updateUserRole,
    signOut,
    isAuthenticated: !!user,
    connectNostr,
    hasNostrExtension
  }
}