import type { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../../lib/authMiddleware';
import { roleService } from '../../../services/roleService';
import { UserRole } from '../../../context/NewRoleContext';

async function handler(req: NextApiRequest, res: NextApiResponse, auth: any) {
  // Handle GET request to fetch current role and available roles
  if (req.method === 'GET') {
    try {
      // Get the user ID from auth middleware
      const userId = auth.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      }
      
      // Get the current role
      const role = await roleService.getCurrentRole(userId);
      
      // Get available roles
      const availableRoles = await roleService.getAvailableRoles(userId);
      
      return res.status(200).json({
        role: role || 'user', // Default to 'user' if not set
        availableRoles
      });
    } catch (error) {
      console.error('Error getting role:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  // Handle POST request to set current role
  if (req.method === 'POST') {
    try {
      // Get the user ID from auth middleware
      const userId = auth.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      }
      
      // Get the role from the request body
      const { role } = req.body;
      
      if (!role) {
        return res.status(400).json({ error: 'Role is required' });
      }
      
      // Validate the role
      const validRoles: UserRole[] = ['user', 'advertiser', 'publisher', 'admin', 'stakeholder'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      
      // Check if the role is available for this user
      const isAvailable = await roleService.isRoleAvailable(userId, role as UserRole);
      
      if (!isAvailable && role !== 'user') {
        return res.status(403).json({ error: 'Role not available for this user' });
      }
      
      // Set the role
      const success = await roleService.setCurrentRole(userId, role as UserRole);
      
      if (success) {
        return res.status(200).json({ success: true, role });
      } else {
        return res.status(500).json({ error: 'Failed to set role' });
      }
    } catch (error) {
      console.error('Error setting role:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  // Handle other methods
  return res.status(405).json({ error: 'Method not allowed' });
}

export default authMiddleware(handler);