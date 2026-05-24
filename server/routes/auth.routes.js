const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth.middleware');

const router = express.Router();

// =============================================
// UTILITY FUNCTIONS
// =============================================

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Send OTP via Email (for development)
const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Your Civic Issue Reporter OTP',
      html: `
        <h2>Verify Your Phone Number</h2>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
      `,
    });
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

// =============================================
// PHONE-BASED OTP AUTHENTICATION
// =============================================

// Send OTP to Phone
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Check if user exists
    let user = await User.findOne({ phone });

    // If new user, create temporary user
    if (!user) {
      user = new User({
        phone,
        role: 'citizen',
        phoneVerified: false,
      });
    }

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // In production, integrate Twilio here
    // For now, send via email if email exists, or return OTP for testing
    if (user.email) {
      await sendOTPEmail(user.email, otp);
    }

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // Only for development - remove in production
      ...(process.env.NODE_ENV === 'development' && { otp }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify OTP and Login/Register
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, name, email } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    let user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: 'User not found. Please request OTP first.' });
    }

    // Verify OTP
    const verifyResult = user.verifyOTP(otp);
    if (!verifyResult.valid) {
      await user.save();
      return res.status(401).json({ message: verifyResult.message });
    }

    // Update user info on first login
    if (!user.name && name) {
      user.name = name;
    }
    if (!user.email && email) {
      user.email = email;
      user.emailVerified = true;
    }

    await user.save();

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// GOOGLE OAUTH AUTHENTICATION
// =============================================

// Google OAuth Callback Handler
router.post('/google-auth', async (req, res) => {
  try {
    const { googleId, email, name, picture, phoneNumber } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({ message: 'Google ID and email are required' });
    }

    // Check if user exists
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      // Auto-register citizen on first login
      user = new User({
        name,
        email,
        googleId,
        googleEmail: email,
        googleName: name,
        avatar: picture,
        phone: phoneNumber || null,
        role: 'citizen',
        emailVerified: true,
      });
      await user.save();
    } else {
      // Update existing user with Google info if not set
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (!user.email && email) {
        user.email = email;
        user.emailVerified = true;
      }
      if (!user.avatar && picture) {
        user.avatar = picture;
      }
      user.lastLogin = new Date();
      await user.save();
    }

    // Check if admin and validate credentials
    if (user.role === 'admin' && !user.password) {
      return res.status(403).json({ 
        message: 'Admin credentials not configured. Please contact municipal authorities.' 
      });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      isNewUser: !user.lastLogin,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// TRADITIONAL EMAIL/PASSWORD AUTHENTICATION
// =============================================

// Register (for traditional setup if needed)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    user = new User({
      name,
      email,
      password,
      phone,
      role: 'citizen',
      emailVerified: true,
    });

    await user.save();

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login (traditional email/password)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if admin
    if (user.role === 'admin' && !user.password) {
      return res.status(403).json({ message: 'Admin login not available through this method' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ADMIN CREDENTIAL MANAGEMENT
// =============================================

// Create/Update Admin Credentials (Protected - requires existing admin token)
router.post('/admin/create-credentials', auth, adminOnly, async (req, res) => {
  try {
    const { username, password, email, adminName } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if admin already exists
    let admin = await User.findOne({ role: 'admin', email });

    if (admin) {
      // Update existing admin
      admin.username = username;
      admin.password = password;
      admin.name = adminName || admin.name;
      await admin.save();
      return res.json({
        success: true,
        message: 'Admin credentials updated successfully',
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });
    }

    // Create new admin
    admin = new User({
      name: adminName || 'Municipal Administrator',
      email: email || `admin-${Date.now()}@civicissue.local`,
      username,
      password,
      role: 'admin',
      emailVerified: true,
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin credentials created successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin Login (username/password only)
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await User.findOne({ email, role: 'admin' }).select('+password');
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin);

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// UTILITY ENDPOINTS
// =============================================

// Verify Token
router.get('/verify', auth, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    // Token is handled client-side, but we can update last activity
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
