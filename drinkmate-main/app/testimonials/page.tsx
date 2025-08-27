"use client"

import React, { useState, useEffect, useRef } from "react"
import { useTranslation } from "@/lib/translation-context"
import PageLayout from "@/components/layout/PageLayout"
import { Star, Play, Pause, Volume2, VolumeX, Maximize2, ChevronLeft, ChevronRight, Quote, Users, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

// Testimonial data
const testimonials = [
  {
    id: 1,
    name: "Sarah Al Mansouri",
    location: "Riyadh, Saudi Arabia",
    rating: 5,
    comment: "I love my DrinkMate! It's so easy to use and makes delicious sparkling drinks. I've tried it with juice, tea, and even wine - everything turns out perfect! The quality is amazing and it's become a daily part of my routine.",
    avatar: "/images/drinkmate-machine-hero.png",
    product: "DrinkMate Carbonator - Red",
    date: "2024-01-15"
  },
  {
    id: 2,
    name: "Ahmed Hassan",
    location: "Jeddah, Saudi Arabia",
    rating: 5,
    comment: "This is a game changer! Being able to carbonate any drink is amazing. The machine is well-built and looks great on my kitchen counter. My kids love making their own sparkling drinks and it's much healthier than store-bought sodas.",
    avatar: "/images/drinkmate-machine-blue.png",
    product: "DrinkMate Carbonator - Blue",
    date: "2024-01-10"
  },
  {
    id: 3,
    name: "Fatima Zahra",
    location: "Dammam, Saudi Arabia",
    rating: 4,
    comment: "Great product that works as advertised. I've saved so much money by not buying bottled sparkling water anymore. The only reason for 4 stars is I wish the CO2 cylinders lasted a bit longer, but overall excellent value.",
    avatar: "/images/co2-cylinder-single.png",
    product: "CO2 Cylinder",
    date: "2023-12-28"
  },
  {
    id: 4,
    name: "Omar Al Rashid",
    location: "Abha, Saudi Arabia",
    rating: 5,
    comment: "Incredible machine! I use it for my coffee shop and customers love the unique sparkling coffee drinks. The Italian syrups are amazing quality and the machine is very reliable. Highly recommend for business use.",
    avatar: "/images/italian-strawberry-lemon-syrup.png",
    product: "Premium Italian Syrups",
    date: "2024-01-05"
  },
  {
    id: 5,
    name: "Layla Al Qahtani",
    location: "Tabuk, Saudi Arabia",
    rating: 5,
    comment: "Perfect for entertaining! I love making sparkling cocktails for guests. The machine is so easy to use and the results are professional quality. Everyone is always impressed and asks where I got it from.",
    avatar: "/images/drinkmate-machine-black-small.png",
    product: "DrinkMate Carbonator - Black",
    date: "2023-12-20"
  },
  {
    id: 6,
    name: "Khalid Al Otaibi",
    location: "Hail, Saudi Arabia",
    rating: 4,
    comment: "Excellent product for the price. The carbonation is perfect and the machine is very durable. I've had it for over a year now and it still works like new. Great investment for any household.",
    avatar: "/images/drinkmate-machine-red.png",
    product: "DrinkMate Carbonator - Red",
    date: "2023-11-15"
  },
  {
    id: 7,
    name: "Noor Al Harbi",
    location: "Al Khobar, Saudi Arabia",
    rating: 5,
    comment: "I'm obsessed with this machine! I make sparkling water with fresh lemon and mint every day. It's so much healthier than buying bottled drinks and the taste is incredible. The customer service is also excellent.",
    avatar: "/images/drinkmate-machine-blue.png",
    product: "DrinkMate Carbonator - Blue",
    date: "2024-01-08"
  },
  {
    id: 8,
    name: "Yousef Al Ghamdi",
    location: "Taif, Saudi Arabia",
    rating: 5,
    comment: "Amazing product! I use it for my restaurant and it's been a huge hit. Customers love the unique drinks we can create. The machine is very reliable and the CO2 refill service is convenient.",
    avatar: "/images/co2-cylinder.png",
    product: "CO2 Cylinder",
    date: "2023-12-10"
  }
]

export default function TestimonialsPage() {
  const { t, isRTL } = useTranslation()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-scroll slider
  useEffect(() => {
    const interval = setInterval(() => {
      if (sliderRef.current) {
        const scrollLeft = sliderRef.current.scrollLeft
        const maxScroll = sliderRef.current.scrollWidth - sliderRef.current.clientWidth
        
        if (scrollLeft >= maxScroll) {
          sliderRef.current.scrollLeft = 0
        } else {
          sliderRef.current.scrollLeft += 300
        }
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  const handleVideoEnded = () => {
    setIsPlaying(false)
  }

  const scrollToSlide = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 300
      const newScrollLeft = direction === 'left' 
        ? sliderRef.current.scrollLeft - scrollAmount
        : sliderRef.current.scrollLeft + scrollAmount
      
      sliderRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  return (
    <PageLayout>
             {/* Hero Section */}
       <div className="relative bg-gradient-to-b from-white to-[#f3f3f3] py-16 overflow-hidden">

         <div className="container mx-auto px-4 relative z-10">
           <div className="text-center text-gray-800">
             <div className="flex justify-center mb-4">
               <div className="bg-[#12d6fa]/20 backdrop-blur-sm rounded-full p-3">
                 <Quote className="w-10 h-10 text-[#12d6fa]" />
               </div>
             </div>
             
             <h1 className={`text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
               Customer Testimonials
             </h1>
             
             <p className={`text-lg md:text-xl text-gray-600 max-w-4xl mx-auto mb-6 leading-relaxed ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
               Hear from our satisfied customers across Saudi Arabia about their experience with DrinkMate products
             </p>

             
           </div>
         </div>
       </div>

      <div className="container mx-auto px-4 py-16">
        {/* Video Testimonial Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold text-gray-800 mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              Watch Our Customer Stories
            </h2>
            <p className={`text-lg text-gray-600 max-w-2xl mx-auto ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
              See real customers share their experiences with DrinkMate products
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl">
              {/* Video Placeholder - Replace with actual video when available */}
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Customer Testimonials Video</h3>
                  <p className="text-white/80">Coming Soon - Real customer stories and experiences</p>
                  <p className="text-sm text-white/60 mt-4">Video will showcase customers using DrinkMate products</p>
                </div>
              </div>
              
              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={togglePlay}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                    
                    <Button
                      onClick={toggleMute}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                  </div>
                  
                  <Button
                    onClick={toggleFullscreen}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Slider Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold text-gray-800 mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              What Our Customers Say
            </h2>
            <p className={`text-lg text-gray-600 max-w-2xl mx-auto ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
              Real reviews from customers across Saudi Arabia
            </p>
          </div>
          
          {/* Navigation Arrows */}
          <div className="flex justify-center space-x-4 mb-8">
            <Button
              onClick={() => scrollToSlide('left')}
              variant="outline"
              size="sm"
              className="rounded-full w-12 h-12 p-0 border-2 hover:border-[#12d6fa] hover:text-[#12d6fa]"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              onClick={() => scrollToSlide('right')}
              variant="outline"
              size="sm"
              className="rounded-full w-12 h-12 p-0 border-2 hover:border-[#12d6fa] hover:text-[#12d6fa]"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          {/* Infinite Scroll Slider */}
          <div className="relative overflow-hidden">
            <div
              ref={sliderRef}
              className="flex space-x-6 overflow-x-auto scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* Duplicate testimonials for infinite scroll effect */}
              {[...testimonials, ...testimonials].map((testimonial, index) => (
                <div
                  key={`${testimonial.id}-${index}`}
                  className="flex-shrink-0 w-80"
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:bg-white hover:scale-105">
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#12d6fa] to-[#0bc4e8] rounded-full overflow-hidden flex-shrink-0 shadow-lg">
                          <Image
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold text-lg text-gray-800 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                            {testimonial.name}
                          </h3>
                          <p className={`text-sm text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                            {testimonial.location}
                          </p>
                          <p className={`text-xs text-[#12d6fa] font-medium ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                            {testimonial.product}
                          </p>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < testimonial.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600 font-medium">{testimonial.rating}/5</span>
                      </div>

                      {/* Comment */}
                      <p className={`text-gray-700 leading-relaxed ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                        "{testimonial.comment}"
                      </p>

                      {/* Date */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className={`text-xs text-gray-500 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                          {new Date(testimonial.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] rounded-3xl p-12 text-white shadow-2xl">
          <div className="max-w-3xl mx-auto">
            <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              Join Our Happy Customers
            </h2>
            <p className={`text-xl mb-8 opacity-90 leading-relaxed ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
              Experience the DrinkMate difference and create amazing sparkling drinks at home
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.location.href = '/shop'}
                className="bg-white text-[#12d6fa] hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Shop Now
              </Button>
              <Button
                onClick={() => window.location.href = '/contact'}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#12d6fa] px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </PageLayout>
  )
}
