import mongoose from "mongoose";
import { HospitalAdmin } from "./HospitalAdmin";

const superAdminSchema = new mongoose.Schema({
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
    hospitalCentres: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HospitalAdmin'
    }],
    testMetrics: {
        totalTests:{
            type:Number,
            default:50
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
            default: 50
        }



        
    }
});

export const SuperAdmin = mongoose.model('SuperAdmin', superAdminSchema);
