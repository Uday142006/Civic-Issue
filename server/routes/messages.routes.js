const express = require('express');
const { auth } = require('../middleware/auth.middleware');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

const router = express.Router();

// Get all messages for a report
router.get('/report/:reportId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ reportId: req.params.reportId })
      .populate('sender', 'name email avatar role')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({ reportId: req.params.reportId });

    // Mark messages recipient received as read
    await Message.updateMany(
      { reportId: req.params.reportId, recipient: req.user.id, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({
      success: true,
      messages,
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

// Send message on a report
router.post('/', auth, async (req, res) => {
  try {
    const { reportId, recipientId, content, attachments = [] } = req.body;

    if (!reportId || !recipientId || !content) {
      return res.status(400).json({ message: 'reportId, recipientId, and content are required' });
    }

    const message = new Message({
      reportId,
      sender: req.user.id,
      recipient: recipientId,
      content,
      attachments,
    });

    await message.save();
    await message.populate('sender', 'name email avatar role');

    // Create notification for recipient
    const notification = new Notification({
      recipient: recipientId,
      sender: req.user.id,
      type: 'message',
      title: 'New Message',
      message: `${req.user.name || 'Someone'} sent you a message`,
      messageId: message._id,
      reportId,
      actionUrl: `/reports/${reportId}`,
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark message as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { read: true, readAt: new Date() },
      { new: true }
    );

    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get unread message count for user
router.get('/count/unread', auth, async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      recipient: req.user.id,
      read: false,
    });

    res.json({ success: true, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
