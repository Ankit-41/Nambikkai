import express, { Express } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';
import hospitalAdminRoutes from './routes/hospitalAdmin';
import doctorRoutes from './routes/doctor';
import superAdminRoutes from './routes/SuperAdmin';
import patientRoutes from './routes/patient';

const app: Express = express();

// Middleware
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err: Error) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/hospital-admin', hospitalAdminRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/patient', patientRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 