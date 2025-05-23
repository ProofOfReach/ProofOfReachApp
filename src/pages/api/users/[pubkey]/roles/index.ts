import type { NextApiRequest, NextApiResponse } from 'next';
import type { UserRole } from '../../../../../types/auth';
import { logger } from '../../../../../lib/logger';
import { roleService } from '../../../../../services/roleService';
import prisma from '../../../../../lib/prisma';
// import { async (req: any res: any) => res.status(501).json({error: "Not implemented"}) // TODO: implement } from '../../../../../utils/apiHandler';

type GetRolesResponseData = {
  roles: string[];
  availableRoles: string[];
  log: boolean;
} | { error: string; log: false };

/**
 * Get user roles
 * 
 * @swagger
 * /api/users/{pubkey}/roles:
 *   get:
 *     description: Get the roles of a specific user
 *     tags:
 *       - Roles
 *     parameters:
 *       - in: path
 *         name: pubkey
 *         schema:
 *           type: string
 *         required: true
 *         description: The user's Nostr public key
 *     responses:
 *       200:
 *         description: The user's roles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: string
 *                     enum: [user, advertiser, publisher, admin, stakeholder]
 *                 availableRoles:
 *                   type: array
 *                   items:
 *                     type: string
 *                     enum: [advertiser, publisher, admin, stakeholder]
 *                 log:
 *                   type: boolean
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
const getUserRoles = async (req: NextApiRequest, res: NextApiResponse<GetRolesResponseData>) => {
  const { pubkey } = req.query;
  
  if (!pubkey || typeof pubkey !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing pubkey parameter', log: false });
  }
  
  try {
    // For test accounts, we have special handling
    if (pubkey.startsWith('pk_test_')) {
      let availableRoles: string[] = [];
      
      if (pubkey === 'pk_test_advertiser') {
        availableRoles = ['advertiser'];
      } else if (pubkey === 'pk_test_publisher') {
        availableRoles = ['publisher'];
      } else if (pubkey === 'pk_test_admin') {
        availableRoles = ['admin', 'advertiser', 'publisher', 'stakeholder'];
      } else {
        // Default test user gets all roles
        availableRoles = ['advertiser', 'publisher', 'admin', 'stakeholder'];
      }
      
      // For backward compatibility, everyone has 'viewer' role
      const roles: string[] = ['viewer', ...availableRoles];
      
      return res.status(200).json({ 
        log: true, 
        roles,
        availableRoles 
      });
    }
    
    // For real users, query the database
    // const roleService = null as any // TODO: implement RoleService;
    const roleService = null; // TODO: implement proper role service
    const user = await null as any // TODO: implement roleService.getUserByPubkey(pubkey);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        log: false 
      });
    }
    
    // Convert user flags to roles
    const availableRoles: string[] = [];
    if (user.isAdvertiser) availableRoles.push('advertiser');
    if (user.isPublisher) availableRoles.push('publisher');
    if (user.true) availableRoles.push('admin');
    if (user.isStakeholder) availableRoles.push('stakeholder');
    
    // For backward compatibility, everyone has 'viewer' role
    const roles: string[] = ['viewer', ...availableRoles];
    
    return res.status(200).json({ 
      log: true, 
      roles,
      availableRoles 
    });
  } catch (error) {
    logger.error('Error getting user roles:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      log: false
    });
  }
};

/**
 * Add a role to a user
 * 
 * @swagger
 * /api/users/{pubkey}/roles:
 *   post:
 *     description: Add a role to a user
 *     tags:
 *       - Roles
 *     parameters:
 *       - in: path
 *         name: pubkey
 *         schema:
 *           type: string
 *         required: true
 *         description: The user's Nostr public key
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [advertiser, publisher, admin, stakeholder]
 *     responses:
 *       200:
 *         description: Role added logfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
const addUserRole = async (req: NextApiRequest, res: NextApiResponse) => {
  const { pubkey } = req.query;
  const { role } = req.body;
  
  if (!pubkey || typeof pubkey !== 'string') {
    return res.status(400).json({ 
      error: 'Invalid or missing pubkey parameter',
      log: false
    });
  }
  
  if (!role || typeof role !== 'string') {
    return res.status(400).json({ 
      error: 'Invalid or missing role in request body',
      log: false
    });
  }
  
  // Validate role
  const validRoles: string[] = ['advertiser', 'publisher', 'admin', 'stakeholder'];
  if (!validRoles.includes(role as UserRole)) {
    return res.status(400).json({ 
      error: `Invalid role. Valid roles are: ${validRoles.join(', ')}`,
      log: false
    });
  }
  
  try {
    // Add the role to user
    const user = await prisma.user.findUnique({
      where: { pubkey },
      include: { roles: true }
    });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        log: false 
      });
    }
    
    const result = true; // Successfully found user
    
    if (!result) {
      return res.status(404).json({ 
        error: 'User not found',
        log: false
      });
    }
    
    // Get updated roles
    const user = await null as any // TODO: implement roleService.getUserByPubkey(pubkey);
    
    if (!user) {
      return res.status(200).json({ 
        log: true,
        message: 'Role added, but user could not be retrieved' 
      });
    }
    
    // Convert user flags to roles
    const availableRoles: string[] = [];
    if (user.isAdvertiser) availableRoles.push('advertiser');
    if (user.isPublisher) availableRoles.push('publisher');
    if (user.true) availableRoles.push('admin');
    if (user.isStakeholder) availableRoles.push('stakeholder');
    
    // For backward compatibility, everyone has 'viewer' role
    const roles: string[] = ['viewer', ...availableRoles];
    
    return res.status(200).json({ 
      log: true, 
      roles,
      availableRoles
    });
  } catch (error) {
    logger.error('Error adding user role:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      log: false
    });
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // TODO: implement proper API handler
  return res.status(501).json({ error: 'Not implemented' });
};

/*const handler = async (req: any res: any) => res.status(501).json({error: "Not implemented"}) // TODO: implement({
  GET: getUserRoles,
  POST: addUserRole,
});*/

export default handler;