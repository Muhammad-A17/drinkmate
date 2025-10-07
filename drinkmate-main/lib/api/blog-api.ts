import { apiClient } from './client'
import { API_ENDPOINTS } from '@/lib/constants'

// Blog types
export interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: {
    _id: string
    name: string
    email: string
  }
  authorName: string
  category: 'recipes' | 'science' | 'guide' | 'products' | 'environment' | 'health' | 'lifestyle'
  tags: string[]
  image: string
  readTime: number
  isPublished: boolean
  isFeatured: boolean
  publishDate: string
  views: number
  likes: number
  comments: BlogComment[]
  relatedPosts: string[]
  seoMetadata: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
  }
  language: 'en' | 'ar'
  translations: {
    [key: string]: {
      title?: string
      excerpt?: string
      content?: string
      seoMetadata?: {
        metaTitle?: string
        metaDescription?: string
        keywords?: string[]
      }
    }
  }
  createdAt: string
  updatedAt: string
}

export interface BlogComment {
  _id: string
  user?: string
  username: string
  comment: string
  date: string
  createdAt: string
  isApproved: boolean
}

export interface BlogFilters {
  category?: string
  language?: 'en' | 'ar'
  search?: string
  tag?: string
  sort?: 'newest' | 'oldest' | 'popular'
  page?: number
  limit?: number
  includeFeatured?: boolean
}

export interface BlogResponse {
  success: boolean
  count: number
  totalPosts: number
  totalPages: number
  currentPage: number
  categories: string[]
  featuredPost?: BlogPost
  posts: BlogPost[]
}

export interface CreateBlogPostData {
  title: string
  excerpt: string
  content: string
  category: string
  tags?: string[]
  image: string
  isPublished?: boolean
  isFeatured?: boolean
  language?: 'en' | 'ar'
  translations?: {
    [key: string]: {
      title?: string
      excerpt?: string
      content?: string
      seoMetadata?: {
        metaTitle?: string
        metaDescription?: string
        keywords?: string[]
      }
    }
  }
}

export interface UpdateBlogPostData extends Partial<CreateBlogPostData> {
  publishDate?: string
}

export interface AddCommentData {
  comment: string
}

export interface AddPublicCommentData {
  comment: string
  username: string
  email: string
}

// Blog API service
export const blogAPI = {
  // Get all blog posts (public)
  getPosts: async (filters?: BlogFilters) => {
    return apiClient.get<BlogResponse>(API_ENDPOINTS.BLOG_POSTS, {
      params: filters
    })
  },

  // Get all blog posts for admin
  getPostsAdmin: async (filters?: BlogFilters) => {
    return apiClient.get<BlogResponse>(`${API_ENDPOINTS.BLOG_POSTS.replace('/posts', '/admin/posts')}`, {
      params: filters
    })
  },

  // Get single blog post by ID or slug
  getPost: async (idOrSlug: string) => {
    return apiClient.get<{ success: boolean; post: BlogPost; relatedPosts: BlogPost[] }>(
      API_ENDPOINTS.BLOG_POST_BY_ID(idOrSlug)
    )
  },

  // Create a new blog post (admin only)
  createPost: async (postData: CreateBlogPostData) => {
    return apiClient.post<{ success: boolean; message: string; post: BlogPost }>(
      `${API_ENDPOINTS.BLOG_POSTS.replace('/posts', '/admin/posts')}`,
      postData
    )
  },

  // Update a blog post (admin only)
  updatePost: async (id: string, postData: UpdateBlogPostData) => {
    return apiClient.put<{ success: boolean; message: string; post: BlogPost }>(
      `${API_ENDPOINTS.BLOG_POSTS.replace('/posts', '/admin/posts')}/${id}`,
      postData
    )
  },

  // Delete a blog post (admin only)
  deletePost: async (id: string) => {
    return apiClient.delete<{ success: boolean; message: string }>(
      `${API_ENDPOINTS.BLOG_POSTS.replace('/posts', '/admin/posts')}/${id}`
    )
  },

  // Add comment to a blog post (authenticated users)
  addComment: async (postId: string, commentData: AddCommentData) => {
    return apiClient.post<{ success: boolean; message: string; comment: BlogComment }>(
      API_ENDPOINTS.BLOG_COMMENTS(postId),
      commentData
    )
  },

  // Add public comment to a blog post (no authentication required)
  addPublicComment: async (postId: string, commentData: AddPublicCommentData) => {
    return apiClient.post<{ success: boolean; message: string; comment: BlogComment }>(
      `${API_ENDPOINTS.BLOG_COMMENTS(postId)}/public`,
      commentData
    )
  },

  // Approve a comment (admin only)
  approveComment: async (postId: string, commentId: string) => {
    return apiClient.put<{ success: boolean; message: string }>(
      `${API_ENDPOINTS.BLOG_POSTS.replace('/posts', '/admin/posts')}/${postId}/comments/${commentId}/approve`
    )
  },

  // Delete a comment (admin only)
  deleteComment: async (postId: string, commentId: string) => {
    return apiClient.delete<{ success: boolean; message: string }>(
      `${API_ENDPOINTS.BLOG_POSTS.replace('/posts', '/admin/posts')}/${postId}/comments/${commentId}`
    )
  },

  // Like a blog post
  likePost: async (postId: string) => {
    return apiClient.post<{ success: boolean; message: string; likes: number }>(
      `${API_ENDPOINTS.BLOG_POST_BY_ID(postId)}/like`
    )
  }
}

export default blogAPI
