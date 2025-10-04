"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, open, onOpenChange, type, duration }) {
        return (
          <Toast 
            key={id} 
            id={id}
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            description={description}
            action={action}
            type={type}
            duration={duration}
          />
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
