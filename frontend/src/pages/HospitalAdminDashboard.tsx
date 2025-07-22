"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "@/components/Layout"
import { hospitalAdminApi } from "../services/api"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Activity,
  Plus,
  Trash2,
  Edit2,
  Stethoscope,
  UserCheck,
  ClipboardList,
  TrendingUp,
  Mail,
  User,
  ChevronDown,
} from "lucide-react"

interface Doctor {
  _id: string
  userId: {
    name: string
  }
  email: string
  gender: "Male" | "Female" | "Other"
  testMetrics: {
    totalTests: number
    testsAllocated: number
    testsDone: number
    testsRemaining: number
  }
}

interface TestMetrics {
  totalTests: number
  testsAllocated: number
  testsDone: number
  testsRemaining: number
}

const HospitalAdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [HospitalName, setHospitalName] = useState("")
  const [testMetrics, setTestMetrics] = useState<TestMetrics>({
    totalTests: 0,
    testsAllocated: 0,
    testsDone: 0,
    testsRemaining: 0,
  })
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false)
  const [showAllocateTestsModal, setShowAllocateTestsModal] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [testCount, setTestCount] = useState(1)
  const [expandedDoctor, setExpandedDoctor] = useState<string | null>(null)
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    email: "",
    password: "",
    gender: "Male" as "Male" | "Female" | "Other",
  })
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    name: "",
    age: "",
    sex: "Male" as "Male" | "Female" | "Other",
    phoneNumber: "",
    address: "",
    kneeCondition: "",
    otherMorbidities: "",
    rehabDuration: "",
    mriImage: "",
    doctorId: "",
    appointmentDate: ""
  });
  const [patientCode, setPatientCode] = useState("");
  const [fetchingPatient, setFetchingPatient] = useState(false);

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

      const response = await hospitalAdminApi.getDashboardData(email)
      console.log("Dashboard data response:", response.data)
      setHospitalName(response.data.data.name)
      setTestMetrics(response.data.data.testMetrics)
      setDoctors(response.data.data.doctors)
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

  const handleAddDoctor = async () => {
    try {
      if (!email) {
        setError("Email not found. Please login again.")
        return
      }

      const response = await hospitalAdminApi.createDoctor(email, newDoctor)

      toast({
        title: "Success",
        description: "Doctor added successfully",
        duration: 3000,
      })

      setShowAddDoctorModal(false)
      setNewDoctor({
        name: "",
        email: "",
        password: "",
        gender: "Male" as "Male" | "Female" | "Other",
      })

      await fetchDashboardData()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to add doctor",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const handleAllocateTests = async () => {
    try {
      if (!email || !selectedDoctor) {
        setError("Email or doctor not found")
        return
      }

      await hospitalAdminApi.allocateTests(email, selectedDoctor._id, testCount)
      await fetchDashboardData()
      setShowAllocateTestsModal(false)
      setSelectedDoctor(null)
      setTestCount(1)

      toast({
        title: "Success",
        description: `${testCount} tests allocated to Dr. ${selectedDoctor.userId.name}`,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to allocate tests",
        variant: "destructive",
      })
    }
  }


  const toggleDoctorExpand = (doctorId: string) => {
    if (expandedDoctor === doctorId) {
      setExpandedDoctor(null)
    } else {
      setExpandedDoctor(doctorId)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-200 border-t-blue-600 mx-auto"></div>
              <Building2 className="h-6 w-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Loading Dashboard</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Fetching hospital data...</p>
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
                <Building2 className="h-6 w-6 text-red-600 dark:text-red-400" />
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
        {/* Redesigned Hospital Header */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="bg-white dark:bg-gray-900 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                  <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{HospitalName}</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Managing {doctors.length} doctors and {testMetrics.totalTests} tests
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-0 p-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Completion</p>
                    <p className="text-sm font-medium">
                      {testMetrics.totalTests > 0
                        ? Math.round((testMetrics.testsDone / testMetrics.totalTests) * 100)
                        : 0}
                      %
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </Card>

        {/* Test Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
            <CardHeader className="p-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-gray-700 dark:text-gray-300">Total Tests</CardTitle>
                <div className="p-1 rounded-md bg-blue-50 dark:bg-blue-900/30">
                  <ClipboardList className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{testMetrics.totalTests}</div>
              <Progress
                value={testMetrics.totalTests > 0 ? (testMetrics.testsDone / testMetrics.totalTests) * 100 : 0}
                className="h-1"
              />
            </CardContent>
          </Card>

          <Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
            <CardHeader className="p-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-gray-700 dark:text-gray-300">Allocated</CardTitle>
                <div className="p-1 rounded-md bg-green-50 dark:bg-green-900/30">
                  <UserCheck className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                {testMetrics.testsAllocated}
              </div>
              <Progress
                value={testMetrics.totalTests > 0 ? (testMetrics.testsAllocated / testMetrics.totalTests) * 100 : 0}
                className="h-1"
              />
            </CardContent>
          </Card>

          <Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
            <CardHeader className="p-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-gray-700 dark:text-gray-300">Completed</CardTitle>
                <div className="p-1 rounded-md bg-purple-50 dark:bg-purple-900/30">
                  <Activity className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{testMetrics.testsDone}</div>
              <Progress
                value={testMetrics.totalTests > 0 ? (testMetrics.testsDone / testMetrics.totalTests) * 100 : 0}
                className="h-1"
              />
            </CardContent>
          </Card>

          <Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
            <CardHeader className="p-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-gray-700 dark:text-gray-300">Remaining</CardTitle>
                <div className="p-1 rounded-md bg-orange-50 dark:bg-orange-900/30">
                  <ClipboardList className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                {testMetrics.testsRemaining}
              </div>
              <Progress
                value={testMetrics.totalTests > 0 ? (testMetrics.testsRemaining / testMetrics.totalTests) * 100 : 0}
                className="h-1"
              />
            </CardContent>
          </Card>
        </div>

        {/* Doctors Management */}
        <Card className="border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <CardHeader className="bg-white dark:bg-gray-900 p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Doctor Management</span>
                </CardTitle>
                <CardDescription className="text-xs">Manage doctors and test allocations</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowAddDoctorModal(true)}
                  className="h-8 text-xs bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  <span>Add Doctor</span>
                </Button>
                <Button
                  onClick={() => setShowAddAppointmentModal(true)}
                  className="h-8 text-xs bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  <span>New Appointment</span>
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
                      <TableHead className="text-xs font-medium text-gray-600 dark:text-gray-400 py-3">
                        Doctor
                      </TableHead>
                      <TableHead className="text-xs font-medium text-gray-600 dark:text-gray-400">Contact</TableHead>
                      <TableHead className="text-xs font-medium text-gray-600 dark:text-gray-400">Allocation</TableHead>
                      <TableHead className="text-xs font-medium text-gray-600 dark:text-gray-400">Progress</TableHead>
                      <TableHead className="text-right text-xs font-medium text-gray-600 dark:text-gray-400">
                        Allocate Tests
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctors.length > 0 ? (
                      doctors.map((doctor) => (
                        <TableRow
                          key={doctor._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800"
                        >
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  Dr. {doctor.userId.name}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {doctor.gender}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-xs">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">{doctor.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-0.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Allocated:</span>
                                <span className="font-medium">{doctor.testMetrics.testsAllocated}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                                <span className="font-medium text-green-600">{doctor.testMetrics.testsDone}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                                <span className="font-medium text-orange-600">{doctor.testMetrics.testsRemaining}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Progress
                                value={
                                  doctor.testMetrics.testsAllocated > 0
                                    ? (doctor.testMetrics.testsDone / doctor.testMetrics.testsAllocated) * 100
                                    : 0
                                }
                                className="h-1"
                              />
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {doctor.testMetrics.testsAllocated > 0
                                  ? Math.round((doctor.testMetrics.testsDone / doctor.testMetrics.testsAllocated) * 100)
                                  : 0}
                                % complete
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedDoctor(doctor)
                                  setShowAllocateTestsModal(true)
                                }}
                                className="h-7 text-xs border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800/70"
                              >
                                <Edit2 className="h-3 w-3 mr-1" />
                                Allocate
                              </Button>
                              
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="space-y-2">
                            <Stethoscope className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto" />
                            <div className="text-sm text-gray-500 dark:text-gray-400">No doctors registered yet.</div>
                            <Button onClick={() => setShowAddDoctorModal(true)} variant="outline" size="sm">
                              <Plus className="h-3 w-3 mr-1" />
                              Add Doctor
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Doctor List */}
              <div className="md:hidden">
                {doctors.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {doctors.map((doctor) => (
                      <div key={doctor._id} className="py-3 px-4">
                        <div
                          className="flex justify-between items-center"
                          onClick={() => toggleDoctorExpand(doctor._id)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                Dr. {doctor.userId.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{doctor.email}</div>
                            </div>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 text-gray-400 transition-transform ${
                              expandedDoctor === doctor._id ? "transform rotate-180" : ""
                            }`}
                          />
                        </div>

                        {expandedDoctor === doctor._id && (
                          <div className="mt-3 space-y-3 pl-2 border-l-2 border-gray-100 dark:border-gray-800">
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400">Gender</p>
                                  <p>{doctor.gender}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400">Tests Allocated</p>
                                  <p>{doctor.testMetrics.testsAllocated}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400">Tests Completed</p>
                                  <p className="text-green-600">{doctor.testMetrics.testsDone}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400">Tests Remaining</p>
                                  <p className="text-orange-600">{doctor.testMetrics.testsRemaining}</p>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <Progress
                                  value={
                                    doctor.testMetrics.testsAllocated > 0
                                      ? (doctor.testMetrics.testsDone / doctor.testMetrics.testsAllocated) * 100
                                      : 0
                                  }
                                  className="h-1"
                                />
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {doctor.testMetrics.testsAllocated > 0
                                    ? Math.round(
                                        (doctor.testMetrics.testsDone / doctor.testMetrics.testsAllocated) * 100,
                                      )
                                    : 0}
                                  % complete
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedDoctor(doctor)
                                  setShowAllocateTestsModal(true)
                                }}
                                className="h-7 text-xs border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800/70 flex-1"
                              >
                                <Edit2 className="h-3 w-3 mr-1" />
                                Allocate Tests
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
                      <Stethoscope className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto" />
                      <div className="text-sm text-gray-500 dark:text-gray-400">No doctors registered yet.</div>
                      <Button onClick={() => setShowAddDoctorModal(true)} variant="outline" size="sm">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Doctor
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Doctor Dialog */}
      <Dialog open={showAddDoctorModal} onOpenChange={setShowAddDoctorModal}>
        <DialogContent className="sm:max-w-lg p-0">
          <DialogHeader className="p-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
            <DialogTitle className="text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Add New Doctor</span>
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </Label>
              <Input
                id="name"
                value={newDoctor.name}
                onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                placeholder="Enter doctor's full name"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={newDoctor.email}
                onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                placeholder="doctor@hospital.com"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={newDoctor.password}
                onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                placeholder="Enter secure password"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="gender" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Gender
              </Label>
              <select
                id="gender"
                value={newDoctor.gender}
                onChange={(e) => setNewDoctor({ ...newDoctor, gender: e.target.value as "Male" | "Female" | "Other" })}
                className="w-full h-8 px-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <DialogFooter className="p-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" onClick={() => setShowAddDoctorModal(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button onClick={handleAddDoctor} className="h-8 text-xs bg-blue-600 hover:bg-blue-700">
                <Plus className="h-3 w-3 mr-1" />
                Add Doctor
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Allocate Tests Dialog */}
      <Dialog open={showAllocateTestsModal} onOpenChange={setShowAllocateTestsModal}>
        <DialogContent className="sm:max-w-lg p-0">
          <DialogHeader className="p-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
            <DialogTitle className="text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Edit2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Allocate Tests</span>
            </DialogTitle>
            {selectedDoctor && (
              <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Dr. {selectedDoctor.userId.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Current allocation: {selectedDoctor.testMetrics.testsAllocated} tests
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogHeader>
          <div className="p-4 space-y-4">
            <div className="space-y-1">
              <Label htmlFor="testCount" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Number of Tests to Allocate
              </Label>
              <Input
                id="testCount"
                type="number"
                value={testCount}
                onChange={(e) => setTestCount(Number.parseInt(e.target.value) || 1)}
                placeholder="Enter number of tests"
                min="1"
                max={testMetrics.testsRemaining}
                className="h-8 text-sm"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Available tests remaining: {testMetrics.testsRemaining}
              </div>
            </div>
          </div>
          <DialogFooter className="p-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" onClick={() => setShowAllocateTestsModal(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button onClick={handleAllocateTests} className="h-8 text-xs bg-blue-600 hover:bg-blue-700">
                <Edit2 className="h-3 w-3 mr-1" />
                Allocate Tests
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Appointment Dialog */}
      <Dialog open={showAddAppointmentModal} onOpenChange={setShowAddAppointmentModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
            <DialogTitle className="text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span>New Appointment</span>
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-4">
            {/* Patient Code Autofill */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Patient Code</Label>
                <Input
                  value={patientCode}
                  onChange={e => setPatientCode(e.target.value.toUpperCase())}
                  placeholder="Enter patient code (e.g., ABC123)"
                  className="h-8 text-sm"
                  maxLength={6}
                />
              </div>
              <Button
                className="h-8 text-xs bg-blue-600 hover:bg-blue-700"
                disabled={!patientCode || fetchingPatient}
                onClick={async () => {
                  setFetchingPatient(true);
                  try {
                    const res = await hospitalAdminApi.getPatientByCode(email, patientCode);
                    const data = res.data.data;
                    setNewAppointment(prev => ({
                      ...prev,
                      name: data.name || "",
                      age: data.age ? String(data.age) : "",
                      sex: data.sex || "Male",
                      phoneNumber: data.phoneNumber || "",
                      address: data.address || "",
                      kneeCondition: data.kneeCondition || "",
                      otherMorbidities: data.otherMorbidities || "",
                      rehabDuration: data.rehabDuration || "",
                      mriImage: data.mriImage || ""
                    }));
                    toast({ title: "Patient found", description: `Details for ${data.name} loaded.` });
                  } catch (err: any) {
                    toast({
                      title: "Patient not found",
                      description: err.response?.data?.message || "No patient with this code.",
                      variant: "destructive"
                    });
                  } finally {
                    setFetchingPatient(false);
                  }
                }}
              >
                Autofill
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <span>Patient Name</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={newAppointment.name}
                  onChange={e => setNewAppointment({ ...newAppointment, name: e.target.value })}
                  placeholder="Patient's full name"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <span>Age</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  value={newAppointment.age}
                  onChange={e => setNewAppointment({ ...newAppointment, age: e.target.value })}
                  placeholder="Age in years"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Gender</Label>
                <select
                  value={newAppointment.sex}
                  onChange={e => setNewAppointment({ ...newAppointment, sex: e.target.value as "Male" | "Female" | "Other" })}
                  className="w-full h-8 px-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Phone Number</Label>
                <Input
                  value={newAppointment.phoneNumber}
                  onChange={e => setNewAppointment({ ...newAppointment, phoneNumber: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Address</Label>
              <Input
                value={newAppointment.address}
                onChange={e => setNewAppointment({ ...newAppointment, address: e.target.value })}
                placeholder="Patient's residential address"
                className="h-8 text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <span>Knee Condition</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={newAppointment.kneeCondition}
                  onChange={e => setNewAppointment({ ...newAppointment, kneeCondition: e.target.value })}
                  placeholder="e.g., Post Surgery, Sports Injury"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Rehabilitation Duration</Label>
                <Input
                  type="number"
                  value={newAppointment.rehabDuration}
                  onChange={e => setNewAppointment({ ...newAppointment, rehabDuration: e.target.value })}
                  placeholder="Duration in weeks"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Other Medical Conditions</Label>
              <Input
                value={newAppointment.otherMorbidities}
                onChange={e => setNewAppointment({ ...newAppointment, otherMorbidities: e.target.value })}
                placeholder="e.g., Diabetes Type 2, Hypertension"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Doctor</Label>
              <select
                value={newAppointment.doctorId}
                onChange={e => setNewAppointment({ ...newAppointment, doctorId: e.target.value })}
                className="w-full h-8 px-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="">Select Doctor</option>
                {doctors.map(doc => (
                  <option key={doc._id} value={doc._id}>Dr. {doc.userId.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Appointment Date</Label>
              <Input
                type="datetime-local"
                value={newAppointment.appointmentDate}
                onChange={e => setNewAppointment({ ...newAppointment, appointmentDate: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
          </div>
          <DialogFooter className="p-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" onClick={() => { setShowAddAppointmentModal(false); setPatientCode(""); }} className="h-8 text-xs">
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    if (!email) {
                      setError("Email not found. Please login again.");
                      return;
                    }
                    await hospitalAdminApi.createAppointment(email, {
                      ...newAppointment,
                      age: Number(newAppointment.age),
                      rehabDuration: String(newAppointment.rehabDuration),
                      appointmentDate: new Date(newAppointment.appointmentDate).toISOString()
                    });
                    toast({ title: "Success", description: "Appointment created successfully" });
                    setShowAddAppointmentModal(false);
                    setNewAppointment({
                      name: "",
                      age: "",
                      sex: "Male",
                      phoneNumber: "",
                      address: "",
                      kneeCondition: "",
                      otherMorbidities: "",
                      rehabDuration: "",
                      mriImage: "",
                      doctorId: "",
                      appointmentDate: ""
                    });
                    setPatientCode("");
                    fetchDashboardData();
                  } catch (err: any) {
                    toast({
                      title: "Error",
                      description: err.response?.data?.message || "Failed to create appointment",
                      variant: "destructive"
                    });
                  }
                }}
                className="h-8 text-xs bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-3 w-3 mr-1" />
                Create Appointment
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}

export default HospitalAdminDashboard
