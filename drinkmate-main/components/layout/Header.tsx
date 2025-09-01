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
    setIsAdminPage(pathname?.startsWith("/admin") || false)
  }, [pathname])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.shop-dropdown') && !target.closest('.shop-button')) {
        setIsShopDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleLanguage = () => {
    setLanguage(language === "EN" ? "AR" : "EN")
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <header className={`bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50 transition-all duration-300 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group transition-transform duration-200 hover:scale-105">
            <Image
              src="/images/drinkmate-logo.png"
              alt="Drinkmate"
              width={120}
              height={40}
              className="h-7 sm:h-8 md:h-10 w-auto filter drop-shadow-sm"
              style={{ width: 'auto' }}
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            <button
              onClick={(e) => {
                e.preventDefault()
                router.push("/")
              }}
              className={`text-sm font-semibold tracking-wide transition-all duration-300 relative group cursor-pointer ${
                currentPage === "home" || !currentPage ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Home
              {(currentPage === "home" || !currentPage) && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#12d6fa] hover:bg-[#0bc4e8] rounded-full"></span>
              )}
            </button>
            <div className="relative group">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsShopDropdownOpen(!isShopDropdownOpen)
                }}
                onMouseEnter={() => setIsShopDropdownOpen(true)}
                aria-label="Shop Menu"
                className={`shop-button flex items-center text-sm font-semibold tracking-wide transition-all duration-300 relative group ${
                  currentPage === "shop" || currentPage?.startsWith("shop-")
                    ? "text-slate-900"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Shop
                <ChevronDown
                  className={`ml-1 w-4 h-4 transition-all duration-300 ${isShopDropdownOpen ? "rotate-180" : ""}`}
                />
                {(currentPage === "shop" || currentPage?.startsWith("shop-")) && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#12d6fa] hover:bg-[#0bc4e8] rounded-full"></span>
                )}
              </button>

              {/* Dropdown Menu */}
              <div
                className={`shop-dropdown absolute left-0 mt-3 w-56 rounded-xl shadow-2xl bg-white/95 backdrop-blur-md ring-1 ring-slate-200 transition-all duration-300 ${
                  isShopDropdownOpen
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
                }`}
                onMouseLeave={() => setIsShopDropdownOpen(false)}
              >
                <div className="py-2">
                  <Link
                    href="/shop/sodamakers"
                    className="block px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 border-l-2 border-transparent hover:border-blue-400"
                    onClick={(e) => {
                      e.preventDefault()
                      setIsShopDropdownOpen(false)
                      router.push("/shop/sodamakers")
                    }}
                  >
                    Sodamakers
                  </Link>
                  <Link
                    href="/shop/flavor"
                    className="block px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 border-l-2 border-transparent hover:border-blue-400"
                    onClick={(e) => {
                      e.preventDefault()
                      setIsShopDropdownOpen(false)
                      router.push("/shop/flavor")
                    }}
                  >
                    Flavor
                  </Link>
                  <Link
                    href="/shop/accessories"
                    className="block px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 border-l-2 border-transparent hover:border-blue-400"
                    onClick={(e) => {
                      e.preventDefault()
                      setIsShopDropdownOpen(false)
                      router.push("/shop/accessories")
                    }}
                  >
                    Accessories
                  </Link>
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault()
                router.push("/co2")
              }}
              className={`text-sm font-semibold tracking-wide transition-all duration-300 relative group cursor-pointer ${
                currentPage === "co2" ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              CO2
              {currentPage === "co2" && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#12d6fa] hover:bg-[#0bc4e8] rounded-full"></span>
              )}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                router.push("/recipes")
              }}
              className={`text-sm font-semibold tracking-wide transition-all duration-300 relative group cursor-pointer ${
                currentPage === "recipes" ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Recipes
              {currentPage === "recipes" && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#12d6fa] hover:bg-[#0bc4e8] rounded-full"></span>
              )}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                router.push("/contact")
              }}
              className={`text-sm font-semibold tracking-wide transition-all duration-300 relative group cursor-pointer ${
                currentPage === "contact" ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Contact Us
              {currentPage === "contact" && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#12d6fa] hover:bg-[#0bc4e8] rounded-full"></span>
              )}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                router.push("/track-order")
              }}
              className={`text-sm font-semibold tracking-wide transition-all duration-300 relative group cursor-pointer ${
                currentPage === "track-order" ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Track Order
              {currentPage === "track-order" && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#12d6fa] hover:bg-[#0bc4e8] rounded-full"></span>
              )}
            </button>
          </nav>

          {/* Right Side Icons and Button */}
          <div
            className={`flex items-center ${isRTL ? "space-x-reverse space-x-2 sm:space-x-3 md:space-x-reverse md:space-x-5" : "space-x-2 sm:space-x-3 md:space-x-5"}`}
          >
            {/* Language Selector */}
            <button
              onClick={toggleLanguage}
              aria-label={`Change language to ${language === "EN" ? "Arabic" : "English"}`}
              className={`flex items-center ${isRTL ? "space-x-reverse space-x-2" : "space-x-2"} px-3 py-2 rounded-lg hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-200 hover:shadow-sm`}
            >
              <Image
                src={language === "EN" ? "/images/us-flag.png" : "/images/saudi-arabia-flag.png"}
                alt={language === "EN" ? "US Flag" : "Saudi Arabia Flag"}
                width={24}
                height={16}
                className="object-contain w-6 h-4 rounded-sm shadow-sm"
              />
              <span className="text-sm font-semibold text-slate-700 hidden md:inline">{language}</span>
            </button>

            {/* Cart Icon with Count */}
            <Link
              href="/cart"
              className="relative p-3 rounded-lg hover:bg-slate-50 transition-all duration-200 group hover:shadow-sm border border-transparent hover:border-slate-200"
            >
              <ShoppingCart className="w-5 h-5 text-slate-700 group-hover:text-slate-900 transition-colors duration-200" />
              {state.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg ring-2 ring-white">
                  {state.itemCount > 99 ? "99+" : state.itemCount}
                </span>
              )}
            </Link>

            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                onBlur={() => setTimeout(() => setIsUserDropdownOpen(false), 100)}
                aria-label="User Menu"
                className="p-3 rounded-lg hover:bg-slate-50 transition-all duration-200 group hover:shadow-sm border border-transparent hover:border-slate-200"
              >
                <User className="w-5 h-5 text-slate-700 group-hover:text-slate-900 transition-colors duration-200" />
              </button>

              {/* User Dropdown Menu */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-xl shadow-2xl bg-white/95 backdrop-blur-md ring-1 ring-slate-200">
                  <div className="py-2">
                    {isAuthenticated ? (
                      <>
                        <div className="px-5 py-3 text-sm text-slate-700 border-b border-slate-100 bg-slate-50/50">
                          Signed in as <span className="font-semibold text-slate-900">{user?.username}</span>
                        </div>

                        {user?.isAdmin && (
                          <Link
                            href="/admin"
                            className="block px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
                        >
                          <div className="flex items-center">
                            <LogOut className="w-4 h-4 mr-3" />
                            Sign out
                          </div>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="block px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          Sign in
                        </Link>
                        <Link
                          href="/register"
                          className="block px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
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
                onClick={() => router.push("/refill-cylinder")}
                className="bg-[#a8f387] hover:bg-[#96e075] text-slate-900 font-semibold px-3 sm:px-4 md:px-8 py-2 sm:py-2.5 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105 text-xs md:text-sm "
              >
                <span className="hidden sm:inline">Refill Cylinder</span>
                <span className="sm:hidden">Refill</span>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
              className="md:hidden p-3 rounded-lg hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-200 hover:shadow-sm"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-700" />
              ) : (
                <Menu className="w-5 h-5 text-slate-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 py-6 bg-white/95 backdrop-blur-md">
            <nav className="flex flex-col space-y-2">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setIsMobileMenuOpen(false)
                  router.push("/")
                }}
                className={`text-sm font-semibold px-5 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  currentPage === "home" || !currentPage
                    ? "text-slate-900 bg-slate-100 border-l-4 border-[#12d6fa]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Home
              </button>
              <div className="space-y-1">
                <button
                  className={`w-full text-left text-sm font-semibold px-5 py-3 rounded-lg transition-all duration-200 ${
                    currentPage === "shop" || currentPage?.startsWith("shop-")
                      ? "text-slate-900 bg-slate-100 border-l-4 border-[#12d6fa]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  } flex items-center justify-between`}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    // Toggle shop dropdown instead of keeping mobile menu open
                    setIsShopDropdownOpen(!isShopDropdownOpen)
                  }}
                >
                  <span>Shop</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Shop subcategories */}
                <div className="pl-6 space-y-1">
                  <Link
                    href="/shop/sodamakers"
                    className="block text-sm font-medium text-slate-600 px-5 py-2 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
                    onClick={(e) => {
                      e.preventDefault()
                      setIsMobileMenuOpen(false)
                      router.push("/shop/sodamakers")
                    }}
                  >
                    Sodamakers
                  </Link>
                  <Link
                    href="/shop/flavor"
                    className="block text-sm font-medium text-slate-600 px-5 py-2 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
                    onClick={(e) => {
                      e.preventDefault()
                      setIsMobileMenuOpen(false)
                      router.push("/shop/flavor")
                    }}
                  >
                    Flavor
                  </Link>
                  <Link
                    href="/shop/accessories"
                    className="block text-sm font-medium text-slate-600 px-5 py-2 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
                    onClick={(e) => {
                      e.preventDefault()
                      setIsMobileMenuOpen(false)
                      router.push("/shop/accessories")
                    }}
                  >
                    Accessories
                  </Link>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setIsMobileMenuOpen(false)
                  router.push("/co2")
                }}
                className={`text-sm font-semibold px-5 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  currentPage === "co2"
                    ? "text-slate-900 bg-slate-100 border-l-4 border-[#12d6fa]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                CO2
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setIsMobileMenuOpen(false)
                  router.push("/recipes")
                }}
                className={`text-sm font-semibold px-5 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  currentPage === "recipes"
                    ? "text-slate-900 bg-slate-100 border-l-4 border-[#12d6fa]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Recipes
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setIsMobileMenuOpen(false)
                  router.push("/contact")
                }}
                className={`text-sm font-semibold px-5 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  currentPage === "contact"
                    ? "text-slate-900 bg-slate-100 border-l-4 border-[#12d6fa]"
                    : "text-slate-900 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Contact Us
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setIsMobileMenuOpen(false)
                  router.push("/track-order")
                }}
                className={`text-sm font-semibold px-5 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  currentPage === "track-order"
                    ? "text-slate-900 bg-slate-100 border-l-4 border-[#12d6fa]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Track Order
              </button>

              {/* Auth links for mobile */}
              <div className="border-t border-slate-100 mt-4 pt-4">
                {isAuthenticated ? (
                  <>
                    <div className="px-5 py-3 text-sm font-semibold text-slate-700 bg-slate-50 rounded-lg mb-2">
                      Signed in as <span className="font-bold text-slate-900">{user?.username}</span>
                    </div>

                    {user?.isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex items-center w-full text-left px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      className="block px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-all duration-200"
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
