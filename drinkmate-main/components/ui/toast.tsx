"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react"

// ToastProps interface removed - using type export below

const Toast = ({
  open = true,
  onOpenChange,
  title,
  description,
  type = "info",
  duration = 5000,
  action,
  id
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  description?: string
  type?: "success" | "error" | "warning" | "info"
  duration?: number
  action?: React.ReactNode
  id?: string
}) => {
  React.useEffect(() => {
    if (open && duration > 0 && onOpenChange) {
      const timer = setTimeout(() => {
        onOpenChange(false)
      }, duration)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [open, duration, onOpenChange])

  if (!open) return null

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
      <div
        className={cn(
          "flex items-start space-x-3 p-4 rounded-lg border shadow-lg max-w-sm",
          getBackgroundColor()
        )}
      >
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {action}
          <button
            onClick={() => onOpenChange?.(false)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Additional components for compatibility
const ToastClose = ({ children, asChild = false }: { children: React.ReactNode; asChild?: boolean }) => {
  return <>{children}</>
}

const ToastDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <p className={cn("text-sm text-gray-600", className)}>{children}</p>
}

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const ToastTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <h2 className={cn("text-lg font-semibold leading-none tracking-tight text-gray-900", className)}>{children}</h2>
}

const ToastViewport = ({ className }: { className?: string }) => {
  return <div className={cn("fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]", className)} />
}

// Type exports for compatibility
export type ToastActionElement = React.ReactElement
export type ToastProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  description?: string
  type?: "success" | "error" | "warning" | "info"
  duration?: number
  action?: React.ReactNode
  id?: string
}

// Additional component for compatibility
const ToastContainer = ({ 
  children, 
  toasts, 
  onClose 
}: { 
  children?: React.ReactNode
  toasts?: Array<{
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    title: string
    message?: string
    duration?: number
  }>
  onClose?: (id: string) => void
}) => {
  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
      {children}
      {toasts?.map((toast) => (
        <Toast
          key={toast.id}
          open={true}
          onOpenChange={() => onClose?.(toast.id)}
          title={toast.title}
          description={toast.message}
          type={toast.type}
          duration={toast.duration}
        />
      ))}
    </div>
  )
}

export { 
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastContainer
}