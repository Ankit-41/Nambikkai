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

const rawDataSchema = new mongoose.Schema({
  puckId: {
    type: String,
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
  },
  timeSeriesData: [timeSeriesDataSchema],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Automatically delete after 1 hour
  }
});

export const RawData = mongoose.model('RawData', rawDataSchema); 