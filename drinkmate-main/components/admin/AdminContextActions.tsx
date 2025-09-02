"use client"

import { 
  Eye, 
  Edit, 
  Trash2, 
  Ship, 
  Package, 
  CheckCircle, 
  Clock, 
  XCircle,
  Truck,
  CreditCard,
  RefreshCw,
  AlertCircle,
  Send,
  Archive,
  Star,
  UserCheck,
  Ban,
  MessageSquare
} from "lucide-react"

// Context-aware action definitions based on status and type
export interface ContextAction {
  id: string
  label: string
  icon: React.ReactNode
  onClick: (item: any) => void
  variant?: "default" | "destructive" | "outline" | "secondary"
  className?: string
  condition: (item: any) => boolean
  priority?: number // Lower numbers appear first
  separator?: boolean
}

// Action presets for different entity types
export const ActionPresets = {
  // ORDER ACTIONS
  orders: {
    // View action (always available)
    view: (onView: (item: any) => void): ContextAction => ({
      id: "view",
      label: "View Details",
      icon: <Eye className="mr-2 h-4 w-4" />,
      onClick: onView,
      variant: "outline",
      condition: () => true,
      priority: 1
    }),

    // Status-based actions
    process: (onProcess: (item: any) => void): ContextAction => ({
      id: "process",
      label: "Process",
      icon: <Clock className="mr-2 h-4 w-4" />,
      onClick: onProcess,
      variant: "default",
      className: "bg-blue-600 hover:bg-blue-700 text-white",
      condition: (item) => item.status === 'pending',
      priority: 2
    }),

    ship: (onShip: (item: any) => void): ContextAction => ({
      id: "ship",
      label: "Ship",
      icon: <Ship className="mr-2 h-4 w-4" />,
      onClick: onShip,
      variant: "default", 
      className: "bg-green-600 hover:bg-green-700 text-white",
      condition: (item) => item.status === 'processing' || item.status === 'confirmed',
      priority: 2
    }),

    deliver: (onDeliver: (item: any) => void): ContextAction => ({
      id: "deliver",
      label: "Deliver",
      icon: <Truck className="mr-2 h-4 w-4" />,
      onClick: onDeliver,
      variant: "default",
      className: "bg-purple-600 hover:bg-purple-700 text-white", 
      condition: (item) => item.status === 'shipped',
      priority: 2
    }),

    cancel: (onCancel: (item: any) => void): ContextAction => ({
      id: "cancel",
      label: "Cancel",
      icon: <XCircle className="mr-2 h-4 w-4" />,
      onClick: onCancel,
      variant: "destructive",
      condition: (item) => ['pending', 'processing'].includes(item.status),
      priority: 10
    }),

    refund: (onRefund: (item: any) => void): ContextAction => ({
      id: "refund", 
      label: "Refund",
      icon: <RefreshCw className="mr-2 h-4 w-4" />,
      onClick: onRefund,
      variant: "outline",
      condition: (item) => item.paymentStatus === 'paid' && ['delivered', 'cancelled'].includes(item.status),
      priority: 8,
      separator: true
    })
  },

  // USER ACTIONS
  users: {
    view: (onView: (item: any) => void): ContextAction => ({
      id: "view",
      label: "View Profile",
      icon: <Eye className="mr-2 h-4 w-4" />,
      onClick: onView,
      variant: "outline",
      condition: () => true,
      priority: 1
    }),

    edit: (onEdit: (item: any) => void): ContextAction => ({
      id: "edit",
      label: "Edit",
      icon: <Edit className="mr-2 h-4 w-4" />,
      onClick: onEdit,
      variant: "outline",
      condition: () => true,
      priority: 2
    }),

    activate: (onActivate: (item: any) => void): ContextAction => ({
      id: "activate",
      label: "Activate",
      icon: <CheckCircle className="mr-2 h-4 w-4" />,
      onClick: onActivate,
      variant: "default",
      className: "bg-green-600 hover:bg-green-700 text-white",
      condition: (item) => item.status === 'inactive',
      priority: 3
    }),

    deactivate: (onDeactivate: (item: any) => void): ContextAction => ({
      id: "deactivate",
      label: "Deactivate", 
      icon: <XCircle className="mr-2 h-4 w-4" />,
      onClick: onDeactivate,
      variant: "outline",
      condition: (item) => item.status === 'active',
      priority: 3
    }),

    block: (onBlock: (item: any) => void): ContextAction => ({
      id: "block",
      label: "Block",
      icon: <Ban className="mr-2 h-4 w-4" />,
      onClick: onBlock,
      variant: "destructive",
      condition: (item) => item.status !== 'blocked',
      priority: 9
    }),

    unblock: (onUnblock: (item: any) => void): ContextAction => ({
      id: "unblock",
      label: "Unblock",
      icon: <UserCheck className="mr-2 h-4 w-4" />,
      onClick: onUnblock,
      variant: "outline",
      condition: (item) => item.status === 'blocked',
      priority: 3
    }),

    delete: (onDelete: (item: any) => void): ContextAction => ({
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      onClick: onDelete,
      variant: "destructive",
      condition: (item) => item.status !== 'active',
      priority: 10,
      separator: true
    })
  },

  // PRODUCT ACTIONS
  products: {
    view: (onView: (item: any) => void): ContextAction => ({
      id: "view",
      label: "View",
      icon: <Eye className="mr-2 h-4 w-4" />,
      onClick: onView,
      variant: "outline",
      condition: () => true,
      priority: 1
    }),

    edit: (onEdit: (item: any) => void): ContextAction => ({
      id: "edit",
      label: "Edit",
      icon: <Edit className="mr-2 h-4 w-4" />,
      onClick: onEdit,
      variant: "outline",
      condition: () => true,
      priority: 2
    }),

    publish: (onPublish: (item: any) => void): ContextAction => ({
      id: "publish",
      label: "Publish",
      icon: <Send className="mr-2 h-4 w-4" />,
      onClick: onPublish,
      variant: "default",
      className: "bg-green-600 hover:bg-green-700 text-white",
      condition: (item) => !item.isActive,
      priority: 3
    }),

    unpublish: (onUnpublish: (item: any) => void): ContextAction => ({
      id: "unpublish",
      label: "Unpublish",
      icon: <Archive className="mr-2 h-4 w-4" />,
      onClick: onUnpublish,
      variant: "outline",
      condition: (item) => item.isActive,
      priority: 3
    }),

    feature: (onFeature: (item: any) => void): ContextAction => ({
      id: "feature",
      label: "Feature",
      icon: <Star className="mr-2 h-4 w-4" />,
      onClick: onFeature,
      variant: "outline",
      className: "text-yellow-600 hover:bg-yellow-50",
      condition: (item) => !item.isFeatured && item.isActive,
      priority: 4
    }),

    unfeature: (onUnfeature: (item: any) => void): ContextAction => ({
      id: "unfeature",
      label: "Remove Feature",
      icon: <Star className="mr-2 h-4 w-4 fill-current" />,
      onClick: onUnfeature,
      variant: "outline",
      condition: (item) => item.isFeatured,
      priority: 4
    }),

    delete: (onDelete: (item: any) => void): ContextAction => ({
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      onClick: onDelete,
      variant: "destructive",
      condition: (item) => !item.isActive,
      priority: 10
    })
  },

  // BLOG ACTIONS  
  blog: {
    view: (onView: (item: any) => void): ContextAction => ({
      id: "view",
      label: "View",
      icon: <Eye className="mr-2 h-4 w-4" />,
      onClick: onView,
      variant: "outline",
      condition: () => true,
      priority: 1
    }),

    edit: (onEdit: (item: any) => void): ContextAction => ({
      id: "edit",
      label: "Edit",
      icon: <Edit className="mr-2 h-4 w-4" />,
      onClick: onEdit,
      variant: "outline",
      condition: () => true,
      priority: 2
    }),

    publish: (onPublish: (item: any) => void): ContextAction => ({
      id: "publish",
      label: "Publish",
      icon: <Send className="mr-2 h-4 w-4" />,
      onClick: onPublish,
      variant: "default",
      className: "bg-green-600 hover:bg-green-700 text-white",
      condition: (item) => item.status === 'draft',
      priority: 3
    }),

    unpublish: (onUnpublish: (item: any) => void): ContextAction => ({
      id: "unpublish",
      label: "Unpublish",
      icon: <Archive className="mr-2 h-4 w-4" />,
      onClick: onUnpublish,
      variant: "outline", 
      condition: (item) => item.status === 'published',
      priority: 3
    }),

    feature: (onFeature: (item: any) => void): ContextAction => ({
      id: "feature",
      label: "Feature",
      icon: <Star className="mr-2 h-4 w-4" />,
      onClick: onFeature,
      variant: "outline",
      className: "text-yellow-600 hover:bg-yellow-50",
      condition: (item) => !item.isFeatured && item.status === 'published',
      priority: 4
    }),

    delete: (onDelete: (item: any) => void): ContextAction => ({
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      onClick: onDelete,
      variant: "destructive",
      condition: (item) => item.status === 'draft',
      priority: 10
    })
  },

  // CO2 CYLINDER ACTIONS
  cylinders: {
    view: (onView: (item: any) => void): ContextAction => ({
      id: "view",
      label: "View",
      icon: <Eye className="mr-2 h-4 w-4" />,
      onClick: onView,
      variant: "outline", 
      condition: () => true,
      priority: 1
    }),

    edit: (onEdit: (item: any) => void): ContextAction => ({
      id: "edit",
      label: "Edit",
      icon: <Edit className="mr-2 h-4 w-4" />,
      onClick: onEdit,
      variant: "outline",
      condition: () => true,
      priority: 2
    }),

    markAvailable: (onMarkAvailable: (item: any) => void): ContextAction => ({
      id: "mark-available",
      label: "Mark Available",
      icon: <CheckCircle className="mr-2 h-4 w-4" />,
      onClick: onMarkAvailable,
      variant: "default",
      className: "bg-green-600 hover:bg-green-700 text-white",
      condition: (item) => item.status !== 'available',
      priority: 3
    }),

    markEmpty: (onMarkEmpty: (item: any) => void): ContextAction => ({
      id: "mark-empty",
      label: "Mark Empty",
      icon: <AlertCircle className="mr-2 h-4 w-4" />,
      onClick: onMarkEmpty,
      variant: "outline",
      condition: (item) => item.status === 'available',
      priority: 3
    }),

    retire: (onRetire: (item: any) => void): ContextAction => ({
      id: "retire",
      label: "Retire",
      icon: <Archive className="mr-2 h-4 w-4" />,
      onClick: onRetire,
      variant: "destructive",
      condition: (item) => item.status !== 'retired',
      priority: 10
    })
  }
}

