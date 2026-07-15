import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return transporter;
};

const sendEmail = async (to, subject, html) => {
  try {
    await getTransporter().sendMail({ from: process.env.EMAIL_USER, to, subject, html });
  } catch (error) {
    console.error('Email send error:', error.message);
  }
};

export const sendOTPEmail = (email, name, otp) => {
  const html = `
    <h2>Verify Your Account</h2>
    <p>Hi ${name},</p>
    <p>Your OTP verification code is:</p>
    <h1 style="letter-spacing: 8px; color: #4F46E5;">${otp}</h1>
    <p>This code expires in <strong>10 minutes</strong>.</p>
    <p>If you didn't create an account, ignore this email.</p>
  `;
  return sendEmail(email, 'Verify Your Account - OTP', html);
};

export const sendWelcomeEmail = (email, name) => {
  const html = `
    <h2>Welcome to Our E-Commerce Store!</h2>
    <p>Hi ${name},</p>
    <p>Thank you for registering with us. Start shopping now!</p>
  `;
  return sendEmail(email, 'Welcome!', html);
};

export const sendOrderConfirmation = (email, name, order) => {
  const html = `
    <h2>Order Confirmation</h2>
    <p>Hi ${name},</p>
    <p>Your order #${order._id} has been confirmed!</p>
    <p><strong>Total: $${order.total}</strong></p>
    <p>We'll notify you when it ships.</p>
  `;
  return sendEmail(email, 'Order Confirmed', html);
};
