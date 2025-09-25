"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import AdminLayout from "@/components/layout/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  Calendar,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react"
import { toast } from "sonner"

interface AuditLog {
  eventId: string
  timestamp: string
  category: string
  type: string
  userId?: string
  email?: string
  ip?: string
  userAgent?: string
  success: boolean
  severity: string
  details: any
  resource?: string
  action?: string
  method?: string
  path?: string
  statusCode?: number
  responseTime?: number
}

export default function AuditLogsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Authentication check
  useEffect(() => {
    if (isLoading) return
    
    if (!isAuthenticated || !user || !user.isAdmin) {
      router.push('/admin/login')
      return
    }
  }, [user, isAuthenticated, isLoading, router])

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/audit-logs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
        setTotalPages(data.totalPages || 1)
      } else {
        toast.error('Failed to fetch audit logs')
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      toast.error('Failed to fetch audit logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditLogs()
  }, [currentPage])

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userId?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === "all" || log.category === categoryFilter
    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter
    
    return matchesSearch && matchesCategory && matchesSeverity
  })

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'ERROR': return <XCircle className="w-4 h-4 text-red-500" />
      case 'WARNING': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'INFO': return <Info className="w-4 h-4 text-blue-500" />
      default: return <CheckCircle className="w-4 h-4 text-green-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'ERROR': return 'bg-red-100 text-red-800'
      case 'WARNING': return 'bg-yellow-100 text-yellow-800'
      case 'INFO': return 'bg-blue-100 text-blue-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Category', 'Type', 'User', 'IP', 'Success', 'Severity', 'Details'],
      ...filteredLogs.map(log => [
        log.timestamp,
        log.category,
        log.type,
        log.email || log.userId || 'N/A',
        log.ip || 'N/A',
        log.success ? 'Yes' : 'No',
        log.severity,
        JSON.stringify(log.details)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Audit Logs</h1>
            <p className="text-gray-600">Monitor system activity and security events</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchAuditLogs} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportLogs} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                    <SelectItem value="AUTHORIZATION">Authorization</SelectItem>
                    <SelectItem value="DATA_ACCESS">Data Access</SelectItem>
                    <SelectItem value="DATA_MODIFICATION">Data Modification</SelectItem>
                    <SelectItem value="SECURITY">Security</SelectItem>
                    <SelectItem value="SYSTEM">System</SelectItem>
                    <SelectItem value="ADMIN_ACTION">Admin Action</SelectItem>
                    <SelectItem value="PAYMENT">Payment</SelectItem>
                    <SelectItem value="API_ACCESS">API Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Severity</label>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="ERROR">Error</SelectItem>
                    <SelectItem value="WARNING">Warning</SelectItem>
                    <SelectItem value="INFO">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Date Range</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Logs ({filteredLogs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Success</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.eventId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.category}</Badge>
                      </TableCell>
                      <TableCell>{log.type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {log.email || log.userId || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>{log.ip || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={log.success ? "default" : "destructive"}>
                          {log.success ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(log.severity)}>
                          <div className="flex items-center gap-1">
                            {getSeverityIcon(log.severity)}
                            {log.severity}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedLog(log)
                            setShowDetails(true)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Log Details Modal */}
        {showDetails && selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Log Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                  className="absolute right-4 top-4"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Event ID</label>
                    <p className="text-sm text-gray-600">{selectedLog.eventId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Timestamp</label>
                    <p className="text-sm text-gray-600">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <p className="text-sm text-gray-600">{selectedLog.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <p className="text-sm text-gray-600">{selectedLog.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">User</label>
                    <p className="text-sm text-gray-600">{selectedLog.email || selectedLog.userId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">IP Address</label>
                    <p className="text-sm text-gray-600">{selectedLog.ip || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Success</label>
                    <p className="text-sm text-gray-600">{selectedLog.success ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Severity</label>
                    <p className="text-sm text-gray-600">{selectedLog.severity}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Details</label>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
