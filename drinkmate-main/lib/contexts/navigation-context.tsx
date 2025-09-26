'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface NavigationState {
  isNavigating: boolean
  navigationPath: string | null
  startTime: number | null
}

interface NavigationContextType {
  navigationState: NavigationState
  startNavigation: (path: string) => void
  endNavigation: () => void
  isNavigating: boolean
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    isNavigating: false,
    navigationPath: null,
    startTime: null
  })

  const startNavigation = useCallback((path: string) => {
    setNavigationState({
      isNavigating: true,
      navigationPath: path,
      startTime: Date.now()
    })
  }, [])

  const endNavigation = useCallback(() => {
    setNavigationState({
      isNavigating: false,
      navigationPath: null,
      startTime: null
    })
  }, [])

  return (
    <NavigationContext.Provider
      value={{
        navigationState,
        startNavigation,
        endNavigation,
        isNavigating: navigationState.isNavigating
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}
