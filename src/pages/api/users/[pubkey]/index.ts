import type { NextApiRequest, NextApiResponse } from 'next';
import { UserProfile } from '../../../../models/user';

type ResponseData = UserProfile | { error: string };

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { pubkey } = req.query;
  
  if (!pubkey || typeof pubkey !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing pubkey parameter' });
  }
  
  // Check for test mode pubkeys (special handling)
  const isTestMode = req.cookies.nostr_test_mode === 'true';
  
  // In a real implementation, this would query the database
  // For now, return mock data for the requested pubkey
  
  // Use the existing pubkey or a test value
  const normalizedPubkey = pubkey;
  
  // Mock profile for the user
  const profile: UserProfile = {
    id: `user-${normalizedPubkey.substring(0, 8)}`,
    pubkey: normalizedPubkey,
    name: `User ${normalizedPubkey.substring(0, 8)}`,
    displayName: `Test User ${normalizedPubkey.substring(0, 4)}`,
    avatar: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
    isTestAccount: isTestMode,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  res.status(200).json(profile);
}