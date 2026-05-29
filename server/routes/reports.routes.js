const express = require('express');
const { auth } = require('../middleware/auth.middleware');
const Report = require('../models/Report');

const router = express.Router();

// Create report
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, latitude, longitude, address, images = [], voiceNotes = [], priority = 'medium' } = req.body;

    const report = new Report({
      title,
      description,
      category,
      priority,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
        address,
      },
      images: images.map(img => ({
        url: img.url || img,
        publicId: img.publicId,
      })),
      voiceNotes: voiceNotes.map(voice => ({
        url: voice.url || voice,
        duration: voice.duration,
      })),
      submittedBy: req.user.id,
    });

    // Automated routing: assign to department based on category
    const categoryToDepartment = {
      'road_damage': 'public_works',
      'garbage': 'sanitation',
      'water_leakage': 'utilities',
      'street_light': 'public_works',
      'drainage': 'utilities',
      'other': 'other',
    };
    report.department = categoryToDepartment[category] || 'other';

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

// Add comment to report
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.comments.push({
      userId: req.user.id,
      text,
      timestamp: new Date(),
    });

    await report.save();
    await report.populate('comments.userId', 'name email avatar');

    res.json({ success: true, message: 'Comment added', report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload voice note to report
router.post('/:id/voice-notes', auth, async (req, res) => {
  try {
    const { voiceUrl, duration } = req.body;
    
    if (!voiceUrl) {
      return res.status(400).json({ message: 'Voice URL required' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.voiceNotes.push({
      url: voiceUrl,
      duration: duration || 0,
      uploadedAt: new Date(),
    });

    await report.save();
    res.json({ success: true, message: 'Voice note added', report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update report priority (admin only)
router.patch('/:id/priority', auth, async (req, res) => {
  try {
    const { priority } = req.body;
    
    if (!['low', 'medium', 'high', 'critical'].includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority level' });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { priority },
      { new: true }
    );

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
