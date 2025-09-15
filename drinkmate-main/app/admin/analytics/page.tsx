"use client"

import { useState } from "react"
import AdminLayout from "@/components/layout/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import SaudiRiyal from "@/components/ui/SaudiRiyal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  Download, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  CreditCard,
  Map,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30days")
  
  // Sample data for charts
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue',
        data: [12500, 15800, 14200, 16800, 19300, 22200, 25100, 26800, 29500, 32200, 35800, 39500],
        borderColor: '#12d6fa',
        backgroundColor: 'rgba(18, 214, 250, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const ordersData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Orders',
        data: [85, 102, 98, 110, 125, 145, 158, 168, 182, 195, 210, 225],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const usersData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'New Users',
        data: [25, 32, 28, 35, 42, 48, 52, 58, 65, 72, 78, 85],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const categoryRevenueData = {
    labels: ['Soda Makers', 'Flavors', 'Accessories', 'CO2 Cylinders', 'Bundles'],
    datasets: [
      {
        label: 'Revenue by Category',
        data: [158000, 75000, 42000, 35000, 95000],
        backgroundColor: [
          'rgba(18, 214, 250, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(236, 72, 153, 0.7)'
        ],
        borderWidth: 0
      }
    ]
  }

  const topSellingProducts = {
    labels: ['OmniFizz', 'Luxe', 'Arctic Blue', 'Strawberry Lemon', 'Cola Flavor'],
    datasets: [
      {
        label: 'Units Sold',
        data: [350, 280, 220, 420, 380],
        backgroundColor: 'rgba(18, 214, 250, 0.7)',
        borderColor: 'rgba(18, 214, 250, 1)',
        borderWidth: 1
      }
    ]
  }

  const regionData = {
    labels: ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina', 'Other'],
    datasets: [
      {
        label: 'Orders by Region',
        data: [42, 28, 15, 12, 10, 18],
        backgroundColor: [
          'rgba(18, 214, 250, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(236, 72, 153, 0.7)',
          'rgba(148, 163, 184, 0.7)'
        ],
        borderWidth: 0
      }
    ]
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Premium Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#12d6fa]/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative z-10 p-6">
          {/* Premium Header */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20"></div>
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-[#12d6fa] to-blue-600 rounded-xl shadow-lg">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Analytics & Reporting
                      </h1>
                      <p className="text-gray-600 text-lg">
                        Comprehensive insights and performance metrics for your business
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">4</div>
                    <div className="text-sm text-gray-500">Key Metrics</div>
                  </div>
                  <div className="w-px h-12 bg-gray-300"></div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#12d6fa]">Live</div>
                    <div className="text-sm text-gray-500">Real-time Data</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[180px] border-2 border-gray-200 focus:border-[#12d6fa] focus:ring-4 focus:ring-[#12d6fa]/20 rounded-xl py-3 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-[#12d6fa]/50">
                      <SelectValue placeholder="Time Range" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
                      <SelectItem value="7days" className="rounded-lg">Last 7 Days</SelectItem>
                      <SelectItem value="30days" className="rounded-lg">Last 30 Days</SelectItem>
                      <SelectItem value="90days" className="rounded-lg">Last 90 Days</SelectItem>
                      <SelectItem value="year" className="rounded-lg">This Year</SelectItem>
                      <SelectItem value="alltime" className="rounded-lg">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline" 
                    className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2"
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Custom Range</span>
                  </Button>
                  
                  <Button 
                    className="bg-gradient-to-r from-[#12d6fa] to-blue-600 hover:from-[#12d6fa]/90 hover:to-blue-600/90 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    Export Report
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live Data</span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="flex items-center text-sm font-medium text-green-600">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    +12.5%
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    <SaudiRiyal amount={405250} size="xl" />
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Compared to <SaudiRiyal amount={360000} size="sm" /> last year</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl">
                    <ShoppingBag className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="flex items-center text-sm font-medium text-green-600">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    +8.2%
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">Total Orders</p>
                  <h3 className="text-2xl font-bold text-gray-800">1,648</h3>
                  <p className="text-xs text-gray-500 mt-1">Compared to 1,523 last year</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="flex items-center text-sm font-medium text-green-600">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    +15.3%
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <h3 className="text-2xl font-bold text-gray-800">620</h3>
                  <p className="text-xs text-gray-500 mt-1">Compared to 538 last year</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-amber-600" />
                  </div>
                  <span className="flex items-center text-sm font-medium text-red-600">
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                    -2.4%
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
                  <h3 className="text-2xl font-bold text-gray-800">3.2%</h3>
                  <p className="text-xs text-gray-500 mt-1">Compared to 3.3% last year</p>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Charts Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30"></div>
            <div className="relative overflow-hidden rounded-2xl">
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-[#12d6fa] to-blue-600 rounded-xl shadow-lg">
                      <TrendingUp className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">Analytics Dashboard</h2>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#12d6fa] rounded-full animate-pulse"></div>
                          <span className="text-gray-300">Real-time performance metrics</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6">
                <Tabs defaultValue="revenue" className="mb-8">
                  <TabsList className="grid w-full grid-cols-3 mb-4 bg-gray-100 rounded-xl p-1">
                    <TabsTrigger 
                      value="revenue" 
                      className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-300"
                    >
                      Revenue
                    </TabsTrigger>
                    <TabsTrigger 
                      value="orders" 
                      className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-300"
                    >
                      Orders
                    </TabsTrigger>
                    <TabsTrigger 
                      value="users" 
                      className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-300"
                    >
                      Users
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="revenue">
                    <Card>
                      <CardHeader>
                        <CardTitle>Revenue Over Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <Line 
                            data={revenueData} 
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: {
                                    callback: (value: any) => `﷼${Number(value)/1000}k`
                                  }
                                }
                              },
                              plugins: {
                                tooltip: {
                                  callbacks: {
                                    label: (context: any) => `﷼${context.parsed.y.toLocaleString()}`
                                  }
                                }
                              }
                            }} 
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="orders">
                    <Card>
                      <CardHeader>
                        <CardTitle>Orders Over Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <Line 
                            data={ordersData} 
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              scales: {
                                y: {
                                  beginAtZero: true
                                }
                              }
                            }} 
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="users">
                    <Card>
                      <CardHeader>
                        <CardTitle>New Users Over Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <Line 
                            data={usersData} 
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              scales: {
                                y: {
                                  beginAtZero: true
                                }
                              }
                            }} 
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Secondary Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Revenue by Category</h3>
                </div>
                <div className="h-80">
                  <Bar 
                    data={categoryRevenueData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value: any) => `﷼${Number(value)/1000}k`
                          }
                        }
                      },
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: (context: any) => `﷼${context.parsed.y.toLocaleString()}`
                          }
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl">
                    <ShoppingBag className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Top Selling Products</h3>
                </div>
                <div className="h-80">
                  <Bar 
                    data={topSellingProducts} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      indexAxis: 'y',
                      scales: {
                        x: {
                          beginAtZero: true
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl">
                    <Map className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Orders by Region</h3>
                </div>
                <div className="h-80 flex items-center justify-center">
                  <div className="w-64">
                    <Doughnut 
                      data={regionData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom'
                          }
                        }
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl">
                      <Map className="h-5 w-5 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Geographic Distribution</h3>
                  </div>
                  <Button variant="outline" size="sm" className="border-2 border-gray-300 hover:border-amber-500 hover:bg-amber-50 rounded-lg">
                    <Map className="h-4 w-4 mr-2" />
                    View Map
                  </Button>
                </div>
                <div className="space-y-4">
                  {[
                    { region: "Riyadh", percentage: 42, color: "bg-blue-500" },
                    { region: "Jeddah", percentage: 28, color: "bg-green-500" },
                    { region: "Dammam", percentage: 15, color: "bg-purple-500" },
                    { region: "Mecca", percentage: 12, color: "bg-orange-500" },
                    { region: "Medina", percentage: 10, color: "bg-pink-500" },
                    { region: "Other Cities", percentage: 18, color: "bg-gray-400" }
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{item.region}</span>
                        <span className="text-sm text-gray-500">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${item.color} h-2 rounded-full progress-width`} 
                          style={{ '--progress-width': `${item.percentage}%` } as React.CSSProperties}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
