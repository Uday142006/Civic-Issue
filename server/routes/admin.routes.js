const express = require('express');
const { auth, adminOnly } = require('../middleware/auth.middleware');
const Report = require('../models/Report');
const User = require('../models/User');

const router = express.Router();

// Get all reports (admin only)
router.get('/reports', auth, adminOnly, async (req, res) => {
  try {
    const { status, category, department, page = 1, limit = 20 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (department) query.department = department;

    const skip = (page - 1) * limit;
    const reports = await Report.find(query)
      .populate('submittedBy', 'name email phone avatar')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      reports,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Assign report to department staff
router.patch('/reports/:id/assign', auth, adminOnly, async (req, res) => {
  try {
    const { assignedTo, department } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { assignedTo, department, status: 'acknowledged' },
      { new: true }
    ).populate('assignedTo', 'name email');

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Resolve report
router.patch('/reports/:id/resolve', auth, adminOnly, async (req, res) => {
  try {
    const { resolutionNotes } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status: 'resolved',
        resolutionNotes,
        resolvedAt: new Date(),
      },
      { new: true }
    );

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get dashboard stats
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });
    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      stats: {
        totalReports,
        pendingReports,
        resolvedReports,
        totalUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
