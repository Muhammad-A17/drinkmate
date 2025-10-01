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
    <PageLayout currentPage="blog">
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
                  <span
                    key={tagString || index}
                    className={`bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 hover:bg-[#12d6fa] hover:text-white ${isRTL ? 'font-cairo' : 'font-montserrat'}`}
                  >
                    #{tagString}
                  </span>
                )
              })}
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none mb-12">
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
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className={`text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              {t('blog.blogPosts.relatedPosts')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {relatedPosts
                .slice(0, 2)
                .map((relatedPost) => (
                  <article key={relatedPost._id} className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="relative h-48">
                      <Image
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`bg-[#12d6fa] text-white px-3 py-1 rounded-full text-sm font-semibold ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                          {relatedPost.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className={`text-xl font-bold text-gray-900 mb-3 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                        {relatedPost.title}
                      </h3>
                      <p className={`text-gray-600 mb-4 leading-relaxed ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm text-gray-500 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                          {relatedPost.readTime}
                        </span>
                        <Link href={`/blog/${relatedPost._id}`}>
                          <button 
                            onClick={() => window.location.href = `/blog/${relatedPost._id}`}
                            className={`text-[#12d6fa] hover:text-[#0bc4e8] font-medium transition-all duration-200 hover:underline ${isRTL ? 'font-cairo' : 'font-montserrat'}`}
                          >
                            {t('blog.featuredPost.readMore')} {isRTL ? '←' : '→'}
                          </button>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
