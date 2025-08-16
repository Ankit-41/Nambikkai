import mongoose, { Schema, Document } from 'mongoose';

export interface ITest extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  puckId: string;
  legTested: 'Left' | 'Right';
  legLength: number;
  testDate: Date;
  
  // Test Results - Peak Values
  maxRangeOfMotion: number;
  maxLinearDisplacement: number;
  maxAngularDisplacement: number;
  
  // Time Series Data
  timeSeriesData: Array<{
    time: number;
    rangeOfMotion: number;
    linearDisplacement: number;
    angularDisplacement: number;
  }>;
  
  // Doctor Notes
  doctorNotes: string;
  
  // Metadata
  filesProcessed: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestSchema: Schema = new Schema({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  puckId: {
    type: String,
    required: true
  },
  legTested: {
    type: String,
    enum: ['Left', 'Right'],
    required: true
  },
  legLength: {
    type: Number,
    required: true
  },
  testDate: {
    type: Date,
    default: Date.now
  },
  
  // Test Results - Peak Values
  maxRangeOfMotion: {
    type: Number,
    required: true
  },
  maxLinearDisplacement: {
    type: Number,
    required: true
  },
  maxAngularDisplacement: {
    type: Number,
    required: true
  },
  
  // Time Series Data
  timeSeriesData: [{
    time: Number,
    rangeOfMotion: Number,
    linearDisplacement: Number,
    angularDisplacement: Number
  }],
  
  // Doctor Notes
  doctorNotes: {
    type: String,
    required: true
  },
  
  // Metadata
  filesProcessed: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
TestSchema.index({ patientId: 1, testDate: -1 });
TestSchema.index({ doctorId: 1, testDate: -1 });

export default mongoose.model<ITest>('Test', TestSchema); 