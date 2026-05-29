const express = require('express');
const { auth, adminOnly } = require('../middleware/auth.middleware');
const Report = require('../models/Report');
const User = require('../models/User');
const Notification = require('../models/Notification');

const router = express.Router();

// Get all reports (admin only)
router.get('/reports', auth, adminOnly, async (req, res) => {
  try {
    const { status, category, department, priority, page = 1, limit = 20 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (department) query.department = department;
    if (priority) query.priority = priority;

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
    const io = req.app.get('io');

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { assignedTo, department, status: 'acknowledged' },
      { new: true }
    )
      .populate('assignedTo', 'name email')
      .populate('submittedBy', 'name email');

    // Create notification for assigned staff
    const notification = new Notification({
      recipient: assignedTo,
      sender: req.user.id,
      type: 'assignment',
      title: 'New Report Assignment',
      message: `You have been assigned to report: ${report.title}`,
      reportId: report._id,
      actionUrl: `/reports/${report._id}`,
    });
    await notification.save();

    // Real-time notification via Socket.io
    if (io) {
      io.to(`user-${assignedTo}`).emit('notification', {
        type: 'assignment',
        message: `You have been assigned to report: ${report.title}`,
        reportId: report._id,
      });

      io.to(`report-${report._id}`).emit('report-updated', { report, action: 'assigned' });
    }

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Resolve report
router.patch('/reports/:id/resolve', auth, adminOnly, async (req, res) => {
  try {
    const { resolutionNotes } = req.body;
    const io = req.app.get('io');

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status: 'resolved',
        resolutionNotes,
        resolvedAt: new Date(),
      },
      { new: true }
    ).populate('submittedBy', 'name email');

    // Create notification for report submitter
    const notification = new Notification({
      recipient: report.submittedBy._id,
      sender: req.user.id,
      type: 'resolution',
      title: 'Report Resolved',
      message: `Your report "${report.title}" has been resolved`,
      reportId: report._id,
      actionUrl: `/reports/${report._id}`,
    });
    await notification.save();

    // Real-time updates
    if (io) {
      io.to(`user-${report.submittedBy._id}`).emit('notification', {
        type: 'resolution',
        message: `Your report "${report.title}" has been resolved`,
        reportId: report._id,
      });

      io.to(`report-${report._id}`).emit('report-updated', {
        report,
        action: 'resolved',
        resolutionNotes,
      });
    }

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update report status
router.patch('/reports/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const io = req.app.get('io');

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('submittedBy', 'name email');

    // Emit real-time update
    if (io) {
      io.to(`report-${report._id}`).emit('report-updated', {
        report,
        action: 'status-changed',
      });

      // Notify submitter
      io.to(`user-${report.submittedBy._id}`).emit('notification', {
        type: 'report_update',
        message: `Your report status updated to: ${status}`,
        reportId: report._id,
      });
    }

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
    const acknowledgedReports = await Report.countDocuments({ status: 'acknowledged' });
    const inProgressReports = await Report.countDocuments({ status: 'in_progress' });
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });
    const totalUsers = await User.countDocuments();

    // Get stats by priority
    const priorityStats = await Report.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get stats by department
    const departmentStats = await Report.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        },
      },
    ]);

    res.json({
      success: true,
      stats: {
        totalReports,
        pendingReports,
        acknowledgedReports,
        inProgressReports,
        resolvedReports,
        totalUsers,
        byPriority: priorityStats,
        byDepartment: departmentStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
