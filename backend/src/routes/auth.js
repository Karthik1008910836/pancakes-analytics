const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const registerValidation = [
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

const loginValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .isAlphanumeric()
    .withMessage('Username must be 3-50 characters and alphanumeric'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('first_name')
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required (1-50 characters)'),
  body('last_name')
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required (1-50 characters)'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required')
];

const changePasswordValidation = [
  body('current_password')
    .notEmpty()
    .withMessage('Current password is required'),
  body('new_password')
    .isLength({ min: 6 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must be at least 6 characters with uppercase, lowercase, and number')
];

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, updateProfileValidation, authController.updateProfile);
router.put('/change-password', authenticate, changePasswordValidation, authController.changePassword);

module.exports = router;