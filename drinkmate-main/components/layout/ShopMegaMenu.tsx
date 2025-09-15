"use client"

import * as Popover from "@radix-ui/react-popover"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/translation-context"
import { useState, useRef, useEffect } from "react"
import { ChevronDown, ArrowRight, Star, Gift, Zap } from "lucide-react"

interface ShopMegaMenuProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  isRTL: boolean
}

interface MenuTileProps {
  href: string
  title: string
  img: string
  alt: string
  badge?: string
  badgeColor?: string
  className?: string
  onMouseEnter?: () => void
  onClick?: () => void
}

function MenuTile({ 
  href, 
  title, 
  img, 
  alt, 
  badge, 
  badgeColor = "bg-slate-900", 
  className = "",
  onMouseEnter,
  onClick
}: MenuTileProps) {
  return (
    <Link 
      href={href} 
      className={`tile group relative block rounded-xl p-3 sm:p-4 bg-white border border-slate-200/60 overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.03] hover:border-[#12d6fa]/30 hover:-translate-y-1 min-h-[100px] sm:min-h-[90px] ${className}`}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      {badge && (
        <span className={`badge absolute top-2 left-2 z-10 text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-md ${badgeColor}`}>
          {badge}
        </span>
      )}
      <div className="flex items-center justify-center mb-1 sm:mb-2 h-14 sm:h-16">
        <Image
          src={img}
          alt={alt}
          width={56}
          height={56}
          className="object-contain group-hover:scale-110 transition-transform duration-300 w-14 h-14 sm:w-16 sm:h-16"
          priority={false}
        />
      </div>
      <div className="text-center">
        <span className="title block text-sm font-bold text-slate-900 mb-1 group-hover:text-[#12d6fa] transition-colors duration-200">
          {title}
        </span>
        <span className="subcta opacity-0 group-hover:opacity-100 transition-all duration-200 text-xs text-slate-500 font-medium flex items-center justify-center">
          Shop now <ArrowRight className="w-3 h-3 ml-1" />
        </span>
      </div>
    </Link>
  )
}

