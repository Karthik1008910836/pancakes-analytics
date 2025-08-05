const express = require('express');
const { body, param } = require('express-validator');
const editRequestController = require('../controllers/editRequestController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const createEditRequestValidation = [
  body('daily_sales_id')
    .isInt({ min: 1 })
    .withMessage('Valid daily sales entry ID is required'),
  body('reason')
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  body('proposed_changes')
    .isObject()
    .withMessage('Proposed changes must be a valid object')
    .custom((value) => {
      const allowedFields = [
        'mtd_target', 'daily_target', 'gross_sale', 'net_sale',
        'total_tickets', 'offline_net_sale', 'offline_tickets',
        'cakes_sold', 'pastries_sold'
      ];
      
      const proposedFields = Object.keys(value);
      const invalidFields = proposedFields.filter(field => !allowedFields.includes(field));
      
      if (invalidFields.length > 0) {
        throw new Error(`Invalid fields in proposed changes: ${invalidFields.join(', ')}`);
      }
      
      if (proposedFields.length === 0) {
        throw new Error('At least one field must be proposed for change');
      }
      
      return true;
    })
];

const reviewEditRequestValidation = [
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be either approved or rejected'),
  body('review_notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Review notes cannot exceed 500 characters')
];

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid ID is required')
];

// All routes require authentication
router.use(authenticate);

// Create edit request
router.post('/', createEditRequestValidation, editRequestController.createEditRequest);

// Get edit requests (with filtering)
router.get('/', editRequestController.getEditRequests);

// Get specific edit request
router.get('/:id', idValidation, editRequestController.getEditRequest);

// Review edit request (admin only)
router.put('/:id/review', idValidation, reviewEditRequestValidation, editRequestController.reviewEditRequest);

// Cancel edit request
router.delete('/:id', idValidation, editRequestController.cancelEditRequest);

module.exports = router;