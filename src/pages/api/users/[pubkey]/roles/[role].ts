import type { NextApiRequest, NextApiResponse } from 'next';
import type { UserRole } from '../../../../../context/RoleContext';

type ResponseData = { success: boolean } | { error: string };

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { pubkey, role } = req.query;
  
  if (!pubkey || typeof pubkey !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing pubkey parameter' });
  }
  
  if (!role || typeof role !== 'string' || !['viewer', 'advertiser', 'publisher'].includes(role)) {
    return res.status(400).json({ error: 'Invalid or missing role parameter' });
  }
  
  if (req.method === 'DELETE') {
    // Cannot remove the 'viewer' role
    if (role === 'viewer') {
      return res.status(400).json({ error: 'Cannot remove the viewer role' });
    }
    
    // In a real implementation, this would update the database
    // For now, just return success
    
    res.status(200).json({ success: true });
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}