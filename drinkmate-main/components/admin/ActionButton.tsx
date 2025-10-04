"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface ActionButtonProps {
  onClick: () => void
  icon?: LucideIcon
  children: React.ReactNode
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: boolean
  loading?: boolean
  className?: string
  title?: string
}

export default function ActionButton({
  onClick,
  icon: Icon,
  children,
  variant = "outline",
  size = "sm",
  disabled = false,
  loading = false,
  className,
  title
}: ActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      variant={variant}
      size={size}
      className={cn(
        "flex items-center gap-2 transition-all duration-200",
        loading && "animate-pulse",
        className
      )}
      title={title}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Button>
  )
}
