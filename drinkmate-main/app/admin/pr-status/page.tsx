"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/translation-context"
import AdminLayout from "@/components/layout/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  GitPullRequest, 
  Clock, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  RefreshCw,
  Eye,
  GitMerge,
  AlertCircle,
  User,
  Calendar,
  Hash
} from "lucide-react"

interface PullRequest {
  id: number
  number: number
  title: string
  state: "open" | "closed" | "merged"
  draft: boolean
  created_at: string
  updated_at: string
  user: {
    login: string
    avatar_url: string
  }
  html_url: string
  head: {
    ref: string
  }
  base: {
    ref: string
  }
  assignees: Array<{
    login: string
  }>
  requested_reviewers: Array<{
    login: string
  }>
}

const PRStatusPage = () => {
  const { user, isLoading } = useAuth()
  const { language, t } = useTranslation()
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchPullRequests = async () => {
    setIsDataLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/pr-status')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch pull requests')
      }
      
      setPullRequests(result.data.pullRequests)
      setLastUpdated(new Date(result.data.lastUpdated))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pull requests')
    } finally {
      setIsDataLoading(false)
    }
  }

  useEffect(() => {
    if (user?.isAdmin) {
      fetchPullRequests()
    }
  }, [user])

  const getStatusIcon = (pr: PullRequest) => {
    if (pr.draft) return <Clock className="h-4 w-4 text-yellow-600" />
    if (pr.state === 'closed') return <XCircle className="h-4 w-4 text-red-600" />
    if (pr.state === 'merged') return <GitMerge className="h-4 w-4 text-purple-600" />
    return <CheckCircle className="h-4 w-4 text-green-600" />
  }

  const getStatusBadge = (pr: PullRequest) => {
    if (pr.draft) return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Draft</Badge>
    if (pr.state === 'closed') return <Badge variant="destructive">Closed</Badge>
    if (pr.state === 'merged') return <Badge className="bg-purple-600">Merged</Badge>
    return <Badge className="bg-green-600">Open</Badge>
  }

  const getStatusColor = (pr: PullRequest) => {
    if (pr.draft) return 'border-l-yellow-400'
    if (pr.state === 'closed') return 'border-l-red-400'
    if (pr.state === 'merged') return 'border-l-purple-400'
    return 'border-l-green-400'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'AR' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    )
  }

  if (!user || !user.isAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Access denied. Admin privileges required.
            </AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    )
  }

  const openPRs = pullRequests.filter(pr => pr.state === 'open')
  const draftPRs = pullRequests.filter(pr => pr.draft)
  const readyForReview = pullRequests.filter(pr => pr.state === 'open' && !pr.draft)

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <GitPullRequest className="h-8 w-8 text-blue-600" />
              {language === 'AR' ? 'حالة طلبات السحب' : 'Pull Request Status'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {language === 'AR' ? 'مراقبة ومراجعة طلبات السحب' : 'Monitor and manage pull requests'}
            </p>
          </div>
          
          <Button onClick={fetchPullRequests} disabled={isDataLoading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${isDataLoading ? 'animate-spin' : ''}`} />
            {language === 'AR' ? 'تحديث' : 'Refresh'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {language === 'AR' ? 'المجموع' : 'Total PRs'}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">{pullRequests.length}</p>
                </div>
                <GitPullRequest className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {language === 'AR' ? 'مفتوحة' : 'Open'}
                  </p>
                  <p className="text-2xl font-bold text-green-600">{openPRs.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {language === 'AR' ? 'مسودة' : 'Draft'}
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">{draftPRs.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {language === 'AR' ? 'جاهزة للمراجعة' : 'Ready for Review'}
                  </p>
                  <p className="text-2xl font-bold text-purple-600">{readyForReview.length}</p>
                </div>
                <Eye className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {language === 'AR' ? 'آخر تحديث: ' : 'Last updated: '}
            {formatDate(lastUpdated.toISOString())}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Pull Requests List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'AR' ? 'طلبات السحب' : 'Pull Requests'}
          </h2>
          
          {isDataLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
              <span className="text-gray-600">{language === 'AR' ? 'جاري التحميل...' : 'Loading...'}</span>
            </div>
          ) : pullRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <GitPullRequest className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {language === 'AR' ? 'لا توجد طلبات سحب' : 'No pull requests found'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pullRequests.map((pr) => (
                <Card key={pr.id} className={`border-l-4 ${getStatusColor(pr)} hover:shadow-md transition-shadow`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Title and Status */}
                        <div className="flex items-start gap-3">
                          {getStatusIcon(pr)}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {pr.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Hash className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400 text-sm">
                                #{pr.number}
                              </span>
                              {getStatusBadge(pr)}
                            </div>
                          </div>
                        </div>

                        {/* Branch Info */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-xs">
                            {pr.head.ref}
                          </span>
                          <span>→</span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-mono text-xs">
                            {pr.base.ref}
                          </span>
                        </div>

                        {/* Author and Dates */}
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{pr.user.login}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {language === 'AR' ? 'أنشئت: ' : 'Created: '}
                              {formatDate(pr.created_at)}
                            </span>
                          </div>
                          {pr.created_at !== pr.updated_at && (
                            <div className="flex items-center gap-2">
                              <span>
                                {language === 'AR' ? 'محدثة: ' : 'Updated: '}
                                {formatDate(pr.updated_at)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Assignees and Reviewers */}
                        {(pr.assignees.length > 0 || pr.requested_reviewers.length > 0) && (
                          <div className="flex items-center gap-4 text-sm">
                            {pr.assignees.length > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  {language === 'AR' ? 'المعينون:' : 'Assignees:'}
                                </span>
                                <div className="flex gap-1">
                                  {pr.assignees.map((assignee) => (
                                    <Badge key={assignee.login} variant="outline" className="text-xs">
                                      {assignee.login}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {pr.requested_reviewers.length > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  {language === 'AR' ? 'المراجعون:' : 'Reviewers:'}
                                </span>
                                <div className="flex gap-1">
                                  {pr.requested_reviewers.map((reviewer) => (
                                    <Badge key={reviewer.login} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                      {reviewer.login}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(pr.html_url, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {language === 'AR' ? 'عرض' : 'View'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default PRStatusPage