import mongoose from 'mongoose';

const hospitalAdminSchema = new mongoose.Schema({
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperAdmin',
    required: true
  },
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
  },
  doctors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  }]
});

export const HospitalAdmin = mongoose.model('HospitalAdmin', hospitalAdminSchema); 