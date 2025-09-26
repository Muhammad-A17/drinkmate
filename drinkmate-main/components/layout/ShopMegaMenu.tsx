"use client"

import * as Popover from "@radix-ui/react-popover"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/contexts/translation-context"
import { useState, useRef, useEffect } from "react"
import { ChevronDown, ArrowRight, Star, Gift, Zap, ShoppingBag } from "lucide-react"

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
      className={`tile group relative block rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-[#12d6fa]/40 hover:-translate-y-2 min-h-[110px] sm:min-h-[120px] ${className}`}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      {badge && (
        <span className={`badge absolute top-2 left-2 z-10 text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-md ${badgeColor}`}>
          {badge}
        </span>
      )}
      <div className="flex items-center justify-center mb-2 sm:mb-3 h-16 sm:h-18">
        <Image
          src={img}
          alt={alt}
          width={70}
          height={70}
          className="object-contain group-hover:scale-110 transition-transform duration-300 w-16 h-16 sm:w-18 sm:h-18 drop-shadow-sm"
          priority={false}
        />
      </div>
      <div className="text-center">
        <span className="title block text-sm font-bold text-slate-900 mb-2 group-hover:text-[#12d6fa] transition-colors duration-200">
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
          className="mega-panel w-[min(1000px,96vw)] bg-white rounded-3xl shadow-2xl border border-slate-200/40 p-6 sm:p-8 z-50 max-h-[70vh] overflow-y-auto backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-300"
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
        >
          {/* Header Section */}
          <div className="mb-6 sm:mb-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 font-montserrat">
              Shop by Category
            </h2>
            <p className="text-sm text-slate-600 font-noto-sans max-w-md mx-auto">
              Discover our premium collection of soda makers, flavors, and accessories
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] rounded-full mx-auto mt-3"></div>
          </div>

          {/* Category Grid - Row Layout */}
          <div className="mega-grid grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <MenuTile
                href="/shop/sodamakers"
                title="Soda Makers"
                img="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756559855/Artic-Black-Machine---Front_pxsies.png"
                alt="Soda Makers"
                onMouseEnter={() => handlePrefetch("/shop/sodamakers")}
                onClick={() => onOpenChange(false)}
              />
              <MenuTile
                href="/shop/flavor"
                title="Flavors"
                img="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756892917/italian-strawberry-lemon-syrup_x0cz9h.png"
                alt="Flavors"
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
                onMouseEnter={() => handlePrefetch("/co2")}
                onClick={() => onOpenChange(false)}
              />
          </div>


          {/* Shop All Link */}
          <div className="mt-6 pt-6 border-t border-slate-200/60">
            <Link
              href="/shop"
              className="w-full flex items-center justify-center gap-3 text-slate-700 hover:text-slate-900 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-slate-50 border border-slate-200 hover:border-slate-300"
              onClick={() => onOpenChange(false)}
              onMouseEnter={() => handlePrefetch("/shop")}
            >
              <ShoppingBag className="w-5 h-5" />
              Shop All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
