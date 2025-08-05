const { EditRequest, DailySales, User, Outlet } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const createEditRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { daily_sales_id, reason, proposed_changes } = req.body;

    // Check if the daily sales entry exists
    const dailySalesEntry = await DailySales.findByPk(daily_sales_id, {
      include: [{ association: 'outlet' }]
    });

    if (!dailySalesEntry) {
      return res.status(404).json({
        success: false,
        message: 'Sales entry not found'
      });
    }

    // Only allow Kompally outlet entries
    if (dailySalesEntry.outlet_id !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only Kompally outlet entries can be edited'
      });
    }

    // Check if there's already a pending request for this entry
    const existingRequest = await EditRequest.findOne({
      where: {
        daily_sales_id,
        status: 'pending'
      }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'There is already a pending edit request for this entry'
      });
    }

    // Normal users can only request edits for entries from their outlet
    if (req.user.role === 'normal' && req.user.outlet_id !== dailySalesEntry.outlet_id) {
      return res.status(403).json({
        success: false,
        message: 'You can only request edits for entries from your assigned outlet'
      });
    }

    const editRequest = await EditRequest.create({
      daily_sales_id,
      requested_by: req.user.id,
      reason,
      proposed_changes
    });

    const requestWithRelations = await EditRequest.findByPk(editRequest.id, {
      include: [
        { 
          association: 'dailySales',
          include: [{ association: 'outlet' }]
        },
        { 
          association: 'requestedBy',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Edit request created successfully. An admin will review your request.',
      data: requestWithRelations
    });
  } catch (error) {
    console.error('Create edit request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getEditRequests = async (req, res) => {
  try {
    const { status, outlet_id, page = 1, limit = 20 } = req.query;
    
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }

    // For normal users, only show their own requests
    if (req.user.role === 'normal') {
      whereClause.requested_by = req.user.id;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await EditRequest.findAndCountAll({
      where: whereClause,
      include: [
        { 
          association: 'dailySales',
          include: [{ association: 'outlet' }]
        },
        { 
          association: 'requestedBy',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        { 
          association: 'reviewedBy',
          attributes: ['id', 'first_name', 'last_name', 'email'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        requests: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get edit requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const reviewEditRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Only admins can review requests
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only admins can review edit requests'
      });
    }

    const { id } = req.params;
    const { status, review_notes } = req.body;

    const editRequest = await EditRequest.findByPk(id, {
      include: [
        { 
          association: 'dailySales',
          include: [{ association: 'outlet' }]
        },
        { 
          association: 'requestedBy',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    if (!editRequest) {
      return res.status(404).json({
        success: false,
        message: 'Edit request not found'
      });
    }

    if (editRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been reviewed'
      });
    }

    // Check if request has expired
    if (new Date() > editRequest.expires_at) {
      await editRequest.update({
        status: 'rejected',
        reviewed_by: req.user.id,
        review_notes: 'Request expired',
        reviewed_at: new Date()
      });

      return res.status(400).json({
        success: false,
        message: 'This request has expired and was automatically rejected'
      });
    }

    // Update the edit request
    await editRequest.update({
      status,
      reviewed_by: req.user.id,
      review_notes: review_notes || null,
      reviewed_at: new Date()
    });

    // If approved, apply the changes to the daily sales entry
    if (status === 'approved') {
      const { proposed_changes } = editRequest;
      await editRequest.dailySales.update(proposed_changes);
    }

    const updatedRequest = await EditRequest.findByPk(id, {
      include: [
        { 
          association: 'dailySales',
          include: [{ association: 'outlet' }]
        },
        { 
          association: 'requestedBy',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        { 
          association: 'reviewedBy',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    const action = status === 'approved' ? 'approved and applied' : 'rejected';
    res.json({
      success: true,
      message: `Edit request ${action} successfully`,
      data: updatedRequest
    });
  } catch (error) {
    console.error('Review edit request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getEditRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const editRequest = await EditRequest.findByPk(id, {
      include: [
        { 
          association: 'dailySales',
          include: [{ association: 'outlet' }]
        },
        { 
          association: 'requestedBy',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        { 
          association: 'reviewedBy',
          attributes: ['id', 'first_name', 'last_name', 'email'],
          required: false
        }
      ]
    });

    if (!editRequest) {
      return res.status(404).json({
        success: false,
        message: 'Edit request not found'
      });
    }

    // Normal users can only view their own requests
    if (req.user.role === 'normal' && editRequest.requested_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own edit requests'
      });
    }

    res.json({
      success: true,
      data: editRequest
    });
  } catch (error) {
    console.error('Get edit request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const cancelEditRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const editRequest = await EditRequest.findByPk(id);

    if (!editRequest) {
      return res.status(404).json({
        success: false,
        message: 'Edit request not found'
      });
    }

    // Only the requester or admin can cancel
    if (editRequest.requested_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only cancel your own requests'
      });
    }

    if (editRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be cancelled'
      });
    }

    await editRequest.update({
      status: 'rejected',
      reviewed_by: req.user.id,
      review_notes: 'Cancelled by requester',
      reviewed_at: new Date()
    });

    res.json({
      success: true,
      message: 'Edit request cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel edit request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createEditRequest,
  getEditRequests,
  reviewEditRequest,
  getEditRequest,
  cancelEditRequest
};