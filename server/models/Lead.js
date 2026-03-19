const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^\d{10}$/, 'Please enter a valid 10-digit mobile number'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    age: {
      type: Number,
      min: [1, 'Age must be a positive number'],
      max: [100, 'Age seems invalid'],
    },
    institutionName: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
    },
    type: {
      type: String,
      enum: ['School', 'College', ''],
      default: '',
    },
    hostelRequired: {
      type: Boolean,
      default: false,
    },
    courseInterest: {
      type: String,
      trim: true,
      default: '',
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Enrolled', 'Rejected'],
      default: 'New',
    },
    leadSource: {
      type: String,
      enum: ['profile', 'interest', 'enquiry'],
      default: 'enquiry',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);
