const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const env = require('../config/env');

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(400, 'User already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  // Send welcome email (Non-blocking)
  sendEmail(email, 'Welcome to RongRani', 'welcome', { name })
    .then(() => {
      console.log('✅ Welcome email sent successfully to:', email);
      // Admin notification
      return sendEmail(
        env.SUPER_ADMIN_EMAIL,
        '🆕 New User Registered - RongRani',
        'adminNewUser',
        { userName: name, userEmail: email, registeredAt: new Date().toLocaleString() }
      );
    })
    .catch(err => console.error('❌ Email notification failed:', err.message));

  const token = generateToken(user._id);

  res.status(201).json(
    new ApiResponse(201, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    }, "User registered successfully")
  );
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id);

  res.status(200).json(
    new ApiResponse(200, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    }, "Login successful")
  );
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(
    new ApiResponse(200, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      address: user.address,
      phone: user.phone,
    })
  );
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (req.body.name) user.name = req.body.name;
  if (req.body.phone) user.phone = req.body.phone;
  if (req.body.address) user.address = req.body.address;

  await user.save();

  res.status(200).json(
    new ApiResponse(200, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      address: user.address,
      phone: user.phone,
    }, "Profile updated successfully")
  );
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json(new ApiResponse(200, {}, 'Password changed successfully'));
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, 'User with this email does not exist');
  }

  // Generate reset token
  const resetToken = jwt.sign({ id: user._id }, env.JWT_SECRET, {
    expiresIn: '1h',
  });

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  // FIX: Removed extra spaces in reset link
  const resetLink = `${env.FRONTEND_URL}/reset-password/${resetToken}`;

  await sendEmail(email, 'Password Reset Request', 'passwordReset', {
    name: user.name,
    resetLink,
  });

  res.status(200).json(new ApiResponse(200, {}, 'Password reset email sent'));
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new ApiError(400, "Token and new password are required");
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json(new ApiResponse(200, {}, 'Password reset successfully'));
  } catch (err) {
    // If jwt.verify fails
    throw new ApiError(400, 'Invalid or expired reset token');
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, {}, 'Logged out successfully'));
});

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    throw new ApiError(401, 'No token provided');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const newToken = generateToken(decoded.id);
    res.status(200).json(new ApiResponse(200, { token: newToken }));
  } catch (_) {
    throw new ApiError(401, 'Invalid or expired token');
  }
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw new ApiError(400, 'Invalid verification token');
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json(new ApiResponse(200, {}, 'Email verified successfully'));
  } catch (_) {
    throw new ApiError(400, 'Invalid or expired verification token');
  }
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
};