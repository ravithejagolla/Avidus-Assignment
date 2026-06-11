import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import env from 'dotenv'
env.config()
import argon2 from 'argon2'

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }
    //Hash Password
    const hashPassword = await argon2.hash(password)

    // Create user
    const userRole = role && ['User', 'Admin'].includes(role) ? role : 'User';

    const user = await User.create({
      name,
      email,
      password: hashPassword,
      role: userRole
    });

    // Log Activity: LOGIN
    await ActivityLog.create({
      user: user._id,
      action: 'LOGIN',
      details: `User "${user.name}" (${user.role}) logged in via signup`
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Log in user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check password match
    const isMatch = await argon2.verify(user.password, password)
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.status === 'Inactive') {
      return res.status(403).json({ success: false, error: 'Your account has been deactivated. Please contact an admin.' });
    }

    // Log Activity: LOGIN
    await ActivityLog.create({
      user: user._id,
      action: 'LOGIN',
      details: `${user.name} (${user.role}) logged in successfully`
    });

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.log("Login error:", error.message)
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
