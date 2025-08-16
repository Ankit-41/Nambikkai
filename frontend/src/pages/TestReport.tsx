"use client";
import { useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { doctorApi } from "@/services/api";

/* ------------------------------------------------------------------
   API DATA STRUCTURE
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

// API Response structure based on your data
type ApiReportData = {
  [key: string]: {
    Data?: Array<any>;
    Max_Axis_Angle_Degrees?: number;
    Max_Linear_Displacement_mm?: number;
    [key: string]: any;
  } | string;
};

type ApiResponse = {
  message: string;
  filesProcessed: number;
  data: ApiReportData;
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
  const reportRef = useRef<HTMLDivElement>(null);

  // Get data from navigation state
  const { patient, puckId, leg, report } = location.state || {};

  console.log("patient", patient);
  console.log("puckId", puckId);
  console.log("leg", leg);
  console.log("report", report);

  // Process API data to extract test results
  const processApiData = (apiData: ApiReportData): TestData => {
    let maxRangeOfMotion = 0;
    let maxLinearDisplacement = 0;
    let maxAngularDisplacement = 0;
    let rangeOfMotionData: any[] = [];
    let linearDisplacementData: any[] = [];
    let angularDisplacementData: any[] = [];

    // Process each file's data
    Object.entries(apiData).forEach(([fileName, fileData]) => {
      if (typeof fileData === 'object' && fileData.Data) {
        // First file: Range of Motion (Axis_Angle_Degrees)
        if (fileName.includes('063725') && fileData.Max_Axis_Angle_Degrees) {
          maxRangeOfMotion = fileData.Max_Axis_Angle_Degrees;
          rangeOfMotionData = fileData.Data || [];
        }
        
        // Second file: Linear Displacement
        if (fileName.includes('063726') && fileData.Max_Linear_Displacement_mm) {
          maxLinearDisplacement = fileData.Max_Linear_Displacement_mm;
          linearDisplacementData = fileData.Data || [];
        }
        
        // Third file: Angular Displacement (currently skipped)
        if (fileName.includes('063727')) {
          if (typeof fileData === 'string' && fileData === 'Skipped') {
            maxAngularDisplacement = 0;
            angularDisplacementData = [];
          } else if (fileData.Max_Angular_Displacement_deg) {
            maxAngularDisplacement = fileData.Max_Angular_Displacement_deg;
            angularDisplacementData = fileData.Data || [];
          }
        }
      }
    });

    // Create combined time series data
    const maxLength = Math.max(
      rangeOfMotionData.length,
      linearDisplacementData.length,
      angularDisplacementData.length
    );

    const timeSeriesData: TimePoint[] = Array.from({ length: maxLength }, (_, index) => ({
      time: index,
      rangeOfMotion: rangeOfMotionData[index]?.Axis_Angle_Degrees || 0,
      linearDisplacement: linearDisplacementData[index]?.Linear_Displacement_mm || 0,
      angularDisplacement: angularDisplacementData[index]?.Angular_Displacement_deg || 0,
    }));

    return {
      linearDisplacement: maxLinearDisplacement,
      rangeOfMotion: maxRangeOfMotion,
      angularDisplacement: maxAngularDisplacement,
      timeSeriesData: timeSeriesData,
    };
  };

  // Process the API data
  const testResults: TestData = report ? processApiData(report) : {
    linearDisplacement: 0,
    rangeOfMotion: 0,
    angularDisplacement: 0,
    timeSeriesData: []
  };

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
      value: testResults.angularDisplacement > 0 ? `${testResults.angularDisplacement.toFixed(1)}°` : "Upcoming",
      optimumRange: "≤ 5°",
      status: testResults.angularDisplacement > 0 ? (testResults.angularDisplacement > 5 ? "high" : "normal") : "pending",
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

  const angularDisplacementData = testResults.timeSeriesData
    .filter((p) => p.angularDisplacement > 0)
    .map((p) => ({
      time: p.time,
      value: p.angularDisplacement,
    }));

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    toast({
      title: "Generating Report",
      description: "Your PDF report is being generated...",
    });

    try {
      // Get the main content container using ref
      const element = reportRef.current;
      
      if (!element) {
        throw new Error("Could not find the report content");
      }

      // Temporarily hide the download button to avoid it in the PDF
      const downloadButton = document.getElementById('download-report-btn');
      if (downloadButton) {
        downloadButton.style.display = 'none';
      }

      // Configure html2canvas options for better quality
      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      // Restore the download button
      if (downloadButton) {
        downloadButton.style.display = 'block';
      }

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Calculate dimensions to fit the content properly
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename
      const filename = `knee-health-report-${patient?.userId?.name || 'patient'}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Download the PDF
      pdf.save(filename);

      setIsDownloading(false);
      toast({
        title: "Download Complete",
        description: "PDF report has been generated successfully",
      });

    } catch (error) {
      console.error("Error generating PDF:", error);
      setIsDownloading(false);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSaveNotes = async () => {
    try {
      setIsEditingNotes(false);
      
      // Save test results to database
      console.log('💾 Saving test results with data:', {
        patientId: patient._id,
        patientUserId: patient.userId._id,
        patientName: patient.userId.name,
        puckId,
        legTested: leg,
        legLength: location.state?.legLength || 0,
        testResults: testResults,
        doctorNotes: doctorNotes,
        filesProcessed: report.filesProcessed || 0
      });
      
      const testData = {
        patientId: patient._id, // Use patient._id directly
        puckId,
        legTested: leg,
        legLength: location.state?.legLength || 0,
        testResults: {
          rangeOfMotion: testResults.rangeOfMotion,
          linearDisplacement: testResults.linearDisplacement,
          angularDisplacement: testResults.angularDisplacement,
          timeSeriesData: testResults.timeSeriesData
        },
        doctorNotes,
        filesProcessed: report.filesProcessed || 0
      };

      // Get doctor email from localStorage
      const doctorEmail = localStorage.getItem('email');
      console.log('🔑 Doctor email from localStorage:', doctorEmail);
      
      if (!doctorEmail) {
        throw new Error('Doctor email not found');
      }

      console.log('📤 Sending API request to save test results...');
      const response = await doctorApi.saveTestResults(doctorEmail, testData);
      console.log('📥 API response received:', response);

      if (response.status === 201) {
        toast({
          title: "Success",
          description: "Test results and notes saved successfully",
        });
      } else {
        throw new Error(`Failed to save test results. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving test results:', error);
      toast({
        title: "Error",
        description: "Failed to save test results. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Check if we have valid data
  if (!patient || !report) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Report Not Found</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <p>Report data is unavailable. Please return to the test page and try again.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate(-1)}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Go Back
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div ref={reportRef} className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
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
                Detailed analysis for {patient.userId.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              id="download-report-btn"
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">Test Date</p>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Configuration Information */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                Test Configuration
              </CardTitle>
              <CardDescription>Test setup and sensor information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Puck ID</p>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                  >
                    {puckId}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Leg Tested</p>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                  >
                    {leg}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Leg Length</p>
                  <p className="text-sm font-medium">{location.state?.legLength || 'N/A'} cm</p>
                </div>
               
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Knee Condition</p>
                  <Badge
                    variant="outline"
                    className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800"
                  >
                    {patient.kneeCondition}
                  </Badge>
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
              <CardDescription className="text-xs">
                {testResults.angularDisplacement > 0 ? "Rotation over test duration" : "Test skipped - no data available"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {testResults.angularDisplacement > 0 ? (
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
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">Test Skipped</p>
                    <p className="text-xs">Angular displacement test graph will be available soon</p>
                  </div>
                </div>
              )}
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
