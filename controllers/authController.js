const { User } = require('../models');
const { validationResult } = require('express-validator');

const authController = {
  // Register new user
  async register(req, res, next) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }
      
      const { name, email, password, role, bio } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ 
          error: 'Email already registered' 
        });
      }
      
      // Create user (role defaults to 'fan' if not specified)
      const user = await User.create({
        name,
        email,
        password,
        role: role === 'artist' ? 'artist' : 'fan',
        bio: bio || null
      });
      
      // Generate token
      const token = user.generateAuthToken();
      
      res.status(201).json({
        message: 'Registration successful',
        user: user.toJSON(),
        token
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Login user
  async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }
      
      const { email, password } = req.body;
      
      // Find user (include password for validation)
      const user = await User.scope('withPassword').findOne({ 
        where: { email } 
      });
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid credentials' 
        });
      }
      
      // Check password
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          error: 'Invalid credentials' 
        });
      }
      
      // Generate token
      const token = user.generateAuthToken();
      
      res.json({
        message: 'Login successful',
        user: user.toJSON(),
        token
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Get current user (from token)
  async getMe(req, res, next) {
    try {
      res.json({
        user: req.user
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Logout (client-side token removal - but we can add token blacklist in production)
  async logout(req, res, next) {
    try {
      // In a production app, you might want to add the token to a blacklist
      // For now, we just inform the client to discard the token
      res.json({ 
        message: 'Logout successful. Please discard your token on client side.' 
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;