"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import SaudiRiyalSymbol from "@/components/ui/SaudiRiyalSymbol"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RowActions } from "./AdminActionBar"
import { ContextAction, getContextActions, getStatusColor } from "./AdminContextActions"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export interface TableColumn<T = any> {
  key: string
  label: string
  sortable?: boolean
  width?: string
  render?: (value: any, row: T) => React.ReactNode
  className?: string
}

export interface TableAction<T = any> {
  id: string
  label: string
  icon?: React.ReactNode
  onClick: (row: T) => void
  variant?: "default" | "destructive" | "outline" | "secondary"
  separator?: boolean
  condition?: (row: T) => boolean
  className?: string
  priority?: number
}

// Extended interface for context-aware actions
export interface ContextTableAction<T = any> extends ContextAction {
  onClick: (row: T) => void
}

interface AdminTableProps<T = any> {
  // Data
  data: T[]
  columns: TableColumn<T>[]
  
  // Selection
  selectable?: boolean
  selectedRows?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  getRowId: (row: T) => string
  
  // Actions (choose one type)
  rowActions?: TableAction<T>[]
  contextActions?: ContextTableAction<T>[] // For context-aware actions
  
  // Action display mode
  actionMode?: "dropdown" | "buttons" // New prop to control action display
  
  // Pagination
  currentPage?: number
  totalPages?: number
  pageSize?: number
  totalItems?: number
  onPageChange?: (page: number) => void
  
  // Loading and empty states
  loading?: boolean
  emptyMessage?: string
  
  // Styling
  className?: string
  title?: string
}

export default function AdminTable<T = any>({
  data,
  columns,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  getRowId,
  rowActions = [],
  contextActions = [],
  actionMode = "dropdown",
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalItems,
  onPageChange,
  loading = false,
  emptyMessage = "No data found",
  className,
  title
}: AdminTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Handle select all
  const isAllSelected = data.length > 0 && selectedRows.length === data.length
  const isPartiallySelected = selectedRows.length > 0 && selectedRows.length < data.length

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange?.([])
    } else {
      onSelectionChange?.(data.map(getRowId))
    }
  }

  const handleSelectRow = (rowId: string) => {
    if (selectedRows.includes(rowId)) {
      onSelectionChange?.(selectedRows.filter(id => id !== rowId))
    } else {
      onSelectionChange?.([...selectedRows, rowId])
    }
  }

  // Handle sorting
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  // Filter row actions based on conditions
  const getRowActions = (row: T) => {
    if (contextActions.length > 0) {
      return getContextActions(contextActions, row)
    }
    return rowActions
      .filter(action => {
        // Ensure condition is a function before calling it
        if (typeof action.condition === 'function') {
          return action.condition(row)
        }
        // If no condition function, show the action by default
        return true
      })
      .sort((a, b) => (a.priority || 5) - (b.priority || 5))
  }

  const TableContent = () => (
    <Table>
      <TableHeader>
        <TableRow>
          {selectable && (
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                ref={(el) => {
                  if (el) {
                    const checkbox = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
                    if (checkbox) checkbox.indeterminate = isPartiallySelected;
                  }
                }}
              />
            </TableHead>
          )}
          {columns.map((column) => (
            <TableHead 
              key={column.key}
              className={cn(
                column.width && `w-[${column.width}]`,
                column.sortable && "cursor-pointer hover:bg-muted/50",
                column.className
              )}
              onClick={column.sortable ? () => handleSort(column.key) : undefined}
            >
              <div className="flex items-center gap-1">
                {column.label}
                {column.sortable && sortColumn === column.key && (
                  <span className="text-xs">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </TableHead>
          ))}
          {(rowActions.length > 0 || contextActions.length > 0) && (
            <TableHead className="w-12">Actions</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          // Skeleton loading rows
          Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
              {selectable && (
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
              )}
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
              {(rowActions.length > 0 || contextActions.length > 0) && (
                <TableCell>
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              )}
            </TableRow>
          ))
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell 
              colSpan={columns.length + (selectable ? 1 : 0) + ((rowActions.length > 0 || contextActions.length > 0) ? 1 : 0)}
              className="h-32 text-center"
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="text-muted-foreground text-sm">
                  {emptyMessage}
                </div>
                <div className="text-xs text-muted-foreground">
                  Try adjusting your search or filters
                </div>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          data.map((row) => {
            const rowId = getRowId(row)
            const isSelected = selectedRows.includes(rowId)
            const actions = getRowActions(row)
            
            return (
              <TableRow 
                key={rowId}
                className={cn(isSelected && "bg-muted/50")}
              >
                {selectable && (
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelectRow(rowId)}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.render 
                      ? column.render(row[column.key as keyof T], row)
                      : String(row[column.key as keyof T] || '')
                    }
                  </TableCell>
                ))}
                {(rowActions.length > 0 || contextActions.length > 0) && (
                  <TableCell>
                    {actions.length > 0 ? (
                      actionMode === "buttons" ? (
                        <div className="flex gap-1 justify-end">
                          {actions.map(action => (
                            <Button
                              key={action.id}
                              variant={action.variant || "outline"}
                              size="sm"
                              onClick={() => action.onClick(row)}
                              className={`h-8 px-2 ${action.className || ""}`}
                              title={action.label}
                            >
                              {action.icon}
                              <span className="sr-only">{action.label}</span>
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <RowActions 
                          actions={actions.map(action => ({
                            id: action.id,
                            label: action.label,
                            icon: action.icon,
                            onClick: () => action.onClick(row),
                            variant: action.variant,
                            separator: action.separator,
                            className: action.className
                          }))}
                        />
                      )
                    ) : (
                      <span className="text-muted-foreground text-xs">No actions</span>
                    )}
                  </TableCell>
                )}
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )

  return (
    <div className={cn("space-y-4", className)}>
      {title ? (
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TableContent />
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <TableContent />
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {totalItems && (
              <>
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange?.(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Commonly used cell renderers
export const CellRenderers = {
  badge: (variant: "default" | "secondary" | "destructive" | "outline" = "default") => 
    (value: string) => (
      <Badge variant={variant}>{value}</Badge>
    ),

  status: (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      )
    }
    
    const statusStyle = getStatusColor(value)
    return (
      <Badge variant={statusStyle.variant} className={statusStyle.className}>
        {value}
      </Badge>
    )
  },

  currency: (value: number, currency = "SAR") => (
    <span className="font-medium flex items-center gap-1">
      {new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)} {currency === "SAR" ? <SaudiRiyalSymbol size="sm" /> : currency}
    </span>
  ),

  date: (value: string | Date | null | undefined) => {
    if (!value) return 'N/A'
    const date = typeof value === 'string' ? new Date(value) : value
    // Check if the date is valid
    if (isNaN(date.getTime())) return 'Invalid Date'
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  },

  truncate: (maxLength: number = 50) => (value: string) => {
    if (!value) return ""
    return value.length > maxLength ? `${value.substring(0, maxLength)}...` : value
  }
}
