import { createClient } from '@supabase/supabase-js'

// Get environment variables with validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Debug logging to identify the issue
console.log('🔍 Supabase config debug:', {
  urlLength: supabaseUrl.length,
  keyLength: supabaseAnonKey.length,
  urlStartsWith: supabaseUrl.substring(0, 20),
  keyStartsWith: supabaseAnonKey.substring(0, 20)
})

// Validate URL format (should start with https://)
const isValidUrl = supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co')
// Validate key format (should be a JWT token starting with eyJ)
const isValidKey = supabaseAnonKey.startsWith('eyJ') && supabaseAnonKey.length > 100

let supabaseClient
if (!isValidUrl || !isValidKey) {
  console.warn('⚠️ Supabase environment variables not configured properly')
  console.warn('URL valid:', isValidUrl, 'Key valid:', isValidKey)
  
  // Create a minimal client for development that won't break the app
  supabaseClient = createClient('https://placeholder.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDk0MDYxMzIsImV4cCI6MTk2NDk4MjEzMn0.placeholder', {
    auth: {
      persistSession: false,
    }
  })
} else {
  console.log('✅ Creating Supabase client with valid credentials')
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