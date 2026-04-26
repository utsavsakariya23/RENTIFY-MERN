const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { User } = require('../models');

// Temporary in-memory OTP storage (In production, use Redis or DB with expiry)
const otps = {};

const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `${process.env.FROM_NAME || 'Rentify'} <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Email Verification — Rentify',
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:500px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#0d6efd,#0a58ca);color:#fff;padding:2rem;text-align:center;">
          <div style="font-size:1.8rem;font-weight:800;">🚗 RENTIFY</div>
          <div style="margin-top:8px;">Email Verification</div>
        </div>
        <div style="padding:2rem;text-align:center;">
          <p style="color:#555;">Use the OTP below to verify your email and create your Rentify account.</p>
          <div style="display:inline-block;background:#f0f4ff;border:2px dashed #0d6efd;border-radius:12px;padding:1rem 2rem;margin:1rem 0;">
            <div style="font-size:2.5rem;font-weight:800;letter-spacing:12px;color:#0d6efd;">${otp}</div>
          </div>
          <p style="color:#888;font-size:0.85rem;">This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
        </div>
        <div style="background:#f8f9fa;padding:1rem;text-align:center;font-size:0.8rem;color:#aaa;">© 2026 Rentify Car Rentals</div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
  }

  try {
    // Check if email already exists in the database
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'This email is already registered. Please login instead.' });
    }

    // Rate limiting: prevent spamming OTP (max 1 per 60 seconds)
    if (otps[email] && otps[email].sentAt && Date.now() - otps[email].sentAt < 60000) {
      return res.status(429).json({ success: false, message: 'Please wait 60 seconds before requesting another OTP' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otps[email] = { otp, expires: Date.now() + 300000, sentAt: Date.now() };

    await sendOTPEmail(email, otp);
    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
});

router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }

  const stored = otps[email];

  if (!stored) {
    return res.status(400).json({ success: false, message: 'No OTP found for this email. Please request a new one.' });
  }
  if (stored.expires < Date.now()) {
    delete otps[email];
    return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
  }
  if (stored.otp !== otp) {
    return res.status(400).json({ success: false, message: 'Incorrect OTP. Please check and try again.' });
  }

  delete otps[email];
  res.json({ success: true, message: 'Email verified successfully' });
});

module.exports = router;
