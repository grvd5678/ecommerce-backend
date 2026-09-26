import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";
import config from "../config/config.js";

let transporter = null;

const isSendGrid = Boolean(config.emailPass?.startsWith("SG."));

const getMailer = () => {
  const activeResendKey =
    process.env.RESEND_API_KEY?.trim() ||
    config.resendApiKey?.trim() ||
    (config.emailPass?.startsWith("re_") ? config.emailPass.trim() : null);

  if (activeResendKey) {
    return {
      send: async ({ to, from, subject, html }) => {
        const fromAddress =
          from && !from.includes("gmail.com") && !from.includes("localhost")
            ? from
            : "onboarding@resend.dev";

        console.log(`[Resend] Sending email from: "${fromAddress}" to: "${to}"`);
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${activeResendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `ShopHub <${fromAddress}>`,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          console.error("[Resend Error Response]", data);
          throw new Error(data.message || JSON.stringify(data));
        }
        console.log("✅ [Resend Success] Email delivered successfully! Email ID:", data.id);
        return data;
      },
    };
  }

  if (isSendGrid) {
    sgMail.setApiKey(config.emailPass);
    return {
      send: async ({ to, from, subject, html }) => {
        const [response] = await sgMail.send({ to, from, subject, html });
        return response;
      },
    };
  }

  if (!transporter) {
    const isGmail =
      config.emailHost?.includes("gmail") ||
      config.emailFrom?.includes("gmail") ||
      !isSendGrid;

    const emailUser =
      config.emailUser && config.emailUser !== "apikey"
        ? config.emailUser
        : config.emailFrom;

    transporter = nodemailer.createTransport(
      isGmail
        ? {
            service: "gmail",
            auth: {
              user: emailUser,
              pass: config.emailPass,
            },
            connectionTimeout: 5000,
            greetingTimeout: 5000,
            socketTimeout: 5000,
          }
        : {
            host: config.emailHost || "smtp.gmail.com",
            port: Number(config.emailPort) || 465,
            secure: Number(config.emailPort) === 465,
            auth: {
              user: emailUser,
              pass: config.emailPass,
            },
            connectionTimeout: 5000,
            greetingTimeout: 5000,
            socketTimeout: 5000,
          }
    );
  }

  return {
    send: async ({ to, from, subject, html }) => {
      return await transporter.sendMail({
        from: `ShopHub <${from}>`,
        to,
        subject,
        html,
      });
    },
  };
};

const sendEmail = async (to, subject, html) => {
  try {
    const mailer = getMailer();
    const response = await mailer.send({
      to,
      from: config.emailFrom,
      subject,
      html,
    });
    console.log("--- Email Sent Successfully ---");
    return response;
  } catch (error) {
    console.error("--- Email Send Failed ---", error.response?.body || error.message);
    throw error;
  }
};

export const sendOTPEmail = async (email, name, otp) => {
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
    headers: { Authorization: `Bearer ${config.emailPass}` },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`SendGrid API health check failed: ${response.status} ${body}`);
  }
  return true;
};
