const express = require('express');
const { auth } = require('../middleware/auth.middleware');
const Report = require('../models/Report');

const router = express.Router();

// Create report
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, latitude, longitude, address, image } = req.body;

    const report = new Report({
      title,
      description,
      category,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
        address,
      },
      image,
      submittedBy: req.user.id,
    });

    await report.save();
    await report.populate('submittedBy', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all reports
router.get('/', async (req, res) => {
  try {
    const { status, category, latitude, longitude, radius = 5000 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;

    if (latitude && longitude) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(radius),
        },
      };
    }

    const reports = await Report.find(query)
      .populate('submittedBy', 'name email avatar')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single report
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('submittedBy', 'name email avatar')
      .populate('assignedTo', 'name email')
      .populate('comments.userId', 'name email avatar');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update report status (admin/department only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upvote report
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report.upvotedBy.includes(req.user.id)) {
      report.upvotedBy.push(req.user.id);
      report.upvotes += 1;
      await report.save();
    }

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
