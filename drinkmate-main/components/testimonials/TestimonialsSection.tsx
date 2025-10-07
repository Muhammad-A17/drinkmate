"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Quote, ChevronLeft, ChevronRight, Users, Heart } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { testimonialAPI, Testimonial } from "@/lib/api/testimonial-api"
import { useTranslation } from "@/lib/contexts/translation-context"

interface TestimonialsSectionProps {
  featured?: boolean
  limit?: number
  language?: 'en' | 'ar'
  showAll?: boolean
  className?: string
}

export default function TestimonialsSection({ 
  featured = false, 
  limit = 6, 
  language = 'en',
  showAll = false,
  className = ""
}: TestimonialsSectionProps) {
  const { t, isRTL } = useTranslation()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Fetch testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const filters = {
          featured: featured ? true : undefined,
          language,
          limit: showAll ? undefined : limit
        }
        
        const response = await testimonialAPI.getTestimonials(filters)
        
        if (response.data?.success) {
          setTestimonials(response.data.testimonials || [])
        } else {
          setError('Failed to load testimonials')
        }
      } catch (err) {
        console.error('Error fetching testimonials:', err)
        setError('Failed to load testimonials')
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [featured, language, limit, showAll])

  // Get rating stars
  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  // Navigation functions
  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  if (loading) {
    return (
      <div className={`py-12 ${className}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-8"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || testimonials.length === 0) {
    return (
      <div className={`py-12 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No testimonials available</p>
            <p className="text-sm">Check back later for customer reviews</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`py-12 ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#12d6fa]/20 rounded-full mb-4">
            <Heart className="w-8 h-8 text-[#12d6fa]" />
          </div>
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 text-gray-800 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
            {featured ? t('testimonials.featured.title') : t('testimonials.title')}
          </h2>
          <p className={`text-lg text-gray-600 max-w-2xl mx-auto ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
            {featured 
              ? t('testimonials.featured.description')
              : t('testimonials.description')
            }
          </p>
          <div className="w-20 h-1 bg-[#12d6fa] mx-auto rounded-full mt-4"></div>
        </div>

        {/* Testimonials Grid */}
        {showAll ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial._id} className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 h-full flex flex-col">
                  {/* Quote Icon */}
                  <div className="flex justify-center mb-4">
                    <Quote className="h-8 w-8 text-[#12d6fa]" />
                  </div>
                  
                  {/* Rating */}
                  <div className="flex justify-center mb-4">
                    <div className="flex items-center">
                      {getRatingStars(testimonial.rating)}
                    </div>
                  </div>
                  
                  {/* Testimonial Text */}
                  <div className="flex-1 mb-6">
                    <p className={`text-gray-700 text-center leading-relaxed ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                      "{testimonial.text}"
                    </p>
                  </div>
                  
                  {/* Author Info */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-3">
                      <Avatar className="h-12 w-12 mr-3" style={{ backgroundColor: testimonial.avatarColor }}>
                        {testimonial.avatar ? (
                          <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                        ) : (
                          <AvatarFallback className="text-white font-medium">
                            {testimonial.avatarInitial}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="text-left">
                        <h4 className={`font-semibold text-gray-800 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                          {testimonial.author}
                        </h4>
                        {testimonial.role && (
                          <p className={`text-sm text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                            {testimonial.role}
                          </p>
                        )}
                        {testimonial.company && (
                          <p className={`text-sm text-gray-500 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                            {testimonial.company}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Badges */}
                    <div className="flex justify-center space-x-2">
                      {testimonial.isVerified && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Verified
                        </Badge>
                      )}
                      {testimonial.featured && (
                        <Badge className="bg-purple-100 text-purple-800">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Carousel View */
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div key={testimonial._id} className="w-full flex-shrink-0">
                    <Card className="mx-4">
                      <CardContent className="p-8 text-center">
                        {/* Quote Icon */}
                        <div className="flex justify-center mb-6">
                          <Quote className="h-12 w-12 text-[#12d6fa]" />
                        </div>
                        
                        {/* Rating */}
                        <div className="flex justify-center mb-6">
                          <div className="flex items-center">
                            {getRatingStars(testimonial.rating)}
                          </div>
                        </div>
                        
                        {/* Testimonial Text */}
                        <div className="mb-8">
                          <p className={`text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                            "{testimonial.text}"
                          </p>
                        </div>
                        
                        {/* Author Info */}
                        <div className="flex items-center justify-center">
                          <Avatar className="h-16 w-16 mr-4" style={{ backgroundColor: testimonial.avatarColor }}>
                            {testimonial.avatar ? (
                              <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                            ) : (
                              <AvatarFallback className="text-white font-medium text-lg">
                                {testimonial.avatarInitial}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="text-left">
                            <h4 className={`text-xl font-semibold text-gray-800 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                              {testimonial.author}
                            </h4>
                            {testimonial.role && (
                              <p className={`text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                                {testimonial.role}
                              </p>
                            )}
                            {testimonial.company && (
                              <p className={`text-gray-500 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                                {testimonial.company}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Buttons */}
            {testimonials.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2"
                  onClick={prevTestimonial}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  onClick={nextTestimonial}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {/* Dots Indicator */}
            {testimonials.length > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-[#12d6fa]' : 'bg-gray-300'
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
