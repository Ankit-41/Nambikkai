"use client";
import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  User,
  ChevronLeft,
  Edit3,
  Save,
  Activity,
  TrendingUp,
  Calendar,
  Stethoscope,
  Heart,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

/* ------------------------------------------------------------------
   1) HARD-CODED MOCK DATA
   ------------------------------------------------------------------ */

type TimePoint = {
  time: number;
  linearDisplacement: number;
  rangeOfMotion: number;
  angularDisplacement: number;
};

type TestData = {
  linearDisplacement: number; // peak
  rangeOfMotion: number;      // peak
  angularDisplacement: number; // peak
  timeSeriesData: TimePoint[];
};

const MOCK_TEST_DATA: TestData = {
  linearDisplacement: 4.2,
  rangeOfMotion: 125.8,
  angularDisplacement: 3.7,
  timeSeriesData: [
    { time: 0,  linearDisplacement: 4.0, rangeOfMotion: 118.2, angularDisplacement: 3.5 },
    { time: 1,  linearDisplacement: 4.1, rangeOfMotion: 119.7, angularDisplacement: 3.4 },
    { time: 2,  linearDisplacement: 4.3, rangeOfMotion: 121.0, angularDisplacement: 3.6 },
    { time: 3,  linearDisplacement: 4.4, rangeOfMotion: 122.5, angularDisplacement: 3.8 },
    { time: 4,  linearDisplacement: 4.2, rangeOfMotion: 123.9, angularDisplacement: 3.5 },
    { time: 5,  linearDisplacement: 4.1, rangeOfMotion: 124.6, angularDisplacement: 3.4 },
    { time: 6,  linearDisplacement: 4.0, rangeOfMotion: 125.2, angularDisplacement: 3.6 },
    { time: 7,  linearDisplacement: 4.3, rangeOfMotion: 126.1, angularDisplacement: 3.7 },
    { time: 8,  linearDisplacement: 4.4, rangeOfMotion: 126.9, angularDisplacement: 3.8 },
    { time: 9,  linearDisplacement: 4.2, rangeOfMotion: 127.0, angularDisplacement: 3.7 },
    { time: 10, linearDisplacement: 4.1, rangeOfMotion: 126.4, angularDisplacement: 3.6 },
    { time: 11, linearDisplacement: 4.0, rangeOfMotion: 125.8, angularDisplacement: 3.7 },
    { time: 12, linearDisplacement: 4.2, rangeOfMotion: 125.5, angularDisplacement: 3.7 },
    { time: 13, linearDisplacement: 4.3, rangeOfMotion: 126.2, angularDisplacement: 3.8 },
    { time: 14, linearDisplacement: 4.1, rangeOfMotion: 125.9, angularDisplacement: 3.6 },
    { time: 15, linearDisplacement: 4.0, rangeOfMotion: 125.3, angularDisplacement: 3.5 },
    { time: 16, linearDisplacement: 4.2, rangeOfMotion: 124.8, angularDisplacement: 3.4 },
    { time: 17, linearDisplacement: 4.3, rangeOfMotion: 125.1, angularDisplacement: 3.5 },
    { time: 18, linearDisplacement: 4.4, rangeOfMotion: 125.7, angularDisplacement: 3.6 },
    { time: 19, linearDisplacement: 4.2, rangeOfMotion: 125.8, angularDisplacement: 3.7 }
  ]
};

const MOCK_PATIENT = {
  userId: { name: "John Doe" },
  age: 45,
  sex: "Male",
  patientId: "ABC123",
  doctorName: "Dr. Sarah Johnson",
  testDate: "2024-01-15",
  kneeCondition: "Post Surgery",
  otherMorbidities: "Diabetes Type 2",
  rehabDuration: "12 weeks",
};

/* ------------------------------------------------------------------ */

const TestReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [doctorNotes, setDoctorNotes] = useState(
    "Patient shows good progress in knee stability. Recommend continued physiotherapy sessions twice weekly. Range of motion has improved significantly since last assessment. Continue current rehabilitation protocol."
  );
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Pull from navigation state if present, else fall back to mocks
  const { patient, testData, doctor } = location.state || {};

  const patientData = patient || { ...MOCK_PATIENT, patientId: id ?? MOCK_PATIENT.patientId };

  const testResults: TestData = testData || MOCK_TEST_DATA;

  // Peak values table
  const peakResults = [
    {
      metric: "Linear Displacement",
      value: `${testResults.linearDisplacement.toFixed(1)} mm`,
      optimumRange: "≤ 6 mm",
      status: testResults.linearDisplacement > 6 ? "high" : "normal",
      description: "Measures straight-line movement stability",
    },
    {
      metric: "Range of Motion",
      value: `${testResults.rangeOfMotion.toFixed(1)}°`,
      optimumRange: "≥ 120°",
      status: testResults.rangeOfMotion < 120 ? "low" : "normal",
      description: "Measures joint flexibility and movement extent",
    },
    {
      metric: "Angular Displacement",
      value: `${testResults.angularDisplacement.toFixed(1)}°`,
      optimumRange: "≤ 5°",
      status: testResults.angularDisplacement > 5 ? "high" : "normal",
      description: "Measures rotational movement control",
    },
  ];

  // Time series for charts
  const rangeOfMotionData = testResults.timeSeriesData.map((p) => ({
    time: p.time,
    value: p.rangeOfMotion,
  }));

  const linearDisplacementData = testResults.timeSeriesData.map((p) => ({
    time: p.time,
    value: p.linearDisplacement,
  }));

  const angularDisplacementData = testResults.timeSeriesData.map((p) => ({
    time: p.time,
    value: p.angularDisplacement,
  }));

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    toast({
      title: "Generating Report",
      description: "Your PDF report is being generated...",
    });

    // Fake PDF generation
    setTimeout(() => {
      const reportContent = `
KNEE HEALTH TEST REPORT
=======================

Patient Details:
- Name: ${patientData.userId.name}
- Age: ${patientData.age}
- Sex: ${patientData.sex}
- Patient ID: ${patientData.patientId}
- Doctor: ${doctor || patientData.doctorName}
- Test Date: ${patientData.testDate}

Peak Test Results:
- Linear Displacement: ${testResults.linearDisplacement.toFixed(1)} mm (Optimum: ≤ 6 mm)
- Range of Motion: ${testResults.rangeOfMotion.toFixed(1)}° (Optimum: ≥ 120°)
- Angular Displacement: ${testResults.angularDisplacement.toFixed(1)}° (Optimum: ≤ 5°)

Doctor Notes:
${doctorNotes}

Generated on: ${new Date().toLocaleString()}
      `;

      const blob = new Blob([reportContent], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `knee-health-report-${patientData.patientId}-${new Date()
        .toISOString()
        .split("T")[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setIsDownloading(false);
      toast({
        title: "Download Complete",
        description: "Test report has been downloaded successfully",
      });
    }, 2000);
  };

  const handleSaveNotes = () => {
    setIsEditingNotes(false);
    toast({
      title: "Notes Saved",
      description: "Doctor notes have been updated successfully",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800/70"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Test Report
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Detailed analysis for {patientData.userId.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleDownloadReport}
              disabled={isDownloading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Patient and Test Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Details */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Patient Information
              </CardTitle>
              <CardDescription>Basic patient details and demographics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
                  <p className="text-sm font-medium">{patientData.userId.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Age</p>
                  <p className="text-sm font-medium">{patientData.age} years</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sex</p>
                  <p className="text-sm font-medium">{patientData.sex}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Test Date</p>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    {new Date(patientData.testDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-600 dark:text-red-400" />
                Medical Information
              </CardTitle>
              <CardDescription>Current condition and medical history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Knee Condition</p>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                  >
                    {patientData.kneeCondition}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Other Medical Conditions
                  </p>
                  <p className="text-sm font-medium">
                    {patientData.otherMorbidities || "None reported"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Rehabilitation Duration
                  </p>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                    {patientData.rehabDuration}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">MRI Images</p>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    View Images
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Peak Test Results */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Peak Test Results
            </CardTitle>
            <CardDescription>Maximum values obtained during the test session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                    <TableHead className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Metric
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Peak Value
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Optimum Range
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">
                      Description
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {peakResults.map((result, index) => (
                    <TableRow
                      key={index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <TableCell className="font-medium text-sm">{result.metric}</TableCell>
                      <TableCell className="font-bold text-base text-blue-600 dark:text-blue-400">
                        {result.value}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {result.optimumRange}
                      </TableCell>

                      <TableCell className="text-xs text-gray-500 dark:text-gray-400 hidden md:table-cell">
                        {result.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Progress Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Range of Motion
              </CardTitle>
              <CardDescription className="text-xs">Movement over test duration</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={rangeOfMotionData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                Linear Displacement
              </CardTitle>
              <CardDescription className="text-xs">Stability over test duration</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={linearDisplacementData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#10b981" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                Angular Displacement
              </CardTitle>
              <CardDescription className="text-xs">Rotation over test duration</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={angularDisplacementData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#8b5cf6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Doctor Notes */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Doctor Notes
              </CardTitle>
              <CardDescription>Clinical observations and recommendations</CardDescription>
            </div>
            {!isEditingNotes && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingNotes(true)}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800/70"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isEditingNotes ? (
              <div className="space-y-4">
                <Textarea
                  className="min-h-[120px] resize-none"
                  placeholder="Enter your clinical observations, recommendations, and treatment notes..."
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handleSaveNotes}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save Notes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditingNotes(false)}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border-l-4 border-blue-500">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {doctorNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TestReport;
