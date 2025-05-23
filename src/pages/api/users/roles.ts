import { NextApiRequest, NextApiResponse } from 'next';
import { NextApiHandler } from 'next';
import type { UserRole } from '../../../types/auth';
import { logger } from '../../../lib/logger';
import { roleService } from '../../../services/roleService';
import { normalizeRole } from '../../../utils/roleNormalizer';

interface AddRoleRequest {
  pubkey: string;
  role: string;
}

/**
 * Handle API request for user roles
 */
const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Only allow POST and DELETE methods
  if (req.method === 'POST') {
    return await addRole(req, res);
  } else if (req.method === 'DELETE') {
    return await removeRole(req, res);
  } else {
    res.setHeader('Allow', ['POST', 'DELETE']);
    return res.status(405).json({ 
      log: false, 
      message: `Method ${req.method} Not Allowed` 
    });
  }
};

/**
 * Add role to user
 * 
 * @swagger
 * /api/users/roles:
 *   post:
 *     description: Add a role to a user
 *     tags:
 *       - Roles
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pubkey
 *               - role
 *             properties:
 *               pubkey:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [advertiser, publisher, admin, stakeholder]
 *     responses:
 *       200:
 *         description: Role added logfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Unauthorized - user must be authenticated
 */
async function addRole(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { pubkey, role } = req.body as AddRoleRequest;
    
    // Validate input
    if (!pubkey || !role) {
      return res.status(400).json({ 
        log: false, 
        message: 'Missing required parameters: pubkey and role' 
      });
    }
    
    // Normalize the role (convert 'viewer' to 'viewer')
    const normalizedRole = normalizeRole(role);
    
    // Validate role
    const validRoles: string[] = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
    if (!validRoles.includes(normalizedRole as UserRole)) {
      return res.status(400).json({ 
        log: false, 
        message: `Invalid role: ${normalizedRole}. Valid roles are: ${validRoles.join(', ')}` 
      });
    }
    
    // Add the normalized role using roleService
    const result = await null as any // TODO: implement roleService.addRoleToUser(pubkey, normalizedRole as UserRole);
    
    if (result) {
      logger.log(`Role ${normalizedRole} added to user ${pubkey}`);
      return res.status(200).json({ log: true });
    } else {
      return res.status(400).json({ 
        log: false, 
        message: 'Failed to add role. User may not exist.' 
      });
    }
  } catch (error) {
    logger.error('Error adding role:', error);
    return res.status(500).json({ 
      log: false, 
      message: 'Internal server error' 
    });
  }
}

/**
 * Remove role from user
 * 
 * @swagger
 * /api/users/roles:
 *   delete:
 *     description: Remove a role from a user
 *     tags:
 *       - Roles
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pubkey
 *               - role
 *             properties:
 *               pubkey:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [advertiser, publisher, admin, stakeholder]
 *     responses:
 *       200:
 *         description: Role removed logfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Unauthorized - user must be authenticated
 */
async function removeRole(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { pubkey, role } = req.body as AddRoleRequest;
    
    // Validate input
    if (!pubkey || !role) {
      return res.status(400).json({ 
        log: false, 
        message: 'Missing required parameters: pubkey and role' 
      });
    }
    
    // Normalize the role (convert 'viewer' to 'viewer')
    const normalizedRole = normalizeRole(role);
    
    // Validate role
    const validRoles: string[] = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
    if (!validRoles.includes(normalizedRole as UserRole)) {
      return res.status(400).json({ 
        log: false, 
        message: `Invalid role: ${normalizedRole}. Valid roles are: ${validRoles.join(', ')}` 
      });
    }
    
    // Remove the normalized role using roleService
    const result = await null as any // TODO: implement roleService.removeRoleFromUser(pubkey, normalizedRole as UserRole);
    
    if (result) {
      logger.log(`Role ${normalizedRole} removed from user ${pubkey}`);
      return res.status(200).json({ log: true });
    } else {
      return res.status(400).json({ 
        log: false, 
        message: 'Failed to remove role. User may not exist or does not have this role.' 
      });
    }
  } catch (error) {
    logger.error('Error removing role:', error);
    return res.status(500).json({ 
      log: false, 
      message: 'Internal server error' 
    });
  }
}

export default handler;