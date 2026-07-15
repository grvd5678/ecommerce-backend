import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load variables from .env
dotenv.config();

console.log('Testing connection with user:', process.env.EMAIL_USER);
// We do NOT log the password, even partially, for security.

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Connection failed:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
  } else {
    console.log('✅ Connection successful!');
  }
});
