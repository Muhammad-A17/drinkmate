"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslation } from "@/lib/translation-context"
import { useDebounce } from "use-debounce"

interface FilterBarProps {
  onSearchChange: (query: string) => void
  onSortChange: (sort: string) => void
  onCategoryChange: (category: string) => void
  searchQuery: string
  selectedCategory: string
  sortBy: string
}

const categories = [
  { key: "all", label: "All" },
  { key: "fruity", label: "Fruity" },
  { key: "citrus", label: "Citrus" },
  { key: "berry", label: "Berry" },
  { key: "cola", label: "Cola" },
  { key: "mocktails", label: "Mocktails" },
  { key: "seasonal", label: "Seasonal" }
]

const sortOptions = [
  { value: "popular", label: "Most popular" },
  { value: "new", label: "Newest" },
  { value: "time", label: "Shortest time" },
  { value: "rating", label: "Highest rated" }
]

export default function FilterBar({ 
  onSearchChange, 
  onSortChange, 
  onCategoryChange, 
  searchQuery, 
  selectedCategory, 
  sortBy 
}: FilterBarProps) {
  const { t, isRTL, isHydrated } = useTranslation()
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [debouncedSearchQuery] = useDebounce(localSearchQuery, 250)

  // Update parent when debounced search changes
  useEffect(() => {
    onSearchChange(debouncedSearchQuery)
  }, [debouncedSearchQuery, onSearchChange])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(e.target.value)
  }, [])

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(e.target.value)
  }, [onSortChange])

  const handleCategoryChange = useCallback((category: string) => {
    onCategoryChange(category)
  }, [onCategoryChange])

  return (
    <div className="sticky top-16 z-10 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 rounded-2xl border p-3 mb-6">
      <div className="flex flex-wrap gap-3 items-center">
        <input 
          placeholder={isRTL ? "البحث في الوصفات..." : "Search recipes…"} 
          className={`h-10 flex-1 min-w-0 rounded-xl border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}
          value={localSearchQuery}
          onChange={handleSearchChange}
        />
        <select 
          className={`h-10 rounded-xl border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}
          value={sortBy}
          onChange={handleSortChange}
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {isRTL ? getArabicSortLabel(option.value) : option.label}
            </option>
          ))}
        </select>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map(category => (
            <button 
              key={category.key}
              onClick={() => handleCategoryChange(category.key)}
              className={`h-9 px-3 rounded-full border text-sm font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
                selectedCategory === category.key 
                  ? "bg-sky-50 border-sky-300 text-sky-700" 
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              } ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}
            >
              {isRTL ? getArabicCategoryLabel(category.key) : category.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Helper function to get Arabic sort labels
function getArabicSortLabel(value: string): string {
  const labels: Record<string, string> = {
    popular: "الأكثر شعبية",
    new: "الأحدث",
    time: "أقصر وقت",
    rating: "الأعلى تقييماً"
  }
  return labels[value] || value
}

// Helper function to get Arabic category labels
function getArabicCategoryLabel(key: string): string {
  const labels: Record<string, string> = {
    all: "الكل",
    fruity: "فواكه",
    citrus: "حمضيات",
    berry: "توت",
    cola: "كولا",
    mocktails: "مشروبات غير كحولية",
    seasonal: "موسمية"
  }
  return labels[key] || key
}
