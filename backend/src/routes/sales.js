const express = require('express');
const { body, param, query } = require('express-validator');
const salesController = require('../controllers/salesController');
const { authenticate, authorize } = require('../middleware/auth');
const { 
  validatePagination, 
  validateDateRange, 
  validateOutletAccess, 
  performanceMonitor 
} = require('../middleware/queryLimits');

const router = express.Router();

const salesEntryValidation = [
  body('date')
    .isISO8601()
    .toDate()
    .withMessage('Valid date is required (YYYY-MM-DD)'),
  body('outlet_id')
    .isInt({ min: 1 })
    .withMessage('Valid outlet ID is required'),
  body('mtd_target')
    .isDecimal({ decimal_digits: '0,2' })
    .isFloat({ min: 0 })
    .withMessage('MTD target must be a positive number'),
  body('daily_target')
    .isDecimal({ decimal_digits: '0,2' })
    .isFloat({ min: 0 })
    .withMessage('Daily target must be a positive number'),
  body('gross_sale')
    .isDecimal({ decimal_digits: '0,2' })
    .isFloat({ min: 0 })
    .withMessage('Gross sale must be a positive number'),
  body('net_sale')
    .isDecimal({ decimal_digits: '0,2' })
    .isFloat({ min: 0 })
    .withMessage('Net sale must be a positive number'),
  body('total_tickets')
    .isInt({ min: 0 })
    .withMessage('Total tickets must be a non-negative integer'),
  body('offline_net_sale')
    .isDecimal({ decimal_digits: '0,2' })
    .isFloat({ min: 0 })
    .withMessage('Offline net sale must be a positive number'),
  body('offline_tickets')
    .isInt({ min: 0 })
    .withMessage('Offline tickets must be a non-negative integer'),
  body('cakes_sold')
    .isInt({ min: 0 })
    .withMessage('Cakes sold must be a non-negative integer'),
  body('pastries_sold')
    .isInt({ min: 0 })
    .withMessage('Pastries sold must be a non-negative integer')
];

const salesUpdateValidation = [
  body('mtd_target')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .isFloat({ min: 0 })
    .withMessage('MTD target must be a positive number'),
  body('daily_target')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .isFloat({ min: 0 })
    .withMessage('Daily target must be a positive number'),
  body('gross_sale')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .isFloat({ min: 0 })
    .withMessage('Gross sale must be a positive number'),
  body('net_sale')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .isFloat({ min: 0 })
    .withMessage('Net sale must be a positive number'),
  body('total_tickets')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total tickets must be a non-negative integer'),
  body('offline_net_sale')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .isFloat({ min: 0 })
    .withMessage('Offline net sale must be a positive number'),
  body('offline_tickets')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offline tickets must be a non-negative integer'),
  body('cakes_sold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Cakes sold must be a non-negative integer'),
  body('pastries_sold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Pastries sold must be a non-negative integer')
];

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid ID is required')
];

const queryValidation = [
  query('outlet_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Outlet ID must be a positive integer'),
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be in YYYY-MM-DD format'),
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be in YYYY-MM-DD format'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort_by')
    .optional()
    .isIn(['date', 'net_sale', 'gross_sale', 'total_tickets', 'apc'])
    .withMessage('Invalid sort field'),
  query('sort_order')
    .optional()
    .isIn(['ASC', 'DESC', 'asc', 'desc'])
    .withMessage('Sort order must be ASC or DESC')
];

const mtdQueryValidation = [
  query('year')
    .isInt({ min: 2020, max: 2050 })
    .withMessage('Year must be between 2020 and 2050'),
  query('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  query('outlet_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Outlet ID must be a positive integer')
];

// Apply performance monitoring to all routes
router.use(performanceMonitor);

router.post('/', authenticate, validateOutletAccess, salesEntryValidation, salesController.createSalesEntry);
router.get('/', authenticate, validatePagination, validateDateRange, validateOutletAccess, queryValidation, salesController.getSalesEntries);
router.get('/check-existing', authenticate, validateOutletAccess, [
  query('date').isISO8601().toDate().withMessage('Valid date is required'),
  query('outlet_id').isInt({ min: 1 }).withMessage('Valid outlet ID is required')
], salesController.checkExistingEntry);
router.get('/mtd-summary', authenticate, validateOutletAccess, mtdQueryValidation, salesController.getMTDSummary);
router.get('/daily-trends', authenticate, validatePagination, validateDateRange, validateOutletAccess, queryValidation, salesController.getDailyTrends);
router.get('/:id', authenticate, idValidation, salesController.getSalesEntry);
router.put('/:id', authenticate, validateOutletAccess, idValidation, salesUpdateValidation, salesController.updateSalesEntry);
router.delete('/:id', authenticate, authorize('admin'), idValidation, salesController.deleteSalesEntry);

module.exports = router;