// Helper function to get filtered and sorted actions
export function getContextActions(
  actions: ContextAction[], 
  item: any
): ContextAction[] {
  return actions
    .filter(action => {
      // Ensure condition is a function before calling it
      if (typeof action.condition === 'function') {
        return action.condition(item)
      }
      // If no condition function, show the action by default
      return true
    })
    .sort((a, b) => (a.priority || 5) - (b.priority || 5))
}

// Status-based styling helper
export function getStatusColor(status: string): {
  variant: "default" | "secondary" | "destructive" | "outline"
  className?: string
} {
  const statusMap: Record<string, any> = {
    // Order statuses
    pending: { variant: "outline", className: "border-yellow-400 text-yellow-700" },
    processing: { variant: "default", className: "bg-blue-600" },
    confirmed: { variant: "default", className: "bg-green-600" },
    shipped: { variant: "default", className: "bg-purple-600" },
    delivered: { variant: "default", className: "bg-green-700" },
    cancelled: { variant: "destructive" },
    refunded: { variant: "secondary" },

    // User statuses  
    active: { variant: "default", className: "bg-green-600" },
    inactive: { variant: "secondary" },
    blocked: { variant: "destructive" },
    suspended: { variant: "destructive" },

    // Product statuses
    published: { variant: "default", className: "bg-green-600" },
    draft: { variant: "secondary" },
    archived: { variant: "outline" },

    // Payment statuses
    paid: { variant: "default", className: "bg-green-600" },
    unpaid: { variant: "destructive" },
    partial: { variant: "outline", className: "border-yellow-400 text-yellow-700" },

    // Cylinder statuses
    available: { variant: "default", className: "bg-green-600" },
    empty: { variant: "outline", className: "border-red-400 text-red-700" },
    retired: { variant: "secondary" }
  }

  return statusMap[status.toLowerCase()] || { variant: "secondary" }
}
