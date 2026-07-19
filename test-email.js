import nodemailer from "nodemailer";
import config from "./config/config.js";

if (!config.emailUser || !config.emailPass) {
  throw new Error(
    "Missing email credentials. Set EMAIL_USER and EMAIL_PASS in your environment.",
  );
}

console.log("Testing connection with user:", config.emailUser);

const host =
  config.emailHost ||
  (config.emailUser === "apikey" ? "smtp.sendgrid.net" : "smtp.gmail.com");
const port = Number(config.emailPort || (host.includes("gmail") ? 465 : 587));
const secure = port === 465;

console.log("SMTP transport config:", { host, port, secure });

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user: config.emailUser,
    pass: config.emailPass,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Connection failed:");
    if (error.code) console.error("Code:", error.code);
    if (error.response) console.error("Response:", error.response);
    console.error("Message:", error.message || error);
  } else {
    console.log("✅ Connection successful!");
  }
});
