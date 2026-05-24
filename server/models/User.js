const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    sparse: true, // Allow null values, but unique when present
  },
  phone: {
    type: String,
    default: null,
  },
  avatar: {
    type: String,
    default: null,
  },

  // Authentication
  password: {
    type: String,
    select: false,
    minlength: [6, 'Password must be at least 6 characters'],
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  googleEmail: String,
  googleName: String,
  phoneVerified: {
    type: Boolean,
    default: false,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },

  // OTP for phone verification
  otp: {
    code: String,
    expiresAt: Date,
    attempts: { type: Number, default: 0 },
  },

  // User Role and Permissions
  role: {
    type: String,
    enum: ['citizen', 'department_staff', 'admin'],
    default: 'citizen',
  },
  department: {
    type: String,
    enum: ['roads', 'sanitation', 'utilities', 'public_works', null],
    default: null,
  },
  permissions: [String], // For granular role-based access

  // Location Information
  location: {
    city: String,
    state: String,
    country: String,
    latitude: Number,
    longitude: Number,
  },

  // User Statistics
  reportsSubmitted: {
    type: Number,
    default: 0,
  },
  reportsResolved: {
    type: Number,
    default: 0,
  },
  totalUpvotes: {
    type: Number,
    default: 0,
  },

  // Account Status
  isActive: {
    type: Boolean,
    default: true,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: Date,
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ googleId: 1 });

// Hash password before saving (only if modified)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    attempts: 0,
  };
  return otp;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function(enteredOTP) {
  if (!this.otp || !this.otp.code) {
    return { valid: false, message: 'No OTP found' };
  }

  if (this.otp.attempts >= 5) {
    return { valid: false, message: 'Too many attempts. Please request a new OTP.' };
  }

  if (new Date() > this.otp.expiresAt) {
    return { valid: false, message: 'OTP has expired' };
  }

  if (this.otp.code !== enteredOTP) {
    this.otp.attempts += 1;
    return { valid: false, message: 'Invalid OTP' };
  }

  // Valid OTP
  this.phoneVerified = true;
  this.otp = null;
  return { valid: true, message: 'OTP verified successfully' };
};

module.exports = mongoose.model('User', userSchema);
