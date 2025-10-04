"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HelpCircle } from "lucide-react"

interface PromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  placeholder?: string
  defaultValue?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: (value: string) => void
  onCancel?: () => void
  required?: boolean
}

const PromptDialog = ({
  open,
  onOpenChange,
  title,
  description,
  placeholder = "Enter value",
  defaultValue = "",
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  required = false
}: PromptDialogProps) => {
  const [value, setValue] = React.useState(defaultValue)

  React.useEffect(() => {
    if (open) {
      setValue(defaultValue)
    }
  }, [open, defaultValue])

  const handleConfirm = () => {
    if (required && !value.trim()) return
    onConfirm?.(value)
    onOpenChange(false)
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <HelpCircle className="h-6 w-6 text-blue-600" />
            <DialogTitle className="text-left">{title}</DialogTitle>
          </div>
          {description && (
            <DialogDescription className="text-left">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="px-6 py-4">
          <Label htmlFor="prompt-input" className="sr-only">
            {placeholder}
          </Label>
          <Input
            id="prompt-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            onKeyPress={handleKeyPress}
            autoFocus
            className="w-full"
          />
        </div>
        <DialogFooter className="gap-2">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={required && !value.trim()}
            className="w-full sm:w-auto"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { PromptDialog }
