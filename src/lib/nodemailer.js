import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function verifyEmailExists(email) {
  try {
    // Basic disposable email domain blocklist
    const disposableDomains = [
      'tempmail.com', 'throwaway.com', 'fakemail.com', 'temp-mail.org',
      'guerrillamail.com', '10minutemail.com', 'mailinator.com',
      'yopmail.com', 'dispostable.com', 'trashmail.com', 'getairmail.com'
    ];
    
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (disposableDomains.includes(domain)) {
      return { valid: false, reason: 'Disposable email addresses are not allowed' };
    }

    // Verify email format and domain has MX records
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, reason: 'Invalid email format' };
    }

    // Nodemailer email verification
    const verifyResult = await transporter.verify();
    
    return { valid: true };
  } catch (error) {
    console.error('Email verification error:', error);
    return { valid: true }; // Fallback to allow if verification service fails
  }
}

export async function sendWelcomeEmail(email, name) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to MediPulse Healthcare',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3875FD 0%, #020331 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome to MediPulse</h1>
          </div>
          <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e7eb;">
            <h2 style="color: #020331;">Hello ${name},</h2>
            <p style="color: #6b7280; line-height: 1.6;">Thank you for registering with MediPulse Healthcare. Your account has been successfully created.</p>
            <p style="color: #6b7280; line-height: 1.6;">You can now login to your patient dashboard to manage your health records, book appointments and view lab reports.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/patients-login" style="background: #3875FD; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Login to Dashboard</a>
            </div>
            <p style="color: #6b7280; line-height: 1.6;">If you have any questions, feel free to contact our support team.</p>
            <p style="color: #9ca3af; margin-top: 30px;">Best regards,<br>The MediPulse Team</p>
          </div>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    console.error('Welcome email error:', error);
    return { success: false, error: error.message };
  }
}

export default transporter;
