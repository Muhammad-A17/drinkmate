"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ShoppingCart, User, Menu, X, ChevronDown, LogOut, ArrowLeft } from "lucide-react"
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
  const [showMobileShopGrid, setShowMobileShopGrid] = useState(false)

  useEffect(() => {
    setIsAdminPage(pathname?.startsWith("/admin") || false)
  }, [pathname])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest(".shop-dropdown") && !target.closest(".shop-button")) {
        setIsShopDropdownOpen(false)
      }
      if (!target.closest(".user-dropdown") && !target.closest(".user-button")) {
        setIsUserDropdownOpen(false)
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsShopDropdownOpen(false)
        setIsUserDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscapeKey)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [])

  const toggleLanguage = () => {
    setLanguage(language === "EN" ? "AR" : "EN")
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    if (isMobileMenuOpen) {
      setShowMobileShopGrid(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleMobileShopClick = () => {
    setShowMobileShopGrid(true)
  }

  const handleBackToMenu = () => {
    setShowMobileShopGrid(false)
  }

  return (
    <header
      className={`bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50 transition-all duration-300 ${isRTL ? "font-cairo" : "font-montserrat"}`}
    >
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
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className={`hidden md:flex items-center ${isRTL ? "space-x-reverse space-x-10" : "space-x-10"}`}>
            <Link
              href="/"
              className={`text-sm font-semibold tracking-wide transition-all duration-300 relative group cursor-pointer ${isRTL ? "font-cairo px-2" : "font-montserrat px-2"} ${
                currentPage === "home" || !currentPage ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("header.home")}
              {(currentPage === "home" || !currentPage) && (
                <span
                  className={`absolute -bottom-1 w-full h-0.5 bg-[#12d6fa] hover:bg-[#0bc4e8] rounded-full ${isRTL ? "right-0" : "left-0"}`}
                ></span>
              )}
            </Link>
            <div className="relative group">
              <button
                onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
                onMouseEnter={() => setIsShopDropdownOpen(true)}
                onFocus={() => setIsShopDropdownOpen(true)}
                aria-label={t("header.shop")}
                aria-expanded="false"
                aria-haspopup="true"
                className={`shop-button flex items-center text-sm font-semibold tracking-wide transition-all duration-300 relative group ${isRTL ? "font-cairo px-2" : "font-montserrat px-2"} ${
                  currentPage === "shop" || currentPage?.startsWith("shop-")
                    ? "text-slate-900"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t("header.shop")}
                <ChevronDown
                  className={`${isRTL ? "mr-1" : "ml-1"} w-4 h-4 transition-all duration-300 ${isShopDropdownOpen ? "rotate-180" : ""}`}
                />
                {(currentPage === "shop" || currentPage?.startsWith("shop-")) && (
                  <span
                    className={`absolute -bottom-1 w-full h-0.5 bg-[#12d6fa] hover:bg-[#0bc4e8] rounded-full ${isRTL ? "right-0" : "left-0"}`}
                  ></span>
                )}
              </button>

              {/* Dropdown Menu */}
              {isShopDropdownOpen && (
                <div
                  className={`shop-dropdown absolute ${isRTL ? "right-0" : "left-0"} mt-3 w-[960px] rounded-2xl shadow-2xl bg-white ring-1 ring-slate-200/50 border border-white/20 transition-all duration-300 opacity-100 translate-y-0 scale-100 z-50`}
                  onMouseLeave={() => setIsShopDropdownOpen(false)}
                  aria-label="Shop categories"
                >
                <div className="p-4">
                  <div className="grid grid-cols-4 gap-4 h-64">
                    {/* Soda Makers */}
                    <Link
                      href="/shop/sodamakers"
                      className="col-span-1 bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] rounded-2xl p-4 text-white hover:from-[#12d6fa] hover:to-[#0bc4e8] transition-all duration-300 group relative overflow-hidden flex flex-col items-center justify-center"
                      onClick={() => setIsShopDropdownOpen(false)}
                    >
                      <div className="relative z-10 text-center">
                        <h3 className={`text-xl font-bold mb-4 ${isRTL ? "font-cairo" : "font-montserrat"}`}>{t("header.sodamakers")}</h3>
                        <div className="flex justify-center">
                          <Image
                            src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756559855/Artic-Black-Machine---Front_pxsies.png"
                            alt="Sample Soda Maker"
                            width={100}
                            height={100}
                            className="object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>

                    {/* Flavors */}
                    <Link
                      href="/shop/flavor"
                      className="col-span-1 bg-[#a8f387] hover:bg-[#96e075] rounded-2xl p-4 text-white transition-all duration-300 group relative overflow-hidden flex flex-col items-center justify-center"
                      onClick={() => setIsShopDropdownOpen(false)}
                    >
                      <div className="relative z-10 text-center">
                        <h3 className={`text-xl font-bold mb-4 ${isRTL ? "font-cairo" : "font-montserrat"}`}>{t("header.flavor")}</h3>
                        <div className="flex justify-center">
                          <Image
                            src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756892917/italian-strawberry-lemon-syrup_x0cz9h.png"
                            alt="Sample Flavor"
                            width={80}
                            height={100}
                            className="object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>

                    {/* Accessories */}
                    <Link
                      href="/shop/accessories"
                      className="col-span-1 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-4 hover:from-slate-200 hover:to-slate-300 transition-all duration-300 group relative overflow-hidden flex flex-col items-center justify-center"
                      onClick={() => setIsShopDropdownOpen(false)}
                    >
                      <div className="relative z-10 text-center">
                        <h3 className={`text-xl font-bold text-slate-800 mb-4 ${isRTL ? "font-cairo" : "font-montserrat"}`}>{t("header.accessories")}</h3>
                        <div className="flex justify-center">
                          <Image
                            src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756892916/empty-drinkmate-bottle_dkmtzo.png"
                            alt="Sample Accessory"
                            width={80}
                            height={100}
                            className="object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>

                    {/* CO2 Cylinders */}
                    <Link
                      href="/co2"
                      className="col-span-1 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl p-4 text-white hover:from-orange-500 hover:to-orange-600 transition-all duration-300 group relative overflow-hidden flex flex-col items-center justify-center"
                      onClick={() => setIsShopDropdownOpen(false)}
                    >
                      <div className="relative z-10 text-center">
                        <h3 className={`text-xl font-bold mb-4 ${isRTL ? "font-cairo" : "font-montserrat"}`}>{t("header.co2")}</h3>
                        <div className="flex justify-center">
                          <Image
                            src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756892915/co2-cylinder_placeholder.png"
                            alt="CO2 Cylinder"
                            width={80}
                            height={100}
                            className="object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>
                  </div>
                </div>
                </div>
              )}
            </div>

            <Link
              href="/recipes"
              className={`text-sm font-semibold tracking-wide transition-all duration-300 relative group cursor-pointer ${isRTL ? "font-cairo px-2" : "font-montserrat px-2"} ${
                currentPage === "recipes" ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("header.recipes")}
              {currentPage === "recipes" && (
                <span
                  className={`absolute -bottom-1 w-full h-0.5 bg-[#12d6fa] hover:bg-[#0bc4e8] rounded-full ${isRTL ? "right-0" : "left-0"}`}
                ></span>
              )}
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-semibold tracking-wide transition-all duration-300 relative group cursor-pointer ${isRTL ? "font-cairo px-2" : "font-montserrat px-2"} ${
                currentPage === "contact" ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("header.contactUs")}
              {currentPage === "contact" && (
                <span
                  className={`absolute -bottom-1 w-full h-0.5 bg-[#12d6fa] hover:bg-[#0bc4e8] rounded-full ${isRTL ? "right-0" : "left-0"}`}
                ></span>
              )}
            </Link>
            <Link
              href="/track-order"
              className={`text-sm font-semibold tracking-wide transition-all duration-300 relative group cursor-pointer ${isRTL ? "font-cairo px-2" : "font-montserrat px-2"} ${
                currentPage === "track-order" ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("header.trackOrder")}
              {currentPage === "track-order" && (
                <span
                  className={`absolute -bottom-1 w-full h-0.5 bg-[#12d6fa] hover:bg-[#0bc4e8] rounded-full ${isRTL ? "right-0" : "left-0"}`}
                ></span>
              )}
            </Link>
          </nav>

          {/* Right Side Icons and Button */}
          <div
            className={`flex items-center ${isRTL ? "space-x-reverse space-x-2 sm:space-x-3 md:space-x-reverse md:space-x-5" : "space-x-2 sm:space-x-3 md:space-x-5"}`}
          >
            {/* Language Selector */}
            <button
              onClick={toggleLanguage}
              aria-label={language === "EN" ? t("common.changeToArabic") : t("common.changeToEnglish")}
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
                aria-label={t("header.userMenu")}
                aria-expanded={isUserDropdownOpen}
                aria-haspopup="true"
                className="user-button p-3 rounded-lg hover:bg-slate-50 transition-all duration-200 group hover:shadow-sm border border-transparent hover:border-slate-200"
              >
                <User className="w-5 h-5 text-slate-700 group-hover:text-slate-900 transition-colors duration-200" />
              </button>

              {/* User Dropdown Menu */}
              {isUserDropdownOpen && (
                <div 
                  className="user-dropdown absolute right-0 mt-3 w-56 rounded-xl shadow-2xl bg-white/95 backdrop-blur-md ring-1 ring-slate-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="py-2">
                    {isAuthenticated ? (
                      <>
                        <div className="px-5 py-3 text-sm text-slate-700 border-b border-slate-100 bg-slate-50/50">
                          Signed in as <span className="font-semibold text-slate-900">{user?.username}</span>
                        </div>

                        <Link
                          href="/profile"
                          className="block px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setIsUserDropdownOpen(false)
                            router.push('/profile')
                          }}
                        >
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-3" />
                            My Profile
                          </div>
                        </Link>

                        {user?.isAdmin && (
                          <Link
                            href="/admin"
                            className="block px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setIsUserDropdownOpen(false)
                              router.push('/admin')
                            }}
                          >
                            Admin Dashboard
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false)
                            handleLogout()
                          }}
                          className={`block w-full ${isRTL ? "text-right" : "text-left"} px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200`}
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
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setIsUserDropdownOpen(false)
                            router.push('/login')
                          }}
                        >
                          Sign in
                        </Link>
                        <Link
                          href="/register"
                          className="block px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setIsUserDropdownOpen(false)
                            router.push('/register')
                          }}
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
              <Link href="/refill-cylinder">
                <Button
                  className={`bg-[#a8f387] hover:bg-[#96e075] text-slate-900 font-semibold px-3 sm:px-4 md:px-8 py-2 sm:py-2.5 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105 text-xs md:text-sm ${isRTL ? "font-cairo" : "font-montserrat"}`}
                >
                  <span className="hidden sm:inline">{t("header.refillCylinder")}</span>
                  <span className="sm:hidden">{t("header.refill")}</span>
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? t("common.closeMenu") : t("common.openMenu")}
              aria-expanded="false"
              aria-controls="mobile-menu"
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
          <div id="mobile-menu" className="md:hidden border-t border-slate-100 py-6 bg-white/95 backdrop-blur-md">
            {showMobileShopGrid ? (
              // Mobile Shop Grid View
              <div id="mobile-shop-grid" className="px-4">
                {/* Back Button */}
                <button
                  onClick={handleBackToMenu}
                  className="flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className={`text-sm font-medium ${isRTL ? "font-cairo" : "font-montserrat"}`}>{t("common.back")}</span>
                </button>

                {/* Shop Categories Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Soda Makers */}
                  <Link
                    href="/shop/sodamakers"
                    className="bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] rounded-2xl p-6 text-white hover:from-[#12d6fa] hover:to-[#0bc4e8] transition-all duration-300 group relative overflow-hidden flex flex-col items-center justify-center aspect-square"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      setShowMobileShopGrid(false)
                    }}
                  >
                    <div className="relative z-10 text-center">
                      <div className="flex justify-center mb-4">
                        <Image
                          src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756559855/Artic-Black-Machine---Front_pxsies.png"
                          alt="Sample Soda Maker"
                          width={80}
                          height={80}
                          className="object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <h3 className={`text-sm font-bold ${isRTL ? "font-cairo" : "font-montserrat"}`}>{t("header.sodamakers")}</h3>
                    </div>
                  </Link>

                  {/* Flavors */}
                  <Link
                    href="/shop/flavor"
                    className="bg-[#a8f387] hover:bg-[#96e075] rounded-2xl p-6 text-white transition-all duration-300 group relative overflow-hidden flex flex-col items-center justify-center aspect-square"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      setShowMobileShopGrid(false)
                    }}
                  >
                    <div className="relative z-10 text-center">
                      <div className="flex justify-center mb-4">
                        <Image
                          src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756892917/italian-strawberry-lemon-syrup_x0cz9h.png"
                          alt="Sample Flavor"
                          width={60}
                          height={80}
                          className="object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <h3 className={`text-sm font-bold ${isRTL ? "font-cairo" : "font-montserrat"}`}>{t("header.flavor")}</h3>
                    </div>
                  </Link>

                  {/* Accessories */}
                  <Link
                    href="/shop/accessories"
                    className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-6 hover:from-slate-200 hover:to-slate-300 transition-all duration-300 group relative overflow-hidden flex flex-col items-center justify-center aspect-square"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      setShowMobileShopGrid(false)
                    }}
                  >
                    <div className="relative z-10 text-center">
                      <div className="flex justify-center mb-4">
                        <Image
                          src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756892916/empty-drinkmate-bottle_dkmtzo.png"
                          alt="Sample Accessory"
                          width={60}
                          height={80}
                          className="object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <h3 className={`text-sm font-bold text-slate-800 ${isRTL ? "font-cairo" : "font-montserrat"}`}>{t("header.accessories")}</h3>
                    </div>
                  </Link>

                  {/* CO2 Cylinders */}
                  <Link
                    href="/co2"
                    className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl p-6 text-white hover:from-orange-500 hover:to-orange-600 transition-all duration-300 group relative overflow-hidden flex flex-col items-center justify-center aspect-square"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      setShowMobileShopGrid(false)
                    }}
                  >
                    <div className="relative z-10 text-center">
                      <div className="flex justify-center mb-4">
                        <Image
                          src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756892915/co2-cylinder_placeholder.png"
                          alt="CO2 Cylinder"
                          width={60}
                          height={80}
                          className="object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <h3 className={`text-sm font-bold ${isRTL ? "font-cairo" : "font-montserrat"}`}>{t("header.co2")}</h3>
                    </div>
                  </Link>
                </div>
              </div>
            ) : (
              // Regular Mobile Menu
              <nav className="flex flex-col space-y-1">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-medium px-5 py-3 ${isRTL ? "text-right" : "text-left"} transition-all duration-200 cursor-pointer ${isRTL ? "font-cairo" : "font-montserrat"} ${
                    currentPage === "home" || !currentPage
                      ? `text-slate-900 bg-slate-100 ${isRTL ? "border-r-4" : "border-l-4"} border-[#12d6fa]`
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {t("header.home")}
                </Link>

                <button
                  className={`w-full ${isRTL ? "text-right" : "text-left"} text-sm font-medium px-5 py-3 transition-all duration-200 cursor-pointer ${isRTL ? "font-cairo" : "font-montserrat"} ${
                    currentPage === "shop" || currentPage?.startsWith("shop-")
                      ? `text-slate-900 bg-slate-100 ${isRTL ? "border-r-4" : "border-l-4"} border-[#12d6fa]`
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                  onClick={handleMobileShopClick}
                  aria-label={t("header.shop")}
                  aria-expanded="false"
                  aria-controls="mobile-shop-grid"
                  aria-haspopup="true"
                >
                  {t("header.shop")}
                </button>

               
                <Link
                  href="/recipes"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-medium px-5 py-3 ${isRTL ? "text-right" : "text-left"} transition-all duration-200 cursor-pointer ${isRTL ? "font-cairo" : "font-montserrat"} ${
                    currentPage === "recipes"
                      ? `text-slate-900 bg-slate-100 ${isRTL ? "border-r-4" : "border-l-4"} border-[#12d6fa]`
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {t("header.recipes")}
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-medium px-5 py-3 ${isRTL ? "text-right" : "text-left"} transition-all duration-200 cursor-pointer ${isRTL ? "font-cairo" : "font-montserrat"} ${
                    currentPage === "contact"
                      ? `text-slate-900 bg-slate-100 ${isRTL ? "border-r-4" : "border-l-4"} border-[#12d6fa]`
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {t("header.contactUs")}
                </Link>
                <Link
                  href="/track-order"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-medium px-5 py-3 ${isRTL ? "text-right" : "text-left"} transition-all duration-200 cursor-pointer ${isRTL ? "font-cairo" : "font-montserrat"} ${
                    currentPage === "track-order"
                      ? `text-slate-900 bg-slate-100 ${isRTL ? "border-r-4" : "border-l-4"} border-[#12d6fa]`
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {t("header.trackOrder")}
                </Link>

                {/* Auth links for mobile */}
                <div className="border-t border-slate-100 mt-4 pt-4 space-y-1">
                  {isAuthenticated ? (
                    <>
                      <div className="px-5 py-3 text-sm text-slate-700 bg-slate-50">
                        Signed in as <span className="font-bold text-slate-900">{user?.username}</span>
                      </div>

                      <Link
                        href="/profile"
                        className="block px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My Profile
                      </Link>

                      {user?.isAdmin && (
                        <Link
                          href="/admin"
                          className="block px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
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
                        className={`flex items-center w-full ${isRTL ? "text-right" : "text-left"} px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200`}
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/register"
                        className="block px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Create account
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
