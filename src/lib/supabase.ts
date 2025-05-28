import { createClient } from '@supabase/supabase-js'

// Get the correct environment variables (URL should be URL, KEY should be KEY)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create Supabase client with proper fallback
let supabaseClient
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured properly')
  // Create a dummy client that won't break the app
  supabaseClient = createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      persistSession: false,
    }
  })
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = supabaseClient

export type UserRole = 'viewer' | 'advertiser' | 'publisher' | 'admin' | 'stakeholder'

export interface UserProfile {
  id: string
  email?: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>
      }
    }
  }
}