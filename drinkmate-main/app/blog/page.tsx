"use client"

import PageLayout from "@/components/layout/PageLayout"
import { Calendar, User, ArrowRight, Coffee, Heart, Search, Filter, SortAsc, Eye, MessageCircle, ThumbsUp, Share2, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useTranslation } from "@/lib/contexts/translation-context"
import { useState, useEffect } from "react"
import { blogAPI } from "@/lib/api"
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
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [postsPerPage] = useState(6)
  
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
        
        if (response.success) {
          setBlogPosts(response.posts || [])
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
  }, [searchTerm, selectedCategory, sortBy])
  
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
      const matchesSearch = searchTerm === "" || 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.authorName.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
        case "oldest":
          return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime()
        case "popular":
          return (b.views + b.likes) - (a.views + a.likes)
        case "title":
          return a.title.localeCompare(b.title)
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

  // Get unique categories for filter
  const categories = ["all", ...Array.from(new Set(blogPosts.map(post => post.category)))]


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
              {/* Search Bar */}
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search blog posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 w-full border-2 border-gray-200 focus:border-[#12d6fa] focus:ring-2 focus:ring-[#12d6fa]/20 rounded-xl"
                  />
                </div>
              </div>

              {/* Sort and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40 border-2 border-gray-200 focus:border-[#12d6fa]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="title">Title A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-sm text-gray-600">
                  {filteredAndSortedPosts.length} post{filteredAndSortedPosts.length !== 1 ? 's' : ''} found
                </div>
                
                {(searchTerm || selectedCategory !== "all" || sortBy !== "newest") && (
                  <Button
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory("all")
                      setSortBy("newest")
                      setCurrentPage(1)
                    }}
                    variant="outline"
                    size="sm"
                    className="text-gray-600 hover:text-[#12d6fa] hover:border-[#12d6fa]"
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
            </div>

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
