import { Request, Response } from 'express';
import { User, Doctor, Patient } from '../models';
import Test from '../models/Test';
import { Appointment } from '../models/Appointment';
import { generatePatientCode } from '../scripts/generatePatientCode';
import { generateToken } from '../utils/jwt';
import axios from 'axios';
// hi guys
import fs from "fs";

export const downloadAndSaveReport = async (req: Request, res: Response) => {
  try {
    const { puckId, timestamp } = req.body;

    console.log("📥 Incoming request body:", req.body);

    if (!puckId || !timestamp) {
      console.error("❌ Missing puckId or timestamp");
      return res.status(400).json({ message: "puckId and timestamp are required" });
    }

    // Step 1: Call first AWS API to download up to 3 files
    console.log(`🌐 Calling /mystage/download with id="${puckId}" and timestamp="${timestamp}"`);

    const awsResp = await axios.post(
      "https://rdj3988sm9.execute-api.eu-north-1.amazonaws.com/mystage/download",
      { id: puckId, timestamp }, // Fixed: no trailing underscore
      { headers: { "Content-Type": "application/json" } }
    );

    console.log(`✅ Received response from download API, type: ${typeof awsResp.data}`);

    if (!Array.isArray(awsResp.data) || awsResp.data.length === 0) {
      console.error("⚠️ No files found in bucket for given puckId/timestamp");
      return res.status(404).json({ message: "No files found in bucket" });
    }

    console.log(`📄 Number of files returned: ${awsResp.data.length}`);
    awsResp.data.forEach((f: any, idx: number) => {
      console.log(`   [${idx + 1}] Filename: ${f.filename}, Data length: ${f.data_base64?.length || 0}`);
    });

    // Step 2: Decode all Base64 files into one merged object
    const mergedObject: Record<string, any> = {};

    for (const fileEntry of awsResp.data) {
      if (!fileEntry.filename || !fileEntry.data_base64) {
        console.warn(`⚠️ Skipping invalid entry: ${JSON.stringify(fileEntry)}`);
        continue;
      }

      try {
        const decodedStr = Buffer.from(fileEntry.data_base64, "base64").toString("utf-8");
        const decodedJson = JSON.parse(decodedStr);

        mergedObject[fileEntry.filename] = decodedJson;

        console.log(`📂 Decoded and added file: ${fileEntry.filename} with ${Object.keys(decodedJson).length} top-level keys`);
      } catch (err) {
        console.error(`❌ Error decoding/JSON parsing file ${fileEntry.filename}:`, err);
      }
    }

    console.log(`📦 Total files merged: ${Object.keys(mergedObject).length}`);

    if (Object.keys(mergedObject).length === 0) {
      console.error("❌ No valid files decoded, aborting");
      return res.status(400).json({ message: "Failed to decode any files" });
    }

    // Optional: Save merged object locally for debugging
    const debugFile = "merged_payload_debug.json";
    fs.writeFileSync(debugFile, JSON.stringify(mergedObject, null, 2));
    console.log(`💾 Merged payload saved locally as ${debugFile}`);

    // Step 3: Send merged JSON to second API
    console.log("🚀 Sending merged payload to /new1/process – Payload preview:");
    console.log(JSON.stringify(mergedObject).slice(0, 500) + "...");

    const processedResp = await axios.post(
      "https://knd87dm4x9.execute-api.eu-north-1.amazonaws.com/new1/process",
      mergedObject,
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("✅ Received response from /new1/process – Status:", processedResp.status);
    console.log("📄 Preview of /new1/process response data:", JSON.stringify(processedResp.data).slice(0, 500) + "...");

    // Step 4: Return processed data to frontend
    return res.status(200).json({
      message: "Processed report ready",
      filesProcessed: Object.keys(mergedObject).length,
      data: processedResp.data,
    });

  } catch (error: any) {
    console.error("💥 Error in downloadAndSaveReport:", error?.response?.data || error.message || error);
    return res.status(500).json({
      message: "Failed to process report",
      error: error?.message || "Unknown error",
    });
  }
};

// till here
export const loginDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Doctor login attempt:', req.body);
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      console.log('Missing fields:', { email, password });
      res.status(400).json({ 
        message: 'Missing required fields',
        required: ['email', 'password']
      });
      return;
    }

    // Find doctor by email
    const doctor = await Doctor.findOne({ email });
    console.log('Found doctor:', doctor ? 'Yes' : 'No');
    
    if (!doctor) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    if (doctor.password !== password) {
      console.log('Password mismatch');
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Get user details
    const user = await User.findById(doctor.userId);
    console.log('Found user:', user ? 'Yes' : 'No');
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      userId: doctor._id.toString(),
      email: doctor.email,
      role: 'doctor'
    });

    res.status(200).json({
      message: 'Login successful',
      data: {
        id: doctor._id,
        name: user.name,
        email: doctor.email,
        gender: doctor.gender,
        testMetrics: doctor.testMetrics,
        token
      }
    });

  } catch (error) {
    console.error('Error logging in doctor:', error);
    res.status(500).json({ 
      message: 'Error logging in',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getDashboardData = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Getting dashboard data for doctor');
    const doctor = (req as any).doctor;
    console.log('Doctor from request:', doctor ? 'Found' : 'Not found');
    
    if (!doctor) {
      console.log('No doctor found in request');
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    // Get all appointments for this doctor
    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate('userId', 'name');
    
    console.log('Found appointments:', appointments.length);

    await doctor.populate('userId', 'name');
    const doctorName = doctor.userId?.name || 'Doctor';
    const testMetrics = doctor.testMetrics;
    console.log('doctor name incoming - ', doctorName);
    res.status(200).json({
      message: 'Dashboard data retrieved successfully',
      data: {
        appointments,
        doctorName,
        testMetrics
      }
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({ 
      message: 'Error getting dashboard data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      age,
      sex,
      phoneNumber,
      address,
      kneeCondition,
      otherMorbidities,
      rehabDuration,
      mriImage
    } = req.body;

    const doctor = (req as any).doctor;
    if (!doctor) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Generate a unique patient code
    let unique = false;
    let newCode = '';
    while (!unique) {
      newCode = generatePatientCode();
      const existing = await Patient.findOne({ patientCode: newCode });
      if (!existing) unique = true;
    }
    const patientCode = newCode;

    // Create user first
    const user = await User.create({
      name,
      role: 'patient'
    });

    // Create patient
    const patient = await Patient.create({
      userId: user._id,
      age,
      sex,
      phoneNumber,
      address,
      kneeCondition,
      otherMorbidities,
      rehabDuration,
      mriImage,
      doctorId: doctor._id,
      tests: [],
      patientCode
    });

    doctor.patients.push(patient._id);
    await doctor.save();


    res.status(201).json({
      message: 'Patient created successfully',
      data: {
        id: patient._id,
        name: user.name,
        age: patient.age,
        sex: patient.sex,
        kneeCondition: patient.kneeCondition,
        patientCode
      }
    });

  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ 
      message: 'Error creating patient',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 

export const saveTestResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      patientId,
      puckId,
      legTested,
      legLength,
      testResults,
      doctorNotes,
      filesProcessed,
      appointmentId
    } = req.body;

    const doctor = (req as any).doctor;
    if (!doctor) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Validate required fields
    if (!patientId || !puckId || !legTested || !legLength || !testResults || !doctorNotes) {
      res.status(400).json({ 
        message: 'Missing required fields',
        required: ['patientId', 'puckId', 'legTested', 'legLength', 'testResults', 'doctorNotes']
      });
      return;
    }

    // Create new test record
    const test = await Test.create({
      patientId,
      doctorId: doctor._id,
      puckId,
      legLength,
      legTested,
      testDate: new Date(),
      maxRangeOfMotion: testResults.rangeOfMotion,
      maxLinearDisplacement: testResults.linearDisplacement,
      maxAngularDisplacement: testResults.angularDisplacement,
      timeSeriesData: testResults.timeSeriesData,
      doctorNotes,
      filesProcessed: filesProcessed || 0
    });

    // Update patient's tests array
    await Patient.findOneAndUpdate(
      { userId: patientId },           // filter by userId
      { $push: { tests: test._id } },   // update
      { new: true }                     // return the updated doc
    );

    // Delete the appointment if appointmentId is provided
    if (appointmentId) {
      try {
        await Appointment.findByIdAndDelete(appointmentId);
        console.log(`Appointment ${appointmentId} deleted successfully`);
      } catch (appointmentError) {
        console.error('Error deleting appointment:', appointmentError);
        // Don't fail the entire operation if appointment deletion fails
      }
    }

    // Update doctor's test counters
    try {
      await Doctor.findByIdAndUpdate(
        doctor._id,
        {
          $inc: {
            'testMetrics.testsDone': 1,
            'testMetrics.testsRemaining': -1
          }
        },
        { new: true }
      );
      console.log(`Doctor ${doctor._id} test counters updated successfully`);
    } catch (counterError) {
      console.error('Error updating doctor test counters:', counterError);
      // Don't fail the entire operation if counter update fails
    }

    res.status(201).json({
      message: 'Test results saved successfully',
      data: {
        testId: test._id,
        patientId: test.patientId,
        testDate: test.testDate,
        legTested: test.legTested
      }
    });

  } catch (error) {
    console.error('Error saving test results:', error);
    res.status(500).json({ 
      message: 'Error saving test results',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 