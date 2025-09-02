/*
 * ADMIN PAGE TEMPLATE
 * 
 * This file serves as a template showing the standardized pattern 
 * for implementing admin pages with consistent actions and UI.
 * 
 * Copy this template and modify it for new admin pages.
 */

"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/layout/AdminLayout"
import AdminActionBar, { AdminActions } from "@/components/admin/AdminActionBar"
import AdminTable, { CellRenderers, TableColumn, TableAction } from "@/components/admin/AdminTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  Eye, 
  Edit, 
  Trash2, 
  Copy,
  Settings,
  Download,
  Upload,
  Filter,
  Tag
} from "lucide-react"

// Define your data type
interface YourDataType {
  _id: string
  name: string
  status: 'active' | 'inactive' | 'pending'
  email?: string
  createdAt: string
  updatedAt: string
  // Add other fields as needed
}

export default function YourAdminPage() {
  // State management
  const [data, setData] = useState<YourDataType[]>([])
  const [filteredData, setFilteredData] = useState<YourDataType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<YourDataType | null>(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = filteredData.slice(startIndex, endIndex)

  // Fetch data
  useEffect(() => {
    fetchData()
  }, [])

  // Filter data when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(data)
    } else {
      const filtered = data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredData(filtered)
    }
    setCurrentPage(1) // Reset to first page when filtering
  }, [data, searchTerm])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Replace with your actual API call
      // const response = await yourAPI.getData()
      // setData(response.data)
      
      // Mock data for demonstration
      const mockData: YourDataType[] = [
        {
          _id: "1",
          name: "Sample Item 1",
          status: "active",
          email: "item1@example.com",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: "2", 
          name: "Sample Item 2",
          status: "inactive",
          email: "item2@example.com",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      setData(mockData)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  // CRUD Operations
  const handleCreate = async (formData: any) => {
    try {
      // Replace with your actual API call
      // await yourAPI.create(formData)
      toast.success("Item created successfully")
      setIsCreateDialogOpen(false)
      await fetchData()
    } catch (error) {
      toast.error("Failed to create item")
    }
  }

  const handleEdit = (item: YourDataType) => {
    setEditingItem(item)
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async (formData: any) => {
    try {
      // Replace with your actual API call
      // await yourAPI.update(editingItem._id, formData)
      toast.success("Item updated successfully")
      setIsEditDialogOpen(false)
      setEditingItem(null)
      await fetchData()
    } catch (error) {
      toast.error("Failed to update item")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return
    
    try {
      // Replace with your actual API call
      // await yourAPI.delete(id)
      toast.success("Item deleted successfully")
      await fetchData()
    } catch (error) {
      toast.error("Failed to delete item")
    }
  }

  const handleView = (id: string) => {
    // Navigate to detail page or open view modal
    console.log("Viewing item:", id)
  }

  const handleDuplicate = async (id: string) => {
    try {
      // Replace with your actual API call
      // await yourAPI.duplicate(id)
      toast.success("Item duplicated successfully")
      await fetchData()
    } catch (error) {
      toast.error("Failed to duplicate item")
    }
  }

  // Bulk Operations
  const handleBulkDelete = async (ids: string[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} items?`)) return
    
    try {
      // Replace with your actual API call
      // await yourAPI.bulkDelete(ids)
      toast.success(`${ids.length} items deleted successfully`)
      setSelectedItems([])
      await fetchData()
    } catch (error) {
      toast.error("Failed to delete items")
    }
  }

  const handleBulkStatusUpdate = async (ids: string[], status: string) => {
    try {
      // Replace with your actual API call  
      // await yourAPI.bulkUpdateStatus(ids, status)
      toast.success(`${ids.length} items updated successfully`)
      setSelectedItems([])
      await fetchData()
    } catch (error) {
      toast.error("Failed to update items")
    }
  }

  // Export/Import
  const handleExport = () => {
    // Implement export functionality
    toast.success("Export started")
  }

  const handleImport = () => {
    // Implement import functionality
    toast.info("Import functionality coming soon")
  }

  // Define table columns
  const columns: TableColumn<YourDataType>[] = [
    {
      key: "name",
      label: "Name", 
      sortable: true,
      render: (value, row) => (
        <div className="font-medium">{value}</div>
      )
    },
    {
      key: "email",
      label: "Email",
      render: (value) => value || "-"
    },
    {
      key: "status",
      label: "Status",
      render: CellRenderers.status
    },
    {
      key: "createdAt",
      label: "Created",
      render: CellRenderers.date,
      width: "120px"
    }
  ]

  // Define row actions
  const rowActions: TableAction<YourDataType>[] = [
    {
      id: "view",
      label: "View Details", 
      icon: <Eye className="mr-2 h-4 w-4" />,
      onClick: (row) => handleView(row._id)
    },
    {
      id: "edit",
      label: "Edit",
      icon: <Edit className="mr-2 h-4 w-4" />,
      onClick: (row) => handleEdit(row)
    },
    {
      id: "duplicate",
      label: "Duplicate",
      icon: <Copy className="mr-2 h-4 w-4" />,
      onClick: (row) => handleDuplicate(row._id),
      separator: true
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      onClick: (row) => handleDelete(row._id),
      variant: "destructive"
    }
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Standardized Header */}
        <AdminActionBar
          title="Your Page Title"
          description="Manage and organize your data items"
          
          // Search
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search items..."
          
          // Statistics
          totalItems={data.length}
          filteredItems={filteredData.length}
          
          // Primary actions
          primaryActions={[
            AdminActions.addNew("Add Item", () => setIsCreateDialogOpen(true))
          ]}
          
          // Secondary actions
          secondaryActions={[
            AdminActions.refresh(fetchData),
            AdminActions.export(handleExport),
            AdminActions.import(handleImport),
            AdminActions.settings(() => setIsSettingsDialogOpen(true))
          ]}
          
          // Bulk actions
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          bulkActions={[
            AdminActions.bulkDelete(handleBulkDelete),
            AdminActions.bulkActivate((ids) => handleBulkStatusUpdate(ids, 'active')),
            AdminActions.bulkDeactivate((ids) => handleBulkStatusUpdate(ids, 'inactive'))
          ]}
        />

        {/* Main Content */}
        <AdminTable
          data={paginatedData}
          columns={columns}
          
          // Selection
          selectable={true}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          getRowId={(row) => row._id}
          
          // Actions
          rowActions={rowActions}
          
          // Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredData.length}
          onPageChange={setCurrentPage}
          
          // States
          loading={loading}
          emptyMessage="No items found. Create your first item to get started."
        />

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
            </DialogHeader>
            {/* Your create form component here */}
            <div className="p-4">
              <p>Create form goes here...</p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleCreate({})}>
                  Create Item
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Item</DialogTitle>
            </DialogHeader>
            {/* Your edit form component here */}
            <div className="p-4">
              <p>Edit form goes here...</p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleUpdate({})}>
                  Update Item
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p>Settings content goes here...</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
