import sgMail from "@sendgrid/mail";
import config from "../config/config.js";

let initialized = false;

const validateEmailConfig = () => {
  const missing = [];
  if (!config.emailPass) missing.push("EMAIL_PASS");
  if (!config.emailFrom) missing.push("EMAIL_FROM");
  if (missing.length) {
    throw new Error(`Missing required email config: ${missing.join(", ")}`);
  }
};

const getClient = () => {
  if (!initialized) {
    validateEmailConfig();
    sgMail.setApiKey(config.emailPass);
    console.log("SendGrid client configured:", {
      from: config.emailFrom,
    });
    initialized = true;
  }
  return sgMail;
};

const sendEmail = async (to, subject, html) => {
  try {
    console.log("--- Email Sending Started ---");
    console.log("Recipient:", to);

    const client = getClient();
    console.log("SendGrid client retrieved.");

    console.log("Attempting to send email via SendGrid API...");
    const [response] = await client.send({
      to,
      from: config.emailFrom,
      subject,
      html,
    });

    console.log("--- Email Sent Successfully ---", response?.statusCode);
    return response;
  } catch (error) {
    console.error("--- Email Send Failed ---");
    console.error(
      "Error details:",
      error.response?.body || error.message,
    );
    throw error;
  }
};

export const sendOTPEmail = async (email, name, otp) => {
  console.log("--- sendOTPEmail called ---");
  const html = `
    <h2>Verify Your Account</h2>
    <p>Hi ${name},</p>
    <p>Your OTP verification code is:</p>
    <h1 style="letter-spacing: 8px; color: #4F46E5;">${otp}</h1>
    <p>This code expires in <strong>10 minutes</strong>.</p>
    <p>If you didn't create an account, ignore this email.</p>
  `;
  return await sendEmail(email, "Verify Your Account - OTP", html);
};

export const sendWelcomeEmail = (email, name) => {
  const html = `
    <h2>Welcome to Our E-Commerce Store!</h2>
    <p>Hi ${name},</p>
    <p>Thank you for registering with us. Start shopping now!</p>
  `;
  return sendEmail(email, "Welcome!", html);
};

export const sendOrderConfirmation = (email, name, order) => {
  const html = `
    <h2>Order Confirmation</h2>
    <p>Hi ${name},</p>
    <p>Your order #${order._id} has been confirmed!</p>
    <p><strong>Total: $${order.total}</strong></p>
    <p>We'll notify you when it ships.</p>
  `;
  return sendEmail(email, "Order Confirmed", html);
};

export const verifyEmailTransporter = async () => {
  validateEmailConfig();

  const response = await fetch("https://api.sendgrid.com/v3/user/account", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.emailPass}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `SendGrid API health check failed: ${response.status} ${body}`,
    );
  }

  return true;
};
