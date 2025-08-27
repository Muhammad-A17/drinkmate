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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Analytics & Reporting</h1>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="alltime">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Custom Range</span>
          </Button>
          <Button className="bg-[#12d6fa] hover:bg-[#0fb8d9]">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-blue-100 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <span className={`flex items-center text-sm font-medium text-green-600`}>
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
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-green-100 p-3 rounded-full">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <span className={`flex items-center text-sm font-medium text-green-600`}>
                <ArrowUpRight className="h-4 w-4 mr-1" />
                +8.2%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-800">1,648</h3>
              <p className="text-xs text-gray-500 mt-1">Compared to 1,523 last year</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <span className={`flex items-center text-sm font-medium text-green-600`}>
                <ArrowUpRight className="h-4 w-4 mr-1" />
                +15.3%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-800">620</h3>
              <p className="text-xs text-gray-500 mt-1">Compared to 538 last year</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-amber-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <span className={`flex items-center text-sm font-medium text-red-600`}>
                <ArrowDownRight className="h-4 w-4 mr-1" />
                -2.4%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
              <h3 className="text-2xl font-bold text-gray-800">3.2%</h3>
              <p className="text-xs text-gray-500 mt-1">Compared to 3.3% last year</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <Tabs defaultValue="revenue" className="mb-8">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
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

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Orders by Region</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Geographic Distribution</CardTitle>
            <Button variant="outline" size="sm">
              <Map className="h-4 w-4 mr-2" />
              View Map
            </Button>
          </CardHeader>
          <CardContent>
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
                      className={`${item.color} h-2 rounded-full`} 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
