import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Create Supabase client with error handling
let supabase: ReturnType<typeof createClientComponentClient> | null = null;

try {
  supabase = createClientComponentClient();
} catch (error) {
  console.warn('Supabase client creation failed:', error);
  supabase = null;
}

export { supabase }
