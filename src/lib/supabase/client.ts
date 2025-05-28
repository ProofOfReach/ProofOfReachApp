import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Ensure environment variables are available before creating client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found, falling back to mock client')
}

// Create Supabase client with proper validation and complete mock
export const supabase = supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://') 
  ? createClientComponentClient({
      supabaseUrl,
      supabaseKey: supabaseAnonKey
    })
  : {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: (callback: any) => {
          // Return a subscription object with unsubscribe method
          return {
            data: { subscription: { unsubscribe: () => {} } },
            error: null
          }
        }
      }
    } as any
