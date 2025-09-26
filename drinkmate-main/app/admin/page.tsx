"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { useAdminTranslation } from "@/lib/use-admin-translation"
import { useTranslation } from "@/lib/contexts/translation-context"
import AdminLayout from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/button"
import { RefreshCw, MessageSquare, LayoutDashboard } from "lucide-react"
import AdminChatDashboard from "@/components/chat/AdminChatDashboard"
import StatsCards from "@/components/admin/dashboard/StatsCards"
import ChartsSection from "@/components/admin/dashboard/ChartsSection"
import RecentDataTables from "@/components/admin/dashboard/RecentDataTables"
import { useDashboardData } from "@/hooks/use-dashboard-data"

export default function AdminDashboard() {
  const { t } = useAdminTranslation()
  const { isRTL } = useTranslation()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [isChatOpen, setIsChatOpen] = useState(false)
  
  const router = useRouter()

  // Use the custom hook for dashboard data
  const { stats, recentOrders, recentProducts, isLoading: isDataLoading, error, refresh } = useDashboardData()

  // Navigation handlers
  const handleViewOrder = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`)
  }

  const handleViewProduct = (productId: string) => {
    router.push(`/admin/products/${productId}`)
  }

  // Show loading state
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  // Show error state
  if (!isAuthenticated || !user || !user.isAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong className="font-bold">Access Denied!</strong>
              <span className="block sm:inline"> You don't have permission to access this page.</span>
            </div>
            <button
              onClick={() => router.push('/admin/login')}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Go to Login
            </button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8 p-4 md:p-6 relative z-10">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20"></div>
          <div className="relative p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-[#12d6fa] to-blue-600 rounded-xl shadow-lg">
                    <LayoutDashboard className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {t('admin.dashboard.title')}
                    </h1>
                    <p className="text-gray-600">
                      {t('admin.dashboard.subtitle')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={refresh}
                  disabled={isDataLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isDataLoading ? 'animate-spin' : ''}`} />
                  {t('admin.dashboard.refresh')}
                </Button>
                <Button
                  onClick={() => setIsChatOpen(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <MessageSquare className="h-4 w-4" />
                  {t('admin.dashboard.chat')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-400 mr-3">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
                <div>
                <h3 className="text-sm font-medium text-red-800">
                  {t('admin.dashboard.error.title')}
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <StatsCards stats={stats} isLoading={isDataLoading} />

        {/* Charts Section */}
        <ChartsSection isLoading={isDataLoading} />

        {/* Recent Data Tables */}
        <RecentDataTables
          recentOrders={recentOrders}
          recentProducts={recentProducts}
          isLoading={isDataLoading}
          onViewOrder={handleViewOrder}
          onViewProduct={handleViewProduct}
        />

        {/* Chat Dashboard Modal */}
        {isChatOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[80vh] m-4">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">
                  {t('admin.dashboard.chat.title')}
                </h2>
                <Button 
                  onClick={() => setIsChatOpen(false)}
                  variant="ghost"
                  size="sm" 
                >
                  ×
                </Button>
              </div>
              <div className="h-full">
                <AdminChatDashboard 
                  isOpen={isChatOpen} 
                  onClose={() => setIsChatOpen(false)} 
                />
              </div>
                  </div>
                </div>
              )}
      </div>
    </AdminLayout>
  )
}
