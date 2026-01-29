# Authentication System Plan

## Overview

This document describes the JWT-based authentication system that replaces Supabase Auth. It includes user registration, login, password management, email verification, and role-based access control.

## Architecture

### Components

1. **AuthService**: Core authentication logic
2. **AuthController**: HTTP request handlers
3. **authMiddleware**: JWT validation middleware
4. **PermissionMiddleware**: Role-based access control

## User Model

```javascript
// src/models/User.js
class User {
  static async create({ email, passwordHash, name }) {
    const id = generateUUID();
    const emailVerificationToken = generateToken();
    
    return await db.insert('users', {
      id,
      email,
      password_hash: passwordHash,
      email_verified: false,
      email_verification_token: emailVerificationToken,
      role: 'user',
      profile: JSON.stringify({ name }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  static async findByEmail(email) {
    return await db.findOne('users', { email });
  }

  static async findById(id) {
    return await db.findOne('users', { id });
  }

  static async update(id, updates) {
    return await db.update('users', id, updates);
  }
}
```

## AuthService

```javascript
// src/services/AuthService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const EmailService = require('./EmailService');

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET;
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    this.refreshSecret = process.env.JWT_REFRESH_SECRET;
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
  }

  async register({ email, password, name }) {
    // Validate email format
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Check if user exists
    const existing = await User.findByEmail(email);
    if (existing) {
      throw new Error('Email already registered');
    }

    // Validate password strength
    this.validatePassword(password);

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      name
    });

    // Send verification email
    await this.sendVerificationEmail(user);

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.email_verified
      },
      ...tokens
    };
  }

  async login({ email, password }) {
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Check if email is verified (optional requirement)
    // if (!user.email_verified) {
    //   throw new Error('Email not verified');
    // }

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Update last login
    await User.update(user.id, {
      last_login: new Date().toISOString()
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.email_verified,
        role: user.role
      },
      ...tokens
    };
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, this.refreshSecret);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async verifyEmail(token) {
    const user = await User.findOne('users', { email_verification_token: token });
    
    if (!user) {
      throw new Error('Invalid verification token');
    }

    if (user.email_verified) {
      throw new Error('Email already verified');
    }

    await User.update(user.id, {
      email_verified: true,
      email_verification_token: null
    });

    return { success: true };
  }

  async requestPasswordReset(email) {
    const user = await User.findByEmail(email);
    
    if (!user) {
      // Don't reveal if user exists
      return { success: true };
    }

    const resetToken = this.generateResetToken();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await User.update(user.id, {
      password_reset_token: resetToken,
      password_reset_expires: resetExpires.toISOString()
    });

    await this.sendPasswordResetEmail(user, resetToken);

    return { success: true };
  }

  async resetPassword({ token, password }) {
    const user = await User.findOne('users', { password_reset_token: token });
    
    if (!user) {
      throw new Error('Invalid reset token');
    }

    if (new Date(user.password_reset_expires) < new Date()) {
      throw new Error('Reset token expired');
    }

    // Validate password
    this.validatePassword(password);

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    await User.update(user.id, {
      password_hash: passwordHash,
      password_reset_token: null,
      password_reset_expires: null
    });

    return { success: true };
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    this.validatePassword(newPassword);

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await User.update(userId, {
      password_hash: passwordHash
    });

    return { success: true };
  }

  generateTokens(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn
    });

    const refreshToken = jwt.sign(
      { userId: user.id },
      this.refreshSecret,
      { expiresIn: this.refreshExpiresIn }
    );

    return { token, refreshToken };
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  validatePassword(password) {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain at least one number');
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async sendVerificationEmail(user) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${user.email_verification_token}`;
    
    await EmailService.send({
      to: user.email,
      subject: 'Verify your email',
      html: `
        <h1>Verify your email</h1>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
      `
    });
  }

  async sendPasswordResetEmail(user, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    await EmailService.send({
      to: user.email,
      subject: 'Reset your password',
      html: `
        <h1>Reset your password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link expires in 1 hour.</p>
      `
    });
  }
}

