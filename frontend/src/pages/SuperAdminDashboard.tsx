"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "@/components/Layout"
import { superAdminApi } from "../services/api"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Plus, Users, LogOut, ChevronDown, ChevronRight, Stethoscope } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface SuperAdminData {
  id: string
  name: string
  email: string
  hospitalCentres: any[]
  testMetrics: {
    totalTests: number
    testsAllocated: number
    testsRemaining: number
  }
}

interface Doctor {
  _id: string
  userId: {
    _id: string
    name: string
  }
  email: string
  gender: string
  testMetrics: {
    testsAllocated: number
    testsDone: number
    testsRemaining: number
  }
  patients: any[]
}

interface HospitalCentre {
  _id: string
  userId: {
    _id: string
    name: string
  }
  email: string
  testMetrics: {
    testsAllocated: number
    testsDone: number
    testsRemaining: number
  }
  doctors: Doctor[]
  createdBy: string
}

const SuperAdminDashboard = () => {
  const navigate = useNavigate()
  const [superAdminData, setSuperAdminData] = useState<SuperAdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [expandedCentres, setExpandedCentres] = useState<Set<string>>(new Set())
  const [createFormData, setCreateFormData] = useState({
    name: "",
    email: "",
    password: "",
    totalTests: 500
  })
  const [allocateModal, setAllocateModal] = useState<{ open: boolean, centre: HospitalCentre | null }>({ open: false, centre: null })
  const [allocateCount, setAllocateCount] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem("token")
    
    if (!token) {
      navigate("/login")
      return
    }

    loadDashboardData()
  }, [navigate])

  const loadDashboardData = async () => {
    try {
      const response = await superAdminApi.getDashboardData()
      console.log("Dashboard data response:", response.data)
      setSuperAdminData(response.data.data)
    } catch (error: any) {
      console.error("Error loading dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateHospitalAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!superAdminData) return

    console.log("superAdminData:", superAdminData)
    console.log("createFormData:", createFormData)
    
    const requestData = {
      ...createFormData,
      superAdminId: superAdminData.id
    }
    
    console.log("Request data being sent:", requestData)

    try {
      await superAdminApi.createHospitalAdmin(requestData)

      toast({
        title: "Success",
        description: "Hospital admin created successfully!",
      })

      setShowCreateForm(false)
      setCreateFormData({ name: "", email: "", password: "", totalTests: 500 })
      
      // Reload dashboard data
      loadDashboardData()
    } catch (error: any) {
      console.error("Error creating hospital admin:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create hospital admin",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("superAdminData")
    navigate("/login")
  }

  const toggleCentreExpansion = (centreId: string) => {
    const newExpanded = new Set(expandedCentres)
    if (newExpanded.has(centreId)) {
      newExpanded.delete(centreId)
    } else {
      newExpanded.add(centreId)
    }
    setExpandedCentres(newExpanded)
  }

  const getTotalAllocatedForCentre = (centre: HospitalCentre) => {
    return centre.testMetrics.testsAllocated
  }

  const getTotalRemainingForCentre = (centre: HospitalCentre) => {
    return centre.testMetrics.testsRemaining
  }

  const handleAllocateTests = async () => {
    if (!superAdminData || !allocateModal.centre) return
    try {
      await superAdminApi.allocateTests({
        superAdminId: superAdminData.id,
        hospitalAdminId: allocateModal.centre._id,
        count: allocateCount
      })
      toast({
        title: "Success",
        description: `Tests ${allocateCount > 0 ? 'allocated' : 'de-allocated'} successfully!`,
      })
      setAllocateModal({ open: false, centre: null })
      setAllocateCount(0)
      // Refresh dashboard
      loadDashboardData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to allocate tests",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8 text-purple-600" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Super Admin Dashboard
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Welcome back, {superAdminData?.name}
                  </p>
                </div>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Hospital Centres
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {superAdminData?.hospitalCentres?.length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Stethoscope className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Tests
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {superAdminData?.testMetrics?.totalTests ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Stethoscope className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Tests Allocated
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {superAdminData?.testMetrics?.testsAllocated ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Stethoscope className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Tests Remaining
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {superAdminData?.testMetrics?.testsRemaining ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create Hospital Admin Section */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Hospital Centre Management</CardTitle>
                  <CardDescription>
                    Create and manage hospital centre administrators
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Hospital Admin
                </Button>
              </div>
            </CardHeader>
            
            {showCreateForm && (
              <CardContent>
                <form onSubmit={handleCreateHospitalAdmin} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={createFormData.name}
                        onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                        placeholder="Enter hospital admin name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={createFormData.email}
                        onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={createFormData.password}
                        onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                        placeholder="Enter password"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="totalTests">Total Tests</Label>
                      <Input
                        id="totalTests"
                        type="number"
                        value={createFormData.totalTests}
                        onChange={(e) => setCreateFormData({ ...createFormData, totalTests: parseInt(e.target.value) })}
                        placeholder="Enter total tests allocation"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                      Create Hospital Admin
                    </Button>
                  </div>
                </form>
              </CardContent>
            )}
          </Card>

          {/* Hospital Centres List */}
          <Card>
            <CardHeader>
              <CardTitle>Hospital Centres</CardTitle>
              <CardDescription>
                List of all hospital centres under your management
              </CardDescription>
            </CardHeader>
            <CardContent>
              {superAdminData?.hospitalCentres?.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No hospital centres created yet. Create your first hospital centre above.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {superAdminData?.hospitalCentres?.map((centre: HospitalCentre) => (
                    <div key={centre._id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                      {/* Hospital Centre Header */}
                      <div 
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        onClick={() => toggleCentreExpansion(centre._id)}
                      >
                        <div className="flex items-center space-x-3">
                          <Building2 className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {centre.userId?.name || "Hospital Centre"}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {centre.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          {/* Centre Test Metrics */}
                          <div className="text-right">
                           
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Allocated: {getTotalAllocatedForCentre(centre)} | Remaining: {getTotalRemainingForCentre(centre)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {centre.doctors?.length || 0} doctors
                            </span>
                            {expandedCentres.has(centre._id) ? (
                              <ChevronDown className="h-4 w-4 text-gray-600" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-600" />
                            )}
                          </div>
                        </div>
                        <div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-4"
                            onClick={e => { e.stopPropagation(); setAllocateModal({ open: true, centre }) }}
                          >
                            Allocate Tests
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Doctors List */}
                      {expandedCentres.has(centre._id) && (
                        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                          <div className="p-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                              Doctors at {centre.userId?.name}
                            </h4>
                            {centre.doctors?.length === 0 ? (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                No doctors assigned to this centre yet.
                              </p>
                            ) : (
                              <div className="space-y-3">
                                {centre.doctors?.map((doctor: Doctor) => (
                                  <div key={doctor._id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center space-x-3">
                                      <Stethoscope className="h-4 w-4 text-blue-600" />
                                      <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                          Dr. {doctor.userId?.name}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                          {doctor.email} • {doctor.gender}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="flex items-center space-x-4">
                                        <div>
                                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            Allocated: {doctor.testMetrics.testsAllocated}
                                          </p>

                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                            Done: {doctor.testMetrics.testsDone}
                                          </p>
                                          <p className="text-xs text-orange-600 dark:text-orange-400">
                                            Remaining: {doctor.testMetrics.testsRemaining}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Allocate Tests Modal */}
      <Dialog open={allocateModal.open} onOpenChange={open => setAllocateModal({ open, centre: open ? allocateModal.centre : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate Tests to {allocateModal.centre?.userId?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="allocateCount">Number of Tests (use negative to de-allocate)</Label>
            <Input
              id="allocateCount"
              type="number"
              value={allocateCount}
              onChange={e => setAllocateCount(Number(e.target.value))}
              placeholder="Enter number of tests"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAllocateModal({ open: false, centre: null })}>Cancel</Button>
            <Button onClick={handleAllocateTests} disabled={allocateCount === 0}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}

export default SuperAdminDashboard