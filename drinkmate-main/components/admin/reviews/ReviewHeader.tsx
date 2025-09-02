"use client"

import { Button } from "@/components/ui/button"
import {
  Plus,
  Upload,
  FileText,
  Shield,
  Zap,
  Activity,
  BarChart3,
  Filter,
  Download,
  MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ReviewHeaderProps {
  onCreateReview: () => void
  onBulkImport: () => void
  onShowTemplates: () => void
  onShowModeration: () => void
  onShowWorkflow: () => void
  onShowReports: () => void
  onToggleAnalytics: () => void
  onToggleFilters: () => void
  onExport: () => void
  showAnalytics: boolean
  showAdvancedFilters: boolean
}

export default function ReviewHeader({
  onCreateReview,
  onBulkImport,
  onShowTemplates,
  onShowModeration,
  onShowWorkflow,
  onShowReports,
  onToggleAnalytics,
  onToggleFilters,
  onExport,
  showAnalytics,
  showAdvancedFilters,
}: ReviewHeaderProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
          <p className="text-gray-600 mt-1">Manage product and bundle reviews efficiently</p>
        </div>

        <Button onClick={onCreateReview} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Create Review
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Primary Actions Group */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onBulkImport} size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={onExport} size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant={showAdvancedFilters ? "default" : "outline"} onClick={onToggleFilters} size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant={showAnalytics ? "default" : "outline"} onClick={onToggleAnalytics} size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="w-4 h-4 mr-2" />
              More Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onShowTemplates}>
              <FileText className="w-4 h-4 mr-2" />
              Response Templates
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onShowReports}>
              <Activity className="w-4 h-4 mr-2" />
              Generate Reports
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onShowModeration}>
              <Shield className="w-4 h-4 mr-2" />
              Moderation Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onShowWorkflow}>
              <Zap className="w-4 h-4 mr-2" />
              Workflow Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
