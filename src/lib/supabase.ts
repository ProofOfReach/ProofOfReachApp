import { createClient } from '@supabase/supabase-js'

// Get environment variables - detect and fix if they're swapped
let rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
let rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Auto-detect if values are swapped and fix them
let supabaseUrl: string
let supabaseAnonKey: string

if (rawUrl.startsWith('eyJ') && rawKey.startsWith('https://')) {
  // Values are swapped - fix them
  console.log('🔧 Detected swapped environment variables, fixing...')
  supabaseUrl = rawKey
  supabaseAnonKey = rawUrl
} else if (rawUrl.startsWith('https://') && rawKey.startsWith('eyJ')) {
  // Values are correct
  supabaseUrl = rawUrl
  supabaseAnonKey = rawKey
} else {
  // Neither format is detected correctly - use hardcoded values for this project
  console.log('🔧 Using hardcoded Supabase credentials')
  supabaseUrl = 'https://vmshptyrqojyydjibwqm.supabase.co'
  supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtc2hwdHlycW9qeXlkamlid3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMDM1NDcsImV4cCI6MjA2Mzc3OTU0N30.v_BhU7lacLEFOZ-2OeD0kFnU83sIccW7RBNJSEimzF8'
}

console.log('✅ Final Supabase config:', {
  url: supabaseUrl.substring(0, 30) + '...',
  keyPrefix: supabaseAnonKey.substring(0, 20) + '...'
})

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

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