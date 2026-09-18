const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: parseInt(process.env.BREVO_SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_LOGIN,
    pass: process.env.BREVO_SMTP_KEY
  }
})

const sendVerificationEmail = async (toEmail, verifyLink) => {
  try {
    await transporter.sendMail({
      from: `KisaanSaathi <b9eb95001@smtp-brevo.com>`,
      to: toEmail,
      subject: '🌾 Verify your KisaanSaathi account',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#fff;border-radius:16px;border:1px solid #e2e8f0">
          <div style="background:linear-gradient(135deg,#176b47,#115839);padding:24px;border-radius:12px;text-align:center;margin-bottom:24px">
            <h1 style="color:#fff;margin:0;font-size:24px">🌾 KisaanSaathi</h1>
            <p style="color:#a7f3d0;margin:4px 0 0;font-size:13px">Smart Farming Companion</p>
          </div>
          <h2 style="color:#176b47">Welcome! 🙏</h2>
          <p style="color:#4a5568;font-size:15px">Thank you for joining KisaanSaathi. Please verify your email to activate your account.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="${verifyLink}" style="background:#176b47;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px">
              ✅ Verify Email Address
            </a>
          </div>
          <p style="font-size:13px;color:#64748b">⏱️ This link expires in 24 hours.</p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-top:16px">
            <p style="font-size:12px;color:#64748b;margin:0">Button not working? Copy this link:<br/>
            <a href="${verifyLink}" style="color:#176b47;word-break:break-all">${verifyLink}</a></p>
          </div>
          <p style="font-size:12px;color:#94a3b8;margin-top:24px;text-align:center">
            If you didn't create this account, ignore this email.<br/>
            © ${new Date().getFullYear()} KisaanSaathi
          </p>
        </div>
      `
    })
    console.log(`✉️ Verification email sent to ${toEmail}`)
    return { success: true }
  } catch (error) {
    console.error('❌ Email error:', error)
    return { success: false, error: error.message }
  }
}

const sendPasswordResetEmail = async (toEmail, resetLink) => {
  try {
    await transporter.sendMail({
      from: `KisaanSaathi <b9eb95001@smtp-brevo.com>`,
      to: toEmail,
      subject: '🔐 Reset your KisaanSaathi password',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#fff;border-radius:16px;border:1px solid #e2e8f0">
          <h2 style="color:#176b47">Password Reset 🔐</h2>
          <p style="color:#4a5568">Click below to reset your password.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="${resetLink}" style="background:#176b47;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px">
              Reset Password
            </a>
          </div>
          <p style="font-size:13px;color:#64748b">⏱️ Expires in 1 hour.</p>
          <p style="font-size:12px;color:#94a3b8">If you didn't request this, ignore this email.</p>
        </div>
      `
    })
    console.log(`✉️ Password reset email sent to ${toEmail}`)
    return { success: true }
  } catch (error) {
    console.error('❌ Email error:', error)
    return { success: false, error: error.message }
  }
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail }