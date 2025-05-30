import { UserRole } from "@/types/role";
import type { NextApiRequest, NextApiResponse } from 'next';
import '@/lib/prismaClient';
import '@/lib/errorHandling';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Only allow GET method
    if (req.method !== 'GET') {
      return res.status(405).json({ 
        log: false, 
        error: `Method ${req.method} Not Allowed` 
      });
    }

    // Get pubkey from query
    const { pubkey } = req.query;

    if (!pubkey || typeof pubkey !== 'string') {
      return res.status(400).json({ 
        log: false, 
        error: 'Missing or invalid pubkey parameter' 
      });
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { nostrPubkey: pubkey }
    });

    // If user doesn't exist, return false for test mode
    if (!user) {
      return res.status(200).json({
        log: true,
        isTestMode: false
      });
    }

    // For now, we'll determine test mode by checking if the user has both roles enabled
    // In a real implementation, you might have a dedicated isTestMode flag in the database
    const isTestMode = user.isAdvertiser && user.isPublisher;

    return res.status(200).json({
      log: true,
      isTestMode
    });
  } catch (error) {
    error(error, req, res);
  }
}