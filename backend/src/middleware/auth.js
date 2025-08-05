const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'pancakes_secret_key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '10m'
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'pancakes_secret_key');
};

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    const user = await User.findByPk(decoded.userId, {
      include: [{ association: 'outlet' }]
    });

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or inactive user'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

const checkOutletAccess = (req, res, next) => {
  const { outlet_id } = req.params;
  const user = req.user;

  if (user.role === 'admin') {
    return next();
  }

  if (user.role === 'normal' && user.outlet_id && user.outlet_id.toString() === outlet_id) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied to this outlet'
  });
};

module.exports = {
  generateToken,
  verifyToken,
  authenticate,
  authorize,
  checkOutletAccess
};