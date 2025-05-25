import { useState, useEffect } from 'react'
import { useAuth } from '@/providers/SupabaseAuthProvider'
import { supabase } from '@/lib/supabase/client'

export type UserRole = 'viewer' | 'advertiser' | 'publisher' | 'admin' | 'stakeholder'

export function useSupabaseRole() {
  const { user, loading: authLoading } = useAuth()
  const [currentRole, setCurrentRole] = useState<UserRole>('viewer')
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>(['viewer'])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      setCurrentRole('viewer')
      setAvailableRoles(['viewer'])
      setLoading(false)
      return
    }

    fetchUserRole()
  }, [user, authLoading])

  const fetchUserRole = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('current_role, available_roles')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user role:', error)
      setCurrentRole('viewer')
      setAvailableRoles(['viewer'])
    } else {
      setCurrentRole(data.current_role as UserRole)
      setAvailableRoles(data.available_roles as UserRole[])
    }
    
    setLoading(false)
  }

  const switchRole = async (newRole: UserRole) => {
    if (!user || !availableRoles.includes(newRole)) return false

    const { error } = await supabase
      .from('profiles')
      .update({ current_role: newRole })
      .eq('id', user.id)

    if (error) {
      console.error('Error switching role:', error)
      return false
    }

    setCurrentRole(newRole)
    return true
  }

  const hasRole = (role: UserRole) => availableRoles.includes(role)
  
  const hasPermission = (permission: string) => {
    // Define permissions based on roles
    const rolePermissions = {
      viewer: ['VIEW_ADS'],
      advertiser: ['VIEW_ADS', 'CREATE_CAMPAIGNS', 'MANAGE_CAMPAIGNS'],
      publisher: ['VIEW_ADS', 'MANAGE_AD_SPACES', 'APPROVE_ADS'],
      admin: ['VIEW_ADS', 'CREATE_CAMPAIGNS', 'MANAGE_CAMPAIGNS', 'MANAGE_AD_SPACES', 'APPROVE_ADS', 'MANAGE_USERS', 'MANAGE_ROLES'],
      stakeholder: ['VIEW_ADS', 'VIEW_ANALYTICS', 'VIEW_REPORTS'],
    }
    
    return rolePermissions[currentRole]?.includes(permission) || false
  }

  return {
    currentRole,
    availableRoles,
    loading,
    switchRole,
    hasRole,
    hasPermission,
    refetch: fetchUserRole,
  }
}
