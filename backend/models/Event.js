const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  college_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: [true, 'College ID is required']
  },
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Event type is required'],
    enum: ['academic', 'cultural', 'sports', 'technical', 'social', 'other'],
    trim: true
  },
  host: {
    type: String,
    required: [true, 'Event host is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true
  },
  start_time: {
    type: Date,
    required: [true, 'Start time is required']
  },
  end_time: {
    type: Date,
    required: [true, 'End time is required']
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true
  },
  poster_url: {
    type: String,
    default: ''
  },
  max_participants: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  }
}, {
  timestamps: true
});

// Validate that end_time is after start_time
eventSchema.pre('save', function(next) {
  if (this.end_time <= this.start_time) {
    next(new Error('End time must be after start time'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Event', eventSchema);
