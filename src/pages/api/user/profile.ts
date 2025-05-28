import { NextApiRequest, NextApiResponse } from 'next'
import { UserRole } from '../../../lib/supabase'
import { userProfileService } from '../../../services/userProfileService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getUserProfile(req, res)
  } else if (req.method === 'POST') {
    return createOrUpdateProfile(req, res)
  } else if (req.method === 'PUT') {
    return updateUserRole(req, res)
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT'])
    return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function getUserProfile(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = req.query

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'User ID is required' })
    }

    const profile = await userProfileService.getUserProfile(userId)
    
    if (!profile) {
      return res.status(500).json({ error: 'Failed to fetch user profile' })
    }

    return res.status(200).json(profile)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return res.status(500).json({ error: 'Failed to fetch user profile' })
  }
}

async function createOrUpdateProfile(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId, email, role } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    if (!role || !['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'].includes(role)) {
      return res.status(400).json({ error: 'Valid role is required' })
    }

    const profile = await userProfileService.createOrUpdateProfile(userId, email, role as UserRole)
    
    if (!profile) {
      return res.status(500).json({ error: 'Failed to create/update user profile' })
    }

    return res.status(200).json(profile)
  } catch (error) {
    console.error('Error creating/updating user profile:', error)
    return res.status(500).json({ error: 'Failed to create/update user profile' })
  }
}

async function updateUserRole(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId, role } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    if (!role || !['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'].includes(role)) {
      return res.status(400).json({ error: 'Valid role is required' })
    }

    const profile = await userProfileService.updateUserRole(userId, role as UserRole)
    
    if (!profile) {
      return res.status(500).json({ error: 'Failed to update user role' })
    }

    return res.status(200).json(profile)
  } catch (error) {
    console.error('Error updating user role:', error)
    return res.status(500).json({ error: 'Failed to update user role' })
  }
}