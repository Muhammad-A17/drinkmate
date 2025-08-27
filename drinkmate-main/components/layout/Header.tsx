"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ShoppingCart, User, Menu, X, ChevronDown, LogOut } from "lucide-react"
import { useTranslation } from "@/lib/translation-context"
import { useState, useEffect } from "react"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

interface HeaderProps {
  currentPage?: string
}

export default function Header({ currentPage }: HeaderProps) {
  const { language, setLanguage, t, isRTL } = useTranslation()
  const { state } = useCart()
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isAdminPage, setIsAdminPage] = useState(false)

  useEffect(() => {
    setIsAdminPage(pathname?.startsWith('/admin') || false)
  }, [pathname])

  const toggleLanguage = () => {
    setLanguage(language === "EN" ? "AR" : "EN")
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }
  
  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/drinkmate-logo.png"
              alt="Drinkmate"
              width={120}
              height={40}
              className="h-7 sm:h-8 md:h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors duration-200 ${
                currentPage === "home" || !currentPage
                  ? "text-[#12d6fa]" 
                  : "text-gray-700 hover:text-[#12d6fa]"
              }`}
            >
              Home
            </Link>
            <div className="relative group">
              <button 
                onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
                onMouseEnter={() => setIsShopDropdownOpen(true)}
                className={`flex items-center text-sm font-medium transition-colors duration-200 ${
                  currentPage === "shop" || currentPage?.startsWith("shop-")
                    ? "text-[#12d6fa]" 
                    : "text-gray-700 hover:text-[#12d6fa]"
                }`}
              >
                Shop
                <ChevronDown className={`ml-1 w-4 h-4 transition-transform duration-200 ${isShopDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              <div 
                className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-200 ${
                  isShopDropdownOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
                onMouseLeave={() => setIsShopDropdownOpen(false)}
              >
                <div className="py-1">
                  <Link 
                    href="/shop/sodamakers" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#12d6fa]"
                    onClick={() => setIsShopDropdownOpen(false)}
                  >
                    Sodamakers
                  </Link>
                  <Link 
                    href="/shop/flavor" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#12d6fa]"
                    onClick={() => setIsShopDropdownOpen(false)}
                  >
                  Flavor
                  </Link>
                  <Link 
                    href="/shop/accessories" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#12d6fa]"
                    onClick={() => setIsShopDropdownOpen(false)}
                  >
                Accessories
                  </Link>
                 
                </div>
              </div>
            </div>
            <Link 
              href="/co2" 
              className={`text-sm font-medium transition-colors duration-200 ${
                currentPage === "co2" 
                  ? "text-[#12d6fa]" 
                  : "text-gray-700 hover:text-[#12d6fa]"
              }`}
            >
              CO2
            </Link>
            <Link 
              href="/recipes" 
              className={`text-sm font-medium transition-colors duration-200 ${
                currentPage === "recipes" 
                  ? "text-[#12d6fa]" 
                  : "text-gray-700 hover:text-[#12d6fa]"
              }`}
            >
              Recipes
            </Link>
            <Link 
              href="/contact" 
              className={`text-sm font-medium transition-colors duration-200 ${
                currentPage === "contact" 
                  ? "text-[#12d6fa]" 
                  : "text-gray-700 hover:text-[#12d6fa]"
              }`}
            >
              Contact Us
            </Link>
            <Link 
              href="/track-order" 
              className={`text-sm font-medium transition-colors duration-200 ${
                currentPage === "track-order" 
                  ? "text-[#12d6fa]" 
                  : "text-gray-700 hover:text-[#12d6fa]"
              }`}
            >
              Track Order
            </Link>
          </nav>

          {/* Right Side Icons and Button */}
          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-1 sm:space-x-2 md:space-x-reverse md:space-x-4' : 'space-x-1 sm:space-x-2 md:space-x-4'}`}>
            {/* Language Selector */}
            <button
              onClick={toggleLanguage}
              className={`flex items-center ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-1'} px-1 sm:px-2 md:px-3 py-1 sm:py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200`}
            >
              <Image
                src={language === "EN" ? "/images/us-flag.png" : "/images/saudi-arabia-flag.png"}
                alt={language === "EN" ? "US Flag" : "Saudi Arabia Flag"}
                width={24}
                height={16}
                className="object-contain w-6 h-4"
              />
              <span className="text-sm font-medium text-gray-700 hidden md:inline">{language}</span>
            </button>

            {/* Cart Icon with Count */}
            <Link 
              href="/cart"
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {state.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#12d6fa] text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {state.itemCount > 99 ? '99+' : state.itemCount}
                </span>
              )}
            </Link>

            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                onBlur={() => setTimeout(() => setIsUserDropdownOpen(false), 100)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <User className="w-5 h-5 text-gray-700" />
              </button>
              
              {/* User Dropdown Menu */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-2 text-sm text-gray-700 border-b">
                          Signed in as <span className="font-semibold">{user?.username}</span>
                        </div>
                        
                        {user?.isAdmin && (
                          <Link
                            href="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <div className="flex items-center">
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign out
                          </div>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          Sign in
                        </Link>
                        <Link
                          href="/register"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          Create account
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Only show Refill Cylinder button on non-admin pages */}
            {!isAdminPage && (
              <Button 
                onClick={() => router.push('/refill-cylinder')}
                className="bg-[#a8f387] hover:bg-[#9ae374] text-black font-medium px-2 sm:px-3 md:px-6 py-1 sm:py-2 rounded-full transition-all duration-200 hover:shadow-md text-[10px] xs:text-xs md:text-sm"
              >
                <span className="hidden sm:inline">Refill Cylinder</span>
                <span className="sm:hidden">Refill</span>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-700" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200 ${
                  currentPage === "home" || !currentPage
                    ? "text-[#12d6fa] bg-blue-50" 
                    : "text-gray-700 hover:text-[#12d6fa] hover:bg-gray-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <div className="space-y-1">
                <button
                  className={`w-full text-left text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200 ${
                    currentPage === "shop" || currentPage?.startsWith("shop-")
                      ? "text-[#12d6fa] bg-blue-50" 
                      : "text-gray-700 hover:text-[#12d6fa] hover:bg-gray-50"
                  } flex items-center justify-between`}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(true); // Keep mobile menu open
                  }}
                >
                  <span>Shop</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {/* Shop subcategories */}
                <div className="pl-6 space-y-1">
                  <Link 
                    href="/shop/sodamakers" 
                    className="block text-sm text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-[#12d6fa]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                     Sodamakers
                  </Link>
                  <Link 
                    href="/shop/flavor" 
                    className="block text-sm text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-[#12d6fa]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Flavor
                  </Link>
                  <Link 
                    href="/shop/accessories" 
                    className="block text-sm text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-[#12d6fa]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                  Accessories
                  </Link>
                  
                </div>
              </div>
              <Link 
                href="/co2" 
                className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200 ${
                  currentPage === "co2" 
                    ? "text-[#12d6fa] bg-blue-50" 
                    : "text-gray-700 hover:text-[#12d6fa] hover:bg-gray-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                CO2
              </Link>
              <Link 
                href="/recipes" 
                className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200 ${
                  currentPage === "recipes" 
                    ? "text-[#12d6fa] bg-blue-50" 
                    : "text-gray-700 hover:text-[#12d6fa] hover:bg-gray-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Recipes
              </Link>
              <Link 
                href="/contact" 
                className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200 ${
                  currentPage === "contact" 
                    ? "text-[#12d6fa] bg-blue-50" 
                    : "text-gray-700 hover:text-[#12d6fa] hover:bg-gray-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact Us
              </Link>
              <Link 
                href="/track-order" 
                className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200 ${
                  currentPage === "track-order" 
                    ? "text-[#12d6fa] bg-blue-50" 
                    : "text-gray-700 hover:text-[#12d6fa] hover:bg-gray-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Track Order
              </Link>
              
              {/* Auth links for mobile */}
              <div className="border-t border-gray-200 mt-2 pt-2">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-2 text-sm font-medium text-gray-700">
                      Signed in as <span className="font-semibold">{user?.username}</span>
                    </div>
                    
                    {user?.isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Create account
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}