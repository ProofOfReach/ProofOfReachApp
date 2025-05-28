import { UserRole } from '../lib/supabase'
import { prisma } from '../lib/prisma'

export interface UserProfile {
  id: string
  email?: string
  role: UserRole
  created_at: Date
  updated_at: Date
}

class UserProfileService {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Check if user exists in the User table
      let user = await prisma.user.findUnique({
        where: { id: userId }
      })

      // If user doesn't exist, create them with viewer role
      if (!user) {
        user = await prisma.user.create({
          data: {
            id: userId,
            nostrPubkey: userId, // Use userId as pubkey for Supabase users
            currentRole: 'viewer',
            isActive: true,
            isTestUser: false
          }
        })

        // Create UserRole entry
        await prisma.userRole.create({
          data: {
            userId: userId,
            role: 'viewer',
            isActive: true
          }
        })
      }

      // Get the current role from the user record
      const currentRole = user.currentRole || 'viewer'

      return {
        id: userId,
        email: undefined, // User table doesn't have email field
        role: currentRole as UserRole,
        created_at: user.createdAt,
        updated_at: user.updatedAt
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  async createOrUpdateProfile(userId: string, email?: string, role?: UserRole): Promise<UserProfile | null> {
    try {
      // Create or update user
      const user = await prisma.user.upsert({
        where: { id: userId },
        create: {
          id: userId,
          nostrPubkey: userId,
          currentRole: role || 'viewer',
          isActive: true,
          isTestUser: false
        },
        update: {
          updatedAt: new Date()
        }
      })

      // If role is provided and different from current, update it
      if (role && user.currentRole !== role) {
        await this.updateUserRole(userId, role)
        // Refetch user with updated role
        return this.getUserProfile(userId)
      }

      // Ensure UserRole entry exists
      const existingRole = await prisma.userRole.findFirst({
        where: {
          userId: userId,
          role: user.currentRole
        }
      })

      if (!existingRole) {
        await prisma.userRole.create({
          data: {
            userId: userId,
            role: user.currentRole,
            isActive: true
          }
        })
      }

      return {
        id: userId,
        email: undefined, // User table doesn't have email field
        role: user.currentRole as UserRole,
        created_at: user.createdAt,
        updated_at: user.updatedAt
      }
    } catch (error) {
      console.error('Error creating/updating user profile:', error)
      return null
    }
  }

  async updateUserRole(userId: string, role: UserRole): Promise<UserProfile | null> {
    try {
      // Deactivate current roles
      await prisma.userRole.updateMany({
        where: {
          userId: userId,
          isActive: true
        },
        data: {
          isActive: false
        }
      })

      // Create new active role
      await prisma.userRole.create({
        data: {
          userId: userId,
          role: role,
          isActive: true
        }
      })

      // Update user timestamp
      await prisma.user.update({
        where: { id: userId },
        data: { updatedAt: new Date() }
      })

      return this.getUserProfile(userId)
    } catch (error) {
      console.error('Error updating user role:', error)
      return null
    }
  }

  async saveOnboardingRole(userId: string, role: UserRole, email?: string): Promise<boolean> {
    try {
      await this.createOrUpdateProfile(userId, email, role)
      
      // Also save to UserOnboarding table for tracking
      await prisma.userOnboarding.upsert({
        where: {
          userPubkey_role: {
            userPubkey: userId,
            role: role
          }
        },
        create: {
          userId: userId,
          userPubkey: userId,
          role: role,
          isComplete: true,
          completedAt: new Date()
        },
        update: {
          isComplete: true,
          completedAt: new Date(),
          updatedAt: new Date()
        }
      })

      return true
    } catch (error) {
      console.error('Error saving onboarding role:', error)
      return false
    }
  }

  // Method for onboarding that works with Supabase current session
  async updateCurrentUserRole(role: UserRole): Promise<boolean> {
    try {
      // Get the current Supabase session to include the auth token
      const { supabase } = await import('../lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        console.error('No valid Supabase session found')
        return false
      }

      // Make API call with proper authorization
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ role })
      })

      if (response.ok) {
        return true
      } else {
        console.error('Failed to update user role:', response.statusText)
        return false
      }
    } catch (error) {
      console.error('Error updating current user role:', error)
      return false
    }
  }
}

export const userProfileService = new UserProfileService()