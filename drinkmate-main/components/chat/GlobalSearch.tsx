"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  X, 
  Filter, 
  Clock, 
  User, 
  MessageSquare,
  Tag,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Conversation, Message } from '@/types/chat'
import { getCustomerDisplayName, formatRelativeTime } from '@/lib/chat-utils'
import { cn } from '@/lib/utils'

interface GlobalSearchProps {
  conversations: Conversation[]
  onConversationSelect: (conversation: Conversation) => void
  onFilterChange: (filters: any) => void
  isRTL?: boolean
}

interface SearchResult {
  conversation: Conversation
  message?: Message
  matchType: 'customer' | 'message' | 'tag' | 'order'
  matchText: string
  relevanceScore: number
}

const searchFilters = [
  { key: 'status', label: 'Status', icon: AlertCircle },
  { key: 'priority', label: 'Priority', icon: Tag },
  { key: 'assignee', label: 'Assignee', icon: User },
  { key: 'channel', label: 'Channel', icon: MessageSquare }
]

export default function GlobalSearch({
  conversations,
  onConversationSelect,
  onFilterChange,
  isRTL = false
}: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Load search history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chat-search-history')
      if (saved) {
        setSearchHistory(JSON.parse(saved))
      }
    }
  }, [])

  // Save search history to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat-search-history', JSON.stringify(searchHistory))
    }
  }, [searchHistory])

  // Perform search
  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setShowResults(false)
      return
    }

    const queryLower = searchQuery.toLowerCase()
    const searchResults: SearchResult[] = []

    conversations.forEach(conversation => {
      let relevanceScore = 0
      let matchType: SearchResult['matchType'] = 'customer'
      let matchText = ''

      // Search customer name
      const customerName = getCustomerDisplayName(conversation.customer)
      if (customerName.toLowerCase().includes(queryLower)) {
        relevanceScore += 100
        matchType = 'customer'
        matchText = customerName
      }

      // Search customer email
      if (conversation.customer.email?.toLowerCase().includes(queryLower)) {
        relevanceScore += 90
        matchType = 'customer'
        matchText = conversation.customer.email
      }

      // Search customer phone
      if (conversation.customer.phone?.toLowerCase().includes(queryLower)) {
        relevanceScore += 80
        matchType = 'customer'
        matchText = conversation.customer.phone
      }

      // Search order number
      if (conversation.orderNumber?.toLowerCase().includes(queryLower)) {
        relevanceScore += 70
        matchType = 'order'
        matchText = conversation.orderNumber
      }

      // Search tags
      conversation.tags.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower)) {
          relevanceScore += 60
          matchType = 'tag'
          matchText = tag
        }
      })

      // Search tags
      conversation.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower)) {
          relevanceScore += 30
          matchType = 'tag'
          matchText = tag
        }
      })

      if (relevanceScore > 0) {
        searchResults.push({
          conversation,
          matchType,
          matchText,
          relevanceScore
        })
      }
    })

    // Sort by relevance score
    searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore)
    setResults(searchResults.slice(0, 10)) // Limit to 10 results
    setShowResults(true)
  }

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    performSearch(searchQuery)
    
    // Add to search history
    if (searchQuery.trim() && !searchHistory.includes(searchQuery.trim())) {
      setSearchHistory(prev => [searchQuery.trim(), ...prev.slice(0, 9)])
    }
  }

  const handleResultClick = (result: SearchResult) => {
    onConversationSelect(result.conversation)
    setShowResults(false)
    setQuery('')
  }

  const handleFilterClick = (filterKey: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }))
    onFilterChange({ [filterKey]: value })
  }

  const clearFilters = () => {
    setActiveFilters({})
    onFilterChange({})
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
    inputRef.current?.focus()
  }

  const getMatchIcon = (matchType: SearchResult['matchType']) => {
    switch (matchType) {
      case 'customer':
        return <User className="w-4 h-4" />
      case 'message':
        return <MessageSquare className="w-4 h-4" />
      case 'tag':
        return <Tag className="w-4 h-4" />
      case 'order':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Search className="w-4 h-4" />
    }
  }

  const getMatchColor = (matchType: SearchResult['matchType']) => {
    switch (matchType) {
      case 'customer':
        return 'text-blue-600'
      case 'message':
        return 'text-green-600'
      case 'tag':
        return 'text-purple-600'
      case 'order':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          ref={inputRef}
          placeholder="Search conversations, customers, messages..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query && setShowResults(true)}
          className="pl-10 pr-10"
          dir={isRTL ? "rtl" : "ltr"}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {Object.entries(activeFilters).map(([key, value]) => (
            <Badge
              key={key}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {key}: {value}
              <button
                onClick={() => {
                  const newFilters = { ...activeFilters }
                  delete newFilters[key]
                  setActiveFilters(newFilters)
                  onFilterChange(newFilters)
                }}
                className="ml-1 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={`${result.conversation.id}-${index}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("mt-1", getMatchColor(result.matchType))}>
                      {getMatchIcon(result.matchType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {getCustomerDisplayName(result.conversation.customer)}
                        </h4>
                        <Badge className={cn("text-xs", 
                          result.conversation.status === 'new' && "bg-blue-100 text-blue-800",
                          result.conversation.status === 'waiting_for_agent' && "bg-yellow-100 text-yellow-800",
                          result.conversation.status === 'closed' && "bg-gray-100 text-gray-800"
                        )}>
                          {result.conversation.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {result.matchText}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>{formatRelativeTime(result.conversation.lastMessageAt)}</span>
                        <span>•</span>
                        <span>{result.matchType}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Search History */}
          {query === '' && searchHistory.length > 0 && (
            <div className="border-t pt-2">
              <div className="px-3 py-2 text-xs font-medium text-gray-500">Recent searches</div>
              {searchHistory.slice(0, 5).map((historyItem, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(historyItem)}
                  className="w-full p-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Clock className="w-4 h-4 text-gray-400" />
                  {historyItem}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Filters */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-sm text-gray-600">Quick filters:</span>
        {searchFilters.map((filter) => {
          const Icon = filter.icon
          return (
            <Button
              key={filter.key}
              variant="outline"
              size="sm"
              onClick={() => {
                // In real app, this would open a filter dropdown
                console.log(`Filter by ${filter.key}`)
              }}
              className="text-xs"
            >
              <Icon className="w-3 h-3 mr-1" />
              {filter.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
