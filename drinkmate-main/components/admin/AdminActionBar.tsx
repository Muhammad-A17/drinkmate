"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Search, 
  RefreshCw, 
  Filter, 
  Download,
  Upload,
  Settings,
  Trash2,
  Edit,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface AdminAction {
  id: string
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  className?: string
  disabled?: boolean
  badge?: string | number
}

export interface BulkAction {
  id: string
  label: string
  icon?: React.ReactNode
  onClick: (selectedIds: string[]) => void
  variant?: "default" | "destructive" | "outline"
  disabled?: boolean
}

interface AdminActionBarProps {
  // Page Info
  title: string
  description?: string
  
  // Primary Actions (right side)
  primaryActions?: AdminAction[]
  
  // Secondary Actions (left side of primary)
  secondaryActions?: AdminAction[]
  
  // Search functionality
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  
  // Bulk actions (shown when items are selected)
  selectedItems?: string[]
  onSelectionChange?: (items: string[]) => void
  bulkActions?: BulkAction[]
  
  // Stats/Counts
  totalItems?: number
  filteredItems?: number
  
  // Custom content
  children?: React.ReactNode
}

export default function AdminActionBar({
  title,
  description,
  primaryActions = [],
  secondaryActions = [],
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  selectedItems = [],
  onSelectionChange,
  bulkActions = [],
  totalItems,
  filteredItems,
  children
}: AdminActionBarProps) {
  const hasSelection = selectedItems.length > 0

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {totalItems !== undefined && (
              <Badge variant="secondary" className="px-2 py-1">
                {filteredItems !== undefined ? `${filteredItems} of ${totalItems}` : totalItems} items
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Secondary Actions */}
          {secondaryActions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || "outline"}
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(action.className)}
            >
              {action.icon}
              {action.label}
              {action.badge && (
                <Badge variant="secondary" className="ml-2">
                  {action.badge}
                </Badge>
              )}
            </Button>
          ))}
          
          {/* Primary Actions */}
          {primaryActions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || "default"}
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                action.variant === "default" && "bg-[#12d6fa] hover:bg-[#0fb8d9]",
                action.className
              )}
            >
              {action.icon}
              {action.label}
              {action.badge && (
                <Badge variant="secondary" className="ml-2">
                  {action.badge}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Search */}
          {onSearchChange && (
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue || ""}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8"
              />
            </div>
          )}

          {/* Custom content */}
          {children}
        </div>

        {/* Bulk Actions (shown when items selected) */}
        {hasSelection && bulkActions.length > 0 && (
          <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-md border">
            <span className="text-sm text-muted-foreground">
              {selectedItems.length} selected
            </span>
            {bulkActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || "outline"}
                size="sm"
                onClick={() => action.onClick(selectedItems)}
                disabled={action.disabled}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectionChange?.([])}
            >
              Clear
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Pre-defined action creators for common use cases
export const AdminActions = {
  // Primary Actions
  addNew: (label: string, onClick: () => void): AdminAction => ({
    id: "add-new",
    label,
    icon: <Plus className="h-4 w-4 mr-2" />,
    onClick,
    variant: "default"
  }),

  // Secondary Actions  
  refresh: (onClick: () => void): AdminAction => ({
    id: "refresh",
    label: "Refresh",
    icon: <RefreshCw className="h-4 w-4 mr-2" />,
    onClick,
    variant: "outline"
  }),

  settings: (onClick: () => void): AdminAction => ({
    id: "settings",
    label: "Settings",
    icon: <Settings className="h-4 w-4 mr-2" />,
    onClick,
    variant: "outline"
  }),

  export: (onClick: () => void): AdminAction => ({
    id: "export",
    label: "Export",
    icon: <Download className="h-4 w-4 mr-2" />,
    onClick,
    variant: "outline"
  }),

  import: (onClick: () => void): AdminAction => ({
    id: "import",
    label: "Import",
    icon: <Upload className="h-4 w-4 mr-2" />,
    onClick,
    variant: "outline"
  }),

  // Bulk Actions
  bulkDelete: (onDelete: (ids: string[]) => void): BulkAction => ({
    id: "bulk-delete",
    label: "Delete Selected",
    icon: <Trash2 className="h-4 w-4 mr-2" />,
    onClick: onDelete,
    variant: "destructive"
  }),

  bulkActivate: (onActivate: (ids: string[]) => void): BulkAction => ({
    id: "bulk-activate",
    label: "Activate",
    icon: <CheckCircle className="h-4 w-4 mr-2" />,
    onClick: onActivate,
    variant: "outline"
  }),

  bulkDeactivate: (onDeactivate: (ids: string[]) => void): BulkAction => ({
    id: "bulk-deactivate",
    label: "Deactivate",
    icon: <XCircle className="h-4 w-4 mr-2" />,
    onClick: onDeactivate,
    variant: "outline"
  })
}

// Row action component for table rows
interface RowActionsProps {
  actions: Array<{
    id: string
    label: string
    icon?: React.ReactNode
    onClick: () => void
    variant?: "default" | "destructive" | "outline" | "secondary"
    separator?: boolean
    className?: string
  }>
}

export function RowActions({ actions }: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions.map((action, index) => (
          <div key={action.id}>
            <DropdownMenuItem
              onClick={action.onClick}
              className={cn(
                action.variant === "destructive" && "text-destructive focus:text-destructive",
                action.className
              )}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
            {action.separator && index < actions.length - 1 && <DropdownMenuSeparator />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Common row actions
export const RowActionsPresets = {
  standard: (
    onView: () => void,
    onEdit: () => void,
    onDelete: () => void
  ) => [
    {
      id: "view",
      label: "View Details",
      icon: <Eye className="mr-2 h-4 w-4" />,
      onClick: onView
    },
    {
      id: "edit",
      label: "Edit",
      icon: <Edit className="mr-2 h-4 w-4" />,
      onClick: onEdit
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      onClick: onDelete,
      variant: "destructive" as const,
      separator: true
    }
  ]
}
