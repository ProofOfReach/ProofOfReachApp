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
