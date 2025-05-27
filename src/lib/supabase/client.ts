import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Temporarily disable Supabase client to restore app functionality
// The credentials need to be properly configured
export const supabase = {
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signOut: () => Promise.resolve({ error: null })
  }
} as any
