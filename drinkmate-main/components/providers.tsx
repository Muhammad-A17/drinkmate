"use client"

import { ReactNode } from "react"
import { Toaster } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DialogProvider } from "@/components/providers/dialog-provider"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <TooltipProvider>
      <DialogProvider>
        {children}
        <Toaster
          position="top-right"
          expand={true}
          richColors={true}
          closeButton={true}
          duration={4000}
          toastOptions={{
            style: {
              background: 'var(--background)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
            },
          }}
        />
      </DialogProvider>
    </TooltipProvider>
  )
}
