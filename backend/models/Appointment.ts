import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
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
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
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
    required: false
  },
  appointmentDate: {
    type: Date,
    required: true
  }
});

export const Appointment = mongoose.model('Appointment', appointmentSchema); 