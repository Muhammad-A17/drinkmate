"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslation } from "@/lib/translation-context"
import { useDebounce } from "use-debounce"
import { Search, Filter, X, SlidersHorizontal } from "lucide-react"

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
  const [debouncedSearchQuery] = useDebounce(localSearchQuery, 300)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Sync local search query with parent prop changes
  useEffect(() => {
    if (searchQuery !== localSearchQuery) {
      setLocalSearchQuery(searchQuery)
    }
  }, [searchQuery, localSearchQuery])

  // Update parent when debounced search changes
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      onSearchChange(debouncedSearchQuery)
    }
  }, [debouncedSearchQuery, onSearchChange, searchQuery])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(e.target.value)
  }, [])

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(e.target.value)
  }, [onSortChange])

  const handleCategoryChange = useCallback((category: string) => {
    onCategoryChange(category)
    // Close mobile filters after selection
    if (window.innerWidth < 768) {
      setIsFiltersOpen(false)
    }
  }, [onCategoryChange])

  const clearSearch = useCallback(() => {
    setLocalSearchQuery('')
    onSearchChange('')
  }, [onSearchChange])

  const activeFiltersCount = (selectedCategory !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
      {/* Main Filter Row */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Bar */}
          <div className="md:col-span-5 relative">
            <div className="relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
              <input 
                type="text"
                placeholder={isRTL ? "البحث في الوصفات..." : "Search recipes..."} 
                className={`w-full h-11 rounded-xl border border-gray-300 bg-white text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 hover:border-gray-400 ${
                  isRTL ? 'pr-10 pl-10 font-cairo text-right' : 'pl-10 pr-10 font-montserrat text-left'
                }`}
                value={localSearchQuery}
                onChange={handleSearchChange}
              />
              {localSearchQuery && (
                <button
                  onClick={clearSearch}
                  className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors duration-200 ${isRTL ? 'left-2' : 'right-2'}`}
                  title={isRTL ? "مسح البحث" : "Clear search"}
                >
                  <X className="w-3 h-3 text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Sort Dropdown - Desktop */}
          <div className="md:col-span-3 hidden md:block">
            <div className="relative">
              <SlidersHorizontal className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
              <select 
                className={`w-full h-11 rounded-xl border border-gray-300 bg-white text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 hover:border-gray-400 ${
                  isRTL ? 'pr-10 pl-8 font-cairo' : 'pl-10 pr-8 font-montserrat'
                } appearance-none cursor-pointer`}
                value={sortBy}
                onChange={handleSortChange}
                title={isRTL ? "ترتيب الوصفات" : "Sort recipes"}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {isRTL ? getArabicSortLabel(option.value) : option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="md:col-span-4 flex justify-between items-center md:justify-end">
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
            >
              <Filter className="w-4 h-4" />
              <span className={`text-sm font-medium ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                {isRTL ? "تصفية" : "Filter"}
              </span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-sky-500 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            
            {/* Results Count - Desktop */}
            <div className="hidden md:block text-sm text-gray-600">
              {searchQuery || selectedCategory !== 'all' ? (
                <span className={`${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                  {isRTL ? "النتائج المصفاة" : "Filtered results"}
                </span>
              ) : (
                <span className={`${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                  {isRTL ? "جميع الوصفات" : "All recipes"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Panel */}
      {isFiltersOpen && (
        <div className="md:hidden border-t border-gray-200 p-4 space-y-4">
          {/* Sort Dropdown - Mobile */}
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-2 ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              {isRTL ? "ترتيب حسب" : "Sort by"}
            </label>
            <select 
              className={`w-full h-11 rounded-xl border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}
              value={sortBy}
              onChange={handleSortChange}
              title={isRTL ? "ترتيب حسب" : "Sort by"}
              aria-label={isRTL ? "ترتيب حسب" : "Sort by"}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {isRTL ? getArabicSortLabel(option.value) : option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Categories - Mobile */}
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-3 ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              {isRTL ? "الفئات" : "Categories"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(category => (
                <button 
                  key={category.key}
                  onClick={() => handleCategoryChange(category.key)}
                  className={`h-10 px-3 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
                    selectedCategory === category.key 
                      ? "bg-sky-500 text-white shadow-sm" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                  } ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}
                >
                  {isRTL ? getArabicCategoryLabel(category.key) : category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Categories */}
      <div className="hidden md:block border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium text-gray-700 ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}>
            {isRTL ? "الفئات:" : "Categories:"}
          </span>
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <button 
                key={category.key}
                onClick={() => handleCategoryChange(category.key)}
                className={`h-9 px-4 rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
                  selectedCategory === category.key 
                    ? "bg-sky-500 text-white shadow-sm" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                } ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}
              >
                {isRTL ? getArabicCategoryLabel(category.key) : category.label}
              </button>
            ))}
          </div>
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
