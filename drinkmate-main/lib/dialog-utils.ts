"use client"

import { useDialog } from "@/components/providers/dialog-provider"

// Custom alert function to replace window.alert
export const customAlert = async (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
  const { alert } = useDialog()
  
  // Split message into title and description if it contains newlines
  const parts = message.split('\n')
  const title = parts[0] || "Alert"
  const description = parts.slice(1).join('\n') || message
  
  await alert({
    title,
    description,
    type,
    confirmText: "OK"
  })
}

// Custom confirm function to replace window.confirm
export const customConfirm = async (message: string, variant: "default" | "destructive" = "default"): Promise<boolean> => {
  const { confirm } = useDialog()
  
  // Split message into title and description if it contains newlines
  const parts = message.split('\n')
  const title = parts[0] || "Confirm"
  const description = parts.slice(1).join('\n') || message
  
  return await confirm({
    title,
    description,
    variant,
    confirmText: "Confirm",
    cancelText: "Cancel"
  })
}

// Custom prompt function to replace window.prompt
export const customPrompt = async (
  message: string, 
  defaultValue: string = "",
  placeholder: string = "Enter value"
): Promise<string | null> => {
  const { prompt } = useDialog()
  
  // Split message into title and description if it contains newlines
  const parts = message.split('\n')
  const title = parts[0] || "Prompt"
  const description = parts.slice(1).join('\n') || message
  
  return await prompt({
    title,
    description,
    placeholder,
    defaultValue,
    confirmText: "OK",
    cancelText: "Cancel",
    required: true
  })
}

// Toast notification function
export const customToast = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
  const { toast } = useDialog()
  
  // Split message into title and description if it contains newlines
  const parts = message.split('\n')
  const title = parts[0] || "Notification"
  const description = parts.slice(1).join('\n') || undefined
  
  toast({
    title,
    description,
    type,
    duration: type === "error" ? 7000 : 5000
  })
}

// Success toast
export const showSuccess = (message: string) => customToast(message, "success")

// Error toast
export const showError = (message: string) => customToast(message, "error")

// Warning toast
export const showWarning = (message: string) => customToast(message, "warning")

// Info toast
export const showInfo = (message: string) => customToast(message, "info")
