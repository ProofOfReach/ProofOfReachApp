import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'
import { userProfileService } from '../../../services/userProfileService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

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

    // Get or create user profile
    const profile = await userProfileService.getUserProfile(user.id)
    
    if (!profile) {
      return res.status(500).json({ error: 'Failed to fetch user profile' })
    }

    // Return user data with profile information
    return res.status(200).json({
      id: user.id,
      email: user.email,
      role: profile.role,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      user_metadata: user.user_metadata || {}
    })
  } catch (error) {
    console.error('Error in /api/auth/user:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}