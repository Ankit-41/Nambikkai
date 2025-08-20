"use client";
import { useState, useRef, useEffect } from "react";
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
  Activity,
  TrendingUp,
  Calendar,
  Stethoscope,
  Heart,
  Clock,
  Eye,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { patientApi } from "@/services/api";

type TimePoint = {
  time: number;
  linearDisplacement: number;
  rangeOfMotion: number;
  angularDisplacement: number;
};

type TestData = {
  linearDisplacement: number;
  rangeOfMotion: number;
  angularDisplacement: number;
  timeSeriesData: TimePoint[];
};

type PatientTestReport = {
  _id: string;
  testDate: string;
  legTested: string;
  legLength: number;
  maxRangeOfMotion: number;
  maxLinearDisplacement: number;
  maxAngularDisplacement: number;
  doctorNotes: string;
  doctorName: string;
  puckId: string;
  timeSeriesData: TimePoint[];
  patient: {
    name: string;
    age: number;
    sex: string;
    kneeCondition: string;
  };
};

const PatientTestReport = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const reportRef = useRef<HTMLDivElement>(null);

  const [report, setReport] = useState<PatientTestReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestReport = async () => {
      try {
        setLoading(true);
        // Get patient code from localStorage
        const patientData = localStorage.getItem("patientData");
        if (!patientData) {
          setError("Patient data not found. Please login again.");
          return;
        }

        const patient = JSON.parse(patientData);
        const patientCode = patient.patientCode;

        // Fetch test report using the patient API
        const response = await patientApi.getUniqueTest(testId, patientCode);
        if (response.status !== 200) {
          throw new Error('Failed to fetch test report');
        }

        const data = response.data.data;
        setReport(data);
        console.log("data", data);
      } catch (err: any) {
        console.error('Error fetching test report:', err);
        setError(err.message || 'Failed to fetch test report');
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchTestReport();
    }
  }, [testId]);

  const handleDownloadPDF = async () => {
    if (!reportRef.current || !report) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `knee-health-report-${report.patient.name}-${new Date(report.testDate).toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

      toast({
        title: "Report Downloaded",
        description: "Your test report has been downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBadgeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80)
      return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
    if (percentage >= 60)
      return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-green-800";
    return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-200 border-t-blue-600 mx-auto"></div>
              <Loader2 className="h-6 w-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Loading Test Report</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Fetching your test results...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !report) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Report Not Found</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <X className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <p>{error || "Report data is unavailable. Please return to the dashboard and try again."}</p>
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Test Report
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Detailed analysis for {report.patient.name}
              </p>
            </div>
          </div>

          <Button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>

        {/* Patient and Test Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Details */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Patient Information
              </CardTitle>
              <CardDescription>Basic patient details and demographics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Name</span>
                <p className="text-sm font-medium">{report.patient.name}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Age</span>
                <p className="text-sm font-medium">{report.patient.age} years</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Sex</span>
                <p className="text-sm font-medium">{report.patient.sex}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Condition</span>
                <Badge variant="outline" className="text-xs">
                  {report.patient.kneeCondition}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Test Details */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                Test Information
              </CardTitle>
              <CardDescription>Test configuration and metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Test Date</span>
                <p className="text-sm font-medium">
                  {new Date(report.testDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Leg Tested</span>
                <Badge variant="outline" className="text-xs">
                  {report.legTested}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Leg Length</span>
                <p className="text-sm font-medium">{report.legLength} cm</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Doctor</span>
                <p className="text-sm font-medium">{report.doctorName}</p>
              </div>
            </CardContent>
          </Card>

          {/* Test Results Summary */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                Test Results
              </CardTitle>
              <CardDescription>Peak performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Range of Motion</span>
                  <span className={`text-sm font-medium ${getScoreColor(report.maxRangeOfMotion, 360)}`}>
                    {report.maxRangeOfMotion.toFixed(1)}°
                  </span>
                </div>
                <Progress value={(report.maxRangeOfMotion / 360) * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Linear Displacement</span>
                  <span className={`text-sm font-medium ${getScoreColor(report.maxLinearDisplacement, 2000)}`}>
                    {report.maxLinearDisplacement.toFixed(1)} mm
                  </span>
                </div>
                <Progress value={(report.maxLinearDisplacement / 2000) * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Angular Displacement</span>
                  <span className={`text-sm font-medium ${getScoreColor(report.maxAngularDisplacement, 180)}`}>
                    {report.maxAngularDisplacement.toFixed(1)}°
                  </span>
                </div>
                <Progress value={(report.maxAngularDisplacement / 180) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Doctor Notes */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Doctor's Notes
            </CardTitle>
            <CardDescription>Professional assessment and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {report.doctorNotes || "No notes provided by the doctor."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Time Series Charts */}
        {report.timeSeriesData && report.timeSeriesData.length > 0 && (
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                Test Performance Over Time
              </CardTitle>
              <CardDescription>Real-time measurements during the test</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Range of Motion Chart */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Range of Motion Over Time
                  </h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={report.timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="rangeOfMotion"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Linear Displacement Chart */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Linear Displacement Over Time
                  </h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={report.timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="linearDisplacement"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Angular Displacement Chart */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Angular Displacement Over Time
                  </h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={report.timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="angularDisplacement"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default PatientTestReport;
