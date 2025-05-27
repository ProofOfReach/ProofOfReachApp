import { NextApiRequest, NextApiResponse } from 'next';
import { MailService } from '@sendgrid/mail';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message }: ContactFormData = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if SendGrid API key is available
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured');
      return res.status(500).json({ 
        message: 'Email service not configured. Please contact us directly at admin@proofofreach.xyz' 
      });
    }

    // Initialize SendGrid
    const mailService = new MailService();
    mailService.setApiKey(process.env.SENDGRID_API_KEY);

    // Prepare email content
    const emailData = {
      to: 'admin@proofofreach.xyz',
      from: 'noreply@proofofreach.xyz', // This should be a verified sender in SendGrid
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Contact Form Submission</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="color: #1e293b; margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #eff6ff; border-radius: 8px;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              This message was sent from the ProofofReach contact form.
              Reply directly to this email to respond to ${name}.
            </p>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
This message was sent from the ProofofReach contact form.
Reply to ${email} to respond directly.
      `
    };

    // Send email
    await mailService.send(emailData);

    console.log(`Contact form email sent successfully from ${email}`);
    
    return res.status(200).json({ 
      message: 'Message sent successfully! We\'ll get back to you soon.' 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    // Provide helpful error message
    let errorMessage = 'Failed to send message. Please try again or contact us directly at admin@proofofreach.xyz';
    
    if (error && typeof error === 'object' && 'response' in error) {
      const sgError = error as any;
      if (sgError.response?.body?.errors) {
        console.error('SendGrid errors:', sgError.response.body.errors);
        errorMessage = 'Email service error. Please contact us directly at admin@proofofreach.xyz';
      }
    }
    
    return res.status(500).json({ message: errorMessage });
  }
}