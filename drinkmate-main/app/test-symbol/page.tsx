"use client"

import SaudiRiyalSymbol from "@/components/ui/SaudiRiyalSymbol"

export default function TestSymbolPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Saudi Riyal Symbol Test (SVG Only)</h1>
        
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">SVG-based Symbol Sizes</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs">XS (12px):</span>
              <SaudiRiyalSymbol size="xs" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">SM (14px):</span>
              <SaudiRiyalSymbol size="sm" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-base">MD (16px):</span>
              <SaudiRiyalSymbol size="md" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg">LG (18px):</span>
              <SaudiRiyalSymbol size="lg" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xl">XL (20px):</span>
              <SaudiRiyalSymbol size="xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">Color Variations</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span>Default:</span>
              <SaudiRiyalSymbol size="md" />
            </div>
            <div className="flex items-center gap-4">
              <span>Blue:</span>
              <SaudiRiyalSymbol size="md" color="#3B82F6" />
            </div>
            <div className="flex items-center gap-4">
              <span>Green:</span>
              <SaudiRiyalSymbol size="md" color="#10B981" />
            </div>
            <div className="flex items-center gap-4">
              <span>Red:</span>
              <SaudiRiyalSymbol size="md" color="#EF4444" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Price Examples</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>150.00</span>
              <SaudiRiyalSymbol size="sm" />
            </div>
            <div className="flex items-center gap-2">
              <span>299.50</span>
              <SaudiRiyalSymbol size="md" />
            </div>
            <div className="flex items-center gap-2">
              <span>1,250.00</span>
              <SaudiRiyalSymbol size="lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
