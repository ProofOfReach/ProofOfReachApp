import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'
import { userProfileService } from '../../../services/userProfileService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No valid authorization token provided' })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    if (req.method === 'GET') {
      // Get user profile
      const profile = await userProfileService.getUserProfile(user.id)
      
      if (!profile) {
        return res.status(500).json({ error: 'Failed to fetch user profile' })
      }

      return res.status(200).json(profile)
    } else if (req.method === 'PUT') {
      // Update user role
      const { role } = req.body

      if (!role) {
        return res.status(400).json({ error: 'Role is required' })
      }

      // Validate role
      const validRoles = ['viewer', 'publisher', 'advertiser']
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' })
      }

      const updatedProfile = await userProfileService.updateUserRole(user.id, role)
      
      if (!updatedProfile) {
        return res.status(500).json({ error: 'Failed to update user role' })
      }

      return res.status(200).json(updatedProfile)
    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Error in /api/user/profile:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}