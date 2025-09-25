"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { LoadingLink } from "@/components/ui/LoadingLink"
import { useTranslation } from "@/lib/translation-context"
import { FaFacebook, FaTwitter, FaInstagram, FaWhatsapp } from "react-icons/fa"

export default function Footer() {
  const { t, isRTL, isHydrated } = useTranslation()
  
  // Newsletter form state
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // Newsletter form handler
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address")
      setNewsletterStatus("error")
      return
    }

    setLoading(true)
    setErrorMessage("")
    
    try {
      // Simulate API call - replace with actual newsletter subscription endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo purposes, always succeed
      setNewsletterStatus("success")
      setEmail("")
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again.")
      setNewsletterStatus("error")
    } finally {
      setLoading(false)
    }
  }

     // Don't render translated content until hydration is complete
   if (!isHydrated) {
     return (
       <footer className="bg-gray-100 text-gray-800 py-20" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-6" suppressHydrationWarning>
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
    <footer className={`border-t border-black/10 bg-white py-8 ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`} dir={isHydrated && isRTL ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <div className="max-w-[1100px] mx-auto px-4 md:px-6" suppressHydrationWarning>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand + contact */}
          <section className="md:col-span-4" itemScope itemType="https://schema.org/Organization">
            <Image
              src="/images/drinkmate-logo.png"
              alt="Drinkmate"
              width={140}
              height={40}
              className="h-8 w-auto filter drop-shadow-sm"
              priority
            />
            <p className={`mt-3 text-sm text-black/70 leading-snug ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
              {t("footer.companyDescription")}
            </p>
            <ul className={`mt-4 space-y-1 text-sm ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
              <li>
                <a 
                  href="tel:+966501234567" 
                  className="text-black/70 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
                  itemProp="telephone"
                >
                  +966 50 123 4567
                </a>
              </li>
              <li>
                <a 
                  href="mailto:info@drinkmate.sa" 
                  className="text-black/70 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
                  itemProp="email"
                >
                  info@drinkmate.sa
                </a>
              </li>
              <li>
                <address className="not-italic text-black/70" itemProp="address">
                  Riyadh, Saudi Arabia
                </address>
              </li>
            </ul>
          </section>

          {/* Products - Desktop */}
          <nav className="hidden md:block md:col-span-3" aria-labelledby="f-products">
            <h3 id="f-products" className={`font-semibold mb-3 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
              {t("footer.products.title")}
            </h3>
            <ul className="space-y-2 text-sm leading-snug">
              <li>
                <Link href="/shop/sodamakers" className={`text-black/70 hover:text-black transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                  {t("footer.products.sodaMakers")}
                </Link>
              </li>
              <li>
                <Link href="/shop/co2-cylinders" className={`text-black/70 hover:text-black transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                  {t("footer.products.co2Cylinders")}
                </Link>
              </li>
              <li>
                <Link href="/shop/flavor" className={`text-black/70 hover:text-black transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                  {t("footer.products.italianSyrups")}
                </Link>
              </li>
              <li>
                <LoadingLink href="/shop/accessories" className={`text-black/70 hover:text-black transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                  {t("footer.products.accessories")}
                </LoadingLink>
              </li>
              <li>
                <Link href="/shop/bundles" className={`text-black/70 hover:text-black transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                  {t("footer.products.giftBundles")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className={`text-black/70 hover:text-black transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                  {t("footer.products.bulkOrders")}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Information - Desktop */}
          <nav className="hidden md:block md:col-span-3" aria-labelledby="f-info">
            <h3 id="f-info" className={`font-semibold mb-3 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
              {t("footer.information.title")}
            </h3>
            <ul className="space-y-2 text-sm leading-snug">
              <li>
                <Link href="/contact" className={`text-black/70 hover:text-black transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                  {t("footer.information.support")}
                </Link>
              </li>
              <li>
                <Link href="/exchange-and-return-policy" className={`text-black/70 hover:text-black transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                  Exchange and Return Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className={`text-black/70 hover:text-black transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                  {t("footer.information.privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className={`text-black/70 hover:text-black transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                  {t("footer.information.cookiePolicy")}
                </Link>
              </li>
              <li>
                <Link href="/recipes" className={`text-black/70 hover:text-black transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                  {t("footer.information.drinkmateRecipe")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className={`text-black/70 hover:text-black transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                  {t("footer.information.blogs")}
                </Link>
              </li>
              <li>
                <Link href="/track-order" className={`text-black/70 hover:text-black transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                  {t("footer.more.trackOrder")}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Newsletter */}
          <section className="md:col-span-2 min-w-0">
            <h3 className={`font-semibold mb-3 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
              {t("footer.newsletter.title")}
            </h3>
            <p className={`text-sm text-black/70 mb-3 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
              {t("footer.newsletter.disclaimer")}
            </p>
            
            {newsletterStatus === "success" ? (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-800 font-medium">
                  Thanks! Please check your inbox to confirm.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} noValidate className="w-full max-w-sm grid grid-cols-1 gap-2 mt-3">
                <label htmlFor="nl-email" className="sr-only">Email address</label>
                <input
                  id="nl-email"
                  type="email"
                  inputMode="email"
                  required
                  placeholder="Enter your email"
                  aria-describedby="nl-help"
                  className={`h-10 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {/* Honeypot (bot trap) */}
                <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" />
                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 w-full rounded-lg bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50 hover:bg-emerald-700 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
                >
                  {loading ? 'Subscribing…' : 'Subscribe to Newsletter'}
                </button>
                <p id="nl-help" className="sr-only">We'll send occasional emails. You can unsubscribe anytime.</p>
              </form>
            )}
            
            {newsletterStatus === "error" && errorMessage && (
              <p className="text-xs text-rose-600 mt-1" role="alert">
                {errorMessage}
              </p>
            )}
          </section>

          {/* Mobile Collapsible Groups */}
          <div className="md:hidden space-y-0">
            <details className="border-t border-black/10">
              <summary className={`py-3 font-medium cursor-pointer ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                {t("footer.products.title")}
              </summary>
              <ul className="pb-3 space-y-2 pl-2 text-sm leading-snug">
                <li>
                  <Link href="/shop/sodamakers" className={`text-black/70 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                    {t("footer.products.sodaMakers")}
                  </Link>
                </li>
                <li>
                  <Link href="/shop/co2-cylinders" className={`text-black/70 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                    {t("footer.products.co2Cylinders")}
                  </Link>
                </li>
                <li>
                  <Link href="/shop/flavor" className={`text-black/70 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                    {t("footer.products.italianSyrups")}
                  </Link>
                </li>
                <li>
                  <LoadingLink href="/shop/accessories" className={`text-black/70 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                    {t("footer.products.accessories")}
                  </LoadingLink>
                </li>
                <li>
                  <Link href="/shop/bundles" className={`text-black/70 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                    {t("footer.products.giftBundles")}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className={`text-black/70 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                    {t("footer.products.bulkOrders")}
                  </Link>
                </li>
              </ul>
            </details>

            <details className="border-t border-black/10">
              <summary className={`py-3 font-medium cursor-pointer ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                {t("footer.information.title")}
              </summary>
              <ul className="pb-3 space-y-2 pl-2 text-sm leading-snug">
                <li>
                  <Link href="/contact" className={`text-black/70 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                    {t("footer.information.support")}
                  </Link>
                </li>
                <li>
                  <Link href="/" className={`text-black/70 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                    {t("footer.information.reprintReturnLabel")}
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className={`text-black/70 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                    {t("footer.information.legalTerms")}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className={`text-black/70 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                    {t("footer.information.privacyPolicy")}
                  </Link>
                </li>
                <li>
                  <Link href="/cookie-policy" className={`text-black/70 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                    {t("footer.information.cookiePolicy")}
                  </Link>
                </li>
                <li>
                  <Link href="/recipes" className={`text-black/70 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                    {t("footer.information.drinkmateRecipe")}
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className={`text-black/70 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                    {t("footer.information.blogs")}
                  </Link>
                </li>
                <li>
                  <Link href="/track-order" className={`text-black/70 hover:text-black transition-colors duration-200 ${isHydrated && isRTL ? 'font-cairo text-end' : 'font-montserrat text-start'}`}>
                    {t("footer.more.trackOrder")}
                  </Link>
                </li>
              </ul>
            </details>
          </div>
        </div>

        {/* Lower bar */}
        <div className="mt-8 border-t border-black/10 pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className={`flex items-center gap-3 text-sm text-black/60 ${isHydrated && isRTL ? 'font-cairo' : 'font-montserrat'}`}>
            <span>Payment:</span>
            <div className="flex items-center gap-2">
              <Image
                src="/images/payment-logos/Mada Logo Vector.svg"
                alt="Mada"
                width={250}
                height={250}
                className="h-6 w-auto md:h-7"
                loading="lazy"
              />
              <Image
                src="/images/payment-logos/visa.png"
                alt="VISA"
                width={250}
                height={250}
                className="h-6 w-auto md:h-7"
                loading="lazy"
              />
              <Image
                src="/images/payment-logos/mastercard.png"
                alt="Mastercard"
                width={250}
                height={250}
                className="h-6 w-auto md:h-7"
                loading="lazy"
              />
              <Image
                src="/images/payment-logos/american-express.png"
                alt="American Express"
                width={250}
                height={250}
                className="h-6 w-auto md:h-7"
                loading="lazy"
              />
              <Image
                src="/images/payment-logos/tabby.png"
                alt="Tabby"
                width={80}
                height={24}
                className="h-6 w-auto md:h-7"
                loading="lazy"
              />
            </div>
            <span className="ml-6">Delivery partner:</span>
            <Image
              src="/images/delivery-logos/aramex-seeklogo.png"
              alt="Aramex"
              width={250}
              height={250}
              className="h-7 w-auto"
              loading="lazy"
            />
          </div>

          <nav aria-label="Follow us" className="flex items-center gap-3">
            <a 
              href="https://wa.me/966501234567" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="h-9 w-9 grid place-items-center rounded-full bg-emerald-50 hover:bg-emerald-100 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
              aria-label="WhatsApp"
            >
              <FaWhatsapp className="h-5 w-5 text-emerald-600" />
            </a>
            <a 
              href="https://www.facebook.com/drinkmate.sa" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="h-9 w-9 grid place-items-center rounded-full bg-blue-50 hover:bg-blue-100 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
              aria-label="Facebook"
            >
              <FaFacebook className="h-5 w-5 text-blue-600" />
            </a>
            <a 
              href="https://www.instagram.com/drinkmate.sa" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="h-9 w-9 grid place-items-center rounded-full bg-pink-50 hover:bg-pink-100 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
              aria-label="Instagram"
            >
              <FaInstagram className="h-5 w-5 text-pink-600" />
            </a>
            <a 
              href="https://twitter.com/drinkmate_sa" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="h-9 w-9 grid place-items-center rounded-full bg-sky-50 hover:bg-sky-100 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
              aria-label="Twitter"
            >
              <FaTwitter className="h-5 w-5 text-sky-600" />
            </a>
          </nav>
        </div>

        <div className="text-xs text-black/60 text-center">
          © <span suppressHydrationWarning>{new Date().getFullYear()}</span> Drinkmate. All rights reserved.
        </div>
      </div>
    </footer>
  )
}