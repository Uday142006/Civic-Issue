const express = require('express');
const { auth } = require('../middleware/auth.middleware');
const Report = require('../models/Report');

const router = express.Router();

// Get analytics by category
router.get('/by-category', async (req, res) => {
  try {
    const data = await Report.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get analytics by status
router.get('/by-status', async (req, res) => {
  try {
    const data = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get department response times
router.get('/response-times', auth, async (req, res) => {
  try {
    const data = await Report.aggregate([
      {
        $match: { status: 'resolved' },
      },
      {
        $group: {
          _id: '$department',
          avgResponseTime: {
            $avg: {
              $subtract: ['$resolvedAt', '$createdAt'],
            },
          },
          totalResolved: { $sum: 1 },
        },
      },
    ]);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
