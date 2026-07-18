import nodemailer from "nodemailer";
import config from "../config/config.js";

let transporter = null;

const validateEmailConfig = () => {
  const missing = [];
  if (!config.emailUser) missing.push("EMAIL_USER");
  if (!config.emailPass) missing.push("EMAIL_PASS");
  if (!config.emailHost && config.emailUser !== "apikey")
    missing.push("EMAIL_HOST");
  if (!config.emailPort) missing.push("EMAIL_PORT");
  if (missing.length) {
    throw new Error(`Missing required email config: ${missing.join(", ")}`);
  }
};

const promiseWithTimeout = (promise, timeoutMs, timeoutMessage) =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timeout);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
  });

const getDefaultTransportConfig = () => {
  const host =
    config.emailHost ||
    (config.emailUser === "apikey" ? "smtp.sendgrid.net" : null);
  const port = Number(config.emailPort || 587);
  const useSecure = port === 465;

  if (!host) {
    throw new Error(
      "Missing SMTP host. Set EMAIL_HOST or use SendGrid credentials with EMAIL_USER=apikey.",
    );
  }

  if (config.emailUser === "apikey" && host.includes("gmail")) {
    console.warn(
      "SMTP warning: using SendGrid API key credentials with a Gmail host is likely incorrect.",
    );
  }

  return {
    host,
    port,
    secure: useSecure,
    auth: {
      user: config.emailUser,
      pass: config.emailPass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: {
      rejectUnauthorized: false,
    },
  };
};

const getTransporter = () => {
  if (!transporter) {
    validateEmailConfig();
    const transportConfig = getDefaultTransportConfig();
    console.log("SMTP transport config:", {
      host: transportConfig.host,
      port: transportConfig.port,
      secure: transportConfig.secure,
      user: transportConfig.auth.user,
    });
    transporter = nodemailer.createTransport(transportConfig);
  }
  return transporter;
};

const sendEmail = async (to, subject, html) => {
  try {
    console.log("--- Email Sending Started ---");
    console.log("Recipient:", to);

    const transporter = getTransporter();
    console.log("Transporter retrieved.");

    console.log("Verifying SMTP connection...");
    await promiseWithTimeout(
      transporter.verify(),
      10000,
      "SMTP verification timed out after 10 seconds",
    );

    console.log("Attempting to send email via sendMail...");
    const info = await promiseWithTimeout(
      transporter.sendMail({
        from: config.emailFrom || config.emailUser,
        to,
        subject,
        html,
      }),
      20000,
      "Email send timed out after 20 seconds",
    );

    console.log("--- Email Sent Successfully ---", info.messageId);
    return info;
  } catch (error) {
    console.error("--- Email Send Failed ---");
    console.error("Error details:", error.message);
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
  const transporter = getTransporter();
  await transporter.verify();
  return true;
};
