"use client"

import { ReactNode } from "react"
import { Toaster } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <TooltipProvider>
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
    </TooltipProvider>
  )
}
