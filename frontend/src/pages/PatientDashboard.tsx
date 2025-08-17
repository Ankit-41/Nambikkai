"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "@/components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  User,
  Edit2,
  FileText,
  Upload,
  Eye,
  Calendar,
  Phone,
  MapPin,
  Activity,
  Heart,
  Clock,
  Download,
  ImageIcon,
  Stethoscope,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { patientApi } from "../services/api"

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null)
  const [patientCode, setPatientCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tests, setTests] = useState<any[]>([]);
  const [testsLoading, setTestsLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("patientData");
    console.log("stored value is ", stored);
    if (stored) {
      const patientData = JSON.parse(stored);
      setPatient(patientData);
      setLoading(false);
      console.log("patient is", patientData);
      
      // Fetch tests for this patient
      if (patientData.patientCode) {
        fetchPatientTests(patientData.patientCode);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchPatientTests = async (patientCode: string) => {
    try {
      setTestsLoading(true);
      const response = await fetch(`http://localhost:5000/api/patient/tests/${patientCode}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTests(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching tests:', err);
    } finally {
      setTestsLoading(false);
    }
  };

  useEffect(() => {
    console.log("patient is", patient);
  }, [patient]);

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isUploadingMRI, setIsUploadingMRI] = useState(false)
  const [selectedMRI, setSelectedMRI] = useState<any>(null)
  const [editForm, setEditForm] = useState({
    phoneNumber: patient?.phoneNumber || "",
    address: patient?.address || "",
    otherMorbidities: patient?.otherMorbidities || "",
  })

  const handlePatientCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await patientApi.getPatientByCode(patientCode);
      console.log(res.data.data);
      setPatient(res.data.data);
      localStorage.setItem("patientData", JSON.stringify(res.data.data));
    } catch (err: any) {
      setError(err.response?.data?.message || "Patient not found");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = () => {
    setPatient({ ...patient, ...editForm })
    setIsEditingProfile(false)
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    })
  }

  const handleMRIUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Simulate upload
      const newMRI = {
        _id: `mri${Date.now()}`,
        filename: file.name,
        uploadDate: new Date().toISOString().split("T")[0],
        description: "New MRI upload",
        url: "/placeholder.svg?height=300&width=400",
      }
      setPatient({
        ...patient,
        mriImages: [newMRI, ...(patient.mriImages || [])],
      })
      setIsUploadingMRI(false)
      toast({
        title: "MRI Uploaded",
        description: "Your MRI image has been uploaded successfully.",
      })
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80)
      return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
    if (score >= 60)
      return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800"
    return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
  }

  if (loading) {
    return <Layout><div className="min-h-screen flex items-center justify-center">Loading...</div></Layout>;
  }
  if (!patient) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <form onSubmit={handlePatientCodeSubmit} className="space-y-4 bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md">
            <Label htmlFor="patientCode">Enter your Patient Code</Label>
            <Input
              id="patientCode"
              value={patientCode}
              onChange={e => setPatientCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              className="h-10 text-lg"
              maxLength={6}
            />
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">View Dashboard</Button>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </form>
        </div>
      </Layout>
    );
  }

  // Defensive: Only show error if patient is null or undefined (already handled above)

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
        {/* Welcome Header */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Welcome back, {patient.name || "Patient"}!
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Track your recovery progress and manage your health information
                  </p>
                </div>
              </div>


            </div>
          </div>
        </Card>



        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Manage your personal details</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingProfile(true)}
                  className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800/70"
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
                    <p className="text-sm font-medium">{patient.name || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm font-medium">{patient.email || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Age</p>
                    <p className="text-sm font-medium">{patient.age} years</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sex</p>
                    <p className="text-sm font-medium">{patient.sex}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Phone Number
                    </p>
                    <p className="text-sm font-medium">{patient.phoneNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Address
                    </p>
                    <p className="text-sm font-medium">{patient.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-600 dark:text-red-400" />
                  Medical Information
                </CardTitle>
                <CardDescription>Your current medical condition and treatment details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Knee Condition</p>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                    >
                      {patient.kneeCondition}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Rehabilitation Duration</p>
                    <p className="text-sm font-medium">{patient.rehabDuration} weeks</p>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Other Medical Conditions</p>
                    <p className="text-sm font-medium">{patient.otherMorbidities || "None reported"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Summary */}
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Test Summary
                </CardTitle>
                <CardDescription>Overview of your test performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{tests.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Tests</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {tests.length > 0 ? Math.round(tests.reduce((acc, test) => acc + (test.maxRangeOfMotion / 360) * 100, 0) / tests.length) : 0}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Range of Motion</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {tests.length > 0 ? new Date(tests[0].testDate).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Latest Test</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Reports */}
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Test Reports
                  </CardTitle>
                  <CardDescription>Your recent test results and progress</CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                >
                  {tests.length} Reports
                </Badge>
              </CardHeader>
              <CardContent>
                {testsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading tests...</p>
                  </div>
                ) : tests.length > 0 ? (
                  <div className="space-y-3">
                    {tests.map((test, index) => (
                      <div
                        key={test._id}
                        className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/patient-test-report/${test._id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900 dark:text-white">
                              Test {index + 1}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(test.testDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Stethoscope className="h-3 w-3" />
                              {test.doctorName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            {test.legTested} Leg
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No test reports available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* MRI Images Sidebar */}
          <div className="space-y-6">
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    MRI Images
                  </CardTitle>
                  <CardDescription>Upload and view your MRI scans</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsUploadingMRI(true)}
                  className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800/70"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Upload
                </Button>
              </CardHeader>
              <CardContent>
                {(patient.mriImages?.length ?? 0) > 0 ? (
                  <div className="space-y-3">
                    {(patient.mriImages ?? []).map((mri) => (
                      <div
                        key={mri._id}
                        className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedMRI(mri)}
                      >
                        <img
                          src={mri.url || "/placeholder.svg"}
                          alt={mri.description}
                          className="w-full h-32 object-cover bg-gray-100 dark:bg-gray-800"
                        />
                        <div className="p-3">
                          <p className="text-xs font-medium truncate">{mri.filename}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(mri.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ImageIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No MRI images uploaded yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsUploadingMRI(true)}
                      className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800/70"
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Upload First Image
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>


          </div>
        </div>

        {/* Edit Profile Dialog */}
        <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Edit Profile Information
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder="Enter your address"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conditions">Other Medical Conditions</Label>
                <Textarea
                  id="conditions"
                  value={editForm.otherMorbidities}
                  onChange={(e) => setEditForm({ ...editForm, otherMorbidities: e.target.value })}
                  placeholder="List any other medical conditions"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Upload MRI Dialog */}
        <Dialog open={isUploadingMRI} onOpenChange={setIsUploadingMRI}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-green-600 dark:text-green-400" />
                Upload MRI Image
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Select an MRI image file to upload</p>
                <Input type="file" accept="image/*" onChange={handleMRIUpload} className="max-w-xs mx-auto" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Supported formats: JPG, PNG, DICOM. Maximum file size: 10MB
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadingMRI(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View MRI Dialog */}
        <Dialog open={!!selectedMRI} onOpenChange={() => setSelectedMRI(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                {selectedMRI?.filename}
              </DialogTitle>
            </DialogHeader>
            {selectedMRI && (
              <div className="space-y-4">
                <img
                  src={selectedMRI.url || "/placeholder.svg"}
                  alt={selectedMRI.description}
                  className="w-full max-h-96 object-contain bg-gray-100 dark:bg-gray-800 rounded-lg"
                />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Upload Date</p>
                    <p className="font-medium">{new Date(selectedMRI.uploadDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Description</p>
                    <p className="font-medium">{selectedMRI.description}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedMRI(null)}>
                <X className="h-4 w-4 mr-1" />
                Close
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}

export default PatientDashboard
