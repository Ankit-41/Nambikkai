"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import Layout from "@/components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Clock,
  Play,
  Check,
  ChevronLeft,
  User,
  Calendar,
  Activity,
  AlertCircle,
  FileText,
  Timer,
  Loader2,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { doctorApi } from "../services/api"

interface Patient {
  _id: string
  userId: { 
    _id: string
    name: string 
  }
  age: number
  sex: string
  condition: string
  kneeCondition: string
  phoneNumber: string
  address: string
  otherMorbidities?: string
  rehabDuration: string
  mriImage: string
  tests?: Array<{ date: string }>
}

type TestType = "rangeOfMotion" | "linearDisplacement" | "angularDisplacement"
const TEST_ORDER: { key: TestType; label: string; description: string; icon: React.ElementType }[] = [
  {
    key: "rangeOfMotion",
    label: "Range of Motion",
    description: "Measures the extent of movement in the knee joint",
    icon: Activity,
  },
  {
    key: "linearDisplacement",
    label: "Linear Displacement",
    description: "Measures straight-line movement of the knee",
    icon: Timer,
  },
  {
    key: "angularDisplacement",
    label: "Angular Displacement",
    description: "Measures rotational movement of the knee joint",
    icon: Activity,
  },
]

const RunTest = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { patientId } = useParams()
  const patient = location.state?.patient

  const [puckId, setPuckId] = useState("")
  const [legLength, setLegLength] = useState("")
  const [leg, setLeg] = useState<"Left" | "Right" | "">("")
  const [currentStep, setCurrentStep] = useState(0)
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [completedTests, setCompletedTests] = useState<Set<TestType>>(new Set())
  const [generating, setGenerating] = useState(false)

  const email = localStorage.getItem("email")

  useEffect(() => {
    if (!email) {
      navigate("/login")
    }
  }, [email, navigate])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (running) {
      timer = setInterval(() => setElapsed((e) => e + 1), 1000)
    }
    return () => clearInterval(timer)
  }, [running])

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60)
    const secs = sec % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const startTest = () => {
    setRunning(true)
    toast({
      title: "Test Started",
      description: `${TEST_ORDER[currentStep].label} test running.`,
    })
  }

  const stopTest = () => {
    setRunning(false)
    const type = TEST_ORDER[currentStep].key
    setCompletedTests((s) => new Set(s).add(type))
    toast({
      title: "Test Complete",
      description: `${TEST_ORDER[currentStep].label} collected.`,
    })
    setElapsed(0)
    // move to next test automatically
    if (currentStep < TEST_ORDER.length - 1) {
      setCurrentStep((step) => step + 1)
    }
  }
  // start here

  const handleGenerateReport = async () => {
  try {
    if (!puckId) {
      toast({
        title: "Error",
        description: "Puck ID is missing",
        variant: "destructive"
      });
      return;
    }

    // Generate timestamp in format: YYYYMMDD-HHMMSS (adjust if AWS expects something else)
    const now = new Date();
    // const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2,"0")}-${String(now.getHours()).padStart(2,"0")}${String(now.getMinutes()).padStart(2,"0")}${String(now.getSeconds()).padStart(2,"0")}`;
    const timestamp = "20250725-063723";
    setGenerating(true);
    toast({ title: "Generating Report", description: "Please wait..." });

    // const response = await fetch("http://localhost:5000/api/doctor/download-report?email=d1@hospital.com", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     // Include auth token if needed:
    //     // "Authorization": `Bearer ${localStorage.getItem("token")}`,
    //   },
    //   body: JSON.stringify({ puckId, timestamp })
    // });

    const response = await doctorApi.getReport(email, { puckId, timestamp })

    const data = response.data;
    console.log("hiya hoo ha", data);

    if (response.status === 200) {
      toast({
        title: "Report Saved",
        description: "The report has been generated and stored successfully"
      });
      navigate(`/test-report/${patientId}`, {
        state: { patient, puckId, leg, legLength, report: data.data, appointmentId: location.state?.appointmentId }
      });
    } else {
      toast({
        title: "Error",
        description: data.message || "Failed to generate report",
        variant: "destructive"
      });
    }
  } catch (error) {
    console.error("Error generating report:", error);
    toast({
      title: "Error",
      description: "Something went wrong while generating the report",
      variant: "destructive"
    });
  } finally {
    setGenerating(false);
  }
};

  //end here
  if (!patient) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Patient Not Found</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <p>Patient data is unavailable. Please return to the dashboard and try again.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate("/doctor")}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Return to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    )
  }

  const canStartFirst = Boolean(puckId && leg)
  const completedCount = completedTests.size
  const progressPercentage = (completedCount / TEST_ORDER.length) * 100

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-5xl">
        {/* Header with Back Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Button variant="outline" size="sm" onClick={() => navigate("/doctor")} className="mb-2">
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to Dashboard
            </Button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Run Tests</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Conducting diagnostic tests for knee assessment</p>
          </div>

          <div className="w-full sm:w-auto">
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-0">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-800">
                  <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Test Progress</p>
                  <p className="text-sm font-medium">
                    {completedCount} of {TEST_ORDER.length} Complete
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Setup</span>
            <span>Testing</span>
            <span>Report</span>
          </div>
        </div>

        {/* Patient Info Card */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Patient Information
                </CardTitle>
                <CardDescription>Test subject details</CardDescription>
              </div>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
              >
                {patient.condition}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                <p className="text-sm font-medium">{patient.userId.name}</p>
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
                <p className="text-xs text-gray-500 dark:text-gray-400">Last Test</p>
                <p className="text-sm font-medium">
                  {patient.tests?.[0]?.date ? (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      {new Date(patient.tests[0].date).toLocaleDateString()}
                    </span>
                  ) : (
                    "No previous tests"
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Setup Card */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Test Configuration
            </CardTitle>
            <CardDescription>Configure the test parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="puckId" className="text-sm flex items-center gap-1">
                  Puck ID <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="puckId"
                    value={puckId}
                    onChange={(e) => setPuckId(e.target.value)}
                    placeholder="Enter Puck ID"
                    className={`pl-3 ${!puckId && "border-red-200 dark:border-red-800"}`}
                  />
                  {!puckId && (
                    <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Required field
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enter the unique identifier for the sensor puck
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leg" className="text-sm flex items-center gap-1">
                  Leg <span className="text-red-500">*</span>
                </Label>
                <Select value={leg} onValueChange={(v) => setLeg(v as "Left" | "Right")}>
                  <SelectTrigger id="leg" className={`${!leg && "border-red-200 dark:border-red-800"}`}>
                    <SelectValue placeholder="Select leg" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Left">Left</SelectItem>
                    <SelectItem value="Right">Right</SelectItem>
                  </SelectContent>
                </Select>
                {!leg && (
                  <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Required field
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">Select which leg is being tested</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="puckId" className="text-sm flex items-center gap-1">
                  Leg Length <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="puckId"
                    value={legLength}
                    onChange={(e) => setLegLength(e.target.value)}
                    placeholder="Enter Leg Length"
                    className={`pl-3 ${!legLength && "border-red-200 dark:border-red-800"}`}
                  />
                  {!legLength && (
                    <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Required field
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enter the patient's leg length
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 px-6 py-3">
            <div className="w-full flex items-center justify-between">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {!canStartFirst ? (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <AlertCircle className="h-3 w-3" /> Please complete all required fields
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Check className="h-3 w-3" /> Configuration complete
                  </span>
                )}
              </div>
              <Button
                size="sm"
                disabled={!canStartFirst || running || currentStep !== 0 || completedTests.has("rangeOfMotion")}
                onClick={startTest}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Play className="mr-1 h-3 w-3" /> Start Range of Motion Test
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Test Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TEST_ORDER.map((test, idx) => {
            const isActive = idx === currentStep
            const isCompleted = completedTests.has(test.key)
            const isLocked = idx > currentStep || (idx === 0 && !canStartFirst)
            const Icon = test.icon

            return (
              <Card
                key={test.key}
                className={`border ${
                  isActive
                    ? "border-blue-300 dark:border-blue-700 shadow-md"
                    : isCompleted
                      ? "border-green-200 dark:border-green-800"
                      : "border-gray-200 dark:border-gray-800"
                } ${isLocked ? "opacity-60" : ""}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        {test.label}
                      </CardTitle>
                      <CardDescription className="text-xs">{test.description}</CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        isCompleted
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                          : isActive
                            ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                            : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                      }
                    >
                      {isCompleted ? "Completed" : isActive ? "Active" : `Step ${idx + 1}`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-center py-6">
                  {isCompleted ? (
                    <div className="flex flex-col items-center justify-center h-24 space-y-2">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400">Test completed successfully</p>
                    </div>
                  ) : isActive ? (
                    <div className="flex flex-col items-center justify-center h-24 space-y-4">
                      {!running && !generating ? (
                        <Button
                          onClick={startTest}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={isLocked}
                        >
                          <Play className="mr-1 h-4 w-4" /> Start Test
                        </Button>
                      ) : running ? (
                        <>
                          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center animate-pulse">
                            <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="space-y-2">
                            <div className="text-xl font-mono font-bold text-blue-600 dark:text-blue-400">
                              {formatTime(elapsed)}
                            </div>
                            <Button
                              onClick={stopTest}
                              variant="outline"
                              className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
                            >
                              Stop Test
                            </Button>
                          </div>
                        </>
                      ) : null}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-24 space-y-2">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isLocked ? "Waiting for previous tests" : "Ready to start"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Generate Report Button */}
        {completedTests.size === TEST_ORDER.length && (
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 shadow-sm">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-green-800 dark:text-green-300">All Tests Completed</h3>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Ready to generate the comprehensive test report
                  </p>
                </div>
              </div>
              <Button
                onClick={handleGenerateReport}
                disabled={generating}
                className="bg-green-600 hover:bg-green-700 text-white min-w-[160px]"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" /> Generate Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}

export default RunTest
