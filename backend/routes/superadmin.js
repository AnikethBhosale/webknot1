const express = require('express');
const { body, validationResult } = require('express-validator');
const College = require('../models/College');
const Admin = require('../models/Admin');
const { adminAuth, superAdminAuth } = require('../middleware/auth');

const router = express.Router();

// Create new college
router.post('/colleges/create', [
  adminAuth,
  superAdminAuth,
  body('name').trim().isLength({ min: 2 }),
  body('address').trim().isLength({ min: 5 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, address } = req.body;

    // Check if college already exists
    const existingCollege = await College.findOne({ name });
    if (existingCollege) {
      return res.status(400).json({ message: 'College already exists' });
    }

    const college = new College({ name, address });
    await college.save();

    res.status(201).json({
      message: 'College created successfully',
      college
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create college admin
router.post('/colleges/:collegeId/admins/create', [
  adminAuth,
  superAdminAuth,
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { collegeId } = req.params;
    const { email, password } = req.body;

    // Check if college exists
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = new Admin({
      email,
      password,
      college_id: collegeId,
      role: 'college_admin'
    });

    await admin.save();

    res.status(201).json({
      message: 'College admin created successfully',
      admin: {
        id: admin._id,
        email: admin.email,
        college: college
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all colleges
router.get('/colleges', [adminAuth, superAdminAuth], async (req, res) => {
  try {
    const colleges = await College.find().sort({ name: 1 });
    res.json(colleges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all admins
router.get('/admins', [adminAuth, superAdminAuth], async (req, res) => {
  try {
    const admins = await Admin.find()
      .populate('college_id', 'name')
      .sort({ role: 1, email: 1 });
    res.json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get college with its admin
router.get('/colleges/:collegeId', [adminAuth, superAdminAuth], async (req, res) => {
  try {
    const { collegeId } = req.params;
    
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    const admin = await Admin.findOne({ college_id: collegeId, role: 'college_admin' });
    
    res.json({
      college,
      admin: admin || null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
