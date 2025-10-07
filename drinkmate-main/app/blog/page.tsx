"use client"

import PageLayout from "@/components/layout/PageLayout"
import { Calendar, User, ArrowRight, Coffee, Heart, Search, Filter, SortAsc, Eye, MessageCircle, ThumbsUp, Share2, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useTranslation } from "@/lib/contexts/translation-context"
import { useState, useEffect } from "react"
import { blogAPI } from "@/lib/api/blog-api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BlogPost {
  _id: string
  title: string
  excerpt: string
  image: string
  category: string
  author: string
  authorName: string
  publishDate: string
  readTime: number
  views: number
  likes: number
  tags?: string[]
  comments?: Array<{
    _id: string
    user: string
    username: string
    comment: string
    isApproved: boolean
    createdAt: string
  }>
  slug?: string
}

export default function Blog() {
  const { t, isRTL, isHydrated } = useTranslation()
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [postsPerPage] = useState(6)
  const [selectedTag, setSelectedTag] = useState("")
  const [selectedAuthor, setSelectedAuthor] = useState("")
  const [selectedReadTime, setSelectedReadTime] = useState("")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [showFilters, setShowFilters] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  // Get URL parameters for all filtering
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const tagParam = urlParams.get('tag')
      const categoryParam = urlParams.get('category')
      const authorParam = urlParams.get('author')
      const readTimeParam = urlParams.get('readTime')
      const searchParam = urlParams.get('search')
      const sortParam = urlParams.get('sort')
      const startDateParam = urlParams.get('startDate')
      const endDateParam = urlParams.get('endDate')
      
      if (tagParam) setSelectedTag(tagParam)
      if (categoryParam) setSelectedCategory(categoryParam)
      if (authorParam) setSelectedAuthor(authorParam)
      if (readTimeParam) setSelectedReadTime(readTimeParam)
      if (searchParam) setSearchTerm(searchParam)
      if (sortParam) setSortBy(sortParam)
      if (startDateParam || endDateParam) {
        setDateRange({ start: startDateParam || "", end: endDateParam || "" })
      }
    }
  }, [])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Generate search suggestions
  useEffect(() => {
    if (searchTerm.length > 2) {
      const suggestions = [
        ...new Set([
          ...blogPosts.map(post => post.title),
          ...blogPosts.map(post => post.authorName),
          ...blogPosts.flatMap(post => post.tags || []),
          ...blogPosts.map(post => post.category)
        ])
      ]
        .filter(item => 
          item.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5)
      
      setSearchSuggestions(suggestions)
      setShowSuggestions(true)
    } else {
      setSearchSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchTerm, blogPosts])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.search-container')) {
        setShowSuggestions(false)
      }
    }

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
    
    return undefined
  }, [showSuggestions])

  // Fetch blog posts from API
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await blogAPI.getPosts({
          limit: 20,
          sort: 'newest',
          language: 'en'
        })
        const data = response?.data

        // Map API posts (author object) to local shape if needed
        const mapApiPostToLocal = (apiPost: any) => ({
          _id: String(apiPost._id),
          title: String(apiPost.title || ''),
          excerpt: String(apiPost.excerpt || ''),
          image: String(apiPost.image || ''),
          category: String(apiPost.category || ''),
          author: typeof apiPost.author === 'object' && apiPost.author?.name ? String(apiPost.author.name) : String(apiPost.author || apiPost.authorName || ''),
          authorName: String(apiPost.authorName || (apiPost.author?.name ?? '')),
          publishDate: String(apiPost.publishDate || ''),
          readTime: Number(apiPost.readTime) || 0,
          views: Number(apiPost.views) || 0,
          likes: Number(apiPost.likes) || 0,
          tags: Array.isArray(apiPost.tags) ? apiPost.tags : [],
          comments: Array.isArray(apiPost.comments)
            ? apiPost.comments.map((c: any) => ({
                _id: String(c._id || ''),
                user: String(c.user || ''),
                username: String(c.username || ''),
                comment: String(c.comment || ''),
                isApproved: Boolean(c.isApproved),
                createdAt: String(c.createdAt || c.date || new Date().toISOString()),
              }))
            : [],
          slug: apiPost.slug ? String(apiPost.slug) : undefined,
        })

        if (data?.success) {
          const mapped = Array.isArray(data.posts) ? data.posts.map(mapApiPostToLocal) : []
          setBlogPosts(mapped)
        } else {
          setError('Failed to fetch blog posts')
        }
      } catch (err) {
        console.error('Error fetching blog posts:', err)
        setError('Failed to fetch blog posts')
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPosts()
  }, [])

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, selectedCategory, sortBy, selectedTag, selectedAuthor, selectedReadTime, dateRange])

  // Update URL when filters change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams()
      
      if (selectedTag) params.set('tag', selectedTag)
      if (selectedCategory !== 'all') params.set('category', selectedCategory)
      if (selectedAuthor) params.set('author', selectedAuthor)
      if (selectedReadTime) params.set('readTime', selectedReadTime)
      if (debouncedSearchTerm) params.set('search', debouncedSearchTerm)
      if (sortBy !== 'newest') params.set('sort', sortBy)
      if (dateRange.start) params.set('startDate', dateRange.start)
      if (dateRange.end) params.set('endDate', dateRange.end)
      
      const newUrl = params.toString() ? `/blog?${params.toString()}` : '/blog'
      window.history.replaceState({}, '', newUrl)
    }
  }, [selectedTag, selectedCategory, selectedAuthor, selectedReadTime, debouncedSearchTerm, sortBy, dateRange])
  
  // Don't render translated content until hydration is complete or show loading
  if (!isHydrated || loading) {
    return (
      <PageLayout currentPage="blog">
        <div className="min-h-screen bg-gradient-to-b from-white to-[#f3f3f3]">
                     {/* Hero Section Skeleton */}
           <section className="py-12 md:py-16 bg-gradient-to-b from-white to-[#f3f3f3]">
             <div className="max-w-7xl mx-auto px-4 text-center">
               <div className="inline-flex items-center justify-center w-16 h-16 bg-[#12d6fa]/20 rounded-full mb-4">
                 <Coffee className="w-8 h-8 text-[#12d6fa]" />
               </div>
               <div className="w-56 h-14 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
               <div className="w-80 h-6 bg-gray-200 rounded mx-auto mb-6 animate-pulse"></div>
               <div className="w-20 h-1 bg-[#12d6fa] mx-auto rounded-full"></div>
             </div>
           </section>

          {/* Blog Content Skeleton */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4">
              {/* Category Filter Skeleton */}
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-24 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                ))}
              </div>

              {/* Featured Post Skeleton */}
              <div className="mb-16">
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="relative h-64 md:h-full bg-gray-200 animate-pulse"></div>
                    <div className="p-8 md:p-12">
                      <div className="space-y-4">
                        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-full h-6 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blog Grid Skeleton */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg">
                    <div className="h-48 bg-gray-200 animate-pulse"></div>
                    <div className="p-6 space-y-4">
                      <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-full h-6 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </PageLayout>
    )
  }

  // Show error state
  if (error) {
    return (
      <PageLayout currentPage="blog">
        <div className="min-h-screen bg-gradient-to-b from-white to-[#f3f3f3] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Error Loading Blog</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-[#12d6fa] text-white rounded-lg hover:bg-[#0fb8d4] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </PageLayout>
    )
  }

  // Filter and sort blog posts
  const filteredAndSortedPosts = blogPosts
    .filter(post => {
      const matchesCategory = selectedCategory === "all" || post.category === selectedCategory
      const matchesSearch = debouncedSearchTerm === "" || 
        post.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        post.authorName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (post.tags && post.tags.some((tag: string) => 
          tag.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        ))
      const matchesTag = selectedTag === "" || 
        (post.tags && Array.isArray(post.tags) && post.tags.some((tag: string) => 
          String(tag).toLowerCase().includes(selectedTag.toLowerCase())
        ))
      const matchesAuthor = selectedAuthor === "" || post.authorName === selectedAuthor
      const matchesReadTime = selectedReadTime === "" || 
        (selectedReadTime === "short" && post.readTime <= 5) ||
        (selectedReadTime === "medium" && post.readTime > 5 && post.readTime <= 10) ||
        (selectedReadTime === "long" && post.readTime > 10)
      const matchesDateRange = !dateRange.start || !dateRange.end || 
        (new Date(post.publishDate) >= new Date(dateRange.start) && 
         new Date(post.publishDate) <= new Date(dateRange.end))
      
      return matchesCategory && matchesSearch && matchesTag && matchesAuthor && matchesReadTime && matchesDateRange
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
        case "oldest":
          return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime()
        case "popular":
          return (b.views + b.likes) - (a.views + a.likes)
        case "most-liked":
          return b.likes - a.likes
        case "most-viewed":
          return b.views - a.views
        case "most-commented":
          return (b.comments?.length || 0) - (a.comments?.length || 0)
        case "title":
          return a.title.localeCompare(b.title)
        case "read-time":
          return a.readTime - b.readTime
        default:
          return 0
      }
    })

  // Get featured post (first post)
  const featuredPost = filteredAndSortedPosts[0]
  const regularPosts = filteredAndSortedPosts.slice(1)

  // Pagination
  const totalPages = Math.ceil(regularPosts.length / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const endIndex = startIndex + postsPerPage
  const paginatedPosts = regularPosts.slice(startIndex, endIndex)

  // Get unique values for filters
  const categories = ["all", ...Array.from(new Set(blogPosts.map(post => post.category)))]
  const authors = Array.from(new Set(blogPosts.map(post => post.authorName)))
  const allTags = Array.from(new Set(blogPosts.flatMap(post => post.tags || [])))
  
  // Get active filters count
  const activeFiltersCount = [
    selectedCategory !== "all",
    selectedTag !== "",
    selectedAuthor !== "",
    selectedReadTime !== "",
    dateRange.start !== "" || dateRange.end !== "",
    debouncedSearchTerm !== ""
  ].filter(Boolean).length

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategory("all")
    setSelectedTag("")
    setSelectedAuthor("")
    setSelectedReadTime("")
    setDateRange({ start: "", end: "" })
    setSearchTerm("")
    setDebouncedSearchTerm("")
    setSortBy("newest")
    setCurrentPage(1)
    window.history.replaceState({}, '', '/blog')
  }


  return (
    <PageLayout currentPage="blog">
      <div className="min-h-screen bg-gradient-to-b from-white to-[#f3f3f3]" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Hero Section */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-white to-[#f3f3f3]">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#12d6fa]/20 rounded-full mb-4">
              <Coffee className="w-8 h-8 text-[#12d6fa]" />
            </div>
            <h1 className={`text-3xl md:text-5xl font-bold mb-4 text-gray-800 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              {t('blog.hero.title')}
            </h1>
            <p className={`text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
              {t('blog.hero.description')}
            </p>
            <div className="w-20 h-1 bg-[#12d6fa] mx-auto rounded-full"></div>
          </div>
        </section>

        {/* Blog Content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            {/* Search and Filter Controls */}
            <div className="mb-8 space-y-6">
              {/* Enhanced Search Bar with Suggestions */}
              <div className="max-w-2xl mx-auto">
                <div className="relative search-container">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search posts, authors, tags, categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowSuggestions(searchTerm.length > 2)}
                    className="pl-10 pr-4 py-3 w-full border-2 border-gray-200 focus:border-[#12d6fa] focus:ring-2 focus:ring-[#12d6fa]/20 rounded-xl"
                  />
                  
                  {/* Search Suggestions Dropdown */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchTerm(suggestion)
                            setShowSuggestions(false)
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center space-x-2"
                        >
                          <Search className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Filter Controls */}
              <div className="space-y-4">
                {/* Filter Toggle and Results Summary */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => setShowFilters(!showFilters)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Filter className="w-4 h-4" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <span className="bg-[#12d6fa] text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                          {activeFiltersCount}
                        </span>
                      )}
                    </Button>
                    
                    <div className="text-sm text-gray-600">
                      {filteredAndSortedPosts.length} post{filteredAndSortedPosts.length !== 1 ? 's' : ''} found
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Sort by:</span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-48 border-2 border-gray-200 focus:border-[#12d6fa]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="most-liked">Most Liked</SelectItem>
                        <SelectItem value="most-viewed">Most Viewed</SelectItem>
                        <SelectItem value="most-commented">Most Commented</SelectItem>
                        <SelectItem value="title">Title A-Z</SelectItem>
                        <SelectItem value="read-time">Read Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Advanced Filters Panel */}
                {showFilters && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Author Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                        <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="All Authors" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Authors</SelectItem>
                            {authors.map(author => (
                              <SelectItem key={author} value={author}>{author}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Read Time Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Read Time</label>
                        <Select value={selectedReadTime} onValueChange={setSelectedReadTime}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Any Length" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Any Length</SelectItem>
                            <SelectItem value="short">Short (≤5 min)</SelectItem>
                            <SelectItem value="medium">Medium (6-10 min)</SelectItem>
                            <SelectItem value="long">Long (&gt;10 min)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Date Range Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                        <Input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                        <Input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Clear All Filters */}
                    {activeFiltersCount > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Button
                          onClick={clearAllFilters}
                          variant="outline"
                          size="sm"
                          className="text-gray-600 hover:text-red-600 hover:border-red-600"
                        >
                          Clear All Filters
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Active Filters Display */}
                {activeFiltersCount > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory !== "all" && (
                      <div className="bg-[#12d6fa]/10 border border-[#12d6fa]/20 rounded-full px-3 py-1 flex items-center gap-2">
                        <span className="text-sm text-gray-600">Category:</span>
                        <span className="text-sm font-medium text-[#12d6fa]">{selectedCategory}</span>
                        <button
                          onClick={() => setSelectedCategory("all")}
                          className="text-gray-500 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    
                    {selectedTag && (
                      <div className="bg-[#12d6fa]/10 border border-[#12d6fa]/20 rounded-full px-3 py-1 flex items-center gap-2">
                        <span className="text-sm text-gray-600">Tag:</span>
                        <span className="text-sm font-medium text-[#12d6fa]">#{selectedTag}</span>
                        <button
                          onClick={() => setSelectedTag("")}
                          className="text-gray-500 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    {selectedAuthor && (
                      <div className="bg-[#12d6fa]/10 border border-[#12d6fa]/20 rounded-full px-3 py-1 flex items-center gap-2">
                        <span className="text-sm text-gray-600">Author:</span>
                        <span className="text-sm font-medium text-[#12d6fa]">{selectedAuthor}</span>
                        <button
                          onClick={() => setSelectedAuthor("")}
                          className="text-gray-500 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    {selectedReadTime && (
                      <div className="bg-[#12d6fa]/10 border border-[#12d6fa]/20 rounded-full px-3 py-1 flex items-center gap-2">
                        <span className="text-sm text-gray-600">Read Time:</span>
                        <span className="text-sm font-medium text-[#12d6fa]">
                          {selectedReadTime === "short" ? "≤5 min" : 
                           selectedReadTime === "medium" ? "6-10 min" : "&gt;10 min"}
                        </span>
                        <button
                          onClick={() => setSelectedReadTime("")}
                          className="text-gray-500 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    {(dateRange.start || dateRange.end) && (
                      <div className="bg-[#12d6fa]/10 border border-[#12d6fa]/20 rounded-full px-3 py-1 flex items-center gap-2">
                        <span className="text-sm text-gray-600">Date:</span>
                        <span className="text-sm font-medium text-[#12d6fa]">
                          {dateRange.start && dateRange.end 
                            ? `${dateRange.start} - ${dateRange.end}`
                            : dateRange.start || dateRange.end}
                        </span>
                        <button
                          onClick={() => setDateRange({ start: "", end: "" })}
                          className="text-gray-500 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    {debouncedSearchTerm && (
                      <div className="bg-[#12d6fa]/10 border border-[#12d6fa]/20 rounded-full px-3 py-1 flex items-center gap-2">
                        <span className="text-sm text-gray-600">Search:</span>
                        <span className="text-sm font-medium text-[#12d6fa]">"{debouncedSearchTerm}"</span>
                        <button
                          onClick={() => {
                            setSearchTerm("")
                            setDebouncedSearchTerm("")
                          }}
                          className="text-gray-500 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Active Tag Filter Display */}
            {selectedTag && (
              <div className="flex items-center justify-center mb-6">
                <div className="bg-[#12d6fa]/10 border border-[#12d6fa]/20 rounded-full px-4 py-2 flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Filtering by tag:</span>
                  <span className="bg-[#12d6fa] text-white text-sm font-medium px-3 py-1 rounded-full">
                    #{selectedTag}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedTag("")
                      window.history.pushState({}, '', '/blog')
                    }}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                    title="Remove tag filter"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${isRTL ? 'font-cairo' : 'font-montserrat'} ${
                    selectedCategory === category
                      ? "bg-[#12d6fa] text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-[#12d6fa] hover:text-white border border-gray-200"
                  }`}
                >
                  {category === "all" ? t('blog.categories.all') : category}
                </button>
              ))}
            </div>

            {/* Popular Tags */}
            {allTags.length > 0 && (
              <div className="mb-12">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Popular Tags</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {allTags.slice(0, 10).map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedTag === tag
                          ? 'bg-[#12d6fa] text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-[#12d6fa]/10 hover:text-[#12d6fa]'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Featured Post */}
            {featuredPost && (
              <div className="mb-16">
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="relative h-64 md:h-full">
                      <Image
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`bg-[#a8f387] text-black px-3 py-1 rounded-full text-sm font-semibold ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                          {featuredPost.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                      <div className={`flex items-center space-x-4 text-sm text-gray-500 mb-4 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                        <span className="flex items-center">
                          <Calendar className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {t('blog.blogPosts.publishedOn')} {new Date(featuredPost.publishDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <User className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {t('blog.blogPosts.author')}: {featuredPost.authorName}
                      </span>
                    </div>
                      <h2 className={`text-2xl md:text-3xl font-bold text-gray-900 mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                        {featuredPost.title}
                      </h2>
                      <p className={`text-gray-600 text-lg mb-6 leading-relaxed ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm text-gray-500 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>{featuredPost.readTime} min read</span>
                        <Link href={`/blog/${featuredPost.slug || featuredPost._id}`}>
                          <button 
                            onClick={() => window.location.href = `/blog/${featuredPost.slug || featuredPost._id}`}
                            className={`bg-[#12d6fa] hover:bg-[#0bc4e8] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center ${isRTL ? 'font-cairo' : 'font-montserrat'}`}
                          >
                            {t('blog.featuredPost.readMore')}
                            <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'} transition-transform duration-200 group-hover:translate-x-1`} />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Blog Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedPosts.map((post) => (
                <article key={post._id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`bg-[#a8f387] text-black px-3 py-1 rounded-full text-sm font-semibold ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                        {post.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className={`flex items-center space-x-4 text-sm text-gray-500 mb-3 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                      <span className="flex items-center">
                        <Calendar className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {new Date(post.publishDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <User className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {post.authorName}
                      </span>
                    </div>
                    
                    <h3 className={`text-xl font-bold text-gray-900 mb-3 group-hover:text-[#12d6fa] transition-colors duration-200 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                      {post.title}
                    </h3>
                    
                    <p className={`text-gray-600 mb-4 leading-relaxed ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                      {post.excerpt}
                    </p>

                    {/* Blog Statistics */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Eye className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          {post.views}
                        </span>
                        <span className="flex items-center">
                          <ThumbsUp className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          {post.likes}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          {post.comments?.length || 0}
                        </span>
                      </div>
                      <span className={`text-sm text-gray-500 flex items-center ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                        <Clock className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {post.readTime} min
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-600 hover:text-[#12d6fa] hover:border-[#12d6fa]"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Link href={`/blog/${post.slug || post._id}`}>
                        <Button 
                          variant="ghost"
                          className="text-[#12d6fa] hover:text-[#0bc4e8] font-medium transition-all duration-200 flex items-center group"
                        >
                          {t('blog.featuredPost.readMore')}
                          <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'} group-hover:translate-x-1 transition-transform duration-200`} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Empty State */}
            {filteredAndSortedPosts.length === 0 && !loading && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No posts found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {searchTerm ? `No posts match your search for "${searchTerm}"` : "No posts available in this category"}
                </p>
                <div className="space-x-4">
                  {searchTerm && (
                    <Button
                      onClick={() => setSearchTerm("")}
                      variant="outline"
                      className="px-6 py-2"
                    >
                      Clear Search
                    </Button>
                  )}
                  <Button
                    onClick={() => setSelectedCategory("all")}
                    variant="outline"
                    className="px-6 py-2"
                  >
                    View All Posts
                  </Button>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2"
                >
                  Previous
                </Button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 ${currentPage === pageNum ? 'bg-[#12d6fa] text-white' : ''}`}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2"
                >
                  Next
                </Button>
              </div>
            )}

          </div>
        </section>
      </div>
    </PageLayout>
  )
}
