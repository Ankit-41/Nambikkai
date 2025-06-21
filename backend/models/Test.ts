import mongoose from 'mongoose';

const timeSeriesDataSchema = new mongoose.Schema({
  time: {
    type: Number,
    required: true
  },
  linearDisplacement: {
    type: Number,
    required: true
  },
  rangeOfMotion: {
    type: Number,
    required: true
  },
  angularDisplacement: {
    type: Number,
    required: true
  }
});

const testSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  puckId: {
    type: String,
    required: true
  },
  testDate: {
    type: Date,
    default: Date.now
  },
  linearDisplacement: {
    type: Number,
    required: true
  },
  rangeOfMotion: {
    type: Number,
    required: true
  },
  angularDisplacement: {
    type: Number,
    required: true
  },
  timeSeriesData: [timeSeriesDataSchema],
  doctorNotes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Test = mongoose.model('Test', testSchema); 