"use client"

import { useEffect, useState } from 'react'

export default function DebugAPIPage() {
  const [apiInfo, setApiInfo] = useState<any>(null)

  useEffect(() => {
    const info = {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NODE_ENV: process.env.NODE_ENV,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'server-side',
      currentURL: typeof window !== 'undefined' ? window.location.href : 'server-side',
      expectedAPI: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    }
    setApiInfo(info)
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">API Configuration Debug</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <pre className="text-sm">
          {JSON.stringify(apiInfo, null, 2)}
        </pre>
      </div>
      
      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Test API Endpoints:</h2>
        <div className="space-y-2">
          <a 
            href={`${apiInfo?.expectedAPI}/shop/products`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-blue-600 hover:underline"
          >
            Test Products API: {apiInfo?.expectedAPI}/shop/products
          </a>
          <a 
            href={`${apiInfo?.expectedAPI}/shop/categories`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-blue-600 hover:underline"
          >
            Test Categories API: {apiInfo?.expectedAPI}/shop/categories
          </a>
        </div>
      </div>
    </div>
  )
}
