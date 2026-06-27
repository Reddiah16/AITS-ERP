import nodemailer from "nodemailer"

// Configure nodemailer transporter using SMTP settings
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.mailtrap.io",
  port: parseInt(process.env.SMTP_PORT || "2525"),
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || ""
  }
})

export const sendEmail = async (to: string, subject: string, htmlContent: string) => {
  const fromAddress = process.env.EMAIL_FROM || "aits-erp@aits.ac.in"
  try {
    const info = await transporter.sendMail({
      from: `"AITS Rajampet ERP" <${fromAddress}>`,
      to,
      subject,
      html: htmlContent
    })
    console.log(`✓ Email notification dispatched successfully to ${to}. MessageId: ${info.messageId}`)
    return info
  } catch (error) {
    console.error(`❌ Failed to dispatch email to ${to}:`, error)
    // Fall back to console logger in development/test
    return null
  }
}
