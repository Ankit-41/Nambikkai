import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  hospitalAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HospitalAdmin',
    required: true
  },
  patients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  }],
  testMetrics: {
    totalTests: {
      type: Number,
      default: 0
    },
    testsAllocated: {
      type: Number,
      default: 0
    },
    testsDone: {
      type: Number,
      default: 0
    },
    testsRemaining: {
      type: Number,
      default: 0
    }
  }
});

export const Doctor = mongoose.model('Doctor', doctorSchema); 