module.exports = AuthService;
```

## AuthController

```javascript
// src/controllers/AuthController.js
const AuthService = require('../services/AuthService');

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  async register(req, res, next) {
    try {
      const { email, password, name } = req.body;
      const result = await this.authService.register({ email, password, name });
      
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login({ email, password });
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const tokens = await this.authService.refreshToken(refreshToken);
      
      res.json({
        success: true,
        data: tokens
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { token } = req.query;
      await this.authService.verifyEmail(token);
      
      res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      await this.authService.requestPasswordReset(email);
      
      res.json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      await this.authService.resetPassword({ token, password });
      
      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      await this.authService.changePassword(req.user.id, {
        currentPassword,
        newPassword
      });
      
      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      
      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          emailVerified: user.email_verified,
          role: user.role,
          profile: JSON.parse(user.profile || '{}')
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const updates = req.body;
      const user = await User.update(req.user.id, {
        profile: JSON.stringify(updates)
      });
      
      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          profile: JSON.parse(user.profile || '{}')
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
```

## Authentication Middleware

```javascript
// src/middleware/auth.js
const AuthService = require('../services/AuthService');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const authService = new AuthService();
    const decoded = authService.verifyToken(token);
    
    // Attach user to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

module.exports = authenticate;
```

## Role-Based Access Control

```javascript
// src/middleware/permissions.js
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

const isOwnerOrAdmin = (resourceUserId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (req.user.role === 'admin' || req.user.id === resourceUserId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  };
};

module.exports = { authorize, isOwnerOrAdmin };
```

## Routes

```javascript
// src/routes/auth.js
const express = require('express');
const AuthController = require('../controllers/AuthController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { authValidators } = require('../utils/validators');

const router = express.Router();
const controller = new AuthController();

// Public routes
router.post('/register',
  authValidators.register,
  validate,
  controller.register.bind(controller)
);

router.post('/login',
  authValidators.login,
  validate,
  controller.login.bind(controller)
);

router.post('/refresh',
  authValidators.refresh,
  validate,
  controller.refreshToken.bind(controller)
);

router.get('/verify-email',
  controller.verifyEmail.bind(controller)
);

router.post('/forgot-password',
  authValidators.forgotPassword,
  validate,
  controller.forgotPassword.bind(controller)
);

router.post('/reset-password',
  authValidators.resetPassword,
  validate,
  controller.resetPassword.bind(controller)
);

// Protected routes
router.use(authenticate);

router.get('/profile', controller.getProfile.bind(controller));
router.put('/profile', controller.updateProfile.bind(controller));
router.post('/change-password',
  authValidators.changePassword,
  validate,
  controller.changePassword.bind(controller)
);

module.exports = router;
```

## Email Service

```javascript
// src/services/EmailService.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  async send({ to, subject, html, text }) {
    await this.transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
      text
    });
  }
}

module.exports = new EmailService();
```

## Security Considerations

1. **Password Hashing**: Use bcrypt with salt rounds of 10
2. **JWT Secret**: Use strong, random secret keys
3. **Token Expiration**: Short-lived access tokens (7 days), longer refresh tokens (30 days)
4. **HTTPS**: Always use HTTPS in production
5. **Rate Limiting**: Limit login attempts to prevent brute force
6. **Password Strength**: Enforce strong password requirements
7. **Email Verification**: Optional but recommended
8. **Password Reset**: Time-limited tokens (1 hour)
9. **Token Storage**: Store refresh tokens securely (httpOnly cookies or database)

## Session Management

### Token Storage Options

1. **LocalStorage** (current): Simple but vulnerable to XSS
2. **HttpOnly Cookies**: More secure, protected from XSS
3. **Database**: Store refresh tokens in database for revocation

### Recommended: Hybrid Approach

```javascript
// Store access token in memory/localStorage
// Store refresh token in httpOnly cookie

res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
});
```

## Testing

```javascript
// tests/services/AuthService.test.js
describe('AuthService', () => {
  it('should register a new user', async () => {
    const result = await authService.register({
      email: 'test@example.com',
      password: 'Password123',
      name: 'Test User'
    });
    
    expect(result.user).toBeDefined();
    expect(result.token).toBeDefined();
  });

  it('should login with valid credentials', async () => {
    const result = await authService.login({
      email: 'test@example.com',
      password: 'Password123'
    });
    
    expect(result.token).toBeDefined();
  });
});
```

