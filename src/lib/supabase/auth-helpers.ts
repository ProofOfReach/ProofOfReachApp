import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function getAuthenticatedUser() {
  const supabase = createServerSupabaseClient()
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Unauthorized')
  }

  // Get user profile with role information
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    user,
    profile,
  }
}

export async function requireRole(allowedRoles: string[]) {
  const { profile } = await getAuthenticatedUser()
  
  if (!allowedRoles.includes(profile.current_role)) {
    throw new Error(`Forbidden: Requires one of: ${allowedRoles.join(', ')}`)
  }
  
  return profile
}
