const { Resend } = require('resend');

let resendClient = null;

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY is not configured in environment variables.');
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
};

/**
 * Sends a branded verification email to a newly registered user using Resend.
 * @param {string} toEmail - Recipient email address
 * @param {string} verifyLink - URL link for email verification
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
const sendVerificationEmail = async (toEmail, verifyLink) => {
  try {
    const resend = getResendClient();
    const fromEmail = process.env.FROM_EMAIL || 'KisaanSaathi <onboarding@resend.dev>';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your KisaanSaathi account</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f7f4;
      color: #2d3748;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 600px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #176b47 0%, #115839 100%);
      color: #ffffff;
      padding: 32px 24px;
      text-align: center;
    }
    .brand-icon {
      font-size: 36px;
      display: block;
      margin-bottom: 8px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .brand-tagline {
      font-size: 13px;
      color: #a7f3d0;
      margin-top: 4px;
      font-weight: 500;
    }
    .content {
      padding: 36px 32px;
      line-height: 1.6;
    }
    h2 {
      color: #176b47;
      font-size: 20px;
      margin-top: 0;
      margin-bottom: 16px;
      font-weight: 700;
    }
    p {
      color: #4a5568;
      font-size: 15px;
      margin-bottom: 20px;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .verify-button {
      display: inline-block;
      background-color: #176b47;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 16px;
      padding: 14px 32px;
      border-radius: 10px;
      box-shadow: 0 4px 14px rgba(23, 107, 71, 0.3);
    }
    .link-fallback {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-top: 24px;
      font-size: 13px;
      color: #64748b;
      word-break: break-all;
    }
    .link-fallback a {
      color: #176b47;
      text-decoration: underline;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      font-size: 12px;
      color: #94a3b8;
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <span class="brand-icon">🌾</span>
      <h1 class="brand-title">KisaanSaathi</h1>
      <div class="brand-tagline">Your Smart Companion for Farming Success</div>
    </div>
    <div class="content">
      <h2>Welcome to KisaanSaathi! 🙏</h2>
      <p>
        Thank you for joining our community. To ensure the security of your account and activate access to real-time weather advisories, mandi prices, crop disease diagnosis, and farming schemes, please verify your email address.
      </p>
      
      <div class="button-container">
        <a href="${verifyLink}" target="_blank" class="verify-button">
          Verify Email Address →
        </a>
      </div>

      <p style="font-size: 13px; color: #64748b;">
        ⏱️ This verification link is valid for <strong>24 hours</strong>.
      </p>

      <div class="link-fallback">
        <p style="margin: 0 0 8px 0; font-weight: 600;">Button not working? Copy and paste this URL into your browser:</p>
        <a href="${verifyLink}">${verifyLink}</a>
      </div>
    </div>
    <div class="footer">
      <p>If you didn't create an account with KisaanSaathi, please ignore this email.</p>
      <p>© ${new Date().getFullYear()} KisaanSaathi. Built for India's farming community.</p>
    </div>
  </div>
</body>
</html>
    `;

    if (!resend) {
      console.warn(`[Mailer Fallback] Mocking email send to ${toEmail}. Link: ${verifyLink}`);
      return {
        success: true,
        data: { id: `mock_${Date.now()}` },
        warning: 'RESEND_API_KEY is not set. Email was logged to console.',
      };
    }

    const data = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: '🌾 Verify your KisaanSaathi account',
      html: htmlContent,
    });

    if (data.error) {
      console.error('❌ Resend API Error:', data.error);
      return { success: false, error: data.error.message || 'Failed to send email' };
    }

    console.log(`✉️ Verification email sent successfully to ${toEmail} (ID: ${data.data?.id})`);
    return { success: true, data: data.data };
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
};
