'use client'

import React from 'react'
import { useNavigation } from '@/lib/contexts/navigation-context'
import { Loader2 } from 'lucide-react'

export function NavigationLoader() {
  const { navigationState } = useNavigation()

  if (!navigationState.isNavigating) return null

  const duration = navigationState.startTime 
    ? Date.now() - navigationState.startTime 
    : 0

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="flex items-center justify-center py-3 px-4">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              Loading page...
            </span>
            <span className="text-xs text-gray-500">
              {navigationState.navigationPath}
            </span>
          </div>
        </div>
        {duration > 1000 && (
          <div className="ml-4 text-xs text-gray-400">
            {Math.round(duration / 1000)}s
          </div>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="h-1 bg-gray-200">
        <div 
          className="h-full bg-blue-600 transition-all duration-300 ease-out"
          style={{
            width: `${Math.min(90, (duration / 2000) * 100)}%`
          }}
        />
      </div>
    </div>
  )
}
