import nodemailer from "nodemailer";

// Create transporter only if credentials are available
let transporter = null;

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
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
    if (!transporter) {
      console.log("Email service not configured - skipping email send to:", to);
      return { success: true, skipped: true };
    }

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || "Medical Appointment System"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
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

/**
 * Send appointment confirmation to patient
 * @param {string} email - Patient email
 * @param {Object} appointment - Appointment details
 */
export const sendAppointmentConfirmation = async (email, appointment) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2>Appointment Confirmed!</h2>
      </div>
      <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px;">
        <p>Dear ${appointment.patientName},</p>
        <p style="font-size: 16px; line-height: 1.6;">
          Your appointment has been successfully booked with <strong>Dr. ${appointment.doctorName}</strong>.
        </p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #E5E7EB;">
          <h3 style="color: #3B82F6; margin-top: 0;">Appointment Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Doctor:</strong></td>
              <td style="padding: 8px 0;">Dr. ${appointment.doctorName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Date:</strong></td>
              <td style="padding: 8px 0;">${new Date(appointment.scheduledDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Time:</strong></td>
              <td style="padding: 8px 0;">${appointment.slotTime || 'To be confirmed'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Appointment ID:</strong></td>
              <td style="padding: 8px 0;">${appointment.appointmentId}</td>
            </tr>
          </table>
        </div>
        <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #92400E;"><strong>Important:</strong> Please arrive 15 minutes before your scheduled time. Bring this email or your patient ID for verification.</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/patients-dashboard?tab=appointments" style="background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Appointment
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Best Regards,<br>
          Medical Appointment System<br>
          Faisalabad, Punjab, Pakistan
        </p>
      </div>
    </div>
  `;

  return await sendDoctorEmail(email, "✅ Appointment Confirmed - " + appointment.doctorName, html);
};

/**
 * Send prescription ready notification to patient
 * @param {string} email - Patient email
 * @param {Object} prescription - Prescription details
 */
export const sendPrescriptionReadyEmail = async (email, prescription) => {
  const medicinesList = prescription.medicines?.map(m => `<li>${m.name} - ${m.dosage}, ${m.frequency}</li>`).join('') || '';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2>💊 Prescription Ready</h2>
      </div>
      <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px;">
        <p>Dear ${prescription.patientName},</p>
        <p style="font-size: 16px; line-height: 1.6;">
          Your prescription from <strong>Dr. ${prescription.doctorName}</strong> is now ready.
        </p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #E5E7EB;">
          <h3 style="color: #10B981; margin-top: 0;">Prescription Details</h3>
          <p><strong>Prescription ID:</strong> ${prescription.prescriptionId}</p>
          <p><strong>Date:</strong> ${new Date(prescription.issuedDate).toLocaleDateString()}</p>
          <p><strong>Diagnosis:</strong> ${prescription.diagnosis}</p>
          ${medicinesList ? `<h4 style="color: #374151; margin-top: 15px;">Medicines:</h4><ul style="margin: 0; padding-left: 20px;">${medicinesList}</ul>` : ''}
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/patients-dashboard" style="background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
            View Prescription
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Best Regards,<br>
          Medical Appointment System
        </p>
      </div>
    </div>
  `;

  return await sendDoctorEmail(email, "💊 Your Prescription is Ready", html);
};

/**
 * Send payment receipt to patient
 * @param {string} email - Patient email
 * @param {Object} payment - Payment details
 */
export const sendPaymentReceiptEmail = async (email, payment) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #7C3AED; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2>💰 Payment Receipt</h2>
      </div>
      <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px;">
        <p>Dear ${payment.patientName},</p>
        <p style="font-size: 16px; line-height: 1.6;">
          Thank you for your payment. Here is your receipt:
        </p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #E5E7EB;">
          <h3 style="color: #7C3AED; margin-top: 0;">Payment Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Receipt ID:</strong></td>
              <td style="padding: 8px 0;">${payment.receiptId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Date:</strong></td>
              <td style="padding: 8px 0;">${new Date(payment.paymentDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Description:</strong></td>
              <td style="padding: 8px 0;">${payment.description}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Amount:</strong></td>
              <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #10B981;">Rs. ${payment.amount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Payment Method:</strong></td>
              <td style="padding: 8px 0;">${payment.paymentMethod || 'Online'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Status:</strong></td>
              <td style="padding: 8px 0;"><span style="background: #D1FAE5; color: #065F46; padding: 4px 12px; border-radius: 20px; font-size: 12px;">Paid</span></td>
            </tr>
          </table>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/patients-dashboard" style="background: #7C3AED; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Payment History
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Thank you for using Medical Appointment System.<br>
          This is an automated receipt - no signature required.
        </p>
      </div>
    </div>
  `;

  return await sendDoctorEmail(email, "💰 Payment Receipt - Rs. " + payment.amount, html);
};

/**
 * Send email to patient
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 */
export const sendPatientEmail = async (to, subject, html) => {
  try {
    if (!transporter) {
      console.log("Email service not configured - skipping email send to:", to);
      return { success: true, skipped: true };
    }

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || "Medical Appointment System"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Patient email sent: ", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending patient email:", error);
    return { success: false, error: error.message };
  }
};