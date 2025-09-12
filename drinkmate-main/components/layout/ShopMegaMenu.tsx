"use client"

import * as Popover from "@radix-ui/react-popover"
import * as NavigationMenu from "@radix-ui/react-navigation-menu"
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
      className={`tile group relative block rounded-2xl p-3 sm:p-4 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-slate-300/80 min-h-[120px] sm:min-h-[140px] ${className}`}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      onPointerDown={(e) => e.preventDefault()}
    >
      {badge && (
        <span className={`badge absolute top-2 left-2 sm:top-3 sm:left-3 z-10 text-xs font-semibold px-2 py-1 rounded-full text-white ${badgeColor}`}>
          {badge}
        </span>
      )}
      <div className="aspect-square flex items-center justify-center mb-2 sm:mb-3">
        <Image
          src={img}
          alt={alt}
          width={60}
          height={60}
          className="object-contain group-hover:scale-110 transition-transform duration-300 sm:w-[80px] sm:h-[80px]"
          priority={false}
        />
      </div>
      <span className="title block text-xs sm:text-sm font-bold text-slate-800 mb-1">
        {title}
      </span>
      <span className="subcta opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs text-slate-600 font-medium flex items-center">
        Shop <ArrowRight className="w-3 h-3 ml-1" />
      </span>
    </Link>
  )
}

export default function ShopMegaMenu({ isOpen, onOpenChange, isRTL }: ShopMegaMenuProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Prefetch on hover with delay
  const handlePrefetch = (href: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
    }
    const timeout = setTimeout(() => {
      router.prefetch(href)
    }, 150)
    setHoverTimeout(timeout)
  }

  // Exit forgiveness - delay close
  const handleMouseLeave = () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout)
    }
    const timeout = setTimeout(() => {
      onOpenChange(false)
    }, 200)
    setCloseTimeout(timeout)
  }

  const handleMouseEnter = () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout)
      setCloseTimeout(null)
    }
  }

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout)
      if (closeTimeout) clearTimeout(closeTimeout)
    }
  }, [hoverTimeout, closeTimeout])

  return (
    <Popover.Root open={isOpen} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <button
          ref={triggerRef}
          className="shop-button flex items-center text-sm font-semibold tracking-wide transition-all duration-300 relative group px-2 text-slate-600 hover:text-slate-900"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-controls="shop-mega-menu"
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
          sideOffset={12}
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            triggerRef.current?.focus()
          }}
          className="mega-panel w-[min(980px,96vw)] bg-white rounded-2xl shadow-2xl border border-slate-200/60 p-4 sm:p-6 z-50 max-h-[90vh] overflow-y-auto"
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
        >
          {/* Hero Section - Two Column Layout */}
          <div className="mega-grid grid grid-cols-1 lg:grid-cols-[1.3fr,1fr] gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Featured Hero Tile */}
            <Link
              href="/shop/sodamakers/artic-black"
              className="hero-tile group relative block rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-[#12d6fa] to-[#0bc4e8] text-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] min-h-[200px] sm:min-h-[240px]"
              onMouseEnter={() => handlePrefetch("/shop/sodamakers/artic-black")}
              onClick={() => onOpenChange(false)}
              onPointerDown={(e) => e.preventDefault()}
            >
              <span className="badge absolute top-3 left-3 sm:top-4 sm:left-4 z-10 text-xs font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm">
                New
              </span>
              <div className="flex flex-col sm:flex-row items-center justify-between h-full">
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Artic Black</h3>
                  <p className="text-sm opacity-90 mb-3 sm:mb-4">Crisper fizz, zero mess.</p>
                  <span className="cta inline-flex items-center text-sm font-semibold bg-white/20 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2 rounded-full hover:bg-white/30 transition-colors duration-200">
                    Shop now <ArrowRight className="w-4 h-4 ml-2" />
                  </span>
                </div>
                <div className="flex-shrink-0 mt-4 sm:mt-0 sm:ml-4">
                  <Image
                    src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756559855/Artic-Black-Machine---Front_pxsies.png"
                    alt="Artic Black Soda Maker"
                    width={100}
                    height={100}
                    className="object-contain group-hover:scale-110 transition-transform duration-300 sm:w-[120px] sm:h-[120px]"
                    priority={false}
                  />
                </div>
              </div>
            </Link>

            {/* Category Grid - 2x2 */}
            <div className="cat-grid grid grid-cols-2 gap-3 sm:gap-4">
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
                href="/co2"
                title="CO₂ Cylinders"
                img="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756893591/co2-cylinder-single_dcrdnx.png"
                alt="CO2 Cylinders"
                badge="Exchange"
                badgeColor="bg-blue-600"
                onMouseEnter={() => handlePrefetch("/co2")}
                onClick={() => onOpenChange(false)}
              />
            </div>
          </div>

          {/* Quick Links Rail */}
          <nav className="quick-links flex flex-wrap gap-2 sm:gap-4 mb-3 sm:mb-4" aria-label="Shop quick links">
            <Link
              href="/shop"
              className="quick text-sm text-slate-600 hover:text-slate-900 hover:underline transition-colors duration-200"
              onClick={() => onOpenChange(false)}
              onMouseEnter={() => handlePrefetch("/shop")}
            >
              All Soda Makers
            </Link>
            <Link
              href="/shop/bundles"
              className="quick text-sm text-slate-600 hover:text-slate-900 hover:underline transition-colors duration-200"
              onClick={() => onOpenChange(false)}
              onMouseEnter={() => handlePrefetch("/shop/bundles")}
            >
              Bundles
            </Link>
            <Link
              href="/co2/exchange"
              className="quick text-sm text-slate-600 hover:text-slate-900 hover:underline transition-colors duration-200"
              onClick={() => onOpenChange(false)}
              onMouseEnter={() => handlePrefetch("/co2/exchange")}
            >
              Cylinder Exchange
            </Link>
            <Link
              href="/shop/starter-kits"
              className="quick text-sm text-slate-600 hover:text-slate-900 hover:underline transition-colors duration-200"
              onClick={() => onOpenChange(false)}
              onMouseEnter={() => handlePrefetch("/shop/starter-kits")}
            >
              Starter Kits
            </Link>
            <Link
              href="/shop/best-sellers"
              className="quick text-sm text-slate-600 hover:text-slate-900 hover:underline transition-colors duration-200"
              onClick={() => onOpenChange(false)}
              onMouseEnter={() => handlePrefetch("/shop/best-sellers")}
            >
              Best Sellers
            </Link>
          </nav>

          {/* Mini Promo Slot */}
          <div className="promo flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 rounded-xl p-3 sm:p-4 gap-2 sm:gap-0">
            <div className="flex items-center">
              <Gift className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">
                Free delivery above 150 ﷼
              </span>
            </div>
            <div className="flex items-center text-xs text-green-600">
              <Zap className="w-4 h-4 mr-1" />
              Limited time
            </div>
          </div>

          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
