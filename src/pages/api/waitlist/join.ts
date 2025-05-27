import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prismaClient';

type ResponseData = {
  log: boolean;
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
    return res.status(405).json({ log: false, error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Extract email and interestedRoles from request body
    const { email, interestedRoles } = req.body;

    // Basic validation
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        log: false,
        error: 'Please enter a valid email address'
      });
    }

    if (!interestedRoles || interestedRoles.length === 0) {
      return res.status(400).json({
        log: false,
        error: 'Please select at least one role'
      });
    }

    try {
      // Test database connection first
      await prisma.$queryRaw`SELECT 1`;
      
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
          log: true,
          message: 'Your subscription has been updated! Thanks for your interest.'
        });
      }

      // Create new waitlist entry
      const result = await prisma.launchEmail.create({
        data: {
          email,
          interestedRoles,
          // Optional metadata
          ipAddress: req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || '',
          source: req.headers.referer || 'direct'
        }
      });

      console.log('Waitlist entry created successfully:', result.id);

      // Return log response
      return res.status(201).json({
        log: true,
        message: 'Thanks for joining our waitlist! We\'ll keep you updated on our launch.'
      });
    } catch (dbError: any) {
      console.error('Database error details:', {
        message: dbError.message,
        code: dbError.code,
        meta: dbError.meta,
        stack: dbError.stack
      });
      
      // Return a more specific error based on the database error
      if (dbError.code === 'P2002') {
        return res.status(409).json({
          log: false,
          error: 'This email is already registered for our waitlist.'
        });
      }
      
      throw new Error(`Database operation failed: ${dbError.message}`);
    }
  } catch (error: any) {
    console.error('Waitlist join error:', {
      message: error.message,
      stack: error.stack,
      body: req.body
    });
    
    return res.status(500).json({
      log: false,
      error: 'An error occurred while processing your request. Please try again later.'
    });
  }
}