export default function ShopMegaMenu({ isOpen, onOpenChange, isRTL }: ShopMegaMenuProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Handle hover to show dropdown
  const handleMouseEnter = () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout)
      setCloseTimeout(null)
    }
    // Small delay to prevent accidental triggers
    const timeout = setTimeout(() => {
      onOpenChange(true)
    }, 100)
    setHoverTimeout(timeout)
  }

  // Handle mouse leave with delay
  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
    }
    if (closeTimeout) {
      clearTimeout(closeTimeout)
    }
    const timeout = setTimeout(() => {
      onOpenChange(false)
    }, 300)
    setCloseTimeout(timeout)
  }

  // Handle click to navigate to shop page
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // Close dropdown first
    onOpenChange(false)
    // Then navigate
    setTimeout(() => {
      router.push('/shop')
    }, 100)
  }

  // Prefetch on hover with delay
  const handlePrefetch = (href: string) => {
    // Prefetch immediately for better performance
    router.prefetch(href)
  }


  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout)
      if (closeTimeout) clearTimeout(closeTimeout)
    }
  }, [])

  return (
    <Popover.Root open={isOpen} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <button
          ref={triggerRef}
          className="shop-button flex items-center text-sm font-semibold tracking-wide transition-all duration-300 relative group px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          aria-haspopup="menu"
          aria-expanded={isOpen ? "true" : "false"}
          aria-controls="shop-mega-menu"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          {t("header.shop")}
          <ChevronDown
            className={`${isRTL ? "mr-1" : "ml-1"} w-4 h-4 transition-all duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          id="shop-mega-menu"
          sideOffset={8}
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            triggerRef.current?.focus()
          }}
          className="mega-panel w-[min(1000px,96vw)] bg-white rounded-2xl shadow-2xl border border-slate-200/60 p-4 sm:p-6 z-50 max-h-[65vh] overflow-y-auto backdrop-blur-sm animate-in fade-in-0 zoom-in-95 duration-200"
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
        >
          {/* Header Section */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1 font-montserrat">
              Shop by Category
            </h2>
            <p className="text-xs text-slate-600 font-noto-sans">
              Discover our premium collection of soda makers, flavors, and accessories
            </p>
          </div>

          {/* Category Grid - Row Layout */}
          <div className="mega-grid grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
              <MenuTile
                href="/shop/sodamakers"
                title="Soda Makers"
                img="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756559855/Artic-Black-Machine---Front_pxsies.png"
                alt="Soda Makers"
                badge="Bestseller"
                badgeColor="bg-green-600"
                onMouseEnter={() => handlePrefetch("/shop/sodamakers")}
                onClick={() => onOpenChange(false)}
              />
              <MenuTile
                href="/shop/flavor"
                title="Flavors"
                img="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756892917/italian-strawberry-lemon-syrup_x0cz9h.png"
                alt="Flavors"
                badge="Save 15%"
                badgeColor="bg-orange-600"
                onMouseEnter={() => handlePrefetch("/shop/flavor")}
                onClick={() => onOpenChange(false)}
              />
              <MenuTile
                href="/shop/accessories"
                title="Accessories"
                img="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756892916/empty-drinkmate-bottle_dkmtzo.png"
                alt="Accessories"
                onMouseEnter={() => handlePrefetch("/shop/accessories")}
                onClick={() => onOpenChange(false)}
              />
              <MenuTile
                href="/shop/co2-cylinders"
                title="CO₂ Cylinders"
                img="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756893591/co2-cylinder-single_dcrdnx.png"
                alt="CO2 Cylinders"
                badge="Exchange"
                badgeColor="bg-blue-600"
                onMouseEnter={() => handlePrefetch("/co2")}
                onClick={() => onOpenChange(false)}
              />
          </div>

          {/* Quick Links Section */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 font-montserrat">Quick Links</h3>
            <nav className="quick-links flex flex-wrap gap-2 sm:gap-3" aria-label="Shop quick links">
              <Link
                href="/shop"
                className="quick text-xs text-slate-600 hover:text-[#12d6fa] hover:bg-[#12d6fa]/5 px-3 py-2 rounded-lg transition-all duration-200 font-medium border border-transparent hover:border-[#12d6fa]/20"
                onClick={() => onOpenChange(false)}
                onMouseEnter={() => handlePrefetch("/shop")}
              >
                All Soda Makers
              </Link>
              <Link
                href="/shop/bundles"
                className="quick text-xs text-slate-600 hover:text-[#12d6fa] hover:bg-[#12d6fa]/5 px-3 py-2 rounded-lg transition-all duration-200 font-medium border border-transparent hover:border-[#12d6fa]/20"
                onClick={() => onOpenChange(false)}
                onMouseEnter={() => handlePrefetch("/shop/bundles")}
              >
                Bundles
              </Link>
              <Link
                href="/shop/co2-cylinders"
                className="quick text-xs text-slate-600 hover:text-[#12d6fa] hover:bg-[#12d6fa]/5 px-3 py-2 rounded-lg transition-all duration-200 font-medium border border-transparent hover:border-[#12d6fa]/20"
                onClick={() => onOpenChange(false)}
                onMouseEnter={() => handlePrefetch("/shop/co2-cylinders")}
              >
                Cylinder Exchange
              </Link>
              <Link
                href="/shop/starter-kits"
                className="quick text-xs text-slate-600 hover:text-[#12d6fa] hover:bg-[#12d6fa]/5 px-3 py-2 rounded-lg transition-all duration-200 font-medium border border-transparent hover:border-[#12d6fa]/20"
                onClick={() => onOpenChange(false)}
                onMouseEnter={() => handlePrefetch("/shop/starter-kits")}
              >
                Starter Kits
              </Link>
              <Link
                href="/shop/best-sellers"
                className="quick text-xs text-slate-600 hover:text-[#12d6fa] hover:bg-[#12d6fa]/5 px-3 py-2 rounded-lg transition-all duration-200 font-medium border border-transparent hover:border-[#12d6fa]/20"
                onClick={() => onOpenChange(false)}
                onMouseEnter={() => handlePrefetch("/shop/best-sellers")}
              >
                Best Sellers
              </Link>
            </nav>
          </div>

          {/* Promo Section */}
          <div className="promo flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-[#12d6fa]/5 to-[#0bc4e8]/5 border border-[#12d6fa]/30 rounded-xl p-4 sm:p-5 gap-3 sm:gap-0">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-[#12d6fa] to-[#0bc4e8] rounded-full flex items-center justify-center mr-3 shadow-lg">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 block font-montserrat">
                  Free delivery above 150 ﷼
                </span>
                <span className="text-xs text-slate-600 font-noto-sans">
                  On all orders within Saudi Arabia
                </span>
              </div>
            </div>
            <div className="flex items-center text-xs text-slate-600 bg-white/70 px-3 py-1.5 rounded-full border border-slate-200">
              <Zap className="w-3 h-3 mr-1 text-[#12d6fa]" />
              Limited time offer
            </div>
          </div>

          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
