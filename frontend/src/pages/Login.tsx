"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "@/components/Layout"
import { hospitalAdminApi, doctorApi, superAdminApi } from "../services/api"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Stethoscope, User, Mail, Lock, BadgeIcon as IdCard, Shield, CheckCircle } from "lucide-react"

const Login = () => {
  const navigate = useNavigate()
  const [selectedPersona, setSelectedPersona] = useState<"patient" | "doctor" | "hospital-admin" | "super-admin">("patient")
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    patientId: "",
  })
  const [loading, setLoading] = useState(false)

  const personas = [
    {
      id: "patient",
      label: "Patient",
      icon: User,
      color:
        "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300",
      activeColor: "border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-400",
    },
    {
      id: "doctor",
      label: "Doctor",
      icon: Stethoscope,
      color: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300",
      activeColor: "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400",
    },
    {
      id: "hospital-admin",
      label: "Hospital Admin",
      icon: Building2,
      color:
        "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300",
      activeColor: "border-purple-500 bg-purple-50 dark:bg-purple-900/30 dark:border-purple-400",
    },
    {
      id: "super-admin",
      label: "Super Admin",
      icon: Shield,
      color:
        "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300",
      activeColor: "border-red-500 bg-red-50 dark:bg-red-900/30 dark:border-red-400",
    }
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    console.log("Login attempt started")
    console.log("Selected persona:", selectedPersona)
    console.log("Login data:", loginData)

    try {
      if (selectedPersona === "patient") {
        console.log("Processing patient login")
        if (!loginData.patientId) {
          toast({
            title: "Error",
            description: "Please enter your Patient ID",
            variant: "destructive",
          })
          return
        }
        navigate("/patient")
      } else {
        console.log("Processing non-patient login")
        if (!loginData.email || !loginData.password) {
          toast({
            title: "Error",
            description: "Please enter email and password",
            variant: "destructive",
          })
          return
        }

        if (selectedPersona === "hospital-admin") {
          console.log("Processing hospital admin login")
          const response = await hospitalAdminApi.login({
            email: loginData.email,
            password: loginData.password,
          })

          // Store admin data and email in localStorage
          localStorage.setItem("hospitalAdminData", JSON.stringify(response.data))
          localStorage.setItem("email", loginData.email)

          // Show success message
          toast({
            title: "Success",
            description: "Login successful!",
          })

          // Navigate to dashboard
          navigate("/hospital-admin")
        } else if (selectedPersona === "super-admin") {
          console.log("Processing super admin login")
          console.log("Calling superAdminApi.login with:", { email: loginData.email, password: loginData.password })
          
          const response = await superAdminApi.login({
            email: loginData.email,
            password: loginData.password,
          })
          
          console.log("Super admin login response:", response)
          
          localStorage.setItem("superAdminData", JSON.stringify(response.data))
          localStorage.setItem("email", loginData.email)

          // Show success message
          toast({
            title: "Success",
            description: "Login successful!",
          })

          // Navigate to dashboard
          navigate("/super-admin")
        } else if (selectedPersona === "doctor") {
          console.log("Processing doctor login")
          const response = await doctorApi.login({
            email: loginData.email,
            password: loginData.password,
          })

          // Store doctor data and email in localStorage
          localStorage.setItem("doctorData", JSON.stringify(response.data))
          localStorage.setItem("email", loginData.email)

          // Show success message
          toast({
            title: "Success",
            description: "Login successful!",
          })

          // Navigate to dashboard
          navigate("/doctor")
        }
      }
    } catch (error: any) {
      console.error("Login error:", error)
      console.error("Error response:", error.response)
      // Show error message
      toast({
        title: "Error",
        description: error.response?.data?.message || "Login failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedPersonaData = personas.find((p) => p.id === selectedPersona)

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6">
          {/* Main Login Card */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-lg">
            <CardHeader className="space-y-4">
              <div>
                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Choose Your Role</CardTitle>
                <CardDescription className="text-sm">Select your account type to continue</CardDescription>
              </div>

              {/* Persona Selection - Single Row for both desktop and mobile */}
              <div className="flex justify-center space-x-3">
                {personas.map((persona) => {
                  const Icon = persona.icon
                  const isSelected = selectedPersona === persona.id
                  return (
                    <button
                      key={persona.id}
                      onClick={() => setSelectedPersona(persona.id as any)}
                      className={`relative flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200 flex-1 ${isSelected
                        ? persona.activeColor
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900"
                        }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div
                          className={`p-2 rounded-lg ${isSelected ? "bg-white dark:bg-gray-800 shadow-sm" : "bg-gray-100 dark:bg-gray-800"
                            }`}
                        >
                          <Icon
                            className={`h-5 w-5 ${isSelected
                              ? persona.id === "patient"
                                ? "text-green-600 dark:text-green-400"
                                : persona.id === "doctor"
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-purple-600 dark:text-purple-400"
                              : "text-gray-600 dark:text-gray-400"
                              }`}
                          />
                        </div>
                        <div className="flex items-center justify-center space-x-1">
                          <span
                            className={`font-medium text-xs ${isSelected ? "text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"
                              }`}
                          >
                            {persona.id === "hospital-admin" ? "Admin" : persona.label}
                          </span>
                          {isSelected && <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400" />}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Selected Persona Info */}
              {selectedPersonaData && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg ${selectedPersona === "patient"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : selectedPersona === "doctor"
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : "bg-purple-100 dark:bg-purple-900/30"
                        }`}
                    >
                      <selectedPersonaData.icon
                        className={`h-4 w-4 ${selectedPersona === "patient"
                          ? "text-green-600 dark:text-green-400"
                          : selectedPersona === "doctor"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-purple-600 dark:text-purple-400"
                          }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Signing in as{" "}
                        {selectedPersona === "hospital-admin" ? "Hospital Administrator" : selectedPersonaData.label}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {selectedPersona === "patient" ? (
                  <div className="space-y-2">
                    <Label htmlFor="patientId" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Patient ID
                    </Label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="patientId"
                        value={loginData.patientId}
                        onChange={(e) => setLoginData({ ...loginData, patientId: e.target.value })}
                        placeholder="Enter your Patient ID"
                        className="pl-10 h-10 border-gray-300 focus:border-green-400 focus:ring-green-400"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Your Patient ID was provided during registration
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="email"
                          type="email"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          placeholder="Enter your email address"
                          className={`pl-10 h-10 border-gray-300 ${selectedPersona === "doctor"
                            ? "focus:border-blue-400 focus:ring-blue-400"
                            : "focus:border-purple-400 focus:ring-purple-400"
                            }`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="password"
                          type="password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          placeholder="Enter your password"
                          className={`pl-10 h-10 border-gray-300 ${selectedPersona === "doctor"
                            ? "focus:border-blue-400 focus:ring-blue-400"
                            : "focus:border-purple-400 focus:ring-purple-400"
                            }`}
                        />
                      </div>
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className={`w-full h-10 text-sm font-medium shadow-lg transition-all duration-200 ${selectedPersona === "patient"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : selectedPersona === "doctor"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      {selectedPersonaData?.icon && <selectedPersonaData.icon className="h-4 w-4" />}
                      <span>Sign In</span>
                    </div>
                  )}
                </Button>
              </form>

              {/* Security Notice */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-blue-900 dark:text-blue-100">Secure Login</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Your medical data is protected with enterprise-grade security and encryption.
                    </p>
                  </div>
                </div>
              </div>

              {/* Help Text */}
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Need help accessing your account?{" "}
                  <button className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    Contact Support
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 Medical Dashboard. All rights reserved.</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Login
