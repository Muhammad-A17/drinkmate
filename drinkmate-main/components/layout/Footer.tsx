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
    <footer className={`bg-gray-100 py-12 ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`} dir={isHydrated && isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info Column */}
          <div className="lg:col-span-1">
            <div className="mb-8">
              <Image
                src="/images/drinkmate-logo.png"
                alt="Drinkmate"
                width={140}
                height={40}
                className="h-8 sm:h-10 md:h-12 w-auto filter drop-shadow-sm"
                style={{ width: "auto", height: "auto" }}
                priority
              />
            </div>
            <p className={`text-gray-600 leading-relaxed mb-6 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
              {t("footer.companyDescription")}
            </p>
            <div className="space-y-2">
              <p className={`text-sm text-gray-600 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                📞 {t("footer.phone")}
              </p>
              <p className={`text-sm text-gray-600 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                ✉️ {t("footer.email")}
              </p>
              <p className={`text-sm text-gray-600 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                📍 {t("footer.address")}
              </p>
            </div>
          </div>

          {/* Products Column */}
          <div>
            <h3 className={`text-xl font-bold text-black mb-6 ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              {t("footer.products.title")}
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/shop/sodamakers" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  {t("footer.products.sodaMakers")}
                </a>
              </li>
              <li>
                <a href="/co2" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  {t("footer.products.co2Cylinders")}
                </a>
              </li>
              <li>
                <a href="/shop/flavor" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  {t("footer.products.italianSyrups")}
                </a>
              </li>
              <li>
                <a href="/shop/accessories" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  {t("footer.products.accessories")}
                </a>
              </li>
              <li>
                <a href="/shop/bundles" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  {t("footer.products.giftBundles")}
                </a>
              </li>
              <li>
                <a href="/contact" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  {t("footer.products.bulkOrders")}
                </a>
              </li>
            </ul>
          </div>

          {/* Information Column */}
          <div>
            <h3 className={`text-xl font-bold text-black mb-6 ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              {t("footer.information.title")}
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/contact" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  {t("footer.information.support")}
                </a>
              </li>
              <li>
                <a href="/" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  {t("footer.information.reprintReturnLabel")}
                </a>
              </li>
              <li>
                <a href="/terms-of-service" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  {t("footer.information.legalTerms")}
                </a>
              </li>
              <li>
                <a href="/privacy-policy" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  {t("footer.information.privacyPolicy")}
                </a>
              </li>
              <li>
                <a href="/cookie-policy" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  {t("footer.information.cookiePolicy")}
                </a>
              </li>
              <li>
                <a href="/recipes" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  {t("footer.information.drinkmateRecipe")}
                </a>
              </li>
              <li>
                <a href="/blog" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  {t("footer.information.blogs")}
                </a>
              </li>
            </ul>
          </div>

          {/* More Column */}
          <div>
            <h3 className={`text-xl font-bold text-black mb-6 ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              {t("footer.more.title")}
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/track-order" className={`text-gray-600 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                  {t("footer.more.trackOrder")}
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="lg:max-w-sm">
            <h3 className={`text-lg font-bold text-black mb-2 leading-tight ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              {t("footer.newsletter.title")}
            </h3>
            
            <p className={`text-sm text-gray-600 mb-4 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
              {t("footer.newsletter.disclaimer")}
            </p>
            
            <div className="space-y-3">
              <input
                type="email"
                placeholder={t("footer.newsletter.emailPlaceholder")}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a8f387] focus:border-[#a8f387] transition-colors duration-200 text-sm ${isHydrated && isRTL ? 'font-noto-arabic text-right' : 'font-noto-sans'}`}
              />
              
              <Button 
                onClick={() => alert('Thank you for subscribing to our newsletter!')}
                className={`w-full bg-[#a8f387] hover:bg-[#9ae374] text-black font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 text-sm ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}
              >
                {t("footer.newsletter.subscribeButton")}
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 md:mt-16 pt-8 md:pt-10 border-t border-gray-200">
          <div className="flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-16 items-center justify-between">
            {/* Payment Methods */}
            <div className={`text-center ${isHydrated && isRTL ? 'lg:text-right' : 'lg:text-left'}`}>
              <p className={`text-sm font-medium text-gray-700 mb-4 ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t("footer.payment.title")}</p>
              <div className={`flex flex-wrap gap-3 justify-center ${isHydrated && isRTL ? 'lg:justify-end' : 'lg:justify-start'}`}>
                <Image
                  src="/images/payment-logos/Mada Logo Vector.svg"
                  alt="Mada"
                  width={50}
                  height={30}
                  className="h-7 sm:h-8 md:h-9 w-auto"
                />
                <Image
                  src="/images/payment-logos/visa.png"
                  alt="VISA"
                  width={50}
                  height={30}
                  className="h-7 sm:h-8 md:h-9 w-auto"
                />
                <Image
                  src="/images/payment-logos/mastercard.png"
                  alt="Mastercard"
                  width={50}
                  height={30}
                  className="h-7 sm:h-8 md:h-9 w-auto"
                />
                <Image
                  src="/images/payment-logos/american-express.png"
                  alt="American Express"
                  width={50}
                  height={30}
                  className="h-7 sm:h-8 md:h-9 w-auto"
                />
                <Image
                  src="/images/payment-logos/google-pay.png"
                  alt="Google Pay"
                  width={50}
                  height={30}
                  className="h-7 sm:h-8 md:h-9 w-auto"
                />
                <Image
                  src="/images/payment-logos/apple-pay.png"
                  alt="Apple Pay"
                  width={50}
                  height={30}
                  className="h-7 sm:h-8 md:h-9 w-auto"
                />
                <Image
                  src="/images/payment-logos/samsung-pay.svg"
                  alt="Samsung Pay"
                  width={50}
                  height={30}
                  className="h-7 sm:h-8 md:h-9 w-auto"
                />
              </div>
            </div>

            {/* Delivery Partner */}
            <div className="text-center">
              <p className={`text-sm font-medium text-gray-700 mb-4 ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t("footer.delivery.title")}</p>
              <div className="flex justify-center">
                <Image
                  src="/images/delivery-logos/aramex-seeklogo.png"
                  alt="Aramex"
                  width={120}
                  height={50}
                  className="h-10 sm:h-12 md:h-14 w-auto"
                  style={{ width: 'auto' }}
                />
              </div>
            </div>

            {/* Social Media Icons */}
            <div className={`text-center ${isHydrated && isRTL ? 'lg:text-right' : 'lg:text-left'}`}>
              <p className={`text-sm font-medium text-gray-700 mb-4 ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t("footer.social.followUs")}</p>
              <div className={`flex flex-wrap justify-center gap-3 ${isHydrated && isRTL ? 'lg:justify-start' : 'lg:justify-start'}`}>
                <a 
                  href="https://wa.me/966501234567" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center hover:opacity-90 transition-all duration-300 transform hover:scale-110 shadow-lg"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp size={20} />
                </a>
                <a 
                  href="https://www.facebook.com/drinkmate.sa" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 bg-[#1877F2] text-white rounded-full flex items-center justify-center hover:opacity-90 transition-all duration-300 transform hover:scale-110 shadow-lg"
                  aria-label="Facebook"
                >
                  <FaFacebook size={20} />
                </a>
                <a 
                  href="https://www.instagram.com/drinkmate.sa" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white rounded-full flex items-center justify-center hover:opacity-90 transition-all duration-300 transform hover:scale-110 shadow-lg"
                  aria-label="Instagram"
                >
                  <FaInstagram size={20} />
                </a>
                <a 
                  href="https://twitter.com/drinkmate_sa" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 bg-[#1DA1F2] text-white rounded-full flex items-center justify-center hover:opacity-90 transition-all duration-300 transform hover:scale-110 shadow-lg"
                  aria-label="Twitter"
                >
                  <FaTwitter size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className={`text-sm text-gray-600 ${isHydrated && isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
              {t("footer.copyright")}
            </p>
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