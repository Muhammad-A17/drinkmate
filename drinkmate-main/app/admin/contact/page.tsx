"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Building,
  Eye,
  Trash2,
  Download,
  UserPlus,
  Archive,
  Star,
  Plus,
  FileText,
  BarChart3,
  Settings,
  Zap,
  Bell,
  TrendingUp,
  Target,
  Users,
  Activity,
  Edit,
  Search,
  Filter,
  RefreshCw,
  X,
  Save,
  Upload,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Shield,
  MessageSquare,
  Phone,
  Globe,
  Calendar,
  Tag,
  ThumbsUp,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  User,
  Mail as MailIcon,
  Phone as PhoneIcon,
  MapPin,
  ExternalLink
} from "lucide-react"
import { contactAPI } from "@/lib/api"
import { sanitizeInput, sanitizeHtml } from "@/lib/api/protected-api"
import { toast } from "sonner"

interface ContactMessage {
  _id: string
  name: string
  email: string
  phone?: string
  company?: string
  subject: string
  message: string
  status: "new" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  assignedTo?: string
  source?: "website" | "email" | "phone" | "social" | "referral"
  tags: string[]
  starred: boolean
  response?: {
    text: string
    sentAt: string
    sentBy: string
  }
  notes: Array<{
    text: string
    createdBy: string
    createdAt: string
  }>
  followUpDate?: string
  responseTime?: number
  createdAt: string
}

const EMAIL_TEMPLATES = [
  {
    id: "welcome",
    name: "Welcome Response",
    subject: "Thank you for contacting us",
    content:
      "Thank you for reaching out to us. We have received your message and will get back to you within 24 hours.",
    category: "general"
  },
  {
    id: "followup",
    name: "Follow-up",
    subject: "Following up on your inquiry",
    content:
      "We wanted to follow up on your recent inquiry. Please let us know if you need any additional information.",
    category: "followup"
  },
  {
    id: "resolved",
    name: "Issue Resolved",
    subject: "Your issue has been resolved",
    content:
      "We are pleased to inform you that your issue has been resolved. If you have any further questions, please don't hesitate to contact us.",
    category: "resolution"
  },
  {
    id: "escalation",
    name: "Escalation Notice",
    subject: "Your inquiry has been escalated",
    content:
      "Thank you for your patience. Your inquiry has been escalated to our senior support team for immediate attention.",
    category: "escalation"
  },
  {
    id: "product_info",
    name: "Product Information",
    subject: "Product Information Request",
    content:
      "Thank you for your interest in our products. Here is the detailed information you requested about our offerings.",
    category: "sales"
  },
  {
    id: "pricing",
    name: "Pricing Inquiry",
    subject: "Pricing Information",
    content:
      "Thank you for your interest in our pricing. I'll connect you with our sales team who can provide detailed pricing information.",
    category: "sales"
  }
]

const QUICK_ACTIONS = [
  { id: "mark_urgent", label: "Mark as Urgent", icon: "AlertCircle", color: "text-red-600" },
  { id: "assign_me", label: "Assign to Me", icon: "UserPlus", color: "text-blue-600" },
  { id: "schedule_followup", label: "Schedule Follow-up", icon: "Clock", color: "text-yellow-600" },
  { id: "add_note", label: "Add Note", icon: "FileText", color: "text-green-600" },
  { id: "star", label: "Star Message", icon: "Star", color: "text-yellow-500" },
  { id: "archive", label: "Archive", icon: "Archive", color: "text-gray-600" }
]

