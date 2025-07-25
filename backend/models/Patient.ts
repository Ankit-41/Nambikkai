import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  sex: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: false
  },
  kneeCondition: {
    type: String,
    required: true
  },
  otherMorbidities: {
    type: String,
    default: 'None'
  },
  rehabDuration: {
    type: String,
    required: true
  },
  mriImage: {
    type: String,
    required: false
  },
  patientCode: {
    type: String,
    required: true,
    unique: true
  },
  tests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test'
  }]
});

export const Patient = mongoose.model('Patient', patientSchema); 