"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { useChartData } from "@/hooks/use-chart-data"
import RefreshButton from "@/components/admin/RefreshButton"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
)

interface ChartsSectionProps {
  isLoading: boolean
}

export default function ChartsSection({ isLoading }: ChartsSectionProps) {
  const { chartData, isLoading: isChartLoading, error, refresh } = useChartData()

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  }

  if (isLoading || isChartLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Chart Data Error</CardTitle>
              <RefreshButton onRefresh={refresh} isLoading={isChartLoading} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">Failed to load chart data: {error}</p>
              <RefreshButton onRefresh={refresh} isLoading={isChartLoading} />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!chartData) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>No Chart Data</CardTitle>
              <RefreshButton onRefresh={refresh} isLoading={isChartLoading} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No chart data available</p>
              <RefreshButton onRefresh={refresh} isLoading={isChartLoading} />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sales Trend</CardTitle>
            <RefreshButton onRefresh={refresh} isLoading={isChartLoading} size="sm" variant="ghost" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Line data={chartData.salesTrend} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Orders by Month</CardTitle>
            <RefreshButton onRefresh={refresh} isLoading={isChartLoading} size="sm" variant="ghost" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Bar data={chartData.ordersByMonth} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sales by Category</CardTitle>
            <RefreshButton onRefresh={refresh} isLoading={isChartLoading} size="sm" variant="ghost" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Doughnut data={chartData.salesByCategory} options={doughnutOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}