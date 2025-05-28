import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, UserRole, UserProfile } from '@/lib/supabase'

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
        setLoading(false)
        return
      }

      if (data) {
        setUserProfile(data)
      } else {
        // Create default profile if it doesn't exist
        const newProfile = {
          id: userId,
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
        } else {
          setUserProfile(createdProfile)
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (newRole: UserRole) => {
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
        return false
      }

      setUserProfile(data)
      return true
    } catch (error) {
      console.error('Error in updateUserRole:', error)
      return false
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      return false
    }
    return true
  }

  return {
    user,
    userProfile,
    role: userProfile?.role || 'viewer',
    loading,
    updateUserRole,
    signOut,
    isAuthenticated: !!user
  }
}