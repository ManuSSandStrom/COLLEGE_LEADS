const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    type: {
      type: String,
      enum: ['School', 'College'],
      required: [true, 'Institution type is required'],
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    fees: {
      type: Number,
      required: [true, 'Fees is required'],
      min: [0, 'Fees cannot be negative'],
    },
    courses: {
      type: [String],
      default: [],
    },
    feesByYear: {
      type: [
        {
          year: { type: String, trim: true },
          fee: { type: Number, min: 0 },
        },
      ],
      default: [],
    },
    hostelAvailable: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    imagePublicId: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    facilities: {
      type: [String],
      default: [],
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.0,
    },
    establishedYear: {
      type: Number,
    },
    website: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Text index for search
institutionSchema.index({ name: 'text', location: 'text', description: 'text' });

module.exports = mongoose.model('Institution', institutionSchema);
