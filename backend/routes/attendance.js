const express = require('express');
const { body, validationResult } = require('express-validator');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Student = require('../models/Student');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Mark attendance
router.post('/mark', [
  adminAuth,
  body('student_id').isMongoId(),
  body('event_id').isMongoId(),
  body('status').isIn(['attended', 'absent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { student_id, event_id, status } = req.body;

    // Check if event belongs to admin's college
    const event = await Event.findById(event_id);
    if (!event || event.college_id.toString() !== req.admin.college_id.toString()) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if student belongs to admin's college
    const student = await Student.findById(student_id);
    if (!student || student.college_id.toString() !== req.admin.college_id.toString()) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Find registration
    const registration = await Registration.findOne({
      student_id,
      event_id
    });

    if (!registration) {
      return res.status(404).json({ message: 'Student is not registered for this event' });
    }

    // Update attendance status
    registration.status = status;
    await registration.save();

    res.json({
      message: 'Attendance marked successfully',
      registration
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk mark attendance
router.post('/mark-bulk', [
  adminAuth,
  body('event_id').isMongoId(),
  body('attendance').isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { event_id, attendance } = req.body;

    // Check if event belongs to admin's college
    const event = await Event.findById(event_id);
    if (!event || event.college_id.toString() !== req.admin.college_id.toString()) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const results = [];
    
    for (const item of attendance) {
      const { student_id, status } = item;
      
      if (!['attended', 'absent'].includes(status)) {
        results.push({ student_id, error: 'Invalid status' });
        continue;
      }

      try {
        const registration = await Registration.findOne({
          student_id,
          event_id
        });

        if (!registration) {
          results.push({ student_id, error: 'Not registered' });
          continue;
        }

        registration.status = status;
        await registration.save();
        results.push({ student_id, status, success: true });
      } catch (error) {
        results.push({ student_id, error: error.message });
      }
    }

    res.json({
      message: 'Bulk attendance processed',
      results
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance report for an event
router.get('/:event_id/report', adminAuth, async (req, res) => {
  try {
    const { event_id } = req.params;

    // Check if event belongs to admin's college
    const event = await Event.findById(event_id).populate('college_id', 'name');
    if (!event || event.college_id._id.toString() !== req.admin.college_id.toString()) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const registrations = await Registration.find({ event_id })
      .populate('student_id', 'name email student_id')
      .sort({ status: 1, 'student_id.name': 1 });

    const totalRegistered = registrations.length;
    const attended = registrations.filter(r => r.status === 'attended').length;
    const absent = registrations.filter(r => r.status === 'absent').length;
    const pending = registrations.filter(r => r.status === 'registered').length;

    const attendancePercentage = totalRegistered > 0 ? (attended / totalRegistered) * 100 : 0;

    res.json({
      event: {
        id: event._id,
        name: event.name,
        start_time: event.start_time,
        end_time: event.end_time,
        location: event.location
      },
      summary: {
        totalRegistered,
        attended,
        absent,
        pending,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100
      },
      registrations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student attendance history
router.get('/student/:student_id/history', adminAuth, async (req, res) => {
  try {
    const { student_id } = req.params;

    // Check if student belongs to admin's college
    const student = await Student.findById(student_id);
    if (!student || student.college_id.toString() !== req.admin.college_id.toString()) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const registrations = await Registration.find({ student_id })
      .populate({
        path: 'event_id',
        select: 'name start_time end_time location type',
        populate: {
          path: 'college_id',
          select: 'name'
        }
      })
      .sort({ 'event_id.start_time': -1 });

    const totalEvents = registrations.length;
    const attendedEvents = registrations.filter(r => r.status === 'attended').length;
    const attendanceRate = totalEvents > 0 ? (attendedEvents / totalEvents) * 100 : 0;

    res.json({
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        student_id: student.student_id
      },
      summary: {
        totalEvents,
        attendedEvents,
        attendanceRate: Math.round(attendanceRate * 100) / 100
      },
      history: registrations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
