import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

// Get Supabase environment variables with validation
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Ensure we have the correct URL and key format
const supabaseUrl = rawUrl.startsWith('https://') ? rawUrl : 'https://vmshptyrqojyydjibwqm.supabase.co'
const supabaseAnonKey = rawKey.startsWith('eyJ') ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtc2hwdHlycW9qeXlkamlid3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMDM1NDcsImV4cCI6MjA2Mzc3OTU0N30.v_BhU7lacLEFOZ-2OeD0kFnU83sIccW7RBNJSEimzF8'

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
