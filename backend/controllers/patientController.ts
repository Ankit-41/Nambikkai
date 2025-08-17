import { Request, Response } from 'express';
import { Patient } from '../models/Patient';
import Test from '../models/Test';
import { User } from '../models/User';

// Get patient profile by patient code
export const getPatientProfile = async (req: Request, res: Response) => {
  try {
    const { patientCode } = req.params;

    const patient = await Patient.findOne({ patientCode }).populate('userId', 'name');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      success: true,
      data: {
        _id: patient._id,
        userId: patient.userId,
        age: patient.age,
        sex: patient.sex,
        phoneNumber: patient.phoneNumber,
        address: patient.address,
        kneeCondition: patient.kneeCondition,
        otherMorbidities: patient.otherMorbidities,
        rehabDuration: patient.rehabDuration,
        mriImage: patient.mriImage,
        patientCode: patient.patientCode,
        tests: patient.tests
      }
    });
  } catch (error) {
    console.error('Error getting patient profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get patient tests by patient code
export const getPatientTests = async (req: Request, res: Response) => {
  try {
    const { patientCode } = req.params;

    const patient = await Patient.findOne({ patientCode });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    console.log('Patient found:', patient._id);
    console.log('Patient tests array:', patient.tests);

    // Get all tests for this patient using the tests array from patient
    const tests = await Test.find({ _id: { $in: patient.tests } })
      .sort({ testDate: -1 }) // Most recent first
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name'
        }
      });

    console.log('Tests found:', tests.length);
    console.log('Tests data:', tests);

    res.json({
      success: true,
      data: tests.map((test: any) => ({
        _id: test._id,
        testDate: test.testDate,
        legTested: test.legTested,
        legLength: test.legLength,
        maxRangeOfMotion: test.maxRangeOfMotion,
        maxLinearDisplacement: test.maxLinearDisplacement,
        maxAngularDisplacement: test.maxAngularDisplacement,
        doctorNotes: test.doctorNotes,
        doctorName: test.doctorId?.userId?.name || 'Unknown Doctor',
        puckId: test.puckId
      }))
    });
  } catch (error) {
    console.error('Error getting patient tests:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get specific test report by test ID
export const getTestReport = async (req: Request, res: Response) => {
  try {
    const { testId } = req.params;
    console.log('Fetching test report for testId:', testId);

    const test = await Test.findById(testId)
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name'
        }
      });

    console.log('Test found:', test);

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Get patient code from query params
    const patientCode = req.query.patientCode as string;
    
    if (!patientCode) {
      return res.status(400).json({ message: 'Patient code is required' });
    }

    // Get patient info using the patient code
    const patient = await Patient.findOne({ patientCode }).populate('userId', 'name');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Verify that this test belongs to this patient
    if (!patient.tests.some(test => test.toString() === testId)) {
      return res.status(403).json({ message: 'This test does not belong to the specified patient' });
    }

    res.json({
      success: true,
      data: {
        _id: test._id,
        testDate: test.testDate,
        legTested: test.legTested,
        legLength: test.legLength,
        maxRangeOfMotion: test.maxRangeOfMotion,
        maxLinearDisplacement: test.maxLinearDisplacement,
        maxAngularDisplacement: test.maxAngularDisplacement,
        doctorNotes: test.doctorNotes,
        doctorName: (test as any).doctorId?.userId?.name || 'Unknown Doctor',
        puckId: test.puckId,
        timeSeriesData: test.timeSeriesData,
        patient: {
          name: (patient.userId as any)?.name || 'Unknown Patient',
          age: patient.age,
          sex: patient.sex,
          kneeCondition: patient.kneeCondition
        }
      }
    });
  } catch (error) {
    console.error('Error getting test report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
