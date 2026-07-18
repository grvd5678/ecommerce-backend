import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load variables from .env
dotenv.config();

console.log('Testing connection with user:', process.env.EMAIL_USER);
// We do NOT log the password, even partially, for security.

// Build transport from environment with sensible defaults
const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
const port = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : (host.includes('gmail') ? 465 : 587);
const secure = process.env.EMAIL_SECURE ? process.env.EMAIL_SECURE === 'true' : (port === 465);

console.log('SMTP transport config:', { host, port, secure });

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Connection failed:');
    if (error.code) console.error('Code:', error.code);
    if (error.response) console.error('Response:', error.response);
    console.error('Message:', error.message || error);
  } else {
    console.log('✅ Connection successful!');
  }
});
