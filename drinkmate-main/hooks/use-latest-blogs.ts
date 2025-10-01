import { useState, useEffect } from 'react'
import { blogAPI } from '@/lib/api'

interface BlogPost {
  _id: string
  title: string
  excerpt: string
  image: string
  category: string
  publishDate: string
  readTime: number
  slug?: string
}

interface UseLatestBlogsReturn {
  blogs: BlogPost[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useLatestBlogs(limit: number = 3): UseLatestBlogsReturn {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await blogAPI.getPosts({
        limit,
        sort: 'newest',
        language: 'en' // You can make this dynamic based on current language
      })
      
      if (response.success) {
        setBlogs(response.posts || [])
      } else {
        setError('Failed to fetch blog posts')
      }
    } catch (err) {
      console.error('Error fetching latest blogs:', err)
      setError('Failed to fetch blog posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [limit])

  return {
    blogs,
    loading,
    error,
    refetch: fetchBlogs
  }
}