export default function ContactPage() {
  const [contacts, setContacts] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [selectedSource, setSelectedSource] = useState("all")
  const [selectedAssignee, setSelectedAssignee] = useState("all")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isAddingResponse, setIsAddingResponse] = useState(false)
  
  // Advanced filtering states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [companyFilter, setCompanyFilter] = useState("")
  const [responseTimeFilter, setResponseTimeFilter] = useState("all")
  const [savedFilters, setSavedFilters] = useState<Array<{name: string, filters: any}>>([])
  const [activeSavedFilter, setActiveSavedFilter] = useState("")
  
  // Analytics and reporting states
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [analyticsPeriod, setAnalyticsPeriod] = useState("7d")
  const [showReports, setShowReports] = useState(false)
  
  // Automation states
  const [showAutomation, setShowAutomation] = useState(false)
  const [automationRules, setAutomationRules] = useState<Array<{
    id: string
    name: string
    condition: string
    action: string
    enabled: boolean
  }>>([])
  
  // Workflow states
  const [showWorkflow, setShowWorkflow] = useState(false)
  const [escalationRules, setEscalationRules] = useState<Array<{
    id: string
    name: string
    trigger: string
    action: string
    enabled: boolean
  }>>([])
  
  // Notifications states
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState({
    newMessage: true,
    urgentMessage: true,
    overdueFollowup: true,
    teamMention: true,
    emailNotifications: true,
    pushNotifications: false
  })
  
  // Email integration states
  const [showEmailIntegration, setShowEmailIntegration] = useState(false)
  const [emailSettings, setEmailSettings] = useState({
    provider: "gmail", // gmail, outlook, custom
    connected: false,
    autoSync: true,
    syncInterval: "5m", // 5m, 15m, 30m, 1h
    importHistory: false
  })
  const [emailAccounts, setEmailAccounts] = useState<Array<{
    id: string
    email: string
    provider: string
    status: "connected" | "disconnected" | "error"
    lastSync: string
  }>>([])
  
  // CRM integration states
  const [showCRMIntegration, setShowCRMIntegration] = useState(false)
  const [crmSettings, setCrmSettings] = useState({
    provider: "hubspot", // hubspot, salesforce, pipedrive, custom
    connected: false,
    autoSync: true,
    syncContacts: true,
    syncDeals: false,
    syncActivities: true
  })
  const [crmAccounts, setCrmAccounts] = useState<Array<{
    id: string
    name: string
    provider: string
    status: "connected" | "disconnected" | "error"
    lastSync: string
    contactCount: number
  }>>([])
  
  // Customer profiles states
  const [showCustomerProfiles, setShowCustomerProfiles] = useState(false)
  const [customerProfiles, setCustomerProfiles] = useState<Array<{
    id: string
    name: string
    email: string
    company: string
    totalContacts: number
    lastContact: string
    status: "active" | "inactive" | "vip"
    tags: string[]
    notes: string
  }>>([])
  const [statusUpdate, setStatusUpdate] = useState<{
    status: "new" | "in_progress" | "resolved" | "closed"
    priority: "low" | "medium" | "high" | "urgent"
    assignedTo?: string
  }>({ status: "new", priority: "low" })
  const [responseText, setResponseText] = useState("")
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [newNote, setNewNote] = useState("")
  const [followUpDate, setFollowUpDate] = useState("")
  const [newTag, setNewTag] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [assignTo, setAssignTo] = useState("")

  const teamMembers = [
    { id: "admin", name: "Admin" },
    { id: "john", name: "John Smith" },
    { id: "sarah", name: "Sarah Johnson" },
    { id: "mike", name: "Mike Davis" },
  ]

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const response = await contactAPI.getAllContacts({ limit: 100 })
      if (response.success && response.contacts) {
        setContacts(response.contacts)
        toast.success(`Loaded ${response.contacts.length} contact messages successfully`)
      } else {
        console.error("Failed to fetch contacts:", response.message)
        toast.error(response.message || "Failed to load contact messages from API")
        setContacts([]) // Set to empty array on failure
      }
    } catch (error) {
      console.error("Error fetching contacts:", error)
      toast.error("Failed to fetch contact messages")
      setContacts([]) // Set to empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedContacts.length === 0) {
      toast.error("Please select contacts first")
      return
    }

    try {
      let response
      switch (action) {
        case "mark_resolved":
          response = await contactAPI.bulkUpdateContacts(selectedContacts, { status: "resolved" })
          if (response.success) {
            toast.success(`Marked ${selectedContacts.length} contacts as resolved`)
          } else {
            toast.error(response.message || "Failed to update contacts")
            return
          }
          break
        case "assign":
          if (!assignTo) {
            toast.error("Please select an assignee")
            return
          }
          response = await contactAPI.bulkUpdateContacts(selectedContacts, { assignedTo: assignTo })
          if (response.success) {
            toast.success(
              `Assigned ${selectedContacts.length} contacts to ${teamMembers.find((m) => m.id === assignTo)?.name}`,
            )
          } else {
            toast.error(response.message || "Failed to assign contacts")
            return
          }
          break
        case "archive":
          response = await contactAPI.bulkUpdateContacts(selectedContacts, { status: "closed" })
          if (response.success) {
            toast.success(`Archived ${selectedContacts.length} contacts`)
          } else {
            toast.error(response.message || "Failed to archive contacts")
            return
          }
          break
        case "delete":
          if (confirm(`Are you sure you want to delete ${selectedContacts.length} contacts?`)) {
            response = await contactAPI.bulkDeleteContacts(selectedContacts)
            if (response.success) {
              toast.success(`Deleted ${selectedContacts.length} contacts`)
            } else {
              toast.error(response.message || "Failed to delete contacts")
              return
            }
          }
          break
      }
      setSelectedContacts([])
      setShowBulkActions(false)
      fetchContacts()
    } catch (error) {
      console.error("Error performing bulk action:", error)
      toast.error("Failed to perform bulk action")
    }
  }

  const handleExport = async () => {
    try {
      const response = await contactAPI.exportContacts({
        status: selectedStatus,
        priority: selectedPriority,
        source: selectedSource,
        company: companyFilter,
        responseTime: responseTimeFilter,
        tags: selectedTags,
        dateRange: dateRange
      })
      if (response.success && response.downloadUrl) {
        // If the API provides a download URL, use it
        window.open(response.downloadUrl, '_blank')
        toast.success("Contacts exported successfully")
      } else if (response.success && response.data) {
        // If the API returns the data directly, create a download
        const csvContent = response.data
        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `contacts-${new Date().toISOString().split("T")[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success("Contacts exported successfully")
      } else {
        // Fallback to client-side export
        const csvContent = [
          ["Name", "Email", "Phone", "Company", "Subject", "Status", "Priority", "Source", "Created Date"],
          ...filteredContacts.map((contact) => [
            contact.name,
            contact.email,
            contact.phone || "",
            contact.company || "",
            contact.subject,
            contact.status,
            contact.priority,
            contact.source || "",
            new Date(contact.createdAt).toLocaleDateString(),
          ]),
        ]
          .map((row) => row.join(","))
          .join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `contacts-${new Date().toISOString().split("T")[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success("Contact data exported successfully")
      }
    } catch (error) {
      console.error("Error exporting contacts:", error)
      toast.error("Failed to export contacts")
    }
  }

  const handleQuickAction = (actionId: string, contact: ContactMessage) => {
    switch (actionId) {
      case "mark_urgent":
        setStatusUpdate({ ...statusUpdate, priority: "urgent" })
        toast.success("Marked as urgent")
        break
      case "assign_me":
        setStatusUpdate({ ...statusUpdate, assignedTo: "current-user" })
        toast.success("Assigned to you")
        break
      case "schedule_followup":
        setFollowUpDate(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '')
        toast.success("Follow-up scheduled")
        break
      case "add_note":
        setNewNote("")
        toast.success("Note field ready")
        break
      case "star":
        handleToggleStar(contact._id)
        break
      case "archive":
        setStatusUpdate({ ...statusUpdate, status: "closed" })
        toast.success("Archived")
        break
      default:
        break
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = EMAIL_TEMPLATES.find((t) => t.id === templateId)
    if (template) {
      setResponseText(template.content)
      setSelectedTemplate(templateId)
    }
  }

  // Analytics calculations
  const getAnalytics = () => {
    const now = new Date()
    const periodDays = analyticsPeriod === "7d" ? 7 : analyticsPeriod === "30d" ? 30 : 90
    const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)
    
    const periodContacts = contacts.filter(c => new Date(c.createdAt) >= startDate)
    
    return {
      totalMessages: periodContacts.length,
      newMessages: periodContacts.filter(c => c.status === "new").length,
      resolvedMessages: periodContacts.filter(c => c.status === "resolved").length,
      averageResponseTime: periodContacts.reduce((acc, c) => acc + (c.responseTime || 0), 0) / periodContacts.length || 0,
      resolutionRate: (periodContacts.filter(c => c.status === "resolved").length / periodContacts.length) * 100 || 0,
      urgentMessages: periodContacts.filter(c => c.priority === "urgent" || c.priority === "high").length,
      sourceBreakdown: {
        website: periodContacts.filter(c => c.source === "website").length,
        email: periodContacts.filter(c => c.source === "email").length,
        phone: periodContacts.filter(c => c.source === "phone").length,
        social: periodContacts.filter(c => c.source === "social").length,
        referral: periodContacts.filter(c => c.source === "referral").length
      },
      statusBreakdown: {
        new: periodContacts.filter(c => c.status === "new").length,
        inProgress: periodContacts.filter(c => c.status === "in_progress").length,
        resolved: periodContacts.filter(c => c.status === "resolved").length,
        closed: periodContacts.filter(c => c.status === "closed").length
      },
      priorityBreakdown: {
        low: periodContacts.filter(c => c.priority === "low").length,
        medium: periodContacts.filter(c => c.priority === "medium").length,
        high: periodContacts.filter(c => c.priority === "high").length,
        urgent: periodContacts.filter(c => c.priority === "urgent").length
      }
    }
  }

  // Generate reports
  const generateReport = (type: "summary" | "detailed" | "performance") => {
    const analytics = getAnalytics()
    const reportData = {
      type,
      period: analyticsPeriod,
      generatedAt: new Date().toISOString(),
      data: analytics
    }
    
    // In a real app, this would send to backend
    console.log("Generated report:", reportData)
    toast.success(`${type} report generated successfully`)
  }

  // Email integration handlers
  const connectEmailAccount = async (provider: string) => {
    try {
      // In a real app, this would handle OAuth flow
      const newAccount = {
        id: Date.now().toString(),
        email: `user@${provider}.com`,
        provider,
        status: "connected" as const,
        lastSync: new Date().toISOString()
      }
      setEmailAccounts([...emailAccounts, newAccount])
      setEmailSettings({...emailSettings, connected: true, provider})
      toast.success(`${provider} account connected successfully`)
    } catch (error) {
      toast.error("Failed to connect email account")
    }
  }

  const disconnectEmailAccount = (accountId: string) => {
    setEmailAccounts(emailAccounts.filter(acc => acc.id !== accountId))
    if (emailAccounts.length === 1) {
      setEmailSettings({...emailSettings, connected: false})
    }
    toast.success("Email account disconnected")
  }

  const syncEmailContacts = async () => {
    try {
      // In a real app, this would sync with email provider
      toast.success("Email contacts synced successfully")
    } catch (error) {
      toast.error("Failed to sync email contacts")
    }
  }

  // CRM integration handlers
  const connectCRMAccount = async (provider: string) => {
    try {
      // In a real app, this would handle OAuth flow
      const newAccount = {
        id: Date.now().toString(),
        name: `${provider} Account`,
        provider,
        status: "connected" as const,
        lastSync: new Date().toISOString(),
        contactCount: Math.floor(Math.random() * 1000) + 100
      }
      setCrmAccounts([...crmAccounts, newAccount])
      setCrmSettings({...crmSettings, connected: true, provider})
      toast.success(`${provider} CRM connected successfully`)
    } catch (error) {
      toast.error("Failed to connect CRM account")
    }
  }

  const disconnectCRMAccount = (accountId: string) => {
    setCrmAccounts(crmAccounts.filter(acc => acc.id !== accountId))
    if (crmAccounts.length === 1) {
      setCrmSettings({...crmSettings, connected: false})
    }
    toast.success("CRM account disconnected")
  }

  const syncCRMData = async () => {
    try {
      // In a real app, this would sync with CRM provider
      toast.success("CRM data synced successfully")
    } catch (error) {
      toast.error("Failed to sync CRM data")
    }
  }

  // Customer profile handlers
  const createCustomerProfile = (contact: ContactMessage) => {
    const newProfile = {
      id: Date.now().toString(),
      name: contact.name,
      email: contact.email,
      company: contact.company || "",
      totalContacts: 1,
      lastContact: contact.createdAt,
      status: "active" as const,
      tags: contact.tags || [],
      notes: ""
    }
    setCustomerProfiles([...customerProfiles, newProfile])
    toast.success("Customer profile created")
  }

  const updateCustomerProfile = (profileId: string, updates: any) => {
    setCustomerProfiles(customerProfiles.map(profile => 
      profile.id === profileId ? {...profile, ...updates} : profile
    ))
    toast.success("Customer profile updated")
  }

  const handleAddNote = async () => {
    if (!selectedContact || !newNote.trim()) return

    try {
      const updatedContact = {
        ...selectedContact,
        notes: [
          ...selectedContact.notes,
          {
            text: newNote,
            createdBy: "Admin",
            createdAt: new Date().toISOString(),
          },
        ],
      }
      setSelectedContact(updatedContact)
      setNewNote("")
      toast.success("Note added successfully")
    } catch (error) {
      toast.error("Failed to add note")
    }
  }

  const handleAddTag = async () => {
    if (!selectedContact || !newTag.trim()) return

    try {
      const updatedContact = {
        ...selectedContact,
        tags: [...selectedContact.tags, newTag],
      }
      setSelectedContact(updatedContact)
      setNewTag("")
      toast.success("Tag added successfully")
    } catch (error) {
      toast.error("Failed to add tag")
    }
  }

  const handleToggleStar = async (contactId: string) => {
    try {
      const updatedContacts = contacts.map((contact) =>
        contact._id === contactId ? { ...contact, starred: !contact.starred } : contact,
      )
      setContacts(updatedContacts)
      toast.success("Contact starred status updated")
    } catch (error) {
      toast.error("Failed to update star status")
    }
  }

  const handleViewContact = (contact: ContactMessage) => {
    setSelectedContact(contact)
    setStatusUpdate({ status: contact.status, priority: contact.priority })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact message?")) return

    try {
      await contactAPI.deleteContact(id)
      toast.success("Contact message deleted successfully")
      fetchContacts()
    } catch (error: any) {
      console.error("Error deleting contact:", error)
      toast.error(error.response?.data?.message || "Failed to delete contact message")
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedContact) return

    try {
      setIsUpdatingStatus(true)
      await contactAPI.updateContactStatus(selectedContact._id, statusUpdate)
      toast.success("Contact status updated successfully")
      fetchContacts()
      setSelectedContact({ ...selectedContact, ...statusUpdate })
    } catch (error: any) {
      console.error("Error updating contact status:", error)
      toast.error(error.response?.data?.message || "Failed to update contact status")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleAddResponse = async () => {
    if (!selectedContact || !responseText.trim()) return

    try {
      setIsAddingResponse(true)
      await contactAPI.addContactResponse(selectedContact._id, {
        responseText: responseText,
        sentBy: "Admin",
      })
      toast.success("Response added successfully")
      setResponseText("")
      setSelectedTemplate("")
      fetchContacts()
    } catch (error: any) {
      console.error("Error adding response:", error)
      toast.error(error.response?.data?.message || "Failed to add response")
    } finally {
      setIsAddingResponse(false)
    }
  }

  const handleViewDetails = (contact: ContactMessage) => {
    setSelectedContact(contact)
    setStatusUpdate({ status: contact.status, priority: contact.priority })
    setIsDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "default"
      case "in_progress":
        return "secondary"
      case "resolved":
        return "outline"
      case "closed":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "outline"
      case "medium":
        return "secondary"
      case "high":
        return "default"
      case "urgent":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case "website":
        return "default"
      case "email":
        return "secondary"
      case "phone":
        return "outline"
      case "social":
        return "destructive"
      case "referral":
        return "default"
      default:
        return "secondary"
    }
  }

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = selectedStatus === "all" || contact.status === selectedStatus
    const matchesPriority = selectedPriority === "all" || (contact.priority || "low") === selectedPriority
    const matchesSource = selectedSource === "all" || (contact.source || "website") === selectedSource
    const matchesAssignee = selectedAssignee === "all" || contact.assignedTo === selectedAssignee
    
    // Advanced filters
    const matchesDateRange = 
      (!dateRange.from || new Date(contact.createdAt) >= new Date(dateRange.from)) &&
      (!dateRange.to || new Date(contact.createdAt) <= new Date(dateRange.to))
    
    const matchesCompany = !companyFilter || 
      (contact.company && contact.company.toLowerCase().includes(companyFilter.toLowerCase()))
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => (contact.tags || []).includes(tag))
    
    const matchesResponseTime = responseTimeFilter === "all" || 
      (responseTimeFilter === "fast" && (contact.responseTime || 0) <= 2) ||
      (responseTimeFilter === "medium" && (contact.responseTime || 0) > 2 && (contact.responseTime || 0) <= 24) ||
      (responseTimeFilter === "slow" && (contact.responseTime || 0) > 24)

    return matchesSearch && matchesStatus && matchesPriority && matchesSource && 
           matchesAssignee && matchesDateRange && matchesCompany && matchesTags && matchesResponseTime
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading contact messages...</div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Premium Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 space-y-8 p-6">
          {/* Premium Header */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-8">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Contact Management
                    </h1>
                    <p className="text-gray-600 text-lg mt-2">View and manage customer contact messages</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                    <Activity className="w-4 h-4 mr-1" />
                    {contacts.length} Total Messages
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {contacts.filter(c => c.status === "resolved").length} Resolved
                  </span>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button onClick={handleExport} variant="outline" className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button 
                  onClick={() => setShowAnalytics(!showAnalytics)} 
                  variant={showAnalytics ? "default" : "outline"}
                  className={showAnalytics ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" : "border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all duration-300"}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
                <Button 
                  onClick={() => setShowReports(!showReports)} 
                  variant="outline"
                  className="border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-all duration-300"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Reports
                </Button>
                <Button 
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  disabled={selectedContacts.length === 0}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Bulk Actions ({selectedContacts.length})
                </Button>
              </div>
            </div>
          </div>

          {/* Premium Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Messages</p>
                  <p className="text-3xl font-bold text-gray-900">{contacts.length}</p>
                  <p className="text-xs text-gray-500 mt-1">All contacts</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Mail className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">New Messages</p>
                  <p className="text-3xl font-bold text-yellow-600">{contacts.filter((c) => c.status === "new").length}</p>
                  <p className="text-xs text-gray-500 mt-1">Unread messages</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">High Priority</p>
                  <p className="text-3xl font-bold text-red-600">
                    {contacts.filter((c) => c.priority === "high" || c.priority === "urgent").length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Urgent messages</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Resolved</p>
                  <p className="text-3xl font-bold text-green-600">{contacts.filter((c) => c.status === "resolved").length}</p>
                  <p className="text-xs text-gray-500 mt-1">Completed messages</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Starred</p>
                  <p className="text-3xl font-bold text-purple-600">{contacts.filter((c) => c.starred).length}</p>
                  <p className="text-xs text-gray-500 mt-1">Important messages</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Avg Response</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {Math.round(contacts.reduce((acc, c) => acc + (c.responseTime || 0), 0) / contacts.length) || 0}h
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Response time</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

        {/* Analytics Dashboard */}
        {showAnalytics && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Analytics Dashboard</CardTitle>
                <Select value={analyticsPeriod} onValueChange={setAnalyticsPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const analytics = getAnalytics()
                return (
                  <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Resolution Rate</p>
                              <p className="text-2xl font-bold text-green-600">
                                {analytics.resolutionRate.toFixed(1)}%
                              </p>
                            </div>
                            <Target className="h-8 w-8 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Avg Response Time</p>
                              <p className="text-2xl font-bold text-blue-600">
                                {analytics.averageResponseTime.toFixed(1)}h
                              </p>
                            </div>
                            <Clock className="h-8 w-8 text-blue-600" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Urgent Messages</p>
                              <p className="text-2xl font-bold text-red-600">
                                {analytics.urgentMessages}
                              </p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-red-600" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Total Messages</p>
                              <p className="text-2xl font-bold text-gray-600">
                                {analytics.totalMessages}
                              </p>
                            </div>
                            <Mail className="h-8 w-8 text-gray-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Breakdown Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Status Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {Object.entries(analytics.statusBreakdown).map(([status, count]) => (
                              <div key={status} className="flex items-center justify-between">
                                <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full progress-width" 
                                      style={{ '--progress-width': `${(count / analytics.totalMessages) * 100}%` } as React.CSSProperties}
                                    />
                                  </div>
                                  <span className="text-sm font-medium w-8">{count}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Source Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {Object.entries(analytics.sourceBreakdown).map(([source, count]) => (
                              <div key={source} className="flex items-center justify-between">
                                <span className="text-sm capitalize">{source}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-green-600 h-2 rounded-full progress-width" 
                                      style={{ '--progress-width': `${(count / analytics.totalMessages) * 100}%` } as React.CSSProperties}
                                    />
                                  </div>
                                  <span className="text-sm font-medium w-8">{count}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Priority Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {Object.entries(analytics.priorityBreakdown).map(([priority, count]) => (
                              <div key={priority} className="flex items-center justify-between">
                                <span className="text-sm capitalize">{priority}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full progress-width ${
                                        priority === 'urgent' ? 'bg-red-600' :
                                        priority === 'high' ? 'bg-orange-600' :
                                        priority === 'medium' ? 'bg-yellow-600' : 'bg-gray-600'
                                      }`}
                                      style={{ '--progress-width': `${(count / analytics.totalMessages) * 100}%` } as React.CSSProperties}
                                    />
                                  </div>
                                  <span className="text-sm font-medium w-8">{count}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        )}

        {/* Reports Section */}
        {showReports && (
          <Card>
            <CardHeader>
              <CardTitle>Generate Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => generateReport("summary")}>
                  <CardContent className="p-6 text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-semibold mb-1">Summary Report</h3>
                    <p className="text-sm text-gray-500">Overview of contact metrics and trends</p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => generateReport("detailed")}>
                  <CardContent className="p-6 text-center">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <h3 className="font-semibold mb-1">Detailed Report</h3>
                    <p className="text-sm text-gray-500">Comprehensive analysis with charts and insights</p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => generateReport("performance")}>
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <h3 className="font-semibold mb-1">Performance Report</h3>
                    <p className="text-sm text-gray-500">Team performance and response time analysis</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {showBulkActions && (
          <Card>
            <CardHeader>
              <CardTitle>Bulk Actions ({selectedContacts.length} selected)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => handleBulkAction("mark_resolved")} variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Resolved
                </Button>
                <div className="flex gap-2">
                  <Select value={assignTo} onValueChange={setAssignTo}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Assign to..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => handleBulkAction("assign")} variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign
                  </Button>
                </div>
                <Button onClick={() => handleBulkAction("archive")} variant="outline">
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
                <Button onClick={() => handleBulkAction("delete")} variant="outline" className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Automation Section */}
        {showAutomation && (
          <Card>
            <CardHeader>
              <CardTitle>Automation Rules</CardTitle>
              <p className="text-sm text-gray-600">Set up automatic responses and actions</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Active Rules</h4>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">Auto-respond to New Messages</h5>
                        <Checkbox defaultChecked />
                      </div>
                      <p className="text-sm text-gray-600">Send welcome message to new contacts</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">Escalate Urgent Messages</h5>
                        <Checkbox defaultChecked />
                      </div>
                      <p className="text-sm text-gray-600">Auto-assign urgent messages to senior team</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">Follow-up Reminders</h5>
                        <Checkbox />
                      </div>
                      <p className="text-sm text-gray-600">Send reminders for overdue follow-ups</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">Auto-tag by Keywords</h5>
                        <Checkbox defaultChecked />
                      </div>
                      <p className="text-sm text-gray-600">Automatically tag messages based on content</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workflow Section */}
        {showWorkflow && (
          <Card>
            <CardHeader>
              <CardTitle>Workflow Management</CardTitle>
              <p className="text-sm text-gray-600">Configure escalation and approval workflows</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Escalation Rules</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h6 className="font-medium">High Priority Timeout</h6>
                          <p className="text-sm text-gray-600">Escalate after 2 hours</p>
                        </div>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h6 className="font-medium">Weekend Escalation</h6>
                          <p className="text-sm text-gray-600">Auto-assign to on-call team</p>
                        </div>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h6 className="font-medium">Customer VIP Escalation</h6>
                          <p className="text-sm text-gray-600">Immediate escalation for VIP customers</p>
                        </div>
                        <Badge variant="secondary">Inactive</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Approval Workflows</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h6 className="font-medium">Refund Requests</h6>
                          <p className="text-sm text-gray-600">Requires manager approval</p>
                        </div>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h6 className="font-medium">Complaint Resolution</h6>
                          <p className="text-sm text-gray-600">Requires team lead review</p>
                        </div>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h6 className="font-medium">Feature Requests</h6>
                          <p className="text-sm text-gray-600">Route to product team</p>
                        </div>
                        <Badge variant="secondary">Inactive</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications Section */}
        {showNotifications && (
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <p className="text-sm text-gray-600">Configure how you receive notifications</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Email Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h6 className="font-medium">New Messages</h6>
                          <p className="text-sm text-gray-600">Get notified of new contact messages</p>
                        </div>
                        <Checkbox 
                          checked={notificationSettings.newMessage}
                          onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, newMessage: !!checked})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h6 className="font-medium">Urgent Messages</h6>
                          <p className="text-sm text-gray-600">Immediate notification for urgent messages</p>
                        </div>
                        <Checkbox 
                          checked={notificationSettings.urgentMessage}
                          onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, urgentMessage: !!checked})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h6 className="font-medium">Overdue Follow-ups</h6>
                          <p className="text-sm text-gray-600">Reminders for overdue follow-up tasks</p>
                        </div>
                        <Checkbox 
                          checked={notificationSettings.overdueFollowup}
                          onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, overdueFollowup: !!checked})}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Push Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h6 className="font-medium">Team Mentions</h6>
                          <p className="text-sm text-gray-600">When you're mentioned in notes or responses</p>
                        </div>
                        <Checkbox 
                          checked={notificationSettings.teamMention}
                          onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, teamMention: !!checked})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h6 className="font-medium">Mobile Push</h6>
                          <p className="text-sm text-gray-600">Receive push notifications on mobile</p>
                        </div>
                        <Checkbox 
                          checked={notificationSettings.pushNotifications}
                          onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: !!checked})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button className="bg-[#12d6fa] hover:bg-[#0fb8d9]">
                    Save Notification Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Email Integration Section */}
        {showEmailIntegration && (
          <Card>
            <CardHeader>
              <CardTitle>Email Integration</CardTitle>
              <p className="text-sm text-gray-600">Connect and sync with email providers</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Email Provider Selection */}
                <div className="space-y-4">
                  <h4 className="font-medium">Connect Email Provider</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => connectEmailAccount("gmail")}>
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Mail className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="font-semibold mb-1">Gmail</h3>
                        <p className="text-sm text-gray-500">Connect your Gmail account</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => connectEmailAccount("outlook")}>
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Mail className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold mb-1">Outlook</h3>
                        <p className="text-sm text-gray-500">Connect your Outlook account</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => connectEmailAccount("custom")}>
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Settings className="w-6 h-6 text-gray-600" />
                        </div>
                        <h3 className="font-semibold mb-1">Custom SMTP</h3>
                        <p className="text-sm text-gray-500">Configure custom email server</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Connected Accounts */}
                {emailAccounts.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Connected Accounts</h4>
                    <div className="space-y-3">
                      {emailAccounts.map((account) => (
                        <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              account.status === "connected" ? "bg-green-500" :
                              account.status === "error" ? "bg-red-500" : "bg-gray-400"
                            }`} />
                            <div>
                              <h6 className="font-medium">{account.email}</h6>
                              <p className="text-sm text-gray-600">
                                {account.provider} • Last sync: {new Date(account.lastSync).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={syncEmailContacts}>
                              <Activity className="h-4 w-4 mr-2" />
                              Sync
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => disconnectEmailAccount(account.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Email Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium">Email Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h6 className="font-medium">Auto Sync</h6>
                          <p className="text-sm text-gray-600">Automatically sync email contacts</p>
                        </div>
                        <Checkbox 
                          checked={emailSettings.autoSync}
                          onCheckedChange={(checked) => setEmailSettings({...emailSettings, autoSync: !!checked})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h6 className="font-medium">Import History</h6>
                          <p className="text-sm text-gray-600">Import past email conversations</p>
                        </div>
                        <Checkbox 
                          checked={emailSettings.importHistory}
                          onCheckedChange={(checked) => setEmailSettings({...emailSettings, importHistory: !!checked})}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="sync-interval">Sync Interval</Label>
                        <Select value={emailSettings.syncInterval} onValueChange={(value) => setEmailSettings({...emailSettings, syncInterval: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5m">Every 5 minutes</SelectItem>
                            <SelectItem value="15m">Every 15 minutes</SelectItem>
                            <SelectItem value="30m">Every 30 minutes</SelectItem>
                            <SelectItem value="1h">Every hour</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CRM Integration Section */}
        {showCRMIntegration && (
          <Card>
            <CardHeader>
              <CardTitle>CRM Integration</CardTitle>
              <p className="text-sm text-gray-600">Connect and sync with CRM systems</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* CRM Provider Selection */}
                <div className="space-y-4">
                  <h4 className="font-medium">Connect CRM Provider</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => connectCRMAccount("hubspot")}>
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Users className="w-6 h-6 text-orange-600" />
                        </div>
                        <h3 className="font-semibold mb-1">HubSpot</h3>
                        <p className="text-sm text-gray-500">Connect your HubSpot CRM</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => connectCRMAccount("salesforce")}>
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold mb-1">Salesforce</h3>
                        <p className="text-sm text-gray-500">Connect your Salesforce CRM</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => connectCRMAccount("pipedrive")}>
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold mb-1">Pipedrive</h3>
                        <p className="text-sm text-gray-500">Connect your Pipedrive CRM</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Connected CRM Accounts */}
                {crmAccounts.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Connected CRM Accounts</h4>
                    <div className="space-y-3">
                      {crmAccounts.map((account) => (
                        <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              account.status === "connected" ? "bg-green-500" :
                              account.status === "error" ? "bg-red-500" : "bg-gray-400"
                            }`} />
                            <div>
                              <h6 className="font-medium">{account.name}</h6>
                              <p className="text-sm text-gray-600">
                                {account.provider} • {account.contactCount} contacts • Last sync: {new Date(account.lastSync).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={syncCRMData}>
                              <Activity className="h-4 w-4 mr-2" />
                              Sync
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => disconnectCRMAccount(account.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CRM Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium">CRM Sync Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h6 className="font-medium">Auto Sync</h6>
                          <p className="text-sm text-gray-600">Automatically sync CRM data</p>
                        </div>
                        <Checkbox 
                          checked={crmSettings.autoSync}
                          onCheckedChange={(checked) => setCrmSettings({...crmSettings, autoSync: !!checked})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h6 className="font-medium">Sync Contacts</h6>
                          <p className="text-sm text-gray-600">Import contacts from CRM</p>
                        </div>
                        <Checkbox 
                          checked={crmSettings.syncContacts}
                          onCheckedChange={(checked) => setCrmSettings({...crmSettings, syncContacts: !!checked})}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h6 className="font-medium">Sync Deals</h6>
                          <p className="text-sm text-gray-600">Import deals and opportunities</p>
                        </div>
                        <Checkbox 
                          checked={crmSettings.syncDeals}
                          onCheckedChange={(checked) => setCrmSettings({...crmSettings, syncDeals: !!checked})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h6 className="font-medium">Sync Activities</h6>
                          <p className="text-sm text-gray-600">Import activities and notes</p>
                        </div>
                        <Checkbox 
                          checked={crmSettings.syncActivities}
                          onCheckedChange={(checked) => setCrmSettings({...crmSettings, syncActivities: !!checked})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer Profiles Section */}
        {showCustomerProfiles && (
          <Card>
            <CardHeader>
              <CardTitle>Customer Profiles</CardTitle>
              <p className="text-sm text-gray-600">Manage customer profiles and relationships</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Profile Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Profiles</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {customerProfiles.length}
                          </p>
                        </div>
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Active Customers</p>
                          <p className="text-2xl font-bold text-green-600">
                            {customerProfiles.filter(p => p.status === "active").length}
                          </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">VIP Customers</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {customerProfiles.filter(p => p.status === "vip").length}
                          </p>
                        </div>
                        <Star className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Inactive</p>
                          <p className="text-2xl font-bold text-gray-600">
                            {customerProfiles.filter(p => p.status === "inactive").length}
                          </p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-gray-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Customer Profiles List */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Customer Profiles</h4>
                    <Button size="sm" onClick={() => {
                      if (selectedContact) {
                        createCustomerProfile(selectedContact)
                      }
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Profile
                    </Button>
                  </div>
                  
                  {customerProfiles.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No customer profiles yet</h3>
                      <p className="text-gray-600 mb-4">Create profiles to better manage your customer relationships</p>
                      <Button onClick={() => {
                        if (selectedContact) {
                          createCustomerProfile(selectedContact)
                        }
                      }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Profile
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customerProfiles.map((profile) => (
                        <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              profile.status === "active" ? "bg-green-500" :
                              profile.status === "vip" ? "bg-purple-500" : "bg-gray-400"
                            }`} />
                            <div>
                              <h6 className="font-medium">{profile.name}</h6>
                              <p className="text-sm text-gray-600">
                                {profile.email} • {profile.company} • {profile.totalContacts} contacts
                              </p>
                              <div className="flex gap-2 mt-1">
                                {profile.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              profile.status === "active" ? "default" :
                              profile.status === "vip" ? "secondary" : "outline"
                            }>
                              {profile.status.toUpperCase()}
                            </Badge>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Premium Filters and Search */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Advanced Filters</h3>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Showing {filteredContacts.length} of {contacts.length} messages
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedStatus("all")
                    setSelectedPriority("all")
                    setSelectedSource("all")
                    setSelectedAssignee("all")
                    setCompanyFilter("")
                    setResponseTimeFilter("all")
                    setSelectedTags([])
                    setDateRange({ from: "", to: "" })
                  }}
                  className="border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 transition-all duration-300"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium text-gray-700">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-medium text-gray-700">Priority</Label>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="source" className="text-sm font-medium text-gray-700">Source</Label>
                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                    <SelectValue placeholder="All sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sources</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assignee" className="text-sm font-medium text-gray-700">Assignee</Label>
                <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                    <SelectValue placeholder="All assignees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All assignees</SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {showAdvancedFilters && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-sm font-medium mb-4">Advanced Filters</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="date-from">Date From</Label>
                    <Input
                      id="date-from"
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date-to">Date To</Label>
                    <Input
                      id="date-to"
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      placeholder="Filter by company..."
                      value={companyFilter}
                      onChange={(e) => setCompanyFilter(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="response-time">Response Time</Label>
                    <Select value={responseTimeFilter} onValueChange={setResponseTimeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All response times" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All response times</SelectItem>
                        <SelectItem value="fast">Fast (≤2 hours)</SelectItem>
                        <SelectItem value="medium">Medium (2-24 hours)</SelectItem>
                        <SelectItem value="slow">Slow (&gt;24 hours)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["urgent", "follow-up", "sales", "support", "billing", "technical"].map((tag) => (
                      <Button
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (selectedTags.includes(tag)) {
                            setSelectedTags(selectedTags.filter(t => t !== tag))
                          } else {
                            setSelectedTags([...selectedTags, tag])
                          }
                        }}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        {/* Premium Contact Messages Table */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Contact Messages Management</h3>
                    <p className="text-sm text-gray-500">
                      {filteredContacts.length} of {contacts.length} messages
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all duration-300"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {filteredContacts.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No contact messages found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                  <Button 
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedStatus("all")
                      setSelectedPriority("all")
                      setSelectedSource("all")
                      setSelectedAssignee("all")
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="w-12 font-semibold text-gray-700">
                        <Checkbox
                          checked={selectedContacts.length === filteredContacts.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedContacts(filteredContacts.map((c) => c._id))
                            } else {
                              setSelectedContacts([])
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">Contact Details</TableHead>
                      <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                      <TableHead className="font-semibold text-gray-700">Message</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">Priority</TableHead>
                      <TableHead className="font-semibold text-gray-700">Source</TableHead>
                      <TableHead className="font-semibold text-gray-700">Response Time</TableHead>
                      <TableHead className="font-semibold text-gray-700">Created</TableHead>
                      <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map((contact) => (
                      <TableRow 
                        key={contact._id}
                        className="hover:bg-blue-50/50 transition-all duration-200 border-b border-gray-100"
                      >
                        <TableCell className="py-4">
                          <Checkbox
                            checked={selectedContacts.includes(contact._id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedContacts([...selectedContacts, contact._id])
                              } else {
                                setSelectedContacts(selectedContacts.filter((id) => id !== contact._id))
                              }
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                        </TableCell>
                        <TableCell className="font-medium py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {contact.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900">{contact.name}</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleStar(contact._id)}
                                  className="p-1 h-auto"
                                >
                                  <Star
                                    className={`h-4 w-4 ${contact.starred ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
                                  />
                                </Button>
                              </div>
                              <div className="text-sm text-gray-600">{contact.email}</div>
                              {contact.phone && (
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <PhoneIcon className="h-3 w-3" />
                                  {contact.phone}
                                </div>
                              )}
                              {contact.company && (
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Building className="h-3 w-3" />
                                  {contact.company}
                                </div>
                              )}
                              {contact.tags && contact.tags.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                  {contact.tags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs border-blue-200 text-blue-700">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {contact.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                                      +{contact.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="font-medium text-gray-900">{contact.subject}</div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{contact.message}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge 
                            variant={getStatusColor(contact.status)}
                            className={contact.status === "new" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" :
                                     contact.status === "in_progress" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" :
                                     contact.status === "resolved" ? "bg-green-100 text-green-700 hover:bg-green-200" :
                                     "bg-gray-100 text-gray-700 hover:bg-gray-200"}
                          >
                            {contact.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge 
                            variant={getPriorityColor(contact.priority || "low")}
                            className={(contact.priority || "low") === "urgent" ? "bg-red-100 text-red-700 hover:bg-red-200" :
                                     (contact.priority || "low") === "high" ? "bg-orange-100 text-orange-700 hover:bg-orange-200" :
                                     (contact.priority || "low") === "medium" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" :
                                     "bg-gray-100 text-gray-700 hover:bg-gray-200"}
                          >
                            {(contact.priority || "low").charAt(0).toUpperCase() + (contact.priority || "low").slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge 
                            variant={getSourceColor(contact.source || "website")}
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                          >
                            {(contact.source || "website").charAt(0).toUpperCase() +
                              (contact.source || "website").slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm text-gray-600 font-medium">
                            {contact.responseTime ? `${contact.responseTime}h` : "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(contact.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(contact.createdAt).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewContact(contact)}
                              title="View Contact"
                              className="border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(contact._id)}
                              title="Delete Contact"
                              className="border-2 border-red-200 hover:border-red-500 hover:bg-red-50 transition-all duration-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Message Details</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="response">Response</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Name</Label>
                        <p className="text-sm">{selectedContact.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm">{selectedContact.email}</p>
                      </div>
                      {selectedContact.phone && (
                        <div>
                          <Label className="text-sm font-medium">Phone</Label>
                          <p className="text-sm">{selectedContact.phone}</p>
                        </div>
                      )}
                      {selectedContact.company && (
                        <div>
                          <Label className="text-sm font-medium">Company</Label>
                          <p className="text-sm">{selectedContact.company}</p>
                        </div>
                      )}
                      <div>
                        <Label className="text-sm font-medium">Source</Label>
                        <Badge variant={getSourceColor(selectedContact.source || "website")}>
                          {(selectedContact.source || "website").charAt(0).toUpperCase() +
                            (selectedContact.source || "website").slice(1)}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Response Time</Label>
                        <p className="text-sm">
                          {selectedContact.responseTime ? `${selectedContact.responseTime} hours` : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Subject</Label>
                      <p className="text-sm font-medium">{selectedContact.subject}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Message</Label>
                      <p className="text-sm whitespace-pre-wrap">{selectedContact.message}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      Received: {new Date(selectedContact.createdAt).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_ACTIONS.map((action) => (
                        <Button
                          key={action.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAction(action.id, selectedContact)}
                          className="flex items-center gap-2"
                        >
                          <span className={action.color}>
                            {action.icon === "AlertCircle" && <AlertCircle className="h-4 w-4" />}
                            {action.icon === "UserPlus" && <UserPlus className="h-4 w-4" />}
                            {action.icon === "Clock" && <Clock className="h-4 w-4" />}
                            {action.icon === "FileText" && <FileText className="h-4 w-4" />}
                            {action.icon === "Star" && <Star className="h-4 w-4" />}
                            {action.icon === "Archive" && <Archive className="h-4 w-4" />}
                          </span>
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Status Management */}
                <Card>
                  <CardHeader>
                    <CardTitle>Status Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={statusUpdate.status}
                          onValueChange={(value: "new" | "in_progress" | "resolved" | "closed") =>
                            setStatusUpdate((prev) => ({ ...prev, status: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={statusUpdate.priority}
                          onValueChange={(value: "low" | "medium" | "high" | "urgent") =>
                            setStatusUpdate((prev) => ({ ...prev, priority: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="followup">Follow-up Date</Label>
                        <Input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
                      </div>
                    </div>
                    <Button
                      onClick={handleUpdateStatus}
                      disabled={isUpdatingStatus}
                      className="bg-[#12d6fa] hover:bg-[#0fb8d9]"
                    >
                      {isUpdatingStatus ? "Updating..." : "Update Status"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Tags Management */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedContact.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Add new tag..." value={newTag} onChange={(e) => setNewTag(e.target.value)} />
                      <Button onClick={handleAddTag} disabled={!newTag.trim()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Tag
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="response" className="space-y-6">
                {/* Email Templates */}
                <Card>
                  <CardHeader>
                    <CardTitle>Response Templates</CardTitle>
                    <p className="text-sm text-gray-600">Quick templates for common responses</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {["general", "sales", "support", "escalation", "followup", "resolution"].map((category) => {
                        const categoryTemplates = EMAIL_TEMPLATES.filter(t => t.category === category)
                        if (categoryTemplates.length === 0) return null
                        
                        return (
                          <div key={category}>
                            <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                              {category} Templates
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {categoryTemplates.map((template) => (
                                <Button
                                  key={template.id}
                                  variant={selectedTemplate === template.id ? "default" : "outline"}
                                  onClick={() => handleTemplateSelect(template.id)}
                                  className="text-left justify-start h-auto p-3"
                                >
                                  <div>
                                    <div className="font-medium">{template.name}</div>
                                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                      {template.content.substring(0, 60)}...
                                    </div>
                                  </div>
                                </Button>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Response Management */}
                <Card>
                  <CardHeader>
                    <CardTitle>Add Response</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="response">Response Message</Label>
                      <Textarea
                        id="response"
                        placeholder="Type your response to the customer..."
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        rows={6}
                      />
                    </div>
                    <Button
                      onClick={handleAddResponse}
                      disabled={isAddingResponse || !responseText.trim()}
                      className="bg-[#12d6fa] hover:bg-[#0fb8d9]"
                    >
                      {isAddingResponse ? "Sending..." : "Send Response"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Existing Response */}
                {selectedContact.response && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Previous Response</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm">{selectedContact.response.text}</p>
                        <div className="text-xs text-gray-500">
                          Sent by {selectedContact.response.sentBy} on{" "}
                          {new Date(selectedContact.response.sentAt).toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="notes" className="space-y-6">
                {/* Add Note */}
                <Card>
                  <CardHeader>
                    <CardTitle>Add Internal Note</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="note">Note</Label>
                      <Textarea
                        id="note"
                        placeholder="Add an internal note..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </CardContent>
                </Card>

                {/* Existing Notes */}
                {selectedContact.notes && selectedContact.notes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Notes History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedContact.notes.map((note, index) => (
                          <div key={index} className="border-l-2 border-gray-200 pl-4 py-2">
                            <p className="text-sm">{note.text}</p>
                            <div className="text-xs text-gray-500 mt-1">
                              Added by {note.createdBy} on {new Date(note.createdAt).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-2 border-blue-200 pl-4 py-2">
                        <p className="text-sm font-medium">Contact created</p>
                        <div className="text-xs text-gray-500">
                          {new Date(selectedContact.createdAt).toLocaleString()}
                        </div>
                      </div>
                      {selectedContact.response && (
                        <div className="border-l-2 border-green-200 pl-4 py-2">
                          <p className="text-sm font-medium">Response sent</p>
                          <div className="text-xs text-gray-500">
                            {new Date(selectedContact.response.sentAt).toLocaleString()}
                          </div>
                        </div>
                      )}
                      {selectedContact.notes.map((note, index) => (
                        <div key={index} className="border-l-2 border-yellow-200 pl-4 py-2">
                          <p className="text-sm font-medium">Note added</p>
                          <p className="text-sm text-gray-600">{note.text}</p>
                          <div className="text-xs text-gray-500">{new Date(note.createdAt).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
