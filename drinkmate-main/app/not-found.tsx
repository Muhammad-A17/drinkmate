"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, Search, ShoppingCart } from "lucide-react"
import Link from "next/link"
import PageLayout from "@/components/layout/PageLayout"

export default function NotFound() {
  return (
    <PageLayout currentPage="404">
      <div className="min-h-screen bg-gradient-to-b from-white to-[#f3f3f3] flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* 404 Number */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-6xl md:text-9xl font-bold text-[#12d6fa] leading-none">404</h1>
            <div className="w-24 md:w-32 h-1 bg-[#a8f387] mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Main Message */}
          <div className="mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-black mb-3 md:mb-4 font-montserrat">
              Oops! Page Not Found
            </h2>
            <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-noto-sans">
              The page you're looking for seems to have fizzed away! 
              Don't worry, we've got plenty of refreshing content waiting for you.
            </p>
          </div>

          {/* Drinkmate Machine Illustration */}
          <div className="mb-8 md:mb-12 flex justify-center">
            <div className="relative">
              <Image
                src="/images/drinkmate-machine.png"
                alt="Drinkmate Machine"
                width={200}
                height={300}
                className="object-contain opacity-20 w-32 md:w-48 h-auto"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#12d6fa] rounded-full flex items-center justify-center animate-pulse">
                  <Search className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 md:mb-12">
            <Link href="/">
              <Button className="bg-[#12d6fa] hover:bg-[#0bc4e8] text-white px-6 md:px-8 py-3 text-base md:text-lg font-medium transition-all duration-200 hover:scale-105 w-full sm:w-auto">
                <Home className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <Link href="/shop">
              <Button variant="outline" className="border-[#a8f387] text-[#a8f387] hover:bg-[#a8f387] hover:text-white px-6 md:px-8 py-3 text-base md:text-lg font-medium transition-all duration-200 hover:scale-105 w-full sm:w-auto">
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Browse Products
              </Button>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
            <h3 className="text-xl md:text-2xl font-bold text-black mb-4 md:mb-6 font-montserrat">
              Popular Pages
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <Link 
                href="/shop"
                className="group p-4 rounded-xl border border-gray-200 hover:border-[#12d6fa] hover:shadow-md transition-all duration-200"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#12d6fa] rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h4 className="font-semibold text-black mb-2 text-sm md:text-base font-montserrat">Shop</h4>
                <p className="text-xs md:text-sm text-gray-600 font-noto-sans">Browse our soda makers & accessories</p>
              </Link>

              <Link 
                href="/shop/co2-cylinders"
                className="group p-4 rounded-xl border border-gray-200 hover:border-[#12d6fa] hover:shadow-md transition-all duration-200"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#a8f387] rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-white rounded-full"></div>
                </div>
                <h4 className="font-semibold text-black mb-2 text-sm md:text-base font-montserrat">CO2</h4>
                <p className="text-xs md:text-sm text-gray-600 font-noto-sans">Refill your cylinders & exchange</p>
              </Link>

              <Link 
                href="/recipes"
                className="group p-4 rounded-xl border border-gray-200 hover:border-[#12d6fa] hover:shadow-md transition-all duration-200"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white text-lg md:text-xl font-bold">🍹</span>
                </div>
                <h4 className="font-semibold text-black mb-2 text-sm md:text-base font-montserrat">Recipes</h4>
                <p className="text-xs md:text-sm text-gray-600 font-noto-sans">Discover delicious drink recipes</p>
              </Link>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 md:mt-12 bg-white rounded-2xl p-6 md:p-8 shadow-lg">
            <h3 className="text-xl md:text-2xl font-bold text-black mb-3 md:mb-4 font-montserrat">
              Need Help?
            </h3>
            <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6 font-noto-sans">
              Can't find what you're looking for? Our support team is here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Link href="/contact">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:border-[#12d6fa] hover:text-[#12d6fa] px-4 md:px-6 py-2 text-sm md:text-base">
                  Contact Support
                </Button>
              </Link>
              <Link href="/track-order">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:border-[#12d6fa] hover:text-[#12d6fa] px-4 md:px-6 py-2 text-sm md:text-base">
                  Track Order
                </Button>
              </Link>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-6 md:mt-8">
            <button 
              onClick={() => window.history.back()}
              className="inline-flex items-center text-[#12d6fa] hover:text-[#0bc4e8] font-medium transition-colors duration-200 text-sm md:text-base"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
