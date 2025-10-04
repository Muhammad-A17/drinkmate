"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react"

interface ToastProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  type?: "success" | "error" | "warning" | "info"
  duration?: number
}

const Toast = ({
  open,
  onOpenChange,
  title,
  description,
  type = "info",
  duration = 5000
}: ToastProps) => {
  React.useEffect(() => {
    if (open && duration > 0) {
      const timer = setTimeout(() => {
        onOpenChange(false)
      }, duration)
      return () => clearTimeout(timer)
    }
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
        <button
          onClick={() => onOpenChange(false)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export { Toast }