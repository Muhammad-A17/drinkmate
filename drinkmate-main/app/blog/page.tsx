"use client"

import PageLayout from "@/components/layout/PageLayout"
import { Calendar, User, ArrowRight, Coffee, Sparkles, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useTranslation } from "@/lib/translation-context"

export default function Blog() {
  const { t, isRTL, isHydrated } = useTranslation()
  
  // Don't render translated content until hydration is complete
  if (!isHydrated) {
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

  const blogPosts = [
    {
      id: 1,
      title: t('blog.blogPosts.postTitles.post1'),
      excerpt: t('blog.blogPosts.postExcerpts.post1'),
      author: t('blog.blogPosts.postAuthors.drinkmateTeam'),
      date: t('blog.blogPosts.postDates.jan15'),
      category: t('blog.categories.recipes'),
      image: "/images/drink-recipes.png",
      readTime: `12 ${t('blog.blogPosts.readTime')}`
    },
    {
      id: 2,
      title: t('blog.blogPosts.postTitles.post2'),
      excerpt: t('blog.blogPosts.postExcerpts.post2'),
      author: t('blog.blogPosts.postAuthors.ahmedHassan'),
      date: t('blog.blogPosts.postDates.jan12'),
      category: t('blog.categories.science'),
      image: "/images/co2-cylinder.png",
      readTime: `15 ${t('blog.blogPosts.readTime')}`
    },
    {
      id: 3,
      title: t('blog.blogPosts.postTitles.post3'),
      excerpt: t('blog.blogPosts.postExcerpts.post3'),
      author: t('blog.blogPosts.postAuthors.drinkmateTeam'),
      date: t('blog.blogPosts.postDates.jan10'),
      category: t('blog.categories.guide'),
      image: "/images/co2-cylinder.png",
      readTime: `8 ${t('blog.blogPosts.readTime')}`
    },
    {
      id: 4,
      title: t('blog.blogPosts.postTitles.post4'),
      excerpt: t('blog.blogPosts.postExcerpts.post4'),
      author: t('blog.blogPosts.postAuthors.drinkmateTeam'),
      date: t('blog.blogPosts.postDates.jan8'),
      category: t('blog.categories.products'),
      image: "/images/italian-strawberry-lemon.png",
      readTime: `10 ${t('blog.blogPosts.readTime')}`
    },
    {
      id: 5,
      title: t('blog.blogPosts.postTitles.post5'),
      excerpt: t('blog.blogPosts.postExcerpts.post5'),
      author: t('blog.blogPosts.postAuthors.environmentalTeam'),
      date: t('blog.blogPosts.postDates.jan5'),
      category: t('blog.categories.environment'),
      image: "/images/plastic-impact.png",
      readTime: `12 ${t('blog.blogPosts.readTime')}`
    },
    {
      id: 6,
      title: t('blog.blogPosts.postTitles.post6'),
      excerpt: t('blog.blogPosts.postExcerpts.post6'),
      author: t('blog.blogPosts.postAuthors.sarahJohnson'),
      date: t('blog.blogPosts.postDates.jan3'),
      category: t('blog.categories.health'),
      image: "/images/health-benefits.png",
      readTime: `10 ${t('blog.blogPosts.readTime')}`
    },
    {
      id: 7,
      title: t('blog.blogPosts.postTitles.post7'),
      excerpt: t('blog.blogPosts.postExcerpts.post7'),
      author: t('blog.blogPosts.postAuthors.drinkmateTeam'),
      date: t('blog.blogPosts.postDates.dec30'),
      category: t('blog.categories.lifestyle'),
      image: "/images/drinkmate-machine.png",
      readTime: `8 ${t('blog.blogPosts.readTime')}`
    }
  ]

  const categories = [t('blog.categories.all'), t('blog.categories.recipes'), t('blog.categories.science'), t('blog.categories.guide'), t('blog.categories.products'), t('blog.categories.environment'), t('blog.categories.health'), t('blog.categories.lifestyle')]

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
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${isRTL ? 'font-cairo' : 'font-montserrat'} ${
                    category === t('blog.categories.all')
                      ? "bg-[#12d6fa] text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-[#12d6fa] hover:text-white border border-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Featured Post */}
            <div className="mb-16">
              <div className="bg-white rounded-3xl overflow-hidden shadow-xl">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative h-64 md:h-full">
                    <Image
                      src={blogPosts[0].image}
                      alt={blogPosts[0].title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`bg-[#a8f387] text-black px-3 py-1 rounded-full text-sm font-semibold ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                        {blogPosts[0].category}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className={`flex items-center space-x-4 text-sm text-gray-500 mb-4 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                      <span className="flex items-center">
                        <Calendar className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t('blog.blogPosts.publishedOn')} {blogPosts[0].date}
                      </span>
                      <span className="flex items-center">
                        <User className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t('blog.blogPosts.author')}: {blogPosts[0].author}
                      </span>
                    </div>
                    <h2 className={`text-2xl md:text-3xl font-bold text-gray-900 mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                      {blogPosts[0].title}
                    </h2>
                    <p className={`text-gray-600 text-lg mb-6 leading-relaxed ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                      {blogPosts[0].excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm text-gray-500 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>{blogPosts[0].readTime}</span>
                      <Link href={`/blog/${blogPosts[0].id}`}>
                        <button 
                          onClick={() => window.location.href = `/blog/${blogPosts[0].id}`}
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

            {/* Blog Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.slice(1).map((post) => (
                <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1">
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
                        {t('blog.blogPosts.publishedOn')} {post.date}
                      </span>
                      <span className="flex items-center">
                        <User className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {t('blog.blogPosts.author')}: {post.author}
                      </span>
                    </div>
                    
                    <h3 className={`text-xl font-bold text-gray-900 mb-3 group-hover:text-[#12d6fa] transition-colors duration-200 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                      {post.title}
                    </h3>
                    
                    <p className={`text-gray-600 mb-4 leading-relaxed ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm text-gray-500 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>{post.readTime}</span>
                      <Link href={`/blog/${post.id}`}>
                        <button 
                          onClick={() => window.location.href = `/blog/${post.id}`}
                          className={`text-[#12d6fa] hover:text-[#0bc4e8] font-medium transition-all duration-200 flex items-center group ${isRTL ? 'font-cairo' : 'font-montserrat'}`}
                        >
                          {t('blog.featuredPost.readMore')}
                          <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'} group-hover:translate-x-1 transition-transform duration-200`} />
                        </button>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Newsletter Signup */}
            <div className="mt-20 bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] rounded-3xl p-8 md:p-12 text-center text-white">
              <div className="max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                  {t('blog.newsletter.title')}
                </h2>
                <p className={`text-xl text-white/90 mb-8 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  {t('blog.newsletter.description')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder={t('blog.newsletter.emailPlaceholder')}
                    className={`flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}
                  />
                  <button 
                    onClick={() => alert('Thank you for subscribing to our newsletter!')}
                    className={`bg-[#a8f387] hover:bg-[#9ae374] text-black px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}
                  >
                    {t('blog.newsletter.subscribe')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
