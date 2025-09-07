const express = require('express');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Feedback = require('../models/Feedback');
const Student = require('../models/Student');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Popular events report
router.get('/popular_events', adminAuth, async (req, res) => {
  try {
    const { limit = 10, type, date_from, date_to } = req.query;

    // Build query for events
    const eventQuery = { college_id: req.admin.college_id };
    if (type) eventQuery.type = type;
    if (date_from || date_to) {
      eventQuery.start_time = {};
      if (date_from) eventQuery.start_time.$gte = new Date(date_from);
      if (date_to) eventQuery.start_time.$lte = new Date(date_to);
    }

    const events = await Event.find(eventQuery)
      .populate('college_id', 'name')
      .sort({ start_time: -1 });

    // Get registration counts for each event
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const registrations = await Registration.find({ event_id: event._id });
        const attended = registrations.filter(r => r.status === 'attended').length;
        const total = registrations.length;
        const attendanceRate = total > 0 ? (attended / total) * 100 : 0;

        // Get average feedback rating
        const feedbacks = await Feedback.find({ event_id: event._id });
        const avgRating = feedbacks.length > 0 
          ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length 
          : 0;

        return {
          ...event.toObject(),
          totalRegistrations: total,
          attendedCount: attended,
          attendanceRate: Math.round(attendanceRate * 100) / 100,
          averageRating: Math.round(avgRating * 100) / 100,
          feedbackCount: feedbacks.length
        };
      })
    );

    // Sort by registration count
    eventsWithStats.sort((a, b) => b.totalRegistrations - a.totalRegistrations);

    res.json({
      events: eventsWithStats.slice(0, parseInt(limit)),
      total: eventsWithStats.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student participation report
router.get('/student_participation', adminAuth, async (req, res) => {
  try {
    const { limit = 10, sort_by = 'attended' } = req.query;

    // Get all students from admin's college
    const students = await Student.find({ college_id: req.admin.college_id })
      .select('name email student_id');

    // Get participation stats for each student
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const registrations = await Registration.find({ student_id: student._id });
        const attended = registrations.filter(r => r.status === 'attended').length;
        const total = registrations.length;
        const participationRate = total > 0 ? (attended / total) * 100 : 0;

        // Get feedback count
        const feedbackCount = await Feedback.countDocuments({ student_id: student._id });

        return {
          ...student.toObject(),
          totalEvents: total,
          attendedEvents: attended,
          participationRate: Math.round(participationRate * 100) / 100,
          feedbackCount
        };
      })
    );

    // Sort by specified criteria
    if (sort_by === 'attended') {
      studentsWithStats.sort((a, b) => b.attendedEvents - a.attendedEvents);
    } else if (sort_by === 'participation') {
      studentsWithStats.sort((a, b) => b.participationRate - a.participationRate);
    } else if (sort_by === 'feedback') {
      studentsWithStats.sort((a, b) => b.feedbackCount - a.feedbackCount);
    }

    res.json({
      students: studentsWithStats.slice(0, parseInt(limit)),
      total: studentsWithStats.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Top students report
router.get('/top_students', adminAuth, async (req, res) => {
  try {
    const { limit = 3, criteria = 'attended' } = req.query;

    // Get all students from admin's college
    const students = await Student.find({ college_id: req.admin.college_id })
      .select('name email student_id');

    // Get stats for each student
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const registrations = await Registration.find({ student_id: student._id });
        const attended = registrations.filter(r => r.status === 'attended').length;
        const total = registrations.length;
        const participationRate = total > 0 ? (attended / total) * 100 : 0;

        // Get feedback count and average rating given
        const feedbacks = await Feedback.find({ student_id: student._id });
        const feedbackCount = feedbacks.length;
        const avgRatingGiven = feedbacks.length > 0 
          ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length 
          : 0;

        return {
          ...student.toObject(),
          totalEvents: total,
          attendedEvents: attended,
          participationRate: Math.round(participationRate * 100) / 100,
          feedbackCount,
          averageRatingGiven: Math.round(avgRatingGiven * 100) / 100
        };
      })
    );

    // Sort by criteria
    if (criteria === 'attended') {
      studentsWithStats.sort((a, b) => b.attendedEvents - a.attendedEvents);
    } else if (criteria === 'participation') {
      studentsWithStats.sort((a, b) => b.participationRate - a.participationRate);
    } else if (criteria === 'feedback') {
      studentsWithStats.sort((a, b) => b.feedbackCount - a.feedbackCount);
    }

    res.json({
      topStudents: studentsWithStats.slice(0, parseInt(limit)),
      criteria,
      total: studentsWithStats.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Event type analytics
router.get('/event_type_analytics', adminAuth, async (req, res) => {
  try {
    const eventTypes = ['academic', 'cultural', 'sports', 'technical', 'social', 'other'];
    
    const analytics = await Promise.all(
      eventTypes.map(async (type) => {
        const events = await Event.find({ 
          college_id: req.admin.college_id, 
          type 
        });

        const totalEvents = events.length;
        let totalRegistrations = 0;
        let totalAttended = 0;
        let totalFeedbacks = 0;
        let totalRating = 0;

        for (const event of events) {
          const registrations = await Registration.find({ event_id: event._id });
          totalRegistrations += registrations.length;
          totalAttended += registrations.filter(r => r.status === 'attended').length;

          const feedbacks = await Feedback.find({ event_id: event._id });
          totalFeedbacks += feedbacks.length;
          totalRating += feedbacks.reduce((sum, f) => sum + f.rating, 0);
        }

        const avgAttendanceRate = totalRegistrations > 0 ? (totalAttended / totalRegistrations) * 100 : 0;
        const avgRating = totalFeedbacks > 0 ? totalRating / totalFeedbacks : 0;

        return {
          type,
          totalEvents,
          totalRegistrations,
          totalAttended,
          averageAttendanceRate: Math.round(avgAttendanceRate * 100) / 100,
          totalFeedbacks,
          averageRating: Math.round(avgRating * 100) / 100
        };
      })
    );

    res.json({ analytics });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Monthly attendance trends
router.get('/attendance_trends', adminAuth, async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const trends = [];

    for (let i = 0; i < parseInt(months); i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      // Get events in this month
      const events = await Event.find({
        college_id: req.admin.college_id,
        start_time: { $gte: startOfMonth, $lte: endOfMonth }
      });

      let totalRegistrations = 0;
      let totalAttended = 0;

      for (const event of events) {
        const registrations = await Registration.find({ event_id: event._id });
        totalRegistrations += registrations.length;
        totalAttended += registrations.filter(r => r.status === 'attended').length;
      }

      const attendanceRate = totalRegistrations > 0 ? (totalAttended / totalRegistrations) * 100 : 0;

      trends.unshift({
        month: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
        totalEvents: events.length,
        totalRegistrations,
        totalAttended,
        attendanceRate: Math.round(attendanceRate * 100) / 100
      });
    }

    res.json({ trends });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Overall dashboard stats
router.get('/dashboard_stats', adminAuth, async (req, res) => {
  try {
    const collegeId = req.admin.college_id;

    // Basic counts
    const totalStudents = await Student.countDocuments({ college_id: collegeId });
    const totalEvents = await Event.countDocuments({ college_id: collegeId });
    const totalRegistrations = await Registration.countDocuments({
      event_id: { $in: await Event.find({ college_id: collegeId }).distinct('_id') }
    });
    const totalFeedbacks = await Feedback.countDocuments({
      event_id: { $in: await Event.find({ college_id: collegeId }).distinct('_id') }
    });

    // Active students (attended at least one event)
    const activeStudents = await Registration.distinct('student_id', {
      status: 'attended',
      event_id: { $in: await Event.find({ college_id: collegeId }).distinct('_id') }
    });

    // Upcoming events
    const upcomingEvents = await Event.countDocuments({
      college_id: collegeId,
      start_time: { $gt: new Date() },
      status: 'upcoming'
    });

    // Average attendance rate
    const allRegistrations = await Registration.find({
      event_id: { $in: await Event.find({ college_id: collegeId }).distinct('_id') }
    });
    const attendedCount = allRegistrations.filter(r => r.status === 'attended').length;
    const avgAttendanceRate = totalRegistrations > 0 ? (attendedCount / totalRegistrations) * 100 : 0;

    // Average feedback rating
    const allFeedbacks = await Feedback.find({
      event_id: { $in: await Event.find({ college_id: collegeId }).distinct('_id') }
    });
    const avgRating = allFeedbacks.length > 0 
      ? allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / allFeedbacks.length 
      : 0;

    res.json({
      totalStudents,
      totalEvents,
      totalRegistrations,
      totalFeedbacks,
      activeStudents: activeStudents.length,
      upcomingEvents,
      averageAttendanceRate: Math.round(avgAttendanceRate * 100) / 100,
      averageRating: Math.round(avgRating * 100) / 100
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
