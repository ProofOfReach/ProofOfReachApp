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
        where: { id: userId },
        include: {
          roles: {
            where: { isActive: true },
            orderBy: { assignedAt: 'desc' }
          }
        }
      })

      // If user doesn't exist, create them with viewer role
      if (!user) {
        user = await prisma.user.create({
          data: {
            id: userId,
            nostrPubkey: userId, // Use userId as pubkey for Supabase users
            isActive: true,
            isTestUser: false,
            roles: {
              create: {
                role: 'viewer',
                isActive: true,
                assignedAt: new Date()
              }
            }
          },
          include: {
            roles: {
              where: { isActive: true },
              orderBy: { assignedAt: 'desc' }
            }
          }
        })
      }

      // Get the most recent active role
      const currentRole = user.roles[0]?.role || 'viewer'

      return {
        id: userId,
        email: user.email || undefined,
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
          email: email || null,
          isActive: true,
          isTestUser: false,
          roles: {
            create: {
              role: role || 'viewer',
              isActive: true,
              assignedAt: new Date()
            }
          }
        },
        update: {
          email: email || undefined,
          updatedAt: new Date()
        },
        include: {
          roles: {
            where: { isActive: true },
            orderBy: { assignedAt: 'desc' }
          }
        }
      })

      // If role is provided and different from current, update it
      if (role && user.roles[0]?.role !== role) {
        await this.updateUserRole(userId, role)
        // Refetch user with updated role
        return this.getUserProfile(userId)
      }

      const currentRole = user.roles[0]?.role || 'viewer'

      return {
        id: userId,
        email: user.email || undefined,
        role: currentRole as UserRole,
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
          isActive: true,
          assignedAt: new Date()
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
          step: 'complete',
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
}

export const userProfileService = new UserProfileService()