// Query limits and validation middleware for performance optimization

const validatePagination = (req, res, next) => {
  const { page = 1, limit = 50 } = req.query;
  
  // Validate and sanitize pagination parameters
  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedLimit = Math.min(Math.max(1, parseInt(limit) || 50), 1000); // Max 1000 per request
  
  req.query.page = parsedPage;
  req.query.limit = parsedLimit;
  
  next();
};

const validateDateRange = (req, res, next) => {
  const { start_date, end_date, days } = req.query;
  
  if (start_date && end_date) {
    const start = new Date(start_date);
    const end = new Date(end_date);
    
    // Validate date format
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD format.'
      });
    }
    
    // Prevent queries spanning more than 2 years for performance
    const diffInDays = Math.abs((end - start) / (1000 * 60 * 60 * 24));
    if (diffInDays > 730) {
      return res.status(400).json({
        success: false,
        message: 'Date range cannot exceed 2 years (730 days).'
      });
    }
    
    // Ensure start_date is before end_date
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'start_date must be before end_date.'
      });
    }
  }
  
  // Validate days parameter
  if (days) {
    const parsedDays = Math.min(Math.max(1, parseInt(days) || 30), 365); // Max 1 year
    req.query.days = parsedDays;
  }
  
  next();
};

const validateOutletAccess = (req, res, next) => {
  const { outlet_id } = req.query;
  
  // For now, only allow Kompally outlet (ID = 1)
  if (outlet_id && parseInt(outlet_id) !== 1) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Only Kompally outlet is allowed'
    });
  }
  
  // Force outlet_id to 1 for all queries in current setup
  req.query.outlet_id = 1;
  
  next();
};

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow queries (> 5 seconds)
    if (duration > 5000) {
      console.warn(`🐌 Slow query detected:`, {
        method: req.method,
        url: req.url,
        query: req.query,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Log to performance metrics (could be sent to monitoring service)
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  
  next();
};

module.exports = {
  validatePagination,
  validateDateRange,
  validateOutletAccess,
  performanceMonitor
};