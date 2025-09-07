const express = require('express');
const { body, validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');
const Event = require('../models/Event');
const Student = require('../models/Student');
const Registration = require('../models/Registration');
const { adminAuth, studentAuth } = require('../middleware/auth');

const router = express.Router();

// Submit feedback
router.post('/submit', [
  studentAuth,
  body('event_id').isMongoId(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { event_id, rating, comment } = req.body;

    // Check if event exists
    const event = await Event.findById(event_id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if student was registered and attended the event
    const registration = await Registration.findOne({
      student_id: req.student._id,
      event_id: event_id,
      status: 'attended'
    });

    if (!registration) {
      return res.status(400).json({ 
        message: 'You must have attended the event to provide feedback' 
      });
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({
      student_id: req.student._id,
      event_id: event_id
    });

    if (existingFeedback) {
      return res.status(400).json({ message: 'Feedback already submitted for this event' });
    }

    const feedback = new Feedback({
      student_id: req.student._id,
      event_id: event_id,
      rating: parseInt(rating),
      comment: comment || ''
    });

    await feedback.save();

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get average feedback for an event
router.get('/:event_id/average', async (req, res) => {
  try {
    const { event_id } = req.params;

    const event = await Event.findById(event_id).populate('college_id', 'name');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const feedbacks = await Feedback.find({ event_id })
      .populate('student_id', 'name')
      .sort({ createdAt: -1 });

    if (feedbacks.length === 0) {
      return res.json({
        event: {
          id: event._id,
          name: event.name,
          start_time: event.start_time,
          end_time: event.end_time
        },
        averageRating: 0,
        totalFeedbacks: 0,
        feedbacks: []
      });
    }

    const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
    const averageRating = totalRating / feedbacks.length;

    // Rating distribution
    const ratingDistribution = {
      5: feedbacks.filter(f => f.rating === 5).length,
      4: feedbacks.filter(f => f.rating === 4).length,
      3: feedbacks.filter(f => f.rating === 3).length,
      2: feedbacks.filter(f => f.rating === 2).length,
      1: feedbacks.filter(f => f.rating === 1).length
    };

    res.json({
      event: {
        id: event._id,
        name: event.name,
        start_time: event.start_time,
        end_time: event.end_time
      },
      averageRating: Math.round(averageRating * 100) / 100,
      totalFeedbacks: feedbacks.length,
      ratingDistribution,
      feedbacks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all feedbacks for admin's college events
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, event_id } = req.query;
    
    // Get all events for admin's college
    const events = await Event.find({ college_id: req.admin.college_id });
    const eventIds = events.map(event => event._id);

    const query = { event_id: { $in: eventIds } };
    if (event_id) {
      query.event_id = event_id;
    }

    const feedbacks = await Feedback.find(query)
      .populate('student_id', 'name email student_id')
      .populate({
        path: 'event_id',
        select: 'name start_time end_time type',
        populate: {
          path: 'college_id',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Feedback.countDocuments(query);

    res.json({
      feedbacks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update feedback (student only)
router.put('/:feedback_id/update', [
  studentAuth,
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { feedback_id } = req.params;
    const { rating, comment } = req.body;

    const feedback = await Feedback.findById(feedback_id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if feedback belongs to current student
    if (feedback.student_id.toString() !== req.student._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = {};
    if (rating !== undefined) updateData.rating = parseInt(rating);
    if (comment !== undefined) updateData.comment = comment;

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      feedback_id,
      updateData,
      { new: true, runValidators: true }
    ).populate('event_id', 'name');

    res.json({
      message: 'Feedback updated successfully',
      feedback: updatedFeedback
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete feedback (student only)
router.delete('/:feedback_id/delete', studentAuth, async (req, res) => {
  try {
    const { feedback_id } = req.params;

    const feedback = await Feedback.findById(feedback_id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if feedback belongs to current student
    if (feedback.student_id.toString() !== req.student._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Feedback.findByIdAndDelete(feedback_id);

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
