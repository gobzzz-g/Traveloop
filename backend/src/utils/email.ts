import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Traveloop" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify your Traveloop account',
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 16px;">
        <h1 style="color: #6366f1; font-size: 28px; margin-bottom: 8px;">Welcome to Traveloop! ✈️</h1>
        <p style="color: #94a3b8; font-size: 16px; margin-bottom: 32px;">Hey ${name}, your adventure starts here.</p>
        <p style="font-size: 16px; margin-bottom: 24px;">Click the button below to verify your email address:</p>
        <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Verify Email</a>
        <p style="color: #64748b; font-size: 14px; margin-top: 32px;">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Traveloop" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset your Traveloop password',
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 16px;">
        <h1 style="color: #6366f1; font-size: 28px; margin-bottom: 8px;">Password Reset 🔐</h1>
        <p style="color: #94a3b8; font-size: 16px; margin-bottom: 32px;">Hi ${name}, we received a request to reset your password.</p>
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Reset Password</a>
        <p style="color: #64748b; font-size: 14px; margin-top: 32px;">This link expires in 1 hour. If you didn't request a reset, please ignore this email.</p>
      </div>
    `,
  });
}

export async function sendOTPEmail(
  email: string,
  name: string,
  otp: string
): Promise<void> {
  await transporter.sendMail({
    from: `"Traveloop" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your Traveloop OTP Code',
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 16px;">
        <h1 style="color: #6366f1; font-size: 28px; margin-bottom: 8px;">Your OTP Code 🔢</h1>
        <p style="color: #94a3b8; font-size: 16px; margin-bottom: 32px;">Hi ${name}, here's your one-time password:</p>
        <div style="background: #1e293b; border: 2px solid #6366f1; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 48px; font-weight: 700; letter-spacing: 12px; color: #6366f1;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">This OTP expires in 10 minutes.</p>
      </div>
    `,
  });
}
