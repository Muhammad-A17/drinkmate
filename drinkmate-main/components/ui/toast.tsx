"use client"

import { useState, useEffect, forwardRef } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  id: string
  type?: 'success' | 'error' | 'info' | 'warning' | 'default'
  title?: React.ReactNode
  description?: React.ReactNode
  message?: string
  duration?: number
  onClose?: (id: string) => void
  variant?: 'default' | 'destructive'
  action?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// Export ToastProps for compatibility
export type { ToastProps }

// Additional components for compatibility with existing UI
export const ToastClose = forwardRef<HTMLButtonElement, { onClick?: () => void; className?: string }>(
  ({ onClick, className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn("bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500", className)}
      onClick={onClick}
      {...props}
    >
      <span className="sr-only">Close</span>
      <X className="h-5 w-5" />
    </button>
  )
)
ToastClose.displayName = "ToastClose"

export const ToastDescription = forwardRef<HTMLParagraphElement, { children: React.ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => (
    <p ref={ref} className={cn("mt-1 text-sm text-gray-500", className)} {...props}>
      {children}
    </p>
  )
)
ToastDescription.displayName = "ToastDescription"

export const ToastTitle = forwardRef<HTMLParagraphElement, { children: React.ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm font-medium text-gray-900", className)} {...props}>
      {children}
    </p>
  )
)
ToastTitle.displayName = "ToastTitle"

export const ToastProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>
ToastProvider.displayName = "ToastProvider"

export const ToastViewport = forwardRef<HTMLDivElement, { className?: string }>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50", className)}
      {...props}
    />
  )
)
ToastViewport.displayName = "ToastViewport"

export const ToastActionElement = forwardRef<HTMLButtonElement, { children: React.ReactNode; className?: string; onClick?: () => void }>(
  ({ children, className, onClick, ...props }, ref) => (
    <button
      ref={ref}
      className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
)
ToastActionElement.displayName = "ToastActionElement"

export function Toast({ 
  id, 
  type = 'default', 
  title, 
  description, 
  message, 
  duration = 5000, 
  onClose, 
  variant = 'default',
  action,
  open = true,
  onOpenChange
}: ToastProps) {
  useEffect(() => {
    if (onClose && duration > 0) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [id, duration, onClose])

  const getIcon = () => {
    if (variant === 'destructive' || type === 'error') {
      return <AlertCircle className="h-5 w-5 text-red-500" />
    }
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBackgroundColor = () => {
    if (variant === 'destructive') {
      return 'bg-red-50 border-red-200'
    }
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-white border-gray-200'
    }
  }

  if (!open) return null

  return (
    <div
      className={cn(
        "max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border",
        getBackgroundColor()
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            {title && (
              <p className="text-sm font-medium text-gray-900">
                {title}
              </p>
            )}
            {(description || message) && (
              <p className="mt-1 text-sm text-gray-500">
                {description || message}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            {action && (
              <div className="mr-2">
                {action}
              </div>
            )}
            <button
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => {
                if (onClose) onClose(id)
                if (onOpenChange) onOpenChange(false)
              }}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Array<{
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    title: string
    message?: string
    duration?: number
  }>
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={onClose}
          />
        ))}
      </div>
    </div>
  )
}
