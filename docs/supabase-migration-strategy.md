# Supabase Auth Migration Strategy

## Overview
This document outlines the complete migration strategy from the current fragmented authentication system to Supabase Auth, eliminating authentication complexity and runtime errors while providing enterprise-grade security.

## Benefits of Migration
- ✅ **Eliminates all test mode conflicts** and authentication complexity
- ✅ **Professional-grade security** with built-in JWT tokens and custom claims
- ✅ **Perfect Next.js integration** with session management
- ✅ **Built-in role management** system
- ✅ **Open source** with no vendor lock-in
- ✅ **Solves RoleManager and authentication runtime errors** permanently

## Pre-Migration Requirements

### 1. Supabase Project Setup
- [ ] Create free Supabase account at https://supabase.com
- [ ] Create new project (choose closest region)
- [ ] Obtain project credentials:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (for server-side operations)

### 2. Dependencies Installation
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

## Migration Phase 1: Core Supabase Setup (30 minutes)

### Step 1.1: Environment Configuration
Create/update `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Keep existing variables for backward compatibility during migration
DATABASE_URL=your_existing_database_url
```

### Step 1.2: Supabase Client Configuration
Create `src/lib/supabase/client.ts`:
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient()
```

Create `src/lib/supabase/server.ts`:
```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createServerSupabaseClient = () => {
  return createServerComponentClient({ cookies })
}
```

### Step 1.3: Database Schema Setup
In Supabase Dashboard SQL Editor, create user profiles table:
```sql
-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nostr_pubkey text,
  balance integer DEFAULT 0,
  current_role text DEFAULT 'viewer',
  available_roles text[] DEFAULT ARRAY['viewer'],
  is_test_user boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
```

## Migration Phase 2: Authentication Provider Replacement (45 minutes)

### Step 2.1: Create Supabase Auth Provider
Create `src/providers/SupabaseAuthProvider.tsx`:
```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  getUserProfile: () => Promise<any>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  getUserProfile: async () => null,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within SupabaseAuthProvider')
  }
  return context
}

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Create profile on sign up
      if (event === 'SIGNED_UP' && session?.user) {
        await createUserProfile(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const createUserProfile = async (user: User) => {
    const { error } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id,
          current_role: 'viewer',
          available_roles: ['viewer'],
          is_test_user: false,
          is_active: true,
        }
      ])
    
    if (error) {
      console.error('Error creating user profile:', error)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const getUserProfile = async () => {
    if (!user) return null
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
    
    return data
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signOut,
      getUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### Step 2.2: Create Unified Role Management Hook
Create `src/hooks/useSupabaseRole.ts`:
```typescript
import { useState, useEffect } from 'react'
import { useAuth } from '@/providers/SupabaseAuthProvider'
import { supabase } from '@/lib/supabase/client'

export type UserRole = 'viewer' | 'advertiser' | 'publisher' | 'admin' | 'stakeholder'

export function useSupabaseRole() {
  const { user, loading: authLoading } = useAuth()
  const [currentRole, setCurrentRole] = useState<UserRole>('viewer')
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>(['viewer'])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      setCurrentRole('viewer')
      setAvailableRoles(['viewer'])
      setLoading(false)
      return
    }

    fetchUserRole()
  }, [user, authLoading])

  const fetchUserRole = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('current_role, available_roles')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user role:', error)
      setCurrentRole('viewer')
      setAvailableRoles(['viewer'])
    } else {
      setCurrentRole(data.current_role as UserRole)
      setAvailableRoles(data.available_roles as UserRole[])
    }
    
    setLoading(false)
  }

  const switchRole = async (newRole: UserRole) => {
    if (!user || !availableRoles.includes(newRole)) return false

    const { error } = await supabase
      .from('profiles')
      .update({ current_role: newRole })
      .eq('id', user.id)

    if (error) {
      console.error('Error switching role:', error)
      return false
    }

    setCurrentRole(newRole)
    return true
  }

  const hasRole = (role: UserRole) => availableRoles.includes(role)
  
  const hasPermission = (permission: string) => {
    // Define permissions based on roles
    const rolePermissions = {
      viewer: ['VIEW_ADS'],
      advertiser: ['VIEW_ADS', 'CREATE_CAMPAIGNS', 'MANAGE_CAMPAIGNS'],
      publisher: ['VIEW_ADS', 'MANAGE_AD_SPACES', 'APPROVE_ADS'],
      admin: ['VIEW_ADS', 'CREATE_CAMPAIGNS', 'MANAGE_CAMPAIGNS', 'MANAGE_AD_SPACES', 'APPROVE_ADS', 'MANAGE_USERS', 'MANAGE_ROLES'],
      stakeholder: ['VIEW_ADS', 'VIEW_ANALYTICS', 'VIEW_REPORTS'],
    }
    
    return rolePermissions[currentRole]?.includes(permission) || false
  }

  return {
    currentRole,
    availableRoles,
    loading,
    switchRole,
    hasRole,
    hasPermission,
    refetch: fetchUserRole,
  }
}
```

## Migration Phase 3: Replace Existing Auth Components (60 minutes)

### Step 3.1: Update App Layout
Update `src/pages/_app.tsx` or `src/app/layout.tsx`:
```typescript
import { SupabaseAuthProvider } from '@/providers/SupabaseAuthProvider'

// Wrap your app with SupabaseAuthProvider
export default function App({ Component, pageProps }: AppProps) {
  return (
    <SupabaseAuthProvider>
      {/* Your existing providers */}
      <Component {...pageProps} />
    </SupabaseAuthProvider>
  )
}
```

### Step 3.2: Create Authentication Components
Create `src/components/auth/LoginForm.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      }
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for the login link!')
    }
    
    setLoading(false)
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="your@email.com"
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send Magic Link'}
      </button>
      
      {message && (
        <p className={`text-sm ${message.includes('Check') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </form>
  )
}
```

### Step 3.3: Update TestModeBanner Component
Update `src/components/TestModeBanner.tsx`:
```typescript
'use client'

import { useAuth } from '@/providers/SupabaseAuthProvider'
import { useSupabaseRole } from '@/hooks/useSupabaseRole'

export function TestModeBanner() {
  const { user } = useAuth()
  const { currentRole, switchRole, availableRoles } = useSupabaseRole()

  // Show test mode banner in development or for test users
  const isTestMode = process.env.NODE_ENV === 'development' || user?.user_metadata?.is_test_user

  if (!isTestMode) return null

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm">
            <strong>Test Mode Active</strong> - Current role: {currentRole}
          </p>
          <div className="mt-2">
            <select 
              value={currentRole} 
              onChange={(e) => switchRole(e.target.value as any)}
              className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-sm"
            >
              {availableRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## Migration Phase 4: API Routes Update (30 minutes)

### Step 4.1: Create Supabase Auth Middleware
Create `src/lib/supabase/middleware.ts`:
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/api/campaigns', '/api/ads']
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/campaigns/:path*', '/api/ads/:path*']
}
```

### Step 4.2: Update API Route Authentication
Create `src/lib/supabase/auth-helpers.ts`:
```typescript
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
```

## Migration Phase 5: Cleanup and Testing (45 minutes)

### Step 5.1: Remove Old Authentication Files
- [ ] Remove or deprecate existing auth providers
- [ ] Remove RoleManager service references
- [ ] Update import statements throughout the app
- [ ] Remove test mode service complexity

### Step 5.2: Update Components
- [ ] Replace `useAuth` hooks with `useAuth` from SupabaseAuthProvider
- [ ] Replace role management with `useSupabaseRole`
- [ ] Update navigation guards and route protection

### Step 5.3: Testing Checklist
- [ ] Test user registration flow
- [ ] Test email authentication
- [ ] Test role switching functionality
- [ ] Test protected route access
- [ ] Test API authentication
- [ ] Verify no runtime errors in console

## Post-Migration Benefits

### Immediate Fixes
- ✅ **No more RoleManager errors** - Eliminated completely
- ✅ **No more authentication runtime errors** - Stable auth system
- ✅ **No more test mode conflicts** - Unified approach
- ✅ **Simplified codebase** - Reduced complexity

### Long-term Advantages
- 🚀 **Enterprise-grade security** with JWT tokens
- 🚀 **Built-in user management** dashboard
- 🚀 **Scalable authentication** for future growth
- 🚀 **Better developer experience** with clear patterns

## Rollback Plan
If migration issues occur:
1. Keep existing auth files during migration
2. Use feature flags to switch between auth systems
3. Maintain database compatibility during transition
4. Have backup of current working state

## Timeline
- **Total estimated time**: 3-4 hours
- **Phase 1**: 30 minutes (Setup)
- **Phase 2**: 45 minutes (Provider)
- **Phase 3**: 60 minutes (Components)
- **Phase 4**: 30 minutes (API)
- **Phase 5**: 45 minutes (Cleanup)

## Next Steps
1. Get Supabase project credentials from user
2. Begin Phase 1 implementation
3. Test each phase before proceeding
4. Complete migration and verify all functionality

---

*This migration will transform your authentication system from a source of complexity to a foundation of strength!*