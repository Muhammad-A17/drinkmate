"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/contexts/auth-context"

interface ChartData {
  salesTrend: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      borderColor: string
      backgroundColor: string
      fill: boolean
      tension: number
    }>
  }
  ordersByMonth: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      backgroundColor: string
      borderColor: string
      borderWidth: number
    }>
  }
  salesByCategory: {
    labels: string[]
    datasets: Array<{
      data: number[]
      backgroundColor: string[]
      borderColor: string[]
      borderWidth: number
    }>
  }
}

interface UseChartDataReturn {
  chartData: ChartData | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useChartData(): UseChartDataReturn {
  const { token } = useAuth()
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<number>(0)
  const FETCH_THROTTLE = 10000 // 10 seconds minimum between fetches

  const fetchChartData = useCallback(async () => {
    try {
      // Throttle requests to prevent rate limiting
      const now = Date.now()
      if (now - lastFetch < FETCH_THROTTLE) {
        return
      }
      
      setIsLoading(true)
      setError(null)
      setLastFetch(now)
      
      const response = await fetch('/api/admin/chart-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch chart data (${response.status})`)
      }

      const data = await response.json()
      
      if (data.success && data.data) {
        setChartData(data.data)
      } else {
        throw new Error('Invalid chart data response format')
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch chart data')
      // Set default empty data on error
      setChartData({
        salesTrend: {
          labels: [],
          datasets: [{
            label: 'Sales (SAR)',
            data: [],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        ordersByMonth: {
          labels: [],
          datasets: [{
            label: 'Orders',
            data: [],
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 1
          }]
        },
        salesByCategory: {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1
          }]
        }
      })
    } finally {
      setIsLoading(false)
    }
  }, [token, lastFetch])

  useEffect(() => {
    if (token) {
      fetchChartData()
    }
  }, [token]) // Remove fetchChartData from dependencies to prevent infinite loop

  return {
    chartData,
    isLoading,
    error,
    refresh: fetchChartData
  }
}
