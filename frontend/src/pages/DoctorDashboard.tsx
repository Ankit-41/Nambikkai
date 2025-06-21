"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "@/components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Users, Bug, Play, FileText, Search, Plus, Stethoscope, Activity, Calendar, Phone, MapPin, ChevronDown } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import { doctorApi } from "../services/api"

interface Patient {
  _id: string
  userId: {
    name: string
  }
  age: number
  sex: "Male" | "Female" | "Other"
  phoneNumber: string
  address: string
  kneeCondition: string
  otherMorbidities?: string
  rehabDuration: string
  mriImage: string
  tests: Array<{
    _id: string
    date: string
    status: string
  }>
}
type TestMetrics = {
  testsAllocated: number;
  testsDone: number;
  testsRemaining: number;
  totalTests: number;
};

const DoctorDashboard = () => {
  const navigate = useNavigate()
  const [doctorName, setdoctorName] = useState("")
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)
  const [isIssueReportOpen, setIsIssueReportOpen] = useState(false)
  const [issueReport, setIssueReport] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [patients, setPatients] = useState<Patient[]>([])
  const [testMetrics, setTestMetrics] = useState<TestMetrics | null>(null);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null)
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    sex: "Male" as "Male" | "Female" | "Other",
    address: "",
    phoneNumber: "",
    kneeCondition: "",
    otherMorbidities: "",
    rehabDuration: "",
  })

  // Get email from localStorage
  const email = localStorage.getItem("email")

  // Redirect to login if email is not found
  useEffect(() => {
    if (!email) {
      navigate("/login")
    }
  }, [email, navigate])

  const fetchDashboardData = async () => {
    try {
      if (!email) {
        setError("Email not found. Please login again.")
        navigate("/login")
        return
      }

      const response = await doctorApi.getDashboardData(email)
      console.log("Dashboard data response:", response.data)
      setdoctorName(response.data.data.doctorName)
      setPatients(response.data.data.patients)
      setTestMetrics(response.data.data.testMetrics)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError("Failed to fetch dashboard data")
      setLoading(false)
    }
  }

  useEffect(() => {
    if (email) {
      fetchDashboardData()
    }
  }, [email])

  const handleAddPatient = async () => {
    try {
      if (!email) {
        setError("Email not found. Please login again.")
        navigate("/login")
        return
      }

      if (!newPatient.name || !newPatient.age) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const response = await doctorApi.createPatient(email, {
        name: newPatient.name,
        age: Number.parseInt(newPatient.age),
        sex: newPatient.sex,
        phoneNumber: newPatient.phoneNumber,
        address: newPatient.address,
        kneeCondition: newPatient.kneeCondition,
        otherMorbidities: newPatient.otherMorbidities,
        rehabDuration: newPatient.rehabDuration,
        mriImage: "",
      })

      toast({
        title: "Success",
        description: "Patient added successfully",
      })

      setNewPatient({
        name: "",
        age: "",
        sex: "Male",
        address: "",
        phoneNumber: "",
        kneeCondition: "",
        otherMorbidities: "",
        rehabDuration: "",
      })
      setIsAddPatientOpen(false)
      fetchDashboardData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add patient",
        variant: "destructive",
      })
    }
  }

  const handleRunTest = (patient: Patient) => {
    navigate(`/run-test/${patient._id}`, {
      state: { patient }
    })
  }
  const handleViewReport = (patientId: string) => {
    navigate(`/patient`)
  }

  const handleReportIssue = () => {
    if (!issueReport.trim()) {
      toast({
        title: "Error",
        description: "Please describe the issue",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Issue Reported",
      description: "Your issue has been reported to the support team",
    })
    setIssueReport("")
    setIsIssueReportOpen(false)
  }

  const togglePatientExpand = (patientId: string) => {
    if (expandedPatient === patientId) {
      setExpandedPatient(null)
    } else {
      setExpandedPatient(patientId)
    }
  }

  // Filter patients based on search term
  const filteredPatients = patients.filter(
    (patient) =>
      patient.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient._id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-200 border-t-blue-600 mx-auto"></div>
              <Stethoscope className="h-6 w-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Loading Dashboard</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Fetching your patient data...</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-3">
                <Bug className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-red-600 dark:text-red-400 text-lg">Error Loading Dashboard</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => fetchDashboardData()} className="w-full">
                Try Again
              </Button>
            </CardContent>
            <CardContent>
              <Button onClick={() => navigate('/')} className="w-full">
                Go back to login
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 space-y-6">
        {/* Redesigned Welcome Header */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="bg-white dark:bg-gray-900 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                  <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Welcome, Dr. {doctorName}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Managing {patients.length} patients and{" "}
                    {testMetrics.testsAllocated} tests
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-0 p-2 flex items-center gap-2 w-[calc(50%-0.375rem)] sm:w-auto">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Patients</p>
                    <p className="text-sm font-medium">{patients.length}</p>
                  </div>
                </Card>
                <Card className="bg-green-50 dark:bg-green-900/20 border-0 p-2 flex items-center gap-2 w-[calc(50%-0.375rem)] sm:w-auto">
                  <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tests Allocated</p>
                    <p className="text-sm font-medium">{testMetrics.testsAllocated}</p>
                  </div>
                </Card>
                <Card className="bg-green-50 dark:bg-green-900/20 border-0 p-2 flex items-center gap-2 w-[calc(50%-0.375rem)] sm:w-auto">
                  <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tests done</p>
                    <p className="text-sm font-medium">{testMetrics.testsDone}</p>
                  </div>
                </Card>

                <Card className="bg-purple-50 dark:bg-purple-900/20 border-0 p-2 flex items-center gap-2 w-[calc(50%-0.375rem)] sm:w-auto">
                  <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                    <p className="text-sm font-medium">{new Date().toLocaleDateString()}</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card
            className="cursor-pointer transition-all duration-300 hover:shadow-md border border-gray-100 dark:border-gray-800"
            onClick={() => setIsAddPatientOpen(true)}
          >
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                  <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-sm">Add Patient</CardTitle>
                  <CardDescription className="text-xs">Register new patient</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer transition-all duration-300 hover:shadow-md border border-gray-100 dark:border-gray-800"
            onClick={() => setIsIssueReportOpen(true)}
          >
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <Bug className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <CardTitle className="text-sm">Report Issue</CardTitle>
                  <CardDescription className="text-xs">Technical support</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Patients Table */}
        <Card className="border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <CardHeader className="bg-white dark:bg-gray-900 p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Patient Management</span>
                </CardTitle>
                <CardDescription className="text-xs">Manage patients and tests</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                  <Input
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-7 h-8 text-xs"
                  />
                </div>
                <Button
                  onClick={() => setIsAddPatientOpen(true)}
                  className="h-8 text-xs bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  <span>Add</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      {/* <TableHead className="text-xs font-medium text-gray-600 dark:text-gray-400 py-3">ID</TableHead> */}
                      <TableHead className="text-xs font-medium text-gray-600 dark:text-gray-400">Patient Name</TableHead>
                      <TableHead className="text-xs font-medium text-gray-600 dark:text-gray-400">Condition</TableHead>
                      <TableHead className="text-xs font-medium text-gray-600 dark:text-gray-400">Tests</TableHead>
                      <TableHead className="text-right text-xs font-medium text-gray-600 dark:text-gray-400">
                        Run new test
                      </TableHead>
                      <TableHead className="text-right text-xs font-medium text-gray-600 dark:text-gray-400">
                        View Reports
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <TableRow
                          key={patient._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800"
                        >
                          {/* <TableCell className="font-mono text-xs text-blue-600 dark:text-blue-400 py-3">
                            {patient._id.slice(-6).toUpperCase()}
                          </TableCell> */}
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {patient.userId.name}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {patient.age} yrs • {patient.sex}
                              </div>
                              {patient.phoneNumber && (
                                <div className="flex items-center gap-1 text-xs">
                                  <Phone className="h-3 w-3 text-gray-400" />
                                  <span className="text-gray-600 dark:text-gray-400">{patient.phoneNumber}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            >
                              {patient.kneeCondition}
                            </Badge>
                            {patient.otherMorbidities && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                +{patient.otherMorbidities}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge
                                variant="outline"
                                className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                              >
                                {patient.tests.length} tests
                              </Badge>
                              {patient.tests.length > 0 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Last: {new Date(patient.tests[patient.tests.length - 1]?.date).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {/* <div className="flex justify-end gap-2"> */}
                            <Button
                              size="sm"
                              onClick={() => handleRunTest(patient)}
                              className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Test
                            </Button>

                            {/* </div> */}
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewReport(patient._id)}
                              className="h-7 text-xs border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800/70"
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              Report
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="space-y-2">
                            <Users className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto" />
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {searchTerm ? "No patients found matching your search." : "No patients registered yet."}
                            </div>
                            {!searchTerm && (
                              <Button onClick={() => setIsAddPatientOpen(true)} variant="outline" size="sm">
                                <Plus className="h-3 w-3 mr-1" />
                                Add Patient
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Patient List */}
              <div className="md:hidden">
                {filteredPatients.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredPatients.map((patient) => (
                      <div key={patient._id} className="py-3 px-4">
                        <div
                          className="flex justify-between items-center"
                          onClick={() => togglePatientExpand(patient._id)}
                        >
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {patient.userId.name}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              >
                                {patient.kneeCondition}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {patient.age} yrs • {patient.sex}
                              </span>
                            </div>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 text-gray-400 transition-transform ${expandedPatient === patient._id ? "transform rotate-180" : ""
                              }`}
                          />
                        </div>

                        {expandedPatient === patient._id && (
                          <div className="mt-3 space-y-3 pl-2 border-l-2 border-gray-100 dark:border-gray-800">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">ID</p>
                                <p className="font-mono text-blue-600 dark:text-blue-400">
                                  {patient._id.slice(-6).toUpperCase()}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Tests</p>
                                <p>{patient.tests.length} completed</p>
                              </div>
                              {patient.phoneNumber && (
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400">Phone</p>
                                  <p>{patient.phoneNumber}</p>
                                </div>
                              )}
                              {patient.address && (
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400">Address</p>
                                  <p className="truncate max-w-[150px]">{patient.address}</p>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                onClick={() => handleRunTest(patient)}
                                className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white flex-1"
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Run Test
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewReport(patient._id)}
                                className="h-7 text-xs border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800/70 flex-1"
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                View Report
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4">
                    <div className="space-y-2">
                      <Users className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto" />
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {searchTerm ? "No patients found matching your search." : "No patients registered yet."}
                      </div>
                      {!searchTerm && (
                        <Button onClick={() => setIsAddPatientOpen(true)} variant="outline" size="sm">
                          <Plus className="h-3 w-3 mr-1" />
                          Add Patient
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Patient Dialog */}
        <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0">
            <DialogHeader className="p-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <DialogTitle className="text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Add New Patient</span>
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <span>Full Name</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    placeholder="Patient's full name"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <span>Age</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                    placeholder="Age in years"
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Gender</label>
                  <select
                    value={newPatient.sex}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, sex: e.target.value as "Male" | "Female" | "Other" })
                    }
                    className="w-full h-8 px-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                  <Input
                    value={newPatient.phoneNumber}
                    onChange={(e) => setNewPatient({ ...newPatient, phoneNumber: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Address</label>
                <Input
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  placeholder="Patient's residential address"
                  className="h-8 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <span>Knee Condition</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newPatient.kneeCondition}
                    onChange={(e) => setNewPatient({ ...newPatient, kneeCondition: e.target.value })}
                    placeholder="e.g., Post Surgery, Sports Injury"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Rehabilitation Duration
                  </label>
                  <Input
                    type="number"
                    value={newPatient.rehabDuration}
                    onChange={(e) => setNewPatient({ ...newPatient, rehabDuration: e.target.value })}
                    placeholder="Duration in weeks"
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Other Medical Conditions</label>
                <Input
                  value={newPatient.otherMorbidities}
                  onChange={(e) => setNewPatient({ ...newPatient, otherMorbidities: e.target.value })}
                  placeholder="e.g., Diabetes Type 2, Hypertension"
                  className="h-8 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button variant="outline" onClick={() => setIsAddPatientOpen(false)} className="h-8 text-xs">
                  Cancel
                </Button>
                <Button onClick={handleAddPatient} className="h-8 text-xs bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="h-3 w-3 mr-1" />
                  Add Patient
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Report Issue Dialog */}
        <Dialog open={isIssueReportOpen} onOpenChange={setIsIssueReportOpen}>
          <DialogContent className="sm:max-w-lg p-0">
            <DialogHeader className="p-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <DialogTitle className="text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Bug className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span>Report an Issue</span>
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label htmlFor="issue-description" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Issue Description
                </label>
                <Textarea
                  id="issue-description"
                  value={issueReport}
                  onChange={(e) => setIssueReport(e.target.value)}
                  placeholder="Please describe the technical issue or bug in detail..."
                  className="h-24 resize-none text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button variant="outline" onClick={() => setIsIssueReportOpen(false)} className="h-8 text-xs">
                  Cancel
                </Button>
                <Button onClick={handleReportIssue} className="h-8 text-xs bg-gray-900 hover:bg-gray-800">
                  <Bug className="h-3 w-3 mr-1" />
                  Submit Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}

export default DoctorDashboard
