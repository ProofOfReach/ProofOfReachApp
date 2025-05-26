'use client'

import { useAuth } from '@/providers/SupabaseAuthProvider'
import { useSupabaseRole } from '@/hooks/useSupabaseRole'

export function TestModeBanner() {
  const { user } = useAuth()
  const { currentRole, switchRole, availableRoles } = useSupabaseRole()

  // Show test mode banner in development or for test users
  const isTestMode = process.env.NODE_ENV === 'development' || user?.user_metadata?.is_test_user

  // Hide test mode banner completely for cleaner interface
  return null
}