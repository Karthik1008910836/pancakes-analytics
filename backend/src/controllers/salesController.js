const { DailySales, Outlet, User, MonthlyTarget, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const createSalesEntry = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      date,
      outlet_id,
      mtd_target,
      daily_target,
      gross_sale,
      net_sale,
      total_tickets,
      offline_net_sale,
      offline_tickets,
      cakes_sold,
      pastries_sold
    } = req.body;

    // Only allow Kompally outlet (ID = 1)
    if (parseInt(outlet_id) !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only Kompally outlet is allowed'
      });
    }

    const existingEntry = await DailySales.findOne({
      where: { date, outlet_id }
    });

    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: 'Sales entry for this date and outlet already exists'
      });
    }

    const outlet = await Outlet.findByPk(outlet_id);
    if (!outlet || !outlet.is_active) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or inactive outlet'
      });
    }

    const salesEntry = await DailySales.create({
      date,
      outlet_id,
      mtd_target,
      daily_target,
      gross_sale,
      net_sale,
      total_tickets,
      offline_net_sale,
      offline_tickets,
      cakes_sold,
      pastries_sold,
      entered_by: req.user.id
    });

    const entryWithRelations = await DailySales.findByPk(salesEntry.id, {
      include: [
        { association: 'outlet' },
        { association: 'enteredBy', attributes: ['id', 'first_name', 'last_name'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Sales entry created successfully',
      data: entryWithRelations
    });
  } catch (error) {
    console.error('Create sales entry error:', error);
    
    // Handle validation errors from model
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: error.errors?.[0]?.message || 'Validation failed',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateSalesEntry = async (req, res) => {
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
    const salesEntry = await DailySales.findByPk(id);

    if (!salesEntry) {
      return res.status(404).json({
        success: false,
        message: 'Sales entry not found'
      });
    }

    // Only allow modification of Kompally outlet entries
    if (salesEntry.outlet_id !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only Kompally outlet entries can be modified'
      });
    }

    // Normal users cannot directly edit existing entries - they must create edit requests
    if (req.user.role === 'normal') {
      return res.status(403).json({
        success: false,
        message: 'Direct editing not allowed. Please create an edit request for admin approval.',
        requiresEditRequest: true
      });
    }

    const {
      mtd_target,
      daily_target,
      gross_sale,
      net_sale,
      total_tickets,
      offline_net_sale,
      offline_tickets,
      cakes_sold,
      pastries_sold
    } = req.body;

    await salesEntry.update({
      mtd_target,
      daily_target,
      gross_sale,
      net_sale,
      total_tickets,
      offline_net_sale,
      offline_tickets,
      cakes_sold,
      pastries_sold
    });

    const updatedEntry = await DailySales.findByPk(id, {
      include: [
        { association: 'outlet' },
        { association: 'enteredBy', attributes: ['id', 'first_name', 'last_name'] }
      ]
    });

    res.json({
      success: true,
      message: 'Sales entry updated successfully',
      data: updatedEntry
    });
  } catch (error) {
    console.error('Update sales entry error:', error);
    
    // Handle validation errors from model
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: error.errors?.[0]?.message || 'Validation failed',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getSalesEntries = async (req, res) => {
  try {
    const { 
      outlet_id, 
      start_date, 
      end_date, 
      page = 1, 
      limit = 50,
      sort_by = 'date',
      sort_order = 'DESC'
    } = req.query;

    const whereClause = {};
    
    if (outlet_id) {
      whereClause.outlet_id = outlet_id;
    }
    
    // Always filter for Kompally outlet only
    whereClause.outlet_id = 1;

    if (start_date && end_date) {
      whereClause.date = {
        [Op.between]: [start_date, end_date]
      };
    } else if (start_date) {
      whereClause.date = {
        [Op.gte]: start_date
      };
    } else if (end_date) {
      whereClause.date = {
        [Op.lte]: end_date
      };
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await DailySales.findAndCountAll({
      where: whereClause,
      include: [
        { association: 'outlet' },
        { association: 'enteredBy', attributes: ['id', 'first_name', 'last_name'] }
      ],
      order: [[sort_by, sort_order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        entries: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get sales entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getSalesEntry = async (req, res) => {
  try {
    const { id } = req.params;
    
    const salesEntry = await DailySales.findByPk(id, {
      include: [
        { association: 'outlet' },
        { association: 'enteredBy', attributes: ['id', 'first_name', 'last_name'] }
      ]
    });

    if (!salesEntry) {
      return res.status(404).json({
        success: false,
        message: 'Sales entry not found'
      });
    }

    // Only allow access to Kompally outlet entries
    if (salesEntry.outlet_id !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only Kompally outlet entries can be accessed'
      });
    }

    res.json({
      success: true,
      data: salesEntry
    });
  } catch (error) {
    console.error('Get sales entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const deleteSalesEntry = async (req, res) => {
  try {
    const { id } = req.params;
    
    const salesEntry = await DailySales.findByPk(id);

    if (!salesEntry) {
      return res.status(404).json({
        success: false,
        message: 'Sales entry not found'
      });
    }

    if (req.user.role === 'normal') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins can delete entries'
      });
    }

    await salesEntry.destroy();

    res.json({
      success: true,
      message: 'Sales entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete sales entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getMTDSummary = async (req, res) => {
  try {
    const { outlet_id, year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Year and month are required'
      });
    }

    const whereClause = {
      date: {
        [Op.and]: [
          sequelize.where(sequelize.fn('strftime', '%Y', sequelize.col('date')), year.toString()),
          sequelize.where(sequelize.fn('strftime', '%m', sequelize.col('date')), month.toString().padStart(2, '0'))
        ]
      }
    };

    if (outlet_id) {
      whereClause.outlet_id = outlet_id;
    }

    // Always filter for Kompally outlet only
    whereClause.outlet_id = 1;

    // Use SQL aggregation instead of JavaScript reduce for better performance
    const summary = await sequelize.query(`
      SELECT 
        ds.outlet_id,
        o.name as outlet_name,
        o.address,
        o.city,
        COUNT(*) as days_reported,
        SUM(CAST(ds.net_sale AS DECIMAL)) as total_net_sale,
        SUM(CAST(ds.gross_sale AS DECIMAL)) as total_gross_sale,
        SUM(ds.total_tickets) as total_tickets,
        SUM(ds.cakes_sold) as total_cakes,
        SUM(ds.pastries_sold) as total_pastries,
        CASE 
          WHEN SUM(ds.total_tickets) > 0 
          THEN ROUND(SUM(CAST(ds.net_sale AS DECIMAL)) / SUM(ds.total_tickets), 2)
          ELSE 0 
        END as avg_apc,
        MAX(ds.mtd_target) as mtd_target,
        CASE 
          WHEN MAX(ds.mtd_target) > 0 
          THEN ROUND((SUM(CAST(ds.net_sale AS DECIMAL)) / MAX(ds.mtd_target) * 100), 2)
          ELSE 0 
        END as achievement_percentage
      FROM daily_sales ds
      JOIN outlets o ON ds.outlet_id = o.id
      WHERE strftime('%Y', ds.date) = ?
        AND strftime('%m', ds.date) = ?
        AND ds.outlet_id = 1
        AND o.is_active = 1
      GROUP BY ds.outlet_id, o.name, o.address, o.city
      ORDER BY ds.outlet_id
    `, {
      replacements: [year.toString(), month.toString().padStart(2, '0')],
      type: sequelize.QueryTypes.SELECT
    });

    // Transform to match expected format
    const formattedSummary = summary.map(row => ({
      outlet: {
        id: row.outlet_id,
        name: row.outlet_name,
        address: row.address,
        city: row.city
      },
      total_net_sale: parseFloat(row.total_net_sale) || 0,
      total_gross_sale: parseFloat(row.total_gross_sale) || 0,
      total_tickets: parseInt(row.total_tickets) || 0,
      total_cakes: parseInt(row.total_cakes) || 0,
      total_pastries: parseInt(row.total_pastries) || 0,
      days_reported: parseInt(row.days_reported) || 0,
      avg_apc: parseFloat(row.avg_apc) || 0,
      mtd_target: parseFloat(row.mtd_target) || 0,
      achievement_percentage: parseFloat(row.achievement_percentage) || 0
    }));

    res.json({
      success: true,
      data: {
        summary: formattedSummary,
        period: { year: parseInt(year), month: parseInt(month) }
      }
    });
  } catch (error) {
    console.error('Get MTD summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const checkExistingEntry = async (req, res) => {
  try {
    const { date, outlet_id } = req.query;
    
    if (!date || !outlet_id) {
      return res.status(400).json({
        success: false,
        message: 'Date and outlet_id are required'
      });
    }

    // Only allow checking for Kompally outlet (ID = 1)
    if (parseInt(outlet_id) !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only Kompally outlet is allowed'
      });
    }

    const existingEntry = await DailySales.findOne({
      where: { date, outlet_id },
      include: [
        { association: 'outlet' },
        { association: 'enteredBy', attributes: ['id', 'first_name', 'last_name'] }
      ]
    });

    if (existingEntry) {
      // Check if there's a pending edit request for this entry
      const { EditRequest } = require('../models');
      const pendingEditRequest = await EditRequest.findOne({
        where: {
          daily_sales_id: existingEntry.id,
          status: 'pending'
        }
      });

      res.json({
        success: true,
        data: {
          exists: true,
          entry: existingEntry,
          hasPendingEditRequest: !!pendingEditRequest,
          canEdit: req.user.role === 'admin',
          canRequestEdit: req.user.role === 'normal' && !pendingEditRequest
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          exists: false,
          canCreate: true
        }
      });
    }
  } catch (error) {
    console.error('Check existing entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getDailyTrends = async (req, res) => {
  try {
    const { start_date, end_date, days = 30, page = 1, limit = 50 } = req.query;
    
    const whereClause = {
      outlet_id: 1 // Always filter for Kompally outlet only
    };

    if (start_date && end_date) {
      whereClause.date = {
        [Op.between]: [start_date, end_date]
      };
    } else {
      // Default to last 30 days if no date range specified
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(days));
      
      whereClause.date = {
        [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
      };
    }

    // Add pagination and limits for better performance
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const queryLimit = Math.min(parseInt(limit), 1000); // Max 1000 records per request

    const { count, rows: salesData } = await DailySales.findAndCountAll({
      where: whereClause,
      include: [{ association: 'outlet' }],
      order: [['date', 'DESC']], // Most recent first
      limit: queryLimit,
      offset: offset
    });

    // Process data for charts
    const trendData = salesData.map(entry => ({
      date: entry.date,
      total_tickets: entry.total_tickets,
      offline_tickets: entry.offline_tickets,
      online_tickets: entry.total_tickets - entry.offline_tickets,
      cakes_sold: entry.cakes_sold,
      pastries_sold: entry.pastries_sold,
      net_sale: parseFloat(entry.net_sale),
      daily_target: parseFloat(entry.daily_target)
    }));

    res.json({
      success: true,
      data: {
        trends: trendData,
        pagination: {
          page: parseInt(page),
          limit: queryLimit,
          total: count,
          totalPages: Math.ceil(count / queryLimit),
          hasNext: (parseInt(page) * queryLimit) < count,
          hasPrev: parseInt(page) > 1
        },
        summary: {
          total_days: trendData.length,
          avg_total_tickets: trendData.length > 0 ? 
            (trendData.reduce((sum, day) => sum + day.total_tickets, 0) / trendData.length).toFixed(1) : 0,
          avg_online_tickets: trendData.length > 0 ? 
            (trendData.reduce((sum, day) => sum + day.online_tickets, 0) / trendData.length).toFixed(1) : 0,
          avg_offline_tickets: trendData.length > 0 ? 
            (trendData.reduce((sum, day) => sum + day.offline_tickets, 0) / trendData.length).toFixed(1) : 0,
          avg_cakes_sold: trendData.length > 0 ? 
            (trendData.reduce((sum, day) => sum + day.cakes_sold, 0) / trendData.length).toFixed(1) : 0,
          avg_pastries_sold: trendData.length > 0 ? 
            (trendData.reduce((sum, day) => sum + day.pastries_sold, 0) / trendData.length).toFixed(1) : 0
        }
      }
    });
  } catch (error) {
    console.error('Get daily trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createSalesEntry,
  updateSalesEntry,
  getSalesEntries,
  getSalesEntry,
  deleteSalesEntry,
  getMTDSummary,
  getDailyTrends,
  checkExistingEntry
};