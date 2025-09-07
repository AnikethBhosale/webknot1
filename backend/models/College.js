const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'College name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'College address is required'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('College', collegeSchema);
