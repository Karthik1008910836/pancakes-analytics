const express = require('express');
const { Outlet } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const outlets = await Outlet.findAll({
      where: { 
        is_active: true,
        id: 1 // Only show Kompally outlet
      },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: outlets
    });
  } catch (error) {
    console.error('Get outlets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;