"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface RefreshButtonProps {
  onRefresh: () => void
  isLoading?: boolean
  disabled?: boolean
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
}

export default function RefreshButton({
  onRefresh,
  isLoading = false,
  disabled = false,
  variant = "outline",
  size = "default",
  className,
  children
}: RefreshButtonProps) {
  return (
    <Button
      onClick={onRefresh}
      disabled={disabled || isLoading}
      variant={variant}
      size={size}
      className={cn(
        "flex items-center gap-2 transition-all duration-200",
        isLoading && "animate-pulse",
        className
      )}
    >
      <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
      {children || "Refresh"}
    </Button>
  )
}
