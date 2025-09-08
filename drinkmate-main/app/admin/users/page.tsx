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
  Loader2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { adminAPI } from "@/lib/api"
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
      console.log("Fetching users...")
      const response = await adminAPI.getAllUsers()
      console.log("API Response:", response)
      if (response.success) {
        console.log("Users data:", response.users)
        setUsers(response.users || [])
      } else {
        console.error("API returned success: false")
        // Add sample users for testing if API fails
        const sampleUsers: User[] = [
          {
            _id: "1",
            username: "admin",
            email: "admin@drinkmate.com",
            firstName: "Admin",
            lastName: "User",
            phone: "+966-50-123-4567",
            isAdmin: true,
            status: "active",
            avatar: "/images/default-avatar.png",
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          },
          {
            _id: "2",
            username: "testuser",
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
            phone: "+966-50-987-6543",
            isAdmin: false,
            status: "active",
            avatar: "/images/default-avatar.png",
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          },
          {
            _id: "3",
            username: "ahmed",
            email: "ahmed@example.com",
            firstName: "Ahmed",
            lastName: "Al-Farsi",
            phone: "+966-50-555-1234",
            isAdmin: false,
            status: "inactive",
            avatar: "/images/default-avatar.png",
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          }
        ]
        setUsers(sampleUsers)
        toast.error("Failed to fetch users, showing sample data")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      // Add sample users for testing if API fails
      const sampleUsers: User[] = [
        {
          _id: "1",
          username: "admin",
          email: "admin@drinkmate.com",
          firstName: "Admin",
          lastName: "User",
          phone: "+966-50-123-4567",
          isAdmin: true,
          status: "active",
          avatar: "/images/default-avatar.png",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        },
        {
          _id: "2",
          username: "testuser",
          email: "test@example.com",
          firstName: "Test",
          lastName: "User",
          phone: "+966-50-987-6543",
          isAdmin: false,
          status: "active",
          avatar: "/images/default-avatar.png",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        },
        {
          _id: "3",
          username: "ahmed",
          email: "ahmed@example.com",
          firstName: "Ahmed",
          lastName: "Al-Farsi",
          phone: "+966-50-555-1234",
          isAdmin: false,
          status: "inactive",
          avatar: "/images/default-avatar.png",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        }
      ]
      setUsers(sampleUsers)
      toast.error("Failed to fetch users, showing sample data")
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
      // This would call an API endpoint to update user status
      // For now, we'll update locally
      setUsers(users.map(user => 
        user._id === userId ? { ...user, status: newStatus } : user
      ))
      toast.success(`User status updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating user status:", error)
      toast.error("Failed to update user status")
    }
  }

  // Handle admin role toggle
  const toggleAdminRole = async (userId: string) => {
    try {
      // This would call an API endpoint to toggle admin role
      // For now, we'll update locally
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isAdmin: !user.isAdmin } : user
      ))
      toast.success("User role updated successfully")
    } catch (error) {
      console.error("Error updating user role:", error)
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
      console.error("Error deleting user:", error)
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
      // This would call an API endpoint to create user
      // For now, we'll add locally
      const newUser: User = {
        _id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        lastLogin: undefined
      }
      setUsers([...users, newUser])
      setIsAddUserOpen(false)
      toast.success("User created successfully")
    } catch (error: any) {
      console.error("Error creating user:", error)
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
      // This would call an API endpoint to update user
      // For now, we'll update locally
      setUsers(users.map(user => 
        user._id === selectedUser._id ? { ...user, ...formData } : user
      ))
      setIsEditUserOpen(false)
      setSelectedUser(null)
      toast.success("User updated successfully")
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
      // This would call API endpoints to delete multiple users
      // For now, we'll delete locally
      setUsers(users.filter(user => !selectedUsers.includes(user._id)))
      setSelectedUsers([])
      toast.success(`${selectedUsers.length} users deleted successfully`)
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
      // This would call API endpoints to update multiple users
      // For now, we'll update locally
      setUsers(users.map(user => 
        ids.includes(user._id) ? { ...user, status: newStatus } : user
      ))
      setSelectedUsers([])
      toast.success(`${ids.length} users status updated to ${newStatus}`)
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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://drinkmates.onrender.com'
      const response = await fetch(`${API_URL}/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'active' })
      })
      
      if (response.ok) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, status: 'active' } : user
        ))
        toast.success("User activated successfully")
      } else {
        throw new Error('Failed to activate user')
      }
    } catch (error) {
      console.error('Error activating user:', error)
      toast.error("Failed to activate user")
    }
  }

  const handleDeactivateUser = async (userId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://drinkmates.onrender.com'
      const response = await fetch(`${API_URL}/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'inactive' })
      })
      
      if (response.ok) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, status: 'inactive' } : user
        ))
        toast.success("User deactivated successfully")
      } else {
        throw new Error('Failed to deactivate user')
      }
    } catch (error) {
      console.error('Error deactivating user:', error)
      toast.error("Failed to deactivate user")
    }
  }

  const handleBlockUser = async (userId: string) => {
    const user = users.find(u => u._id === userId)
    if (!confirm(`Are you sure you want to block ${user?.name || user?.username}?`)) return
    
    try {
      setUsers(users.map(user => 
        user._id === userId ? { ...user, status: 'blocked' } : user
      ))
      toast.success("User blocked successfully")
    } catch (error) {
      toast.error("Failed to block user")
    }
  }

  const handleUnblockUser = async (userId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://drinkmates.onrender.com'
      const response = await fetch(`${API_URL}/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'active' })
      })
      
      if (response.ok) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, status: 'active' } : user
        ))
        toast.success("User unblocked successfully")
      } else {
        throw new Error('Failed to unblock user')
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
      {/* Header with standardized actions */}
      <AdminActionBar
        title="User Management"
        description="Manage user accounts, permissions, and access control"
        totalItems={users.length}
        filteredItems={filteredUsers.length}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search users..."
        primaryActions={[
          AdminActions.addNew("Add User", () => setIsAddUserOpen(true))
        ]}
        secondaryActions={[
          AdminActions.refresh(() => fetchUsers()),
          AdminActions.export(() => handleExportUsers()),
          {
            id: "invite-users",
            label: "Send Invites",
            icon: <Mail className="h-4 w-4 mr-2" />,
            onClick: () => toast.info("Bulk invite functionality"),
            variant: "outline"
          }
        ]}
        selectedItems={selectedUsers}
        onSelectionChange={setSelectedUsers}
        bulkActions={[
          {
            id: "bulk-activate",
            label: "Activate Selected",
            icon: <CheckCircle className="h-4 w-4 mr-2" />,
            onClick: (ids) => handleBulkStatusUpdate(ids, 'active'),
            variant: "default"
          },
          {
            id: "bulk-deactivate", 
            label: "Deactivate Selected",
            icon: <XCircle className="h-4 w-4 mr-2" />,
            onClick: (ids) => handleBulkStatusUpdate(ids, 'inactive'),
            variant: "outline"
          },
          {
            id: "bulk-block",
            label: "Block Selected", 
            icon: <UserX className="h-4 w-4 mr-2" />,
            onClick: (ids) => handleBulkStatusUpdate(ids, 'blocked'),
            variant: "destructive"
          },
          AdminActions.bulkDelete(handleBulkDelete)
        ]}
      />

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{users.length}</div>
            </div>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <div className="text-2xl font-bold">
                {users.filter(u => u.status === 'active').length}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Active Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-purple-600" />
              <div className="text-2xl font-bold">
                {users.filter(u => u.isAdmin).length}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Admin Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <UserX className="h-4 w-4 text-red-600" />
              <div className="text-2xl font-bold">
                {users.filter(u => u.status === 'blocked').length}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Blocked Users</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by username or email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">More Filters</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {selectedUsers.length} user(s) selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate(selectedUsers, 'active')}
                  disabled={isSubmitting}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate(selectedUsers, 'blocked')}
                  disabled={isSubmitting}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <UserX className="h-4 w-4 mr-1" />
                  Block
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isSubmitting}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

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