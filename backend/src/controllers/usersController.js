const { User, Outlet } = require('../models');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{ association: 'outlet' }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      include: [{ association: 'outlet' }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const createUser = async (req, res) => {
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

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Validate outlet if provided
    if (outlet_id) {
      const outlet = await Outlet.findByPk(outlet_id);
      if (!outlet || !outlet.is_active) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or inactive outlet'
        });
      }
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password_hash: password,
      role: role || 'normal',
      outlet_id: role === 'normal' ? outlet_id : null,
      first_name,
      last_name,
      is_active: true
    });

    // Return user with outlet info
    const userWithOutlet = await User.findByPk(user.id, {
      include: [{ association: 'outlet' }]
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userWithOutlet
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { username, email, password, role, outlet_id, first_name, last_name, is_active } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email/username is taken by another user
    if (email !== user.email || username !== user.username) {
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email }, { username }],
          id: { [Op.ne]: id }
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email or username already exists'
        });
      }
    }

    // Validate outlet if provided
    if (outlet_id) {
      const outlet = await Outlet.findByPk(outlet_id);
      if (!outlet || !outlet.is_active) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or inactive outlet'
        });
      }
    }

    // Prepare update data
    const updateData = {
      username,
      email,
      role: role || user.role,
      outlet_id: role === 'normal' ? outlet_id : null,
      first_name,
      last_name,
      is_active: is_active !== undefined ? is_active : user.is_active
    };

    // Add password if provided
    if (password && password.trim() !== '') {
      updateData.password_hash = password;
    }

    await user.update(updateData);

    // Return updated user with outlet info
    const updatedUser = await User.findByPk(id, {
      include: [{ association: 'outlet' }]
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deactivating yourself
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    // Toggle status
    const newStatus = !user.is_active;
    await user.update({ is_active: newStatus });

    const updatedUser = await User.findByPk(id, {
      include: [{ association: 'outlet' }]
    });

    res.json({
      success: true,
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
      data: updatedUser
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting yourself
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Check if user has associated sales entries
    const { DailySales } = require('../models');
    const salesCount = await DailySales.count({
      where: { entered_by: id }
    });

    if (salesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete user. User has ${salesCount} associated sales entries. Please deactivate instead.`
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser
};