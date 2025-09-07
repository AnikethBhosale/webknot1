const express = require('express');
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Feedback = require('../models/Feedback');
const { adminAuth, studentAuth } = require('../middleware/auth');

const router = express.Router();

// Get all students for admin's college
router.get('/list', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = { college_id: req.admin.college_id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { student_id: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(query)
      .select('-password')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Student.countDocuments(query);

    res.json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current student's events
router.get('/me/events', studentAuth, async (req, res) => {
  try {
    const registrations = await Registration.find({ student_id: req.student._id })
      .populate({
        path: 'event_id',
        populate: {
          path: 'college_id',
          select: 'name'
        }
      })
      .sort({ registered_at: -1 });

    // Check feedback status for each registration
    const registrationsWithFeedback = await Promise.all(
      registrations.map(async (registration) => {
        const feedback = await Feedback.findOne({
          student_id: req.student._id,
          event_id: registration.event_id._id
        });
        
        return {
          ...registration.toObject(),
          hasFeedback: !!feedback
        };
      })
    );

    res.json(registrationsWithFeedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student events (registered events)
router.get('/:id/events', [adminAuth], async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Check if student belongs to admin's college
    const student = await Student.findById(studentId);
    if (!student || student.college_id.toString() !== req.admin.college_id.toString()) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const registrations = await Registration.find({ student_id: studentId })
      .populate({
        path: 'event_id',
        populate: {
          path: 'college_id',
          select: 'name'
        }
      })
      .sort({ registered_at: -1 });

    res.json(registrations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register for event
router.post('/register-event', [
  studentAuth,
  body('event_id').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { event_id } = req.body;

    // Check if event exists and is upcoming
    const event = await Event.findById(event_id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'upcoming') {
      return res.status(400).json({ message: 'Event is not available for registration' });
    }

    // Check if student is already registered
    const existingRegistration = await Registration.findOne({
      student_id: req.student._id,
      event_id: event_id
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check max participants if set
    if (event.max_participants) {
      const registrationCount = await Registration.countDocuments({ event_id });
      if (registrationCount >= event.max_participants) {
        return res.status(400).json({ message: 'Event is full' });
      }
    }

    const registration = new Registration({
      student_id: req.student._id,
      event_id: event_id,
      status: 'registered'
    });

    await registration.save();

    res.status(201).json({
      message: 'Successfully registered for event',
      registration
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unregister from event
router.delete('/unregister-event/:event_id', studentAuth, async (req, res) => {
  try {
    const { event_id } = req.params;

    const registration = await Registration.findOneAndDelete({
      student_id: req.student._id,
      event_id: event_id
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    res.json({ message: 'Successfully unregistered from event' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student profile
router.put('/profile', [
  studentAuth,
  body('name').optional().trim().isLength({ min: 2 }),
  body('email').optional().isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) {
      // Check if email is already taken
      const existingStudent = await Student.findOne({ 
        email, 
        _id: { $ne: req.student._id } 
      });
      if (existingStudent) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      updateData.email = email;
    }

    const student = await Student.findByIdAndUpdate(
      req.student._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      student
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/change-password', [
  studentAuth,
  body('currentPassword').isLength({ min: 6 }),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const student = await Student.findById(req.student._id);
    const isMatch = await student.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    student.password = newPassword;
    await student.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
