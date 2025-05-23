import type { NextApiRequest, NextApiResponse } from 'next';
import "./lib/auth';
import "./lib/prismaClient';
import { UserRole } from '../../../context/RoleContext';

type ResponseData = {
  success: boolean;
  roles?: UserRole[];
  error?: string;
}

// Handle role changes for a user
async function handleSetRole(req: NextApiRequest, res: NextApiResponse<ResponseData>, pubkey: string) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { role, enabled } = req.body;

    if (!role || typeof role !== 'string' || !['viewer', 'advertiser', 'publisher'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid role specified. Valid roles are: user, advertiser, publisher'
      });
    }

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        error: 'enabled must be a boolean value'
      });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { nostrPubkey: pubkey }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // If enabling a role, add it to UserRole table if it doesn't exist
    if (enabled) {
      // Check if the role already exists
      const existingRole = await prisma.userRole.findFirst({
        where: {
          userId: user.id,
          role: role
        }
      });
      
      // If it doesn't exist, create it
      if (!existingRole) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            role: role,
            isActive: true
          }
        });
      } else if (!existingRole.isActive) {
        // If it exists but is inactive, reactivate it
        await prisma.userRole.update({
          where: { id: existingRole.id },
          data: { isActive: true }
        });
      }
      
      // Update user's current role to the newly enabled role
      await prisma.user.update({
        where: { id: user.id },
        data: { currentRole: role }
      });
    } else {
      // If disabling a role, set it to inactive in UserRole table
      const existingRole = await prisma.userRole.findFirst({
        where: {
          userId: user.id,
          role: role
        }
      });
      
      if (existingRole) {
        await prisma.userRole.update({
          where: { id: existingRole.id },
          data: { isActive: false }
        });
      }
      
      // If disabling the current role, switch to a different active role
      if (user.currentRole === role) {
        // Find another active role to switch to
        const activeRole = await prisma.userRole.findFirst({
          where: {
            userId: user.id,
            isActive: true,
            role: { not: role }
          }
        });
        
        // Default to 'viewer' if no other active roles
        const newRole = activeRole?.role || 'viewer';
        
        // Update current role
        await prisma.user.update({
          where: { id: user.id },
          data: { currentRole: newRole }
        });
      }
    }

    // Get all active roles for the user
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId: user.id,
        isActive: true
      }
    });

    // Map to role names
    const roles: UserRole[] = userRoles.map(role => role.role as UserRole);
    
    // Always include the 'viewer' role
    if (!roles.includes('viewer')) {
      roles.push('viewer');
    }

    return res.status(200).json({ 
      success: true,
      roles
    });
  } catch (error) {
    console.logger.error('Error updating user role:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to update user role' 
    });
  }
}

// Process API requests with auth middleware
const handleRequest = async (req: NextApiRequest, res: NextApiResponse<ResponseData>, pubkey: string, userId: string) => {
  return handleSetRole(req, res, pubkey);
};

// Export with auth middleware
export default requireAuth(handleRequest);