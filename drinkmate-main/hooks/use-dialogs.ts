"use client"

import { useState, useCallback } from "react"

interface AlertOptions {
  title: string
  description: string
  type?: "info" | "success" | "warning" | "error"
  confirmText?: string
}

interface ConfirmOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

interface PromptOptions {
  title: string
  description?: string
  placeholder?: string
  defaultValue?: string
  confirmText?: string
  cancelText?: string
  required?: boolean
}

interface ToastOptions {
  title: string
  description?: string
  type?: "success" | "error" | "warning" | "info"
  duration?: number
}

export const useDialogs = () => {
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean
    options: AlertOptions
    onConfirm?: () => void
  }>({
    open: false,
    options: { title: "", description: "" }
  })

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    options: ConfirmOptions
    onConfirm?: () => void
    onCancel?: () => void
  }>({
    open: false,
    options: { title: "", description: "" }
  })

  const [promptDialog, setPromptDialog] = useState<{
    open: boolean
    options: PromptOptions
    onConfirm?: (value: string) => void
    onCancel?: () => void
  }>({
    open: false,
    options: { title: "", description: "" }
  })

  const [toast, setToast] = useState<{
    open: boolean
    options: ToastOptions
  }>({
    open: false,
    options: { title: "" }
  })

  const showAlert = useCallback((options: AlertOptions, onConfirm?: () => void) => {
    setAlertDialog({ open: true, options, onConfirm })
  }, [])

  const showConfirm = useCallback((
    options: ConfirmOptions, 
    onConfirm?: () => void, 
    onCancel?: () => void
  ) => {
    setConfirmDialog({ open: true, options, onConfirm, onCancel })
  }, [])

  const showPrompt = useCallback((
    options: PromptOptions,
    onConfirm?: (value: string) => void,
    onCancel?: () => void
  ) => {
    setPromptDialog({ open: true, options, onConfirm, onCancel })
  }, [])

  const showToast = useCallback((options: ToastOptions) => {
    setToast({ open: true, options })
  }, [])

  const hideAlert = useCallback(() => {
    setAlertDialog(prev => ({ ...prev, open: false }))
  }, [])

  const hideConfirm = useCallback(() => {
    setConfirmDialog(prev => ({ ...prev, open: false }))
  }, [])

  const hidePrompt = useCallback(() => {
    setPromptDialog(prev => ({ ...prev, open: false }))
  }, [])

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, open: false }))
  }, [])

  // Promise-based methods for easier use
  const alert = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      showAlert(options, () => resolve())
    })
  }, [showAlert])

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      showConfirm(
        options,
        () => resolve(true),
        () => resolve(false)
      )
    })
  }, [showConfirm])

  const prompt = useCallback((options: PromptOptions): Promise<string | null> => {
    return new Promise((resolve) => {
      showPrompt(
        options,
        (value) => resolve(value),
        () => resolve(null)
      )
    })
  }, [showPrompt])

  return {
    // State
    alertDialog,
    confirmDialog,
    promptDialog,
    toast,
    
    // Actions
    showAlert,
    showConfirm,
    showPrompt,
    showToast,
    hideAlert,
    hideConfirm,
    hidePrompt,
    hideToast,
    
    // Promise-based methods
    alert,
    confirm,
    prompt
  }
}
