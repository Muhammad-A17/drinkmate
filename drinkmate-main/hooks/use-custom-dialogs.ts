"use client"

import { useDialog } from "@/components/providers/dialog-provider"

export const useCustomDialogs = () => {
  const { alert, confirm, prompt, toast } = useDialog()

  // Custom alert function to replace window.alert
  const customAlert = async (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
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
  const customConfirm = async (message: string, variant: "default" | "destructive" = "default"): Promise<boolean> => {
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
  const customPrompt = async (
    message: string, 
    defaultValue: string = "",
    placeholder: string = "Enter value"
  ): Promise<string | null> => {
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

  // Toast notification functions
  const showSuccess = (message: string) => {
    const parts = message.split('\n')
    const title = parts[0] || "Success"
    const description = parts.slice(1).join('\n') || undefined
    
    toast({
      title,
      description,
      type: "success",
      duration: 5000
    })
  }

  const showError = (message: string) => {
    const parts = message.split('\n')
    const title = parts[0] || "Error"
    const description = parts.slice(1).join('\n') || undefined
    
    toast({
      title,
      description,
      type: "error",
      duration: 7000
    })
  }

  const showWarning = (message: string) => {
    const parts = message.split('\n')
    const title = parts[0] || "Warning"
    const description = parts.slice(1).join('\n') || undefined
    
    toast({
      title,
      description,
      type: "warning",
      duration: 6000
    })
  }

  const showInfo = (message: string) => {
    const parts = message.split('\n')
    const title = parts[0] || "Info"
    const description = parts.slice(1).join('\n') || undefined
    
    toast({
      title,
      description,
      type: "info",
      duration: 5000
    })
  }

  return {
    // Direct dialog functions
    alert: customAlert,
    confirm: customConfirm,
    prompt: customPrompt,
    
    // Toast functions
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Generic toast
    toast: (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
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
  }
}
