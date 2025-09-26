"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/layout/AdminLayout"
import AdminActionBar, { AdminActions } from "@/components/admin/AdminActionBar"
import AdminTable, { CellRenderers, TableColumn, ContextTableAction } from "@/components/admin/AdminTable"
import { ActionPresets } from "@/components/admin/AdminContextActions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search, 
  Plus, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  User,
  UserPlus,
  UserCheck,
  UserX,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Download,
  X
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { adminAPI } from "@/lib/api"
import { sanitizeInput, validateUsername, validatePassword, validateEmail } from "@/lib/api/protected-api"
import { AdminErrorBoundary } from "@/lib/admin-error-handler"
import { useAdminErrorHandler, useFormErrorHandler } from "@/hooks/use-admin-error-handler"
import { toast } from "sonner"

// Define User interface
interface User {
  _id: string;
  name?: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'blocked';
  avatar?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface UserFormData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  isAdmin: boolean;
  status: 'active' | 'inactive' | 'blocked';
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [isBulkActionOpen, setIsBulkActionOpen] = useState(false)
  const [isViewUserOpen, setIsViewUserOpen] = useState(false)
  
  // Add missing pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  const router = useRouter()

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getAllUsers()
      if (response.success && response.users) {
        setUsers(response.users)
        toast.success(`Loaded ${response.users.length} users successfully`)
      } else {
        toast.error(response.message || "Failed to load users from API")
        setUsers([]) // Set to empty array on failure
      }
    } catch (error) {
      toast.error("Failed to fetch users")
      setUsers([]) // Set to empty array on error
    } finally {
      setLoading(false)
    }
  }

  // Filter users based on search term and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === "all" ? true : user.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  // Handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Handle user status change
  const updateUserStatus = async (userId: string, newStatus: 'active' | 'inactive' | 'blocked') => {
    try {
      const response = await adminAPI.updateUserStatus(userId, newStatus)
      if (response.success) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, status: newStatus } : user
        ))
        toast.success(`User status updated to ${newStatus}`)
      } else {
        toast.error(response.message || "Failed to update user status")
      }
    } catch (error) {
      toast.error("Failed to update user status")
    }
  }

  // Handle admin role toggle
  const toggleAdminRole = async (userId: string) => {
    try {
      const user = users.find(u => u._id === userId)
      if (!user) return
      
      const response = await adminAPI.toggleUserRole(userId, !user.isAdmin)
      if (response.success) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, isAdmin: !user.isAdmin } : user
        ))
        toast.success("User role updated successfully")
      } else {
        toast.error(response.message || "Failed to update user role")
      }
    } catch (error) {
      toast.error("Failed to update user role")
    }
  }

  // Handle delete user
  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return

    try {
      await adminAPI.deleteUser(id)
      toast.success("User deleted successfully")
      fetchUsers()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete user")
    }
  }

  // Handle edit user (remove duplicate)
  // const handleEditUser = (user: User) => {
  //   setSelectedUser(user)
  //   setIsEditUserOpen(true)
  // }

  // Handle view user (remove duplicate)
  // const handleViewUser = (user: User) => {
  //   setSelectedUser(user)
  //   setIsViewUserOpen(true)
  // }

  // Handle form submission for adding user
  const handleAddUser = async (formData: UserFormData) => {
    try {
      setIsSubmitting(true)
      
      // Validate input data
      const usernameValidation = validateUsername(formData.username)
      if (!usernameValidation.valid) {
        toast.error(usernameValidation.error)
        return
      }

      const emailValidation = validateEmail(formData.email)
      if (!emailValidation) {
        toast.error('Invalid email format')
        return
      }

      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.valid) {
        toast.error(passwordValidation.error)
        return
      }
      
      // Sanitize user input
      const sanitizedFormData = {
        ...formData,
        username: sanitizeInput(formData.username),
        email: sanitizeInput(formData.email),
        firstName: sanitizeInput(formData.firstName),
        lastName: sanitizeInput(formData.lastName),
        phone: sanitizeInput(formData.phone)
      }
      
      const response = await adminAPI.createUser(sanitizedFormData)
      if (response.success && response.user) {
        setUsers([...users, response.user])
        setIsAddUserOpen(false)
        toast.success("User created successfully")
      } else {
        toast.error(response.message || "Failed to create user")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create user")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle form submission for editing user
  const handleUpdateUser = async (formData: Partial<UserFormData>) => {
    if (!selectedUser) return

    try {
      setIsSubmitting(true)
      
      // Sanitize user input
      const sanitizedFormData = {
        ...formData,
        username: formData.username ? sanitizeInput(formData.username) : undefined,
        email: formData.email ? sanitizeInput(formData.email) : undefined,
        firstName: formData.firstName ? sanitizeInput(formData.firstName) : undefined,
        lastName: formData.lastName ? sanitizeInput(formData.lastName) : undefined,
        phone: formData.phone ? sanitizeInput(formData.phone) : undefined
      }
      
      const response = await adminAPI.updateUser(selectedUser._id, sanitizedFormData)
      if (response.success && response.user) {
        setUsers(users.map(user => 
          user._id === selectedUser._id ? response.user : user
        ))
        setIsEditUserOpen(false)
        setSelectedUser(null)
        toast.success("User updated successfully")
      } else {
        toast.error(response.message || "Failed to update user")
      }
    } catch (error: any) {
      console.error("Error updating user:", error)
      toast.error(error.response?.data?.message || "Failed to update user")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Status badge renderer
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center gap-1">
            <UserCheck className="h-3 w-3" />
            Active
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 flex items-center gap-1">
            <User className="h-3 w-3" />
            Inactive
          </Badge>
        )
      case "blocked":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 flex items-center gap-1">
            <UserX className="h-3 w-3" />
            Blocked
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            {status}
          </Badge>
        )
    }
  }

  // Form state for add user
  const [addUserForm, setAddUserForm] = useState<UserFormData>({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    isAdmin: false,
    status: "active"
  })

  // Form state for edit user
  const [editUserForm, setEditUserForm] = useState<Partial<UserFormData>>({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    isAdmin: false,
    status: "active"
  })

  // Reset add user form
  const resetAddUserForm = () => {
    setAddUserForm({
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      isAdmin: false,
      status: "active"
    })
  }

  // Reset edit user form
  const resetEditUserForm = () => {
    setEditUserForm({
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      isAdmin: false,
      status: "active"
    })
  }

  // Handle add user form submission
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!addUserForm.username || !addUserForm.email || !addUserForm.password) {
      toast.error("Please fill in all required fields")
      return
    }

    if (addUserForm.password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    await handleAddUser(addUserForm)
    resetAddUserForm()
  }

  // Handle edit user form submission
  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!editUserForm.username || !editUserForm.email) {
      toast.error("Please fill in all required fields")
      return
    }

    await handleUpdateUser(editUserForm)
    resetEditUserForm()
  }

  // Update edit form when selected user changes
  useEffect(() => {
    if (selectedUser) {
      setEditUserForm({
        username: selectedUser.username,
        email: selectedUser.email,
        firstName: selectedUser.firstName || "",
        lastName: selectedUser.lastName || "",
        phone: selectedUser.phone || "",
        isAdmin: selectedUser.isAdmin,
        status: selectedUser.status
      })
    }
  }, [selectedUser])

  // Handle bulk selection
  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === currentItems.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(currentItems.map(user => user._id))
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) return

    try {
      setIsSubmitting(true)
      const response = await adminAPI.bulkDeleteUsers(selectedUsers)
      if (response.success) {
        setUsers(users.filter(user => !selectedUsers.includes(user._id)))
        setSelectedUsers([])
        toast.success(`${selectedUsers.length} users deleted successfully`)
      } else {
        toast.error(response.message || "Failed to delete users")
      }
    } catch (error: any) {
      console.error("Error deleting users:", error)
      toast.error("Failed to delete users")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle bulk status update
  const handleBulkStatusUpdate = async (ids: string[], newStatus: 'active' | 'inactive' | 'blocked') => {
    try {
      setIsSubmitting(true)
      const response = await adminAPI.bulkUpdateUsers(ids, { status: newStatus })
      if (response.success) {
        setUsers(users.map(user => 
          ids.includes(user._id) ? { ...user, status: newStatus } : user
        ))
        setSelectedUsers([])
        toast.success(`${ids.length} users status updated to ${newStatus}`)
      } else {
        toast.error(response.message || "Failed to update users status")
      }
    } catch (error: any) {
      console.error("Error updating users status:", error)
      toast.error("Failed to update users status")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Individual user actions
  const handleViewUser = (userId: string) => {
    const user = users.find(u => u._id === userId)
    if (user) {
      setSelectedUser(user)
      setIsViewUserOpen(true)
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditUserOpen(true)
  }

  const handleActivateUser = async (userId: string) => {
    try {
      const response = await adminAPI.updateUserStatus(userId, 'active')
      if (response.success) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, status: 'active' } : user
        ))
        toast.success("User activated successfully")
      } else {
        toast.error(response.message || "Failed to activate user")
      }
    } catch (error) {
      console.error('Error activating user:', error)
      toast.error("Failed to activate user")
    }
  }

  const handleDeactivateUser = async (userId: string) => {
    try {
      const response = await adminAPI.updateUserStatus(userId, 'inactive')
      if (response.success) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, status: 'inactive' } : user
        ))
        toast.success("User deactivated successfully")
      } else {
        toast.error(response.message || "Failed to deactivate user")
      }
    } catch (error) {
      console.error('Error deactivating user:', error)
      toast.error("Failed to deactivate user")
    }
  }

  const handleBlockUser = async (userId: string) => {
    const user = users.find(u => u._id === userId)
    if (!confirm(`Are you sure you want to block ${user?.firstName || user?.username}?`)) return
    
    try {
      const response = await adminAPI.updateUserStatus(userId, 'blocked')
      if (response.success) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, status: 'blocked' } : user
        ))
        toast.success("User blocked successfully")
      } else {
        toast.error(response.message || "Failed to block user")
      }
    } catch (error) {
      console.error('Error blocking user:', error)
      toast.error("Failed to block user")
    }
  }

  const handleUnblockUser = async (userId: string) => {
    try {
      const response = await adminAPI.updateUserStatus(userId, 'active')
      if (response.success) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, status: 'active' } : user
        ))
        toast.success("User unblocked successfully")
      } else {
        toast.error(response.message || "Failed to unblock user")
      }
    } catch (error) {
      console.error('Error unblocking user:', error)
      toast.error("Failed to unblock user")
    }
  }

  const handleExportUsers = () => {
    // Convert users data to CSV
    const csvData = users.map(user => ({
      Name: user.name || user.username,
      Email: user.email,
      Role: user.isAdmin ? 'admin' : 'user',
      Status: user.status,
      'Joined Date': new Date(user.createdAt).toLocaleDateString(),
      'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'
    }))
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users-export.csv'
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success("Users exported successfully")
  }

  // Define table columns
  const columns: TableColumn<User>[] = [
    {
      key: "name",
      label: "User",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
                  <div>
          <div className="font-medium">{value || row.username}</div>
          <div className="text-sm text-muted-foreground">{row.email}</div>
        </div>
        </div>
      )
    },
    {
      key: "role",
      label: "Role",
      render: (value, row) => (
        <Badge variant={row.isAdmin ? 'default' : 'secondary'}>
          {row.isAdmin ? 'admin' : 'user'}
        </Badge>
      )
    },
    {
      key: "status",
      label: "Status",
      render: CellRenderers.status
    },
    {
      key: "createdAt",
      label: "Joined",
      render: CellRenderers.date,
      width: "120px"
    },
    {
      key: "lastLogin",
      label: "Last Login",
      render: (value) => value ? CellRenderers.date(value) : "Never",
      width: "120px"
    }
  ]

  // Context-aware actions for users
  const contextActions: ContextTableAction<User>[] = [
    ActionPresets.users.view((user) => handleViewUser(user._id)),
    ActionPresets.users.edit((user) => handleEditUser(user)),
    ActionPresets.users.activate((user) => handleActivateUser(user._id)),
    ActionPresets.users.deactivate((user) => handleDeactivateUser(user._id)),
    ActionPresets.users.block((user) => handleBlockUser(user._id)),
    ActionPresets.users.unblock((user) => handleUnblockUser(user._id)),
    ActionPresets.users.delete((user) => handleDeleteUser(user._id))
  ]

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Premium Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#12d6fa]/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="space-y-8 p-4 md:p-6 relative z-10">
          {/* Premium Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20"></div>
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-[#12d6fa] to-blue-600 rounded-xl shadow-lg">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        User Management
                      </h1>
                      <p className="text-gray-600 text-lg">
                        Manage user accounts, permissions, and access control with advanced features
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{filteredUsers.length}</div>
                    <div className="text-sm text-gray-500">Filtered Users</div>
                  </div>
                  <div className="w-px h-12 bg-gray-300"></div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#12d6fa]">{users.length}</div>
                    <div className="text-sm text-gray-500">Total Users</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => setIsAddUserOpen(true)}
                    className="bg-gradient-to-r from-[#12d6fa] to-blue-600 hover:from-[#12d6fa]/90 hover:to-blue-600/90 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Add New User
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => fetchUsers()}
                    className="border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 px-6 py-3 rounded-xl transition-all duration-300"
                  >
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Refresh
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleExportUsers()}
                    className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 px-6 py-3 rounded-xl transition-all duration-300"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Export
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>System Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">{users.length}</div>
                    <p className="text-sm text-gray-600 mt-1">Total Users</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">All registered users</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-green-600">
                      {users.filter(u => u.status === 'active').length}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Active Users</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Currently active</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-purple-600">
                      {users.filter(u => u.isAdmin).length}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Admin Users</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl">
                    <ShieldCheck className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Administrative access</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-red-600">
                      {users.filter(u => u.status === 'blocked').length}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Blocked Users</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl">
                    <UserX className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Access restricted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Search & Filters */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30"></div>
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-[#12d6fa]/20 to-blue-500/20 rounded-xl">
                  <Search className="h-6 w-6 text-[#12d6fa]" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Search & Filters
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Search className="h-4 w-4 text-[#12d6fa]" />
                    Search Users
                  </label>
                  <div className="relative group">
                    <Input
                      placeholder="Search by username or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-3 border-2 border-gray-200 focus:border-[#12d6fa] focus:ring-4 focus:ring-[#12d6fa]/20 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 group-hover:border-[#12d6fa]/50"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#12d6fa] transition-colors duration-300" />
                    </div>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Filter className="h-4 w-4 text-[#12d6fa]" />
                    Status Filter
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="border-2 border-gray-200 focus:border-[#12d6fa] focus:ring-4 focus:ring-[#12d6fa]/20 rounded-xl py-3 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-[#12d6fa]/50">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
                      <SelectItem value="all" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#12d6fa] to-blue-500" />
                          All Statuses
                        </div>
                      </SelectItem>
                      <SelectItem value="active" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-500" />
                          Inactive
                        </div>
                      </SelectItem>
                      <SelectItem value="blocked" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          Blocked
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Quick Actions
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("")
                        setStatusFilter("all")
                      }}
                      className="text-xs px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all duration-300"
                    >
                      <div className="flex items-center gap-1">
                        <X className="h-3 w-3" />
                        Clear All
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => fetchUsers()}
                      className="text-xs px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                    >
                      <div className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        Refresh
                      </div>
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#12d6fa] rounded-full"></div>
                    Results
                  </label>
                  <div className="text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
                    {filteredUsers.length} of {users.length} users
                    {searchTerm && ` • Filtered by "${searchTerm}"`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Users Table */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30"></div>
            <div className="relative overflow-hidden rounded-2xl">
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-[#12d6fa] to-blue-600 rounded-xl shadow-lg">
                      <User className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">Users Directory</h2>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#12d6fa] rounded-full animate-pulse"></div>
                          <span className="text-gray-300">
                            {filteredUsers.length} of {users.length} users
                          </span>
                        </div>
                        {searchTerm && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <span className="text-yellow-300">Filtered by "{searchTerm}"</span>
                          </div>
                        )}
                        {selectedUsers.length > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-green-300">{selectedUsers.length} selected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedUsers.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBulkStatusUpdate(selectedUsers, 'active')}
                          disabled={isSubmitting}
                          className="text-xs px-3 py-2 bg-green-500/10 border-green-500/20 text-green-300 hover:bg-green-500/20 rounded-lg transition-all duration-300"
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Activate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBulkStatusUpdate(selectedUsers, 'blocked')}
                          disabled={isSubmitting}
                          className="text-xs px-3 py-2 bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Block
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBulkDelete}
                          disabled={isSubmitting}
                          className="text-xs px-3 py-2 bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                    <Button 
                      onClick={() => fetchUsers()}
                      variant="outline"
                      size="sm"
                      className="text-xs px-4 py-2 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-lg transition-all duration-300"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === currentItems.length && currentItems.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                    aria-label="Select all users"
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    <Loader2 className="h-12 w-12 mx-auto mb-2 text-gray-300 animate-spin" />
                    <p className="text-gray-500">Loading users...</p>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length > 0 ? (
                currentItems.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleSelectUser(user._id)}
                        className="rounded border-gray-300"
                        aria-label={`Select user ${user.email || user.name || 'user'}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} alt={user.username} />
                          <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{format(new Date(user.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{user.lastLogin ? format(new Date(user.lastLogin), 'MMM d, yyyy') : 'N/A'}</TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(user.status)}
                    </TableCell>
                    <TableCell className="text-center">
                      {user.isAdmin ? (
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-600">
                          Customer
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewUser(user._id)}
                          className="h-8 px-2"
                          title="View Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          className="h-8 px-2"
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.status === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeactivateUser(user._id)}
                            className="h-8 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            title="Deactivate User"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleActivateUser(user._id)}
                            className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Activate User"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {user.status === 'blocked' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnblockUser(user._id)}
                            className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Unblock User"
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBlockUser(user._id)}
                            className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Block User"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user._id)}
                          className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500">No users found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageToShow = i + 1;
                    if (totalPages > 5) {
                      if (currentPage > 3 && i === 0) {
                        pageToShow = 1;
                      } else if (currentPage > 3 && i === 1) {
                        return (
                          <span key="ellipsis-start" className="px-2">
                            ...
                          </span>
                        );
                      } else if (currentPage > 3 && i < 4) {
                        pageToShow = currentPage + i - 2;
                      } else if (i === 4) {
                        if (currentPage + 2 >= totalPages) {
                          pageToShow = totalPages;
                        } else {
                          return (
                            <span key="ellipsis-end" className="px-2">
                              ...
                            </span>
                          );
                        }
                      }
                    }
                    
                    if (pageToShow <= totalPages) {
                      return (
                        <Button
                          key={pageToShow}
                          variant={currentPage === pageToShow ? "default" : "outline"}
                          size="icon"
                          onClick={() => paginate(pageToShow)}
                          className={currentPage === pageToShow ? "bg-[#12d6fa] hover:bg-[#0fb8d9]" : ""}
                        >
                          {pageToShow}
                        </Button>
                      );
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with the following details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddUserSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={addUserForm.firstName} 
                    onChange={(e) => setAddUserForm({ ...addUserForm, firstName: e.target.value })}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={addUserForm.lastName} 
                    onChange={(e) => setAddUserForm({ ...addUserForm, lastName: e.target.value })}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input 
                  id="username" 
                  value={addUserForm.username} 
                  onChange={(e) => setAddUserForm({ ...addUserForm, username: e.target.value })}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input 
                    id="email" 
                    type="email"
                    value={addUserForm.email}
                    onChange={(e) => setAddUserForm({ ...addUserForm, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={addUserForm.phone} 
                  onChange={(e) => setAddUserForm({ ...addUserForm, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={addUserForm.password}
                  onChange={(e) => setAddUserForm({ ...addUserForm, password: e.target.value })}
                  placeholder="Enter password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={addUserForm.status} 
                  onValueChange={(value) => setAddUserForm({ ...addUserForm, status: value as 'active' | 'inactive' | 'blocked' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="isAdmin" 
                  checked={addUserForm.isAdmin} 
                  onCheckedChange={(checked) => setAddUserForm({ ...addUserForm, isAdmin: checked })}
                />
                <Label htmlFor="isAdmin">Admin privileges</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-[#12d6fa] hover:bg-[#0fb8d9]"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                {isSubmitting ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user account details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUserSubmit}>
            {selectedUser && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-firstName">First Name</Label>
                    <Input 
                      id="edit-firstName" 
                      value={editUserForm.firstName} 
                      onChange={(e) => setEditUserForm({ ...editUserForm, firstName: e.target.value })}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-lastName">Last Name</Label>
                    <Input 
                      id="edit-lastName" 
                      value={editUserForm.lastName} 
                      onChange={(e) => setEditUserForm({ ...editUserForm, lastName: e.target.value })}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-username">Username *</Label>
                  <Input 
                    id="edit-username" 
                    value={editUserForm.username} 
                    onChange={(e) => setEditUserForm({ ...editUserForm, username: e.target.value })}
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <Input 
                      id="edit-email" 
                      type="email"
                      value={editUserForm.email}
                      onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                      placeholder="Enter email address"
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input 
                    id="edit-phone" 
                    value={editUserForm.phone} 
                    onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={editUserForm.status} 
                    onValueChange={(value) => setEditUserForm({ ...editUserForm, status: value as 'active' | 'inactive' | 'blocked' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="edit-isAdmin" 
                    checked={editUserForm.isAdmin} 
                    onCheckedChange={(checked) => setEditUserForm({ ...editUserForm, isAdmin: checked })}
                  />
                  <Label htmlFor="edit-isAdmin">Admin privileges</Label>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-[#12d6fa] hover:bg-[#0fb8d9]"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit className="mr-2 h-4 w-4" />}
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* User Details View Dialog */}
      <Dialog open={isViewUserOpen} onOpenChange={setIsViewUserOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>
              View detailed information about this user.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Avatar and Basic Info */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.username} />
                  <AvatarFallback className="text-2xl">
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    {selectedUser.firstName && selectedUser.lastName 
                      ? `${selectedUser.firstName} ${selectedUser.lastName}`
                      : selectedUser.username
                    }
                  </h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex gap-2">
                    {getStatusBadge(selectedUser.status)}
                    {selectedUser.isAdmin && (
                      <Badge className="bg-purple-100 text-purple-800">
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Username</Label>
                    <p className="text-sm">{selectedUser.username}</p>
                  </div>
                  {selectedUser.firstName && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">First Name</Label>
                      <p className="text-sm">{selectedUser.firstName}</p>
                    </div>
                  )}
                  {selectedUser.lastName && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Last Name</Label>
                      <p className="text-sm">{selectedUser.lastName}</p>
                    </div>
                  )}
                  {selectedUser.phone && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
                      <p className="text-sm">{selectedUser.phone}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p className="text-sm">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Account Status</Label>
                    <p className="text-sm capitalize">{selectedUser.status}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Role</Label>
                    <p className="text-sm">{selectedUser.isAdmin ? 'Administrator' : 'Customer'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Member Since</Label>
                    <p className="text-sm">{format(new Date(selectedUser.createdAt), 'PPP')}</p>
                  </div>
                  {selectedUser.lastLogin && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Last Login</Label>
                      <p className="text-sm">{format(new Date(selectedUser.lastLogin), 'PPP')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewUserOpen(false)
                    handleEditUser(selectedUser)
                  }}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit User
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewUserOpen(false)
                    if (selectedUser.status === 'active') {
                      updateUserStatus(selectedUser._id, 'blocked')
                    } else {
                      updateUserStatus(selectedUser._id, 'active')
                    }
                  }}
                  className="flex-1"
                >
                  {selectedUser.status === 'active' ? (
                    <>
                      <UserX className="h-4 w-4 mr-2" />
                      Block User
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Activate User
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewUserOpen(false)
                    toggleAdminRole(selectedUser._id)
                  }}
                  className="flex-1"
                >
                  {selectedUser.isAdmin ? (
                    <>
                      <ShieldAlert className="h-4 w-4 mr-2" />
                      Remove Admin
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Make Admin
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
