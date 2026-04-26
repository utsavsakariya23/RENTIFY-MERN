const { User, PasswordReset } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const { Op } = require('sequelize');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Register user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  const { name, username, email, password, phone_number, address } = req.body;
  try {
    // Server-side validation
    if (!name || !name.trim()) return res.status(400).json({ message: 'Full name is required' });
    if (!email || !email.trim()) return res.status(400).json({ message: 'Email is required' });
    if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (phone_number && !/^\d{10}$/.test(phone_number)) return res.status(400).json({ message: 'Enter a valid 10-digit phone number' });

    const userExists = await User.findOne({ where: { email } });
    if (userExists) return res.status(400).json({ message: 'Email already exists' });

    if (username) {
      const usernameExists = await User.findOne({ where: { username } });
      if (usernameExists) return res.status(400).json({ message: 'Username is already taken' });
    }

    const user = await User.create({ name, username, email, password, phone_number, address, role: 'Customer' });

    res.status(201).json({
      id: user.user_id, name: user.name, email: user.email,
      role: user.role, phone_number: user.phone_number, address: user.address,
      token: generateToken(user.user_id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const authUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (user && (await user.matchPassword(password))) {
      res.json({
        id: user.user_id, name: user.name, email: user.email,
        role: user.role, phone_number: user.phone_number, address: user.address,
        token: generateToken(user.user_id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateUserProfile = async (req, res) => {
  const { name, phone_number, address, currentPassword, newPassword } = req.body;
  try {
    const user = await User.findByPk(req.user.user_id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update basic fields
    if (name) user.name = name;
    if (phone_number !== undefined) user.phone_number = phone_number;
    if (address !== undefined) user.address = address;

    // Handle password change
    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Current password required' });
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
      }
      
      user.password = newPassword; // hook will hash this
    }

    await user.save();
    res.json({
      id: user.user_id, name: user.name, email: user.email,
      role: user.role, phone_number: user.phone_number, address: user.address
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot password — send OTP email
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'No account found with this email address' });

    // Invalidate old OTPs
    await PasswordReset.destroy({ where: { email, used: false } });

    const otp = generateOTP();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await PasswordReset.create({ email, otp, expires_at });

    await sendEmail({
      email,
      subject: '🔑 Password Reset OTP — Rentify',
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:500px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#0d6efd,#0a58ca);color:#fff;padding:2rem;text-align:center;">
            <div style="font-size:1.8rem;font-weight:800;">🚗 RENTIFY</div>
            <div style="margin-top:8px;">Password Reset Request</div>
          </div>
          <div style="padding:2rem;text-align:center;">
            <p style="color:#555;">Hello <strong>${user.name}</strong>, use the OTP below to reset your password.</p>
            <div style="display:inline-block;background:#f0f4ff;border:2px dashed #0d6efd;border-radius:12px;padding:1rem 2rem;margin:1rem 0;">
              <div style="font-size:2.5rem;font-weight:800;letter-spacing:12px;color:#0d6efd;">${otp}</div>
            </div>
            <p style="color:#888;font-size:0.85rem;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
          </div>
          <div style="background:#f8f9fa;padding:1rem;text-align:center;font-size:0.8rem;color:#aaa;">© 2026 Rentify Car Rentals</div>
        </div>
      `
    });

    res.json({ success: true, message: 'OTP sent to your email address' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const record = await PasswordReset.findOne({
      where: { email, otp, used: false, expires_at: { [Op.gt]: new Date() } }
    });
    if (!record) return res.status(400).json({ message: 'Invalid or expired OTP' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    user.password = newPassword; // beforeUpdate hook will hash
    await user.save();

    record.used = true;
    await record.save();

    res.json({ success: true, message: 'Password reset successfully. Please login.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check username availability
// @route   POST /api/auth/check-username
const checkUsername = async (req, res) => {
  const { username } = req.body;
  try {
    if (!username || username.length < 3) return res.json({ available: false });
    const exists = await User.findOne({ where: { username } });
    res.json({ available: !exists });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, authUser, getUserProfile, updateUserProfile, forgotPassword, resetPassword, checkUsername };
