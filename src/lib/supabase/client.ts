import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

// Handle swapped environment variables as requested by user
// If the values don't look correct, use development fallback
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

// Check if we have valid URL format and use fallback for development if needed
const supabaseUrl = rawUrl.startsWith('https://') ? rawUrl : 'https://localhost:54321'
const supabaseAnonKey = rawKey.startsWith('eyJ') ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsaG9zdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ2NjI4MjAwLCJleHAiOjE5NjIyMDQyMDB9.NqHW2rKOPq-AcO9QGFJfTvt4bTpJNGjYzpKPQk0bkJI'

// Create Supabase client for client-side operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// User role types
export type UserRole = 'viewer' | 'advertiser' | 'publisher' | 'admin' | 'stakeholder'

// User profile interface
export interface UserProfile {
  id: string
  role: UserRole
  nostr_pubkey?: string
  display_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}
