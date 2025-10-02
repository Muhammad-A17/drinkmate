"use client"

import PageLayout from "@/components/layout/PageLayout"
import { Calendar, User, ArrowLeft, Clock, Heart, MessageCircle, Facebook, Twitter, Linkedin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import React, { useState, useEffect } from "react"
import { useTranslation } from "@/lib/contexts/translation-context"
import { blogAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Head from "next/head"

interface BlogPostData {
  _id: string
  title: string
  content: string
  excerpt: string
  image: string
  category: string
  author: string
  authorName: string
  publishDate: string
  readTime: number
  views: number
  likes: number
  comments: number
  tags: string[]
  slug?: string
  commentsList?: Array<{
    _id: string
    user: string
    username: string
    comment: string
    isApproved: boolean
    createdAt: string
  }>
}

export default function BlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { t, isRTL, isHydrated } = useTranslation()
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [id, setId] = useState<string | null>(null)
  const [blogPost, setBlogPost] = useState<BlogPostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPostData[]>([])
  const [previousPost, setPreviousPost] = useState<BlogPostData | null>(null)
  const [nextPost, setNextPost] = useState<BlogPostData | null>(null)
  
  // Reading progress states
  const [readingProgress, setReadingProgress] = useState(0)
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0)
  // Comment states
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [commentAuthor, setCommentAuthor] = useState("")
  const [commentEmail, setCommentEmail] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [commentsError, setCommentsError] = useState<string | null>(null)
  
  // Extract id from params when component mounts
  React.useEffect(() => {
    params.then(({ id }) => setId(id))
  }, [params])

  // Fetch blog post data
  useEffect(() => {
    if (!id) return

    const fetchBlogPost = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await blogAPI.getPost(id)
        
        if (response.success && response.post) {
          setBlogPost(response.post)
          setRelatedPosts(response.relatedPosts || [])
          setPreviousPost(response.previousPost || null)
          setNextPost(response.nextPost || null)
          
          // Set approved comments and ensure createdAt field exists
          try {
            setCommentsError(null)
            const rawComments = response.post.comments || []
            
            // Validate and process comments safely
            const validComments = rawComments.filter((comment: any) => {
              return comment && typeof comment === 'object' && comment.username && comment.comment
            })
            
            const approvedComments = validComments
              .filter((comment: any) => comment.isApproved === true)
              .map((comment: any) => {
                // Create a clean, serializable comment object
                return {
                  _id: String(comment._id || Math.random().toString()),
                  user: String(comment.user || ''),
                  username: String(comment.username || 'Anonymous'),
                  comment: String(comment.comment || ''),
                  isApproved: Boolean(comment.isApproved),
                  createdAt: String(comment.createdAt || comment.date || new Date().toISOString())
                }
              })
            
            setComments(approvedComments)
          } catch (commentsErr) {
            console.error('Error processing comments:', commentsErr)
            setCommentsError('Failed to load comments')
            setComments([])
          }
        } else {
          setError('Blog post not found')
        }
      } catch (err) {
        console.error('Error fetching blog post:', err)
        setError('Failed to load blog post')
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPost()
  }, [id])

  // Update likes count when blog post is loaded
  useEffect(() => {
    if (blogPost) {
      setLikesCount(blogPost.likes || 0)
    }
  }, [blogPost])
  
  // Reading progress calculation
  useEffect(() => {
    const handleScroll = () => {
      const articleElement = document.getElementById('blog-article-content')
      if (!articleElement || !blogPost) return

      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight - windowHeight
      const scrollTop = window.pageYOffset

      // Calculate progress based on article position
      const articleRect = articleElement.getBoundingClientRect()
      const articleTop = articleRect.top + scrollTop
      const articleHeight = articleRect.height
      
      if (scrollTop < articleTop) {
        setReadingProgress(0)
        setEstimatedTimeRemaining(blogPost.readTime)
      } else if (scrollTop > articleTop + articleHeight) {
        setReadingProgress(100)
        setEstimatedTimeRemaining(0)
      } else {
        const progress = ((scrollTop - articleTop) / articleHeight) * 100
        setReadingProgress(Math.min(Math.max(progress, 0), 100))
        
        // Calculate estimated time remaining
        const remainingProgress = 100 - progress
        const timeRemaining = Math.ceil((remainingProgress / 100) * blogPost.readTime)
        setEstimatedTimeRemaining(Math.max(timeRemaining, 0))
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll)
  }, [blogPost])

  // Update progress bar width using CSS custom property
  useEffect(() => {
    const progressBar = document.querySelector('[data-progress]') as HTMLElement
    if (progressBar) {
      progressBar.style.setProperty('--progress-width', `${readingProgress}%`)
      progressBar.style.width = `${readingProgress}%`
    }
  }, [readingProgress])
  
  // Generate structured data for SEO
  const generateStructuredData = () => {
    if (!blogPost || !post) return null

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "image": [
        post.image
      ],
      "author": {
        "@type": "Person",
        "name": post.authorName,
        "url": `${window.location.origin}/blog`
      },
      "publisher": {
        "@type": "Organization",
        "name": "DrinkMates",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/placeholder-logo.png`
        }
      },
      "datePublished": post.publishDate,
      "dateModified": post.publishDate,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      },
      "wordCount": post.content ? post.content.replace(/<[^>]*>/g, '').split(' ').length : 0,
      "timeRequired": `PT${post.readTime}M`,
      "keywords": post.tags ? post.tags.join(', ') : '',
      "articleSection": post.category,
      "inLanguage": "en-US",
      "isAccessibleForFree": true,
      "url": window.location.href
    }

    return structuredData
  }
  
  // Show loading state
  if (!isHydrated || !id || loading) {
    return (
      <PageLayout currentPage="blog">
        <div className="min-h-screen bg-gradient-to-b from-white to-[#f3f3f3]">
          {/* Back Button Skeleton */}
          <div className="pt-8 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Article Content Skeleton */}
          <article className="py-8 md:py-16">
            <div className="max-w-4xl mx-auto px-4">
              {/* Category Badge Skeleton */}
              <div className="mb-6">
                <div className="w-24 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              </div>

              {/* Title Skeleton */}
              <div className="w-full h-16 bg-gray-200 rounded mb-6 animate-pulse"></div>

              {/* Meta Information Skeleton */}
              <div className="flex flex-wrap items-center gap-6 mb-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>

              {/* Featured Image Skeleton */}
              <div className="mb-8">
                <div className="relative h-64 md:h-96 rounded-2xl bg-gray-200 animate-pulse"></div>
              </div>

              {/* Tags Skeleton */}
              <div className="flex flex-wrap gap-2 mb-8">
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-20 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                ))}
              </div>

              {/* Article Content Skeleton */}
              <div className="space-y-4 mb-12">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>

              {/* Article Footer Skeleton */}
              <div className="pt-8 border-t border-gray-200">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    ))}
                  </div>
                </div>

                {/* Author Bio Skeleton */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="w-24 h-6 bg-gray-200 rounded mb-3 animate-pulse"></div>
                  <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </article>

          {/* Related Posts Skeleton */}
          <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4">
              <div className="w-48 h-8 bg-gray-200 rounded mx-auto mb-8 animate-pulse"></div>
              <div className="grid md:grid-cols-2 gap-8">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-gray-50 rounded-2xl overflow-hidden">
                    <div className="h-48 bg-gray-200 animate-pulse"></div>
                    <div className="p-6 space-y-4">
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

  // Use the dynamic blogPost data instead of static data with safety checks
  const post = blogPost ? {
    ...blogPost,
    tags: Array.isArray(blogPost.tags) ? blogPost.tags : [],
    title: String(blogPost.title || ''),
    category: String(blogPost.category || ''),
    authorName: String(blogPost.authorName || ''),
    content: String(blogPost.content || ''),
    image: String(blogPost.image || ''),
    publishDate: String(blogPost.publishDate || ''),
    readTime: Number(blogPost.readTime) || 0,
    comments: Number(blogPost.comments) || 0
  } : null

  // Show error state
  if (error || !blogPost || !post) {
    return (
      <PageLayout currentPage="blog">
        <div className="min-h-screen bg-gradient-to-b from-white to-[#f3f3f3] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
            <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
            <Link 
              href="/blog" 
              className="inline-flex items-center px-6 py-3 bg-[#12d6fa] text-white rounded-lg hover:bg-[#0fb8d4] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </div>
        </div>
      </PageLayout>
    )
  }
  
  const handleLike = () => {
    if (!liked) {
      setLiked(true)
      setLikesCount(prev => prev + 1)
    }
  }
  
  const handleShare = (platform: string) => {
    const url = window.location.href
    const title = post.title
    const description = post.excerpt || post.title
    
    // Try native Web Share API first
    if (platform === 'native' && 'share' in navigator) {
      navigator.share({
        title,
        text: description,
        url
      }).catch(err => console.log('Error sharing:', err))
      return
    }
    
    // Fallback to platform-specific sharing
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`)
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`)
        break
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`)
        break
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`)
        break
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this blog post: ${title}\n\n${description}\n\n${url}`)}`)
        break
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          // Show a toast or feedback that the link was copied
          const toast = document.createElement('div')
          toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg z-50'
          toast.textContent = 'Link copied to clipboard!'
          document.body.appendChild(toast)
          setTimeout(() => document.body.removeChild(toast), 2000)
        })
        break
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim() || !commentAuthor.trim() || !commentEmail.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    if (!id) {
      toast.error("Blog post not found")
      return
    }

    setSubmittingComment(true)

    try {
      // Call the real API to save comment to database
      const response = await blogAPI.addPublicComment(id, {
        comment: newComment,
        username: commentAuthor,
        email: commentEmail
      })

      if (response.success) {
        // Add the comment to the local state (it will be pending approval)
        const newCommentData = {
          _id: response.comment?._id || Math.random().toString(),
          user: response.comment?.user || '',
          username: response.comment?.username || 'Anonymous',
          comment: response.comment?.comment || '',
          isApproved: Boolean(response.comment?.isApproved),
          createdAt: response.comment?.createdAt || response.comment?.date || new Date().toISOString()
        }

        setComments(prev => [newCommentData, ...prev])
        setNewComment("")
        setCommentAuthor("")
        setCommentEmail("")
        
        toast.success("Comment submitted successfully! It will appear after admin approval.")
      } else {
        toast.error(response.message || "Failed to submit comment")
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      toast.error("Failed to submit comment. Please try again.")
    } finally {
      setSubmittingComment(false)
    }
  }

  return (
    <>
      {/* SEO Meta Tags and Structured Data */}
      {blogPost && post && (
        <Head>
          <title>{post.title} | DrinkMates Blog</title>
          <meta name="description" content={post.excerpt} />
          <meta name="keywords" content={post.tags ? post.tags.join(', ') : ''} />
          <meta name="author" content={post.authorName} />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href={window.location.href} />
          
          {/* Open Graph Tags */}
          <meta property="og:title" content={post.title} />
          <meta property="og:description" content={post.excerpt} />
          <meta property="og:image" content={post.image} />
          <meta property="og:url" content={window.location.href} />
          <meta property="og:type" content="article" />
          <meta property="og:site_name" content="DrinkMates Blog" />
          <meta property="article:author" content={post.authorName} />
          <meta property="article:published_time" content={post.publishDate} />
          <meta property="article:section" content={post.category} />
          {post.tags && post.tags.map((tag: string, index: number) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
          
          {/* Twitter Card Tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={post.title} />
          <meta name="twitter:description" content={post.excerpt} />
          <meta name="twitter:image" content={post.image} />
          
          {/* Structured Data */}
          <script 
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(generateStructuredData())
            }}
          />
        </Head>
      )}

      <PageLayout currentPage="blog">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] transition-all duration-300 ease-out"
          data-progress={readingProgress}
        />
      </div>

      {/* Reading Progress Indicator */}
      {blogPost && readingProgress > 5 && readingProgress < 95 && (
        <div className="fixed bottom-6 right-6 z-40">
          <div className="bg-white rounded-full shadow-2xl border border-gray-200 p-4 flex items-center space-x-3 backdrop-blur-sm bg-white/90">
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#12d6fa]"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${readingProgress}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-[#12d6fa]">
                  {Math.round(readingProgress)}%
                </span>
              </div>
            </div>
            <div className="hidden sm:block">
              <p className={`text-sm font-medium text-gray-900 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                {estimatedTimeRemaining} min left
              </p>
              <p className="text-xs text-gray-500">
                Reading progress
              </p>
            </div>
          </div>
        </div>
      )}

      <div className={`min-h-screen bg-gradient-to-b from-white to-[#f3f3f3] ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
        {/* Back Button */}
        <div className="pt-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Link 
              href="/blog" 
              className={`inline-flex items-center text-[#12d6fa] hover:text-[#0bc4e8] font-medium transition-colors duration-200 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}
            >
              <ArrowLeft className={`w-4 h-4 transition-transform duration-200 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
              {t('blog.blogPosts.backToBlog')}
            </Link>
          </div>
        </div>

        {/* Article Content */}
        <article className="py-8 md:py-16">
          <div className="max-w-4xl mx-auto px-4">
            {/* Category Badge */}
            <div className="mb-6">
              <span className={`bg-[#a8f387] text-black px-4 py-2 rounded-full text-sm font-semibold ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className={`text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className={`flex flex-wrap items-center gap-6 text-gray-600 mb-8 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
              <div className="flex items-center">
                <User className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <span>{t('blog.blogPosts.author')}: {post.authorName}</span>
              </div>
              <div className="flex items-center">
                <Calendar className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <span>{t('blog.blogPosts.publishedOn')} {new Date(post.publishDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <Clock className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <span>{post.readTime} {t('blog.blogPosts.readTime')}</span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="mb-8">
              <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              <span className={`text-sm text-gray-600 ${isRTL ? 'ml-2' : 'mr-2'} ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                {t('blog.blogPosts.tags')}:
              </span>
              {post.tags && Array.isArray(post.tags) && post.tags.map((tag, index) => {
                // Ensure tag is a string
                const tagString = typeof tag === 'string' ? tag : String(tag)
                return (
                  <Link
                    key={tagString || index}
                    href={`/blog?tag=${encodeURIComponent(tagString)}`}
                    className={`group bg-gray-100 hover:bg-[#12d6fa] text-gray-700 hover:text-white px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-md ${isRTL ? 'font-cairo' : 'font-montserrat'}`}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="group-hover:animate-pulse">#</span>
                      <span>{tagString}</span>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Article Content */}
            <div id="blog-article-content" className="prose prose-lg max-w-none mb-12">
              <div 
                className={`text-lg text-gray-700 leading-relaxed ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Article Footer */}
            <div className="pt-8 border-t border-gray-200">
              {/* Engagement Section */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      liked
                        ? 'bg-red-100 text-red-600 shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 hover:shadow-md'
                    } ${isRTL ? 'font-cairo' : 'font-montserrat'}`}
                  >
                    <Heart className={`w-5 h-5 transition-all duration-200 ${liked ? 'fill-current scale-110' : ''}`} />
                    <span>{likesCount}</span>
                  </button>
                  
                  <div className={`flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.comments}</span>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="flex items-center space-x-3">
                  <span className={`text-sm text-gray-600 ${isRTL ? 'ml-2' : 'mr-2'} ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                    {t('blog.blogPosts.shareThisPost')}:
                  </span>
                  
                  {/* Native Share Button (if supported) */}
                  {'share' in navigator && (
                    <button
                      onClick={() => handleShare('native')}
                      className="w-10 h-10 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
                      aria-label="Share via native sharing"
                      title="Share"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-10 h-10 bg-[#1877f2] hover:bg-[#166fe5] rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
                    aria-label="Share on Facebook"
                    title="Share on Facebook"
                  >
                    <Facebook className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-10 h-10 bg-[#1da1f2] hover:bg-[#1a91da] rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
                    aria-label="Share on Twitter"
                    title="Share on Twitter"
                  >
                    <Twitter className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="w-10 h-10 bg-[#0077b5] hover:bg-[#005885] rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
                    aria-label="Share on LinkedIn"
                    title="Share on LinkedIn"
                  >
                    <Linkedin className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="w-10 h-10 bg-[#25d366] hover:bg-[#20b954] rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
                    aria-label="Share on WhatsApp"
                    title="Share on WhatsApp"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleShare('telegram')}
                    className="w-10 h-10 bg-[#0088cc] hover:bg-[#0077b3] rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
                    aria-label="Share on Telegram"
                    title="Share on Telegram"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleShare('email')}
                    className="w-10 h-10 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
                    aria-label="Share via Email"
                    title="Share via Email"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-10 h-10 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
                    aria-label="Copy Link"
                    title="Copy Link"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Author Bio */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100">
                <h3 className={`text-lg font-semibold text-gray-900 mb-3 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                  {t('blog.blogPosts.author')}
                </h3>
                <p className={`text-gray-600 leading-relaxed ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  {post.author === t('blog.blogPosts.post1.author') 
                    ? t('blog.blogPosts.authorBio.team')
                    : t('blog.blogPosts.authorBio.expert')
                  }
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Previous/Next Post Navigation */}
        {(previousPost || nextPost) && (
          <section className="py-12 bg-gray-50 border-t border-gray-100">
            <div className="max-w-4xl mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Previous Post */}
                <div className="space-y-4">
                  {previousPost ? (
                    <Link href={`/blog/${previousPost.slug || previousPost._id}`}>
                      <div className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex items-center space-x-2 text-[#12d6fa]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className={`text-sm font-medium ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                              Previous Post
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-4">
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={previousPost.image}
                              alt={previousPost.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-lg font-semibold text-gray-900 group-hover:text-[#12d6fa] transition-colors duration-300 line-clamp-2 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                              {previousPost.title}
                            </h3>
                            <p className={`text-sm text-gray-600 mt-1 line-clamp-2 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                              {previousPost.excerpt}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="bg-white/50 p-6 rounded-2xl border-2 border-dashed border-gray-200">
                      <div className="flex items-center space-x-3 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className={`text-sm ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                          No previous post
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Next Post */}
                <div className="space-y-4">
                  {nextPost ? (
                    <Link href={`/blog/${nextPost.slug || nextPost._id}`}>
                      <div className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200">
                        <div className="flex items-center justify-end space-x-3 mb-3">
                          <div className="flex items-center space-x-2 text-[#12d6fa]">
                            <span className={`text-sm font-medium ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                              Next Post
                            </span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex space-x-4">
                          <div className="flex-1 min-w-0 text-right">
                            <h3 className={`text-lg font-semibold text-gray-900 group-hover:text-[#12d6fa] transition-colors duration-300 line-clamp-2 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                              {nextPost.title}
                            </h3>
                            <p className={`text-sm text-gray-600 mt-1 line-clamp-2 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                              {nextPost.excerpt}
                            </p>
                          </div>
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={nextPost.image}
                              alt={nextPost.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="bg-white/50 p-6 rounded-2xl border-2 border-dashed border-gray-200">
                      <div className="flex items-center justify-end space-x-3 text-gray-400">
                        <span className={`text-sm ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                          No next post
                        </span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Comments Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className={`text-2xl md:text-3xl font-bold text-gray-900 mb-8 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              Comments ({comments.length})
            </h2>

            {/* Comment Form */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                Leave a Comment
              </h3>
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="commentAuthor" className="text-sm font-medium text-gray-700">
                      Name *
                    </Label>
                    <Input
                      id="commentAuthor"
                      type="text"
                      value={commentAuthor}
                      onChange={(e) => setCommentAuthor(e.target.value)}
                      placeholder="Your name"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commentEmail" className="text-sm font-medium text-gray-700">
                      Email *
                    </Label>
                    <Input
                      id="commentEmail"
                      type="email"
                      value={commentEmail}
                      onChange={(e) => setCommentEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="newComment" className="text-sm font-medium text-gray-700">
                    Comment *
                  </Label>
                  <Textarea
                    id="newComment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={4}
                    required
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submittingComment}
                  className="bg-[#12d6fa] hover:bg-[#0bc4e8] text-white px-6 py-2"
                >
                  {submittingComment ? "Submitting..." : "Submit Comment"}
                </Button>
              </form>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {commentsError ? (
                <div className="text-center py-8 text-red-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-red-300" />
                  <p>{commentsError}</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment, index) => {
                    // Ensure we have a valid comment object
                    if (!comment || typeof comment !== 'object') {
                      return null
                    }
                    
                    // Extract and validate all properties as primitive values
                    const id = comment._id ? String(comment._id) : `comment-${index}`
                    const user = comment.username ? String(comment.username) : 'Anonymous'
                    const text = comment.comment ? String(comment.comment) : ''
                    const approved = comment.isApproved === true
                    const date = comment.createdAt ? String(comment.createdAt) : (comment.date ? String(comment.date) : new Date().toISOString())
                    
                    // Skip if we don't have essential data
                    if (!user || !text) {
                      return null
                    }
                    
                    return (
                      <div key={id} className={`rounded-2xl p-6 ${approved ? "bg-gray-50" : "bg-yellow-50 border border-yellow-200"}`}>
                        <div className="flex items-start space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${approved ? "bg-[#12d6fa]" : "bg-yellow-500"}`}>
                            {user.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className={`font-semibold text-gray-900 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                                {user}
                              </h4>
                              <span className="text-sm text-gray-500">
                                {new Date(date).toLocaleDateString()}
                              </span>
                              {!approved && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Pending Approval
                                </span>
                              )}
                            </div>
                            <p className={`text-gray-700 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                              {text}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            
            {/* Comment Status Note */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Comment Moderation</h4>
                  <p className="text-sm text-blue-700">
                    All comments are moderated and will appear after admin approval. This helps maintain a respectful and relevant discussion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Posts */}
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-2xl md:text-3xl font-bold text-gray-900 mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                {t('blog.blogPosts.relatedPosts')}
              </h2>
              <p className={`text-gray-600 max-w-2xl mx-auto ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                Discover more insights and stories related to this topic
              </p>
            </div>
            
            {relatedPosts && relatedPosts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.slice(0, 3).map((relatedPost) => (
                  <article key={relatedPost._id} className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-4 left-4">
                        <span className={`bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                          {relatedPost.category}
                        </span>
                      </div>
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                          <svg className="w-5 h-5 text-[#12d6fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center space-x-2 mb-3 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{relatedPost.readTime} min read</span>
                        <span>•</span>
                        <span>{new Date(relatedPost.publishDate).toLocaleDateString()}</span>
                      </div>
                      
                      <h3 className={`text-xl font-bold text-gray-900 mb-3 group-hover:text-[#12d6fa] transition-colors duration-300 line-clamp-2 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                        {relatedPost.title}
                      </h3>
                      
                      <p className={`text-gray-600 mb-4 line-clamp-3 leading-relaxed ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                        {relatedPost.excerpt}
                      </p>

                      {/* Tags for related posts */}
                      {relatedPost.tags && relatedPost.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {relatedPost.tags.slice(0, 2).map((tag: string, index: number) => (
                            <span
                              key={index}
                              className={`text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ${isRTL ? 'font-cairo' : 'font-montserrat'}`}
                            >
                              #{tag}
                            </span>
                          ))}
                          {relatedPost.tags.length > 2 && (
                            <span className="text-xs text-gray-500 px-2 py-1">
                              +{relatedPost.tags.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{relatedPost.views || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{relatedPost.likes || 0}</span>
                          </div>
                        </div>
                        
                        <Link href={`/blog/${relatedPost.slug || relatedPost._id}`}>
                          <button className={`inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] text-white text-sm font-medium rounded-full hover:from-[#0bc4e8] hover:to-[#12d6fa] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                            {t('blog.featuredPost.readMore')}
                            <svg className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'} transition-transform duration-300 group-hover:translate-x-1`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Related Posts</h3>
                <p className="text-gray-600 mb-6">We couldn't find any related posts at the moment.</p>
                <Link href="/blog">
                  <button className="inline-flex items-center px-6 py-3 bg-[#12d6fa] text-white font-medium rounded-lg hover:bg-[#0bc4e8] transition-colors duration-300">
                    Browse All Posts
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </PageLayout>
    </>
  )
}
