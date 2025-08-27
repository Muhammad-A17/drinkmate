"use client"

import { Button } from "@/components/ui/button"
import { ChevronUp } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useTranslation } from "@/lib/translation-context"
import { FaFacebook, FaTwitter, FaInstagram, FaWhatsapp } from "react-icons/fa"

export default function Footer() {
  const { t, isRTL, isHydrated } = useTranslation()
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY
          const docHeight = document.documentElement.scrollHeight - window.innerHeight
          const scrollPercent = Math.min(scrollTop / docHeight, 1) // Ensure it doesn't exceed 1

          setScrollProgress(scrollPercent)
          setShowScrollTop(scrollTop > 300) // Show button after scrolling 300px
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

     // Don't render translated content until hydration is complete
   if (!isHydrated) {
     return (
       <footer className="bg-gray-100 text-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Main Footer Content Skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Company Info & Logo Skeleton */}
            <div className="lg:col-span-1">
              <div className="mb-8">
                               <div className="w-140 h-20 bg-gray-300 rounded animate-pulse"></div>
             </div>
             <div className="w-full h-20 bg-gray-300 rounded mb-8 animate-pulse"></div>
             
             
           </div>

           {/* Products Column Skeleton */}
           <div>
             <div className="w-32 h-8 bg-gray-300 rounded mb-8 animate-pulse"></div>
             <ul className="space-y-4">
               {[...Array(5)].map((_, i) => (
                 <li key={i}>
                   <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
                 </li>
               ))}
             </ul>
           </div>

           {/* Support Column Skeleton */}
           <div>
             <div className="w-32 h-8 bg-gray-300 rounded mb-8 animate-pulse"></div>
             <ul className="space-y-4">
               {[...Array(4)].map((_, i) => (
                 <li key={i}>
                   <div className="w-28 h-4 bg-gray-300 rounded animate-pulse"></div>
                 </li>
               ))}
             </ul>
           </div>

           {/* Newsletter Column Skeleton */}
           <div>
             <div className="w-40 h-8 bg-gray-300 rounded mb-8 animate-pulse"></div>
             <div className="w-full h-4 bg-gray-300 rounded mb-4 animate-pulse"></div>
             <div className="w-full h-10 bg-gray-300 rounded mb-4 animate-pulse"></div>
             <div className="w-24 h-10 bg-gray-300 rounded animate-pulse"></div>
           </div>
         </div>

         {/* Bottom Footer Skeleton */}
         <div className="border-t border-gray-300 pt-8">
           <div className="flex flex-col md:flex-row justify-between items-center">
             <div className="w-48 h-4 bg-gray-300 rounded mb-4 md:mb-0 animate-pulse"></div>
             <div className="flex space-x-6">
               {[...Array(5)].map((_, i) => (
                 <div key={i} className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
               ))}
             </div>
           </div>
         </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-gray-100 py-12" dir={isHydrated && isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Products Column */}
          <div>
            <h3 className={`text-xl font-bold text-black mb-6 ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              Products
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/shop" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  Drinkmate Soda Makers
                </a>
              </li>
              <li>
                <a href="/co2" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  CO2
                </a>
              </li>
              <li>
                <a href="/shop" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  Premium Italian Syrups
                </a>
              </li>
              <li>
                <a href="/shop" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  Accessories
                </a>
              </li>
              <li>
                <a href="/shop" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  Gift For Family & Friends
                </a>
              </li>
              <li>
                <a href="/contact" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  Bulk Order Request
                </a>
              </li>
            </ul>
          </div>

          {/* Information Column */}
          <div>
            <h3 className={`text-xl font-bold text-black mb-6 ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              Information
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/contact" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  Support
                </a>
              </li>
              <li>
                <a href="/" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  Reprint Return Label
                </a>
              </li>
              <li>
                <a href="/terms-of-service" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  Legal Terms
                </a>
              </li>
              <li>
                <a href="/privacy-policy" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/cookie-policy" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="/recipes" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  Drinkmate Recipe
                </a>
              </li>
              <li>
                <a href="/blog" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  Blogs
                </a>
              </li>
            </ul>
          </div>

          {/* More Column */}
          <div>
            <h3 className={`text-xl font-bold text-black mb-6 ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              More
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/track-order" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  Track Order
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="lg:max-w-sm">
            <h3 className={`text-xl font-bold text-black mb-6 leading-tight ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              Register your email to hear about our new offers & Promotions and get 5% discount on your next purchase with us!
            </h3>
            
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a8f387] focus:border-[#a8f387] transition-colors duration-200"
              />
              
              <Button 
                onClick={() => alert('Thank you for subscribing to our newsletter!')}
                className="w-full bg-[#a8f387] hover:bg-[#9ae374] text-black font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                SIGN ME UP
              </Button>
              
              <p className={`text-xs text-gray-500 leading-relaxed ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                You can unsubscribe to the newsletter at anytime in profile settings<br />
                <span className="font-medium">*Gas cylinders & exchange/refill are not eligible for the discount*.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 md:mt-16 pt-8 md:pt-10 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12 items-center">
            {/* Payment Methods */}
            <div className="text-center lg:text-left">
              <p className="text-sm font-medium text-gray-700 mb-3 md:mb-4">Payment Methods Accepted</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 md:gap-3">
                <Image
                  src="/images/payment-logos/Mada Logo Vector.svg"
                  alt="Mada"
                  width={50}
                  height={30}
                  className="h-6 sm:h-7 md:h-8 w-auto"
                />
                <Image
                  src="/images/payment-logos/visa.png"
                  alt="VISA"
                  width={50}
                  height={30}
                  className="h-6 sm:h-7 md:h-8 w-auto"
                />
                <Image
                  src="/images/payment-logos/mastercard.png"
                  alt="Mastercard"
                  width={50}
                  height={30}
                  className="h-6 sm:h-7 md:h-8 w-auto"
                />
                <Image
                  src="/images/payment-logos/american-express.png"
                  alt="American Express"
                  width={50}
                  height={30}
                  className="h-6 sm:h-7 md:h-8 w-auto"
                />
                <Image
                  src="/images/payment-logos/google-pay.png"
                  alt="Google Pay"
                  width={50}
                  height={30}
                  className="h-6 sm:h-7 md:h-8 w-auto"
                />
                <Image
                  src="/images/payment-logos/apple-pay.png"
                  alt="Apple Pay"
                  width={50}
                  height={30}
                  className="h-6 sm:h-7 md:h-8 w-auto"
                />
                <Image
                  src="/images/payment-logos/samsung-pay.svg"
                  alt="Samsung Pay"
                  width={50}
                  height={30}
                  className="h-6 sm:h-7 md:h-8 w-auto"
                />
              </div>
            </div>

            {/* Delivery Partner */}
            <div className="text-center mt-6 md:mt-0">
              <p className="text-sm font-medium text-gray-700 mb-3 md:mb-4">Delivery Partner</p>
              <Image
                src="/images/delivery-logos/aramex-seeklogo.png"
                alt="Aramex"
                width={100}
                height={40}
                className="h-8 sm:h-9 md:h-10 w-auto mx-auto"
              />
            </div>

            {/* Social Media Icons */}
            <div className="text-center lg:text-right mt-6 lg:mt-0">
              <p className="text-sm font-medium text-gray-700 mb-3 md:mb-4">Follow Us</p>
              <div className="flex justify-center lg:justify-end space-x-2 sm:space-x-3">
                <a 
                  href="https://wa.me/966501234567" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center hover:opacity-90 transition-all duration-300 transform hover:scale-110"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp size={18} className="sm:text-xl md:text-2xl" />
                </a>
                <a 
                  href="https://www.facebook.com/drinkmate.sa" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-[#1877F2] text-white rounded-full flex items-center justify-center hover:opacity-90 transition-all duration-300 transform hover:scale-110"
                  aria-label="Facebook"
                >
                  <FaFacebook size={18} className="sm:text-xl md:text-2xl" />
                </a>
                <a 
                  href="https://www.instagram.com/drinkmate.sa" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white rounded-full flex items-center justify-center hover:opacity-90 transition-all duration-300 transform hover:scale-110"
                  aria-label="Instagram"
                >
                  <FaInstagram size={18} className="sm:text-xl md:text-2xl" />
                </a>
                <a 
                  href="https://twitter.com/drinkmate_sa" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-[#1DA1F2] text-white rounded-full flex items-center justify-center hover:opacity-90 transition-all duration-300 transform hover:scale-110"
                  aria-label="Twitter"
                >
                  <FaTwitter size={18} className="sm:text-xl md:text-2xl" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Progress Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-8 z-50 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg overflow-hidden border-2 border-gray-200"
          style={{
            backgroundColor: "white",
          }}
          aria-label={isRTL ? "انتقل إلى الأعلى" : "Scroll to top"}
        >
          {/* Blue fill that grows from bottom based on scroll progress */}
          <div
            className="absolute bottom-0 left-0 w-full bg-[#12d6fa] transition-all duration-100"
            style={{
              height: `${scrollProgress * 100}%`,
            }}
          />

          {/* Icon positioned above the fill */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <ChevronUp 
              className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 transition-colors duration-300" 
              style={{ 
                color: scrollProgress > 0.5 ? "white" : "#12d6fa" 
              }} 
            />
          </div>
        </button>
      )}
    </footer>
  )
}