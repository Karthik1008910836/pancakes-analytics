const express = require('express');
const { body, param } = require('express-validator');
const usersController = require('../controllers/usersController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

const createUserValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .isAlphanumeric()
    .withMessage('Username must be 3-50 characters and alphanumeric'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 6 characters with uppercase, lowercase, and number'),
  body('first_name')
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required (1-50 characters)'),
  body('last_name')
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required (1-50 characters)'),
  body('role')
    .optional()
    .isIn(['admin', 'normal'])
    .withMessage('Role must be admin or normal'),
  body('outlet_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Outlet ID must be a positive integer')
];

const updateUserValidation = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 })
    .isAlphanumeric()
    .withMessage('Username must be 3-50 characters and alphanumeric'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 6 characters with uppercase, lowercase, and number'),
  body('first_name')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be 1-50 characters'),
  body('last_name')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be 1-50 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'normal'])
    .withMessage('Role must be admin or normal'),
  body('outlet_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Outlet ID must be a positive integer'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean')
];

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid user ID is required')
];

// All user management routes require admin access
router.use(authenticate, authorize('admin'));

router.get('/', usersController.getAllUsers);
router.get('/:id', idValidation, usersController.getUser);
router.post('/', createUserValidation, usersController.createUser);
router.put('/:id', idValidation, updateUserValidation, usersController.updateUser);
router.patch('/:id/toggle-status', idValidation, usersController.toggleUserStatus);
router.delete('/:id', idValidation, usersController.deleteUser);

module.exports = router;