"use client"

import React, { createContext, useContext } from "react"
import { useDialogs } from "@/hooks/use-dialogs"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { PromptDialog } from "@/components/ui/prompt-dialog"
import { Toast } from "@/components/ui/toast"

interface DialogContextType {
  alert: (options: {
    title: string
    description: string
    type?: "info" | "success" | "warning" | "error"
    confirmText?: string
  }) => Promise<void>
  confirm: (options: {
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: "default" | "destructive"
  }) => Promise<boolean>
  prompt: (options: {
    title: string
    description?: string
    placeholder?: string
    defaultValue?: string
    confirmText?: string
    cancelText?: string
    required?: boolean
  }) => Promise<string | null>
  toast: (options: {
    title: string
    description?: string
    type?: "success" | "error" | "warning" | "info"
    duration?: number
  }) => void
}

const DialogContext = createContext<DialogContextType | undefined>(undefined)

export const useDialog = () => {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider")
  }
  return context
}

export const DialogProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    alertDialog,
    confirmDialog,
    promptDialog,
    toast,
    alert,
    confirm,
    prompt,
    showToast,
    hideAlert,
    hideConfirm,
    hidePrompt,
    hideToast
  } = useDialogs()

  const contextValue: DialogContextType = {
    alert,
    confirm,
    prompt,
    toast: showToast
  }

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      
      {/* Global Dialog Components */}
      <AlertDialog
        open={alertDialog.open}
        onOpenChange={hideAlert}
        title={alertDialog.options.title}
        description={alertDialog.options.description}
        type={alertDialog.options.type}
        confirmText={alertDialog.options.confirmText}
        onConfirm={alertDialog.onConfirm}
      />
      
      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={hideConfirm}
        title={confirmDialog.options.title}
        description={confirmDialog.options.description}
        confirmText={confirmDialog.options.confirmText}
        cancelText={confirmDialog.options.cancelText}
        variant={confirmDialog.options.variant}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
      />
      
      <PromptDialog
        open={promptDialog.open}
        onOpenChange={hidePrompt}
        title={promptDialog.options.title}
        description={promptDialog.options.description}
        placeholder={promptDialog.options.placeholder}
        defaultValue={promptDialog.options.defaultValue}
        confirmText={promptDialog.options.confirmText}
        cancelText={promptDialog.options.cancelText}
        required={promptDialog.options.required}
        onConfirm={promptDialog.onConfirm}
        onCancel={promptDialog.onCancel}
      />
      
      <Toast
        open={toast.open}
        onOpenChange={hideToast}
        title={toast.options.title}
        description={toast.options.description}
        type={toast.options.type}
        duration={toast.options.duration}
      />
    </DialogContext.Provider>
  )
}
