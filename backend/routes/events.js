const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Create event
router.post('/create', [
  adminAuth,
  upload.single('poster'),
  body('name').trim().isLength({ min: 3 }),
  body('type').isIn(['academic', 'cultural', 'sports', 'technical', 'social', 'other']),
  body('host').trim().isLength({ min: 2 }),
  body('description').trim().isLength({ min: 10 }),
  body('start_time').isISO8601(),
  body('end_time').isISO8601(),
  body('location').trim().isLength({ min: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      type,
      host,
      description,
      start_time,
      end_time,
      location,
      max_participants
    } = req.body;

    const eventData = {
      college_id: req.admin.college_id,
      name,
      type,
      host,
      description,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      location,
      max_participants: max_participants ? parseInt(max_participants) : null
    };

    if (req.file) {
      eventData.poster_url = `/uploads/${req.file.filename}`;
    }

    const event = new Event(eventData);
    await event.save();

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all events for admin's college
router.get('/list', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;
    const query = { college_id: req.admin.college_id };

    if (type) query.type = type;
    if (status) query.status = status;

    const events = await Event.find(query)
      .sort({ start_time: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('college_id', 'name');

    const total = await Event.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all events for students (public)
router.get('/public', async (req, res) => {
  try {
    const { page = 1, limit = 10, type, college_id } = req.query;
    const query = { status: { $in: ['upcoming', 'ongoing'] } };

    if (type) query.type = type;
    if (college_id) query.college_id = college_id;

    const events = await Event.find(query)
      .sort({ start_time: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('college_id', 'name');

    const total = await Event.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('college_id', 'name address');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event
router.put('/:id/update', [
  adminAuth,
  upload.single('poster'),
  body('name').optional().trim().isLength({ min: 3 }),
  body('type').optional().isIn(['academic', 'cultural', 'sports', 'technical', 'social', 'other']),
  body('host').optional().trim().isLength({ min: 2 }),
  body('description').optional().trim().isLength({ min: 10 }),
  body('start_time').optional().isISO8601(),
  body('end_time').optional().isISO8601(),
  body('location').optional().trim().isLength({ min: 2 }),
  body('status').optional().isIn(['upcoming', 'ongoing', 'completed', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if admin owns this event
    if (event.college_id.toString() !== req.admin.college_id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = { ...req.body };
    
    if (updateData.start_time) updateData.start_time = new Date(updateData.start_time);
    if (updateData.end_time) updateData.end_time = new Date(updateData.end_time);
    if (updateData.max_participants) updateData.max_participants = parseInt(updateData.max_participants);

    if (req.file) {
      updateData.poster_url = `/uploads/${req.file.filename}`;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel event
router.delete('/:id/cancel', adminAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if admin owns this event
    if (event.college_id.toString() !== req.admin.college_id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    event.status = 'cancelled';
    await event.save();

    res.json({ message: 'Event cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
