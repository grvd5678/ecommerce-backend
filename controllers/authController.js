import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { sendOTPEmail, sendWelcomeEmail } from '../utils/email.js';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists && userExists.isVerified) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    let user;
    if (userExists && !userExists.isVerified) {
      userExists.name = name;
      userExists.password = password;
      userExists.otp = { code: otp, expiresAt: otpExpiresAt };
      user = await userExists.save();
    } else {
      user = await User.create({ name, email, password, otp: { code: otp, expiresAt: otpExpiresAt } });
    }

    await sendOTPEmail(email, name, otp).catch(err => {
      console.error('OTP email failed:', err.message);
      console.log(`⚠️  EMAIL FAILED - OTP for ${email}: ${otp}`);
    });

    res.status(201).json({ message: 'OTP sent to your email. Please verify to complete registration.', email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select('+otp.code +otp.expiresAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Account already verified' });
    if (!user.otp.code || user.otp.code !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (user.otp.expiresAt < new Date()) return res.status(400).json({ message: 'OTP has expired. Please register again.' });

    await User.findByIdAndUpdate(user._id, { isVerified: true, $unset: { otp: 1 } });

    try { await sendWelcomeEmail(email, user.name); } catch (e) { console.error('Welcome email failed:', e); }

    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Account already verified' });

    const otp = generateOTP();
    user.otp = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
    await user.save();
    await sendOTPEmail(email, user.name, otp).catch(err => {
      console.error('OTP email failed:', err.message);
      console.log(`⚠️  EMAIL FAILED - OTP for ${email}: ${otp}`);
    });

    res.json({ message: 'New OTP sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Account not verified. Please verify your email first.', email });
    }

    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json(req.user);
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });

    const otp = generateOTP();
    user.otp = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
    await user.save();

    await sendOTPEmail(email, user.name, otp).catch(err => {
      console.error('OTP email failed:', err.message);
      console.log(`⚠️  EMAIL FAILED - Password Reset OTP for ${email}: ${otp}`);
    });

    res.json({ message: 'OTP sent to your email.', email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password - verify OTP and set new password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email }).select('+otp.code +otp.expiresAt');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.otp?.code || user.otp.code !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please try again.' });
    }

    user.password = newPassword;
    user.isVerified = true;
    await User.findByIdAndUpdate(user._id, { $unset: { otp: 1 } });
    await user.save();

    res.json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
