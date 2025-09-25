/**
 * Error display component for admin pages
 */

import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  RefreshCw, 
  X, 
  Info, 
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { AdminError } from '@/lib/admin-error-handler'

interface AdminErrorDisplayProps {
  error: AdminError | null
  onRetry?: () => void
  onDismiss?: () => void
  showDetails?: boolean
  className?: string
}

export function AdminErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss, 
  showDetails = false,
  className = ""
}: AdminErrorDisplayProps) {
  if (!error) return null

  const getSeverityIcon = (severity: AdminError['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'high':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'low':
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: AdminError['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 bg-red-50'
      case 'high':
        return 'border-red-200 bg-red-50'
      case 'medium':
        return 'border-yellow-200 bg-yellow-50'
      case 'low':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getCategoryBadge = (category: AdminError['category']) => {
    const categoryColors = {
      network: 'bg-blue-100 text-blue-800',
      validation: 'bg-yellow-100 text-yellow-800',
      auth: 'bg-red-100 text-red-800',
      permission: 'bg-purple-100 text-purple-800',
      server: 'bg-orange-100 text-orange-800',
      unknown: 'bg-gray-100 text-gray-800'
    }

    return (
      <Badge className={categoryColors[category] || categoryColors.unknown}>
        {category.toUpperCase()}
      </Badge>
    )
  }

  return (
    <Card className={`border-l-4 border-l-red-500 ${getSeverityColor(error.severity)} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {getSeverityIcon(error.severity)}
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {error.severity === 'critical' ? 'Critical Error' : 
                 error.severity === 'high' ? 'Error' :
                 error.severity === 'medium' ? 'Warning' : 'Info'}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                {getCategoryBadge(error.category)}
                <span className="text-sm text-gray-500">
                  {new Date(error.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <Alert className="mb-4">
          <AlertDescription className="text-gray-700">
            {error.message}
          </AlertDescription>
        </Alert>

        {showDetails && error.details && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Error Details:</h4>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-32">
              {JSON.stringify(error.details, null, 2)}
            </pre>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Error Code: <code className="bg-gray-200 px-1 rounded">{error.code}</code>
          </div>
          
          {error.retryable && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Compact error display for inline use
 */
export function AdminErrorInline({ 
  error, 
  onRetry, 
  onDismiss,
  className = ""
}: AdminErrorDisplayProps) {
  if (!error) return null

  return (
    <Alert className={`${className}`}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error.message}</span>
        <div className="flex items-center space-x-2">
          {error.retryable && onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-xs"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}

/**
 * Error statistics display
 */
interface AdminErrorStatsProps {
  stats: {
    total: number
    bySeverity: Record<string, number>
    byCategory: Record<string, number>
    recent: AdminError[]
  }
  onClearLog?: () => void
  className?: string
}

export function AdminErrorStats({ 
  stats, 
  onClearLog, 
  className = "" 
}: AdminErrorStatsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Error Statistics</CardTitle>
          {onClearLog && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearLog}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Clear Log
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Errors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.bySeverity.critical || 0}
            </div>
            <div className="text-sm text-gray-500">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.bySeverity.high || 0}
            </div>
            <div className="text-sm text-gray-500">High</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.bySeverity.medium || 0}
            </div>
            <div className="text-sm text-gray-500">Medium</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Recent Errors:</h4>
          {stats.recent.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              No recent errors
            </div>
          ) : (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {stats.recent.slice(0, 5).map((error, index) => (
                <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                  <span className="truncate">{error.message}</span>
                  <Badge variant="outline" className="ml-2">
                    {error.severity}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
