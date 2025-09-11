"use client"

import PageLayout from "@/components/layout/PageLayout"
import { Calendar, User, ArrowLeft, Clock, Heart, MessageCircle, Facebook, Twitter, Linkedin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useState } from "react"
import { useTranslation } from "@/lib/translation-context"

export default function BlogPost({ params }: { params: { id: string } }) {
  const { t, isRTL, isHydrated } = useTranslation()
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  
  // Don't render translated content until hydration is complete
  if (!isHydrated) {
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
  
  // Sample blog post data with proper translations
  const blogPosts = [
    {
      id: 1,
      title: t('blog.blogPosts.post1.title'),
      content: `
        <div class="space-y-8">
          <div class="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border-l-4 border-[#12d6fa]">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">🌞 ${t('blog.blogPosts.post1.subtitle')}</h2>
            <p class="text-lg text-gray-700 leading-relaxed">
              ${t('blog.blogPosts.post1.intro')}
            </p>
          </div>
          
          <div class="bg-white p-6 rounded-2xl shadow-lg">
            <h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span class="text-3xl mr-3">✨</span>
              ${t('blog.blogPosts.post1.whyMake.title')}
            </h2>
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-800 mb-3 text-[#12d6fa]">${t('blog.blogPosts.post1.whyMake.health.title')}</h3>
                <ul class="space-y-2 text-gray-700">
                  <li class="flex items-start">
                    <span class="text-green-500 mr-2">✓</span>
                    ${t('blog.blogPosts.post1.whyMake.health.benefit1')}
                  </li>
                  <li class="flex items-start">
                    <span class="text-green-500 mr-2">✓</span>
                    ${t('blog.blogPosts.post1.whyMake.health.benefit2')}
                  </li>
                  <li class="flex items-start">
                    <span class="text-green-500 mr-2">✓</span>
                    ${t('blog.blogPosts.post1.whyMake.health.benefit3')}
                  </li>
                  <li class="flex items-start">
                    <span class="text-green-500 mr-2">✓</span>
                    ${t('blog.blogPosts.post1.whyMake.health.benefit4')}
                  </li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-800 mb-3 text-[#a8f387]">${t('blog.blogPosts.post1.whyMake.cost.title')}</h3>
                <ul class="space-y-2 text-gray-700">
                  <li class="flex items-start">
                    <span class="text-green-500 mr-2">✓</span>
                    ${t('blog.blogPosts.post1.whyMake.cost.saving1')}
                  </li>
                  <li class="flex items-start">
                    <span class="text-green-500 mr-2">✓</span>
                    ${t('blog.blogPosts.post1.whyMake.cost.saving2')}
                  </li>
                  <li class="flex items-start">
                    <span class="text-green-500 mr-2">✓</span>
                    ${t('blog.blogPosts.post1.whyMake.cost.saving3')}
                  </li>
                  <li class="flex items-start">
                    <span class="text-green-500 mr-2">✓</span>
                    ${t('blog.blogPosts.post1.whyMake.cost.saving4')}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      `,
      excerpt: t('blog.blogPosts.post1.excerpt'),
      author: t('blog.blogPosts.post1.author'),
      date: t('blog.blogPosts.post1.date'),
      category: t('blog.categories.recipes'),
      image: "/images/drink-recipes.png",
      readTime: `12 ${t('blog.blogPosts.readTime')}`,
      tags: [t('blog.blogPosts.post1.tags.recipes'), t('blog.blogPosts.post1.tags.summer'), t('blog.blogPosts.post1.tags.refreshing'), t('blog.blogPosts.post1.tags.healthy'), t('blog.blogPosts.post1.tags.sparkling')],
      likes: 245,
      comments: 67
    },
    {
      id: 2,
      title: t('blog.blogPosts.post2.title'),
      content: t('blog.blogPosts.post2.content'),
      excerpt: t('blog.blogPosts.post2.excerpt'),
      author: t('blog.blogPosts.post2.author'),
      date: t('blog.blogPosts.post2.date'),
      category: t('blog.categories.science'),
      image: "/images/co2-cylinder.png",
      readTime: `15 ${t('blog.blogPosts.readTime')}`,
      tags: [t('blog.blogPosts.post2.tags.science'), t('blog.blogPosts.post2.tags.chemistry'), t('blog.blogPosts.post2.tags.carbonation'), t('blog.blogPosts.post2.tags.technology')],
      likes: 189,
      comments: 42
    },
    {
      id: 3,
      title: t('blog.blogPosts.post3.title'),
      content: t('blog.blogPosts.post3.content'),
      excerpt: t('blog.blogPosts.post3.excerpt'),
      author: t('blog.blogPosts.post3.author'),
      date: t('blog.blogPosts.post3.date'),
      category: t('blog.categories.guide'),
      image: "/images/co2-cylinder.png",
      readTime: `8 ${t('blog.blogPosts.readTime')}`,
      tags: [t('blog.blogPosts.post3.tags.guide'), t('blog.blogPosts.post3.tags.co2'), t('blog.blogPosts.post3.tags.equipment'), t('blog.blogPosts.post3.tags.tips')],
      likes: 156,
      comments: 38
    },
    {
      id: 4,
      title: t('blog.blogPosts.post4.title'),
      content: t('blog.blogPosts.post4.content'),
      excerpt: t('blog.blogPosts.post4.excerpt'),
      author: t('blog.blogPosts.post4.author'),
      date: t('blog.blogPosts.post4.date'),
      category: t('blog.categories.products'),
      image: "/images/italian-strawberry-lemon.png",
      readTime: `10 ${t('blog.blogPosts.readTime')}`,
      tags: [t('blog.blogPosts.post4.tags.products'), t('blog.blogPosts.post4.tags.italian'), t('blog.blogPosts.post4.tags.syrups'), t('blog.blogPosts.post4.tags.premium')],
      likes: 203,
      comments: 51
    },
    {
      id: 5,
      title: t('blog.blogPosts.post5.title'),
      content: t('blog.blogPosts.post5.content'),
      excerpt: t('blog.blogPosts.post5.excerpt'),
      author: t('blog.blogPosts.post5.author'),
      date: t('blog.blogPosts.post5.date'),
      category: t('blog.categories.environment'),
      image: "/images/plastic-impact.png",
      readTime: `12 ${t('blog.blogPosts.readTime')}`,
      tags: [t('blog.blogPosts.post5.tags.environment'), t('blog.blogPosts.post5.tags.plastic'), t('blog.blogPosts.post5.tags.sustainability'), t('blog.blogPosts.post5.tags.green')],
      likes: 178,
      comments: 45
    },
    {
      id: 6,
      title: t('blog.blogPosts.post6.title'),
      content: t('blog.blogPosts.post6.content'),
      excerpt: t('blog.blogPosts.post6.excerpt'),
      author: t('blog.blogPosts.post6.author'),
      date: t('blog.blogPosts.post6.date'),
      category: t('blog.categories.health'),
      image: "/images/health-benefits.png",
      readTime: `10 ${t('blog.blogPosts.readTime')}`,
      tags: [t('blog.blogPosts.post6.tags.health'), t('blog.blogPosts.post6.tags.benefits'), t('blog.blogPosts.post6.tags.myths'), t('blog.blogPosts.post6.tags.science')],
      likes: 234,
      comments: 58
    },
    {
      id: 7,
      title: t('blog.blogPosts.post7.title'),
      content: t('blog.blogPosts.post7.content'),
      excerpt: t('blog.blogPosts.post7.excerpt'),
      author: t('blog.blogPosts.post7.author'),
      date: t('blog.blogPosts.post7.date'),
      category: t('blog.categories.lifestyle'),
      image: "/images/drinkmate-machine.png",
      readTime: `8 ${t('blog.blogPosts.readTime')}`,
      tags: [t('blog.blogPosts.post7.tags.party'), t('blog.blogPosts.post7.tags.entertainment'), t('blog.blogPosts.post7.tags.social'), t('blog.blogPosts.post7.tags.lifestyle'), t('blog.blogPosts.post7.tags.carbonation')],
      likes: 167,
      comments: 39
    }
  ]
  
  const post = blogPosts.find(p => p.id === parseInt(params.id))
  
  if (!post) {
    notFound()
  }
  
  if (likesCount === 0) {
    setLikesCount(post.likes)
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
                <span>{t('blog.blogPosts.author')}: {post.author}</span>
              </div>
              <div className="flex items-center">
                <Calendar className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <span>{t('blog.blogPosts.publishedOn')} {post.date}</span>
              </div>
              <div className="flex items-center">
                <Clock className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <span>{post.readTime}</span>
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
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className={`bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 hover:bg-[#12d6fa] hover:text-white ${isRTL ? 'font-cairo' : 'font-montserrat'}`}
                >
                  #{tag}
                </span>
              ))}
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

        {/* Related Posts */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className={`text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              {t('blog.blogPosts.relatedPosts')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {blogPosts
                .filter(p => p.id !== post.id)
                .slice(0, 2)
                .map((relatedPost) => (
                  <article key={relatedPost.id} className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
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
                        <Link href={`/blog/${relatedPost.id}`}>
                          <button 
                            onClick={() => window.location.href = `/blog/${relatedPost.id}`}
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
