import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prismaClient';

type ResponseData = {
  success: boolean;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Extract email and interestedRoles from request body
    const { email, interestedRoles } = req.body;

    // Basic validation
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address'
      });
    }

    if (!interestedRoles || interestedRoles.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please select at least one role'
      });
    }

    try {
      // Check if email already exists
      const existingEmail = await prisma.launchEmail.findUnique({
        where: { email }
      });

      if (existingEmail) {
        // Update existing record instead of creating a new one
        await prisma.launchEmail.update({
          where: { email },
          data: { 
            interestedRoles,
            // Update timestamp
            createdAt: new Date()
          }
        });

        return res.status(200).json({
          success: true,
          message: 'Your subscription has been updated! Thanks for your interest.'
        });
      }

      // Create new waitlist entry
      await prisma.launchEmail.create({
        data: {
          email,
          interestedRoles,
          // Optional metadata
          ipAddress: req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || '',
          source: req.headers.referer || 'direct'
        }
      });

      // Return success response
      return res.status(201).json({
        success: true,
        message: 'Thanks for joining our waitlist! We\'ll keep you updated on our launch.'
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Database operation failed');
    }
  } catch (error) {
    console.error('Waitlist join error:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while processing your request. Please try again later.'
    });
  } finally {
    await prisma.$disconnect();
  }
}