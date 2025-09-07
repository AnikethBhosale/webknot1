const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required']
  },
  status: {
    type: String,
    enum: ['registered', 'attended', 'absent'],
    default: 'registered'
  },
  registered_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure one registration per student per event
registrationSchema.index({ student_id: 1, event_id: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
