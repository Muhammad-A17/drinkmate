const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);

module.exports= Service;
