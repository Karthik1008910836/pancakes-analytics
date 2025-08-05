const { User, Outlet } = require('../models');
const { generateToken } = require('../middleware/auth');
const { validationResult } = require('express-validator');
const { validatePasswordStrength } = require('../utils/passwordValidation');

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { username, email, password, role, outlet_id, first_name, last_name } = req.body;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors
      });
    }

    const existingUser = await User.findOne({
      where: {
        $or: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    if (role === 'normal' && !outlet_id) {
      return res.status(400).json({
        success: false,
        message: 'Outlet ID is required for normal users'
      });
    }

    if (outlet_id) {
      const outlet = await Outlet.findByPk(outlet_id);
      if (!outlet || !outlet.is_active) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or inactive outlet'
        });
      }
    }

    const user = await User.create({
      username,
      email,
      password_hash: password,
      role: role || 'normal',
      outlet_id: role === 'normal' ? outlet_id : null,
      first_name,
      last_name
    });

    const token = generateToken({
      userId: user.id,
      role: user.role,
      outlet_id: user.outlet_id
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { username, password } = req.body;

    const user = await User.findOne({
      where: { username },
      include: [{ association: 'outlet' }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
      outlet_id: user.outlet_id
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ association: 'outlet' }]
    });

    res.json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { first_name, last_name, email } = req.body;
    const userId = req.user.id;

    if (email !== req.user.email) {
      const existingUser = await User.findOne({
        where: { email, id: { $ne: userId } }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    await User.update(
      { first_name, last_name, email },
      { where: { id: userId } }
    );

    const updatedUser = await User.findByPk(userId, {
      include: [{ association: 'outlet' }]
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser.toJSON()
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { current_password, new_password } = req.body;
    const userId = req.user.id;

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(new_password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'New password does not meet security requirements',
        errors: passwordValidation.errors
      });
    }

    const user = await User.findByPk(userId);
    const isValidCurrentPassword = await user.validatePassword(current_password);

    if (!isValidCurrentPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    await User.update(
      { password_hash: new_password },
      { where: { id: userId } }
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};