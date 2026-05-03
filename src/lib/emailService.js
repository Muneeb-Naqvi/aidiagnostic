import nodemailer from "nodemailer";

// Create transporter only if credentials are available
let transporter = null;

if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });
}

/**
 * Send email notification to doctor
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 */
export const sendDoctorEmail = async (to, subject, html) => {
  try {
    // Skip email sending if transporter not configured (no credentials)
    if (!transporter) {
      console.log("Email service not configured - skipping email send to:", to);
      return { success: true, skipped: true };
    }

    const mailOptions = {
      from: `"Medical Appointment System" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send approval email to doctor
 * @param {string} email - Doctor email
 * @param {Object} doctor - Doctor details
 */
export const sendApprovalEmail = async (email, doctor) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2>Account Approved!</h2>
      </div>
      <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px;">
        <p>Dear Dr. ${doctor.name},</p>
        <p style="font-size: 16px; line-height: 1.6;">
          Congratulations! Your doctor account has been <strong>approved</strong> by the administration.
        </p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #3B82F6;">Your Login Credentials</h3>
          <p><strong>Doctor ID:</strong> ${doctor.doctorId}</p>
          <p><strong>Email:</strong> ${doctor.email}</p>
          <p><strong>Temporary Password:</strong> doctor@12345</p>
          <p style="color: #666; font-size: 12px; margin-top: 15px;">
            *Please change your password after first login
          </p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/doctor-login" style="background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">
            Login to Dashboard
          </a>
        </div>
        <p style="color: #666;">
          Best Regards,<br>
          Medical Appointment System<br>
          Faisalabad, Punjab, Pakistan
        </p>
      </div>
    </div>
  `;
  
  return await sendDoctorEmail(email, "✅ Your Doctor Account Has Been Approved", html);
};

/**
 * Send rejection email to doctor
 * @param {string} email - Doctor email
 * @param {string} reason - Rejection reason
 */
export const sendRejectionEmail = async (email, reason) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2>Account Update</h2>
      </div>
      <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px;">
        <p>Dear Doctor,</p>
        <p style="font-size: 16px; line-height: 1.6;">
          We regret to inform you that your doctor account request has been reviewed and 
          <strong style="color: #EF4444;">could not be approved</strong> at this time.
        </p>
        <div style="background: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #FECACA;">
          <h4 style="color: #B91C1C; margin-top: 0;">Reason:</h4>
          <p>${reason || "Administrative review required"}</p>
        </div>
        <p style="color: #666; line-height: 1.6;">
          If you believe this was a mistake, please contact administration with complete documentation.
        </p>
        <p style="color: #666;">
          Best Regards,<br>
          Medical Appointment System
        </p>
      </div>
    </div>
  `;
  
  return await sendDoctorEmail(email, "Doctor Account Request Status", html);
};

/**
 * Send appointment notification email
 * @param {string} email - Doctor email
 * @param {Object} appointment - Appointment details
 */
export const sendAppointmentNotification = async (email, appointment) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2>New Appointment Booked!</h2>
      </div>
      <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px;">
        <p>Dear Doctor,</p>
        <p>A new appointment has been booked for you:</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #10B981;">Appointment Details</h3>
          <p><strong>Patient:</strong> ${appointment.patientName}</p>
          <p><strong>Disease:</strong> ${appointment.disease}</p>
          <p><strong>Date:</strong> ${new Date(appointment.scheduledDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${appointment.slotTime || "Check dashboard"}</p>
          <p><strong>Hospital:</strong> ${appointment.hospitalName || "Clinic"}</p>
        </div>
        <p style="color: #666;">
          Please login to your dashboard to view complete details and confirm this appointment.
        </p>
        <p style="color: #666;">
          Best Regards,<br>
          Medical Appointment System
        </p>
      </div>
    </div>
  `;
  
  return await sendDoctorEmail(email, "📅 New Appointment Received", html);
};