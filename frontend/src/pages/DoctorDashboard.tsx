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

interface Appointment {
  _id: string;
  userId: {
    name: string;
  };
  age: number;
  sex: "Male" | "Female" | "Other";
  phoneNumber: string;
  address: string;
  kneeCondition: string;
  otherMorbidities?: string;
  rehabDuration: string;
  mriImage: string;
  doctorId: string;
  appointmentDate: string;
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
  const [isIssueReportOpen, setIsIssueReportOpen] = useState(false)
  const [issueReport, setIssueReport] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [testMetrics, setTestMetrics] = useState<TestMetrics | null>(null);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null)

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
      setAppointments(response.data.data.appointments)
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

  const handleRunTest = (patient: Appointment) => {
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

  // Filter appointments based on search term
  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment._id.toLowerCase().includes(searchTerm.toLowerCase())
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
                    Managing {appointments.length} patients and{" "}
                    {testMetrics.testsAllocated} tests
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-0 p-2 flex items-center gap-2 w-[calc(50%-0.375rem)] sm:w-auto">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Patients</p>
                    <p className="text-sm font-medium">{appointments.length}</p>
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
                  <span>Appointment Management</span>
                </CardTitle>
                <CardDescription className="text-xs">Manage appointments and patients</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                  <Input
                    placeholder="Search appointments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-7 h-8 text-xs"
                  />
                </div>
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
                      <TableHead className="text-xs font-medium text-gray-600 dark:text-gray-400">Patient Name</TableHead>
                      <TableHead className="text-xs font-medium text-gray-600 dark:text-gray-400">Condition</TableHead>
                      <TableHead className="text-xs font-medium text-gray-600 dark:text-gray-400">Appointment Date</TableHead>
                      <TableHead className="text-xs font-medium text-gray-600 dark:text-gray-400">Phone</TableHead>
                      <TableHead className="text-xs font-medium text-gray-600 dark:text-gray-400">Sex</TableHead>
                      <TableHead className="text-xs font-medium text-gray-600 dark:text-gray-400">Age</TableHead>
                      <TableHead className="text-right text-xs font-medium text-gray-600 dark:text-gray-400">Run Test</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map((appointment) => (
                        <TableRow
                          key={appointment._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800"
                        >
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {appointment.userId.name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            >
                              {appointment.kneeCondition}
                            </Badge>
                            {appointment.otherMorbidities && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                +{appointment.otherMorbidities}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(appointment.appointmentDate).toLocaleString()}
                          </TableCell>
                          <TableCell>{appointment.phoneNumber}</TableCell>
                          <TableCell>{appointment.sex}</TableCell>
                          <TableCell>{appointment.age}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => handleRunTest(appointment)}
                              className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Run Test
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="space-y-2">
                            <Users className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto" />
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {searchTerm ? "No appointments found matching your search." : "No appointments yet."}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {/* Mobile Appointment List */}
              <div className="md:hidden">
                {filteredAppointments.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredAppointments.map((appointment) => (
                      <div key={appointment._id} className="py-3 px-4">
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {appointment.userId.name}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              >
                                {appointment.kneeCondition}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {appointment.age} yrs • {appointment.sex}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Appointment: {new Date(appointment.appointmentDate).toLocaleString()}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleRunTest(appointment)}
                            className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white ml-2"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Run Test
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4">
                    <div className="space-y-2">
                      <Users className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto" />
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {searchTerm ? "No appointments found matching your search." : "No appointments yet."}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

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
