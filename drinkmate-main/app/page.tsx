"use client"

import Image from "next/image"
import Link from "next/link"
import { LoadingLink } from "@/components/ui/LoadingLink"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import PageLayout from "@/components/layout/PageLayout"
import { useTranslation } from "@/lib/contexts/translation-context"
import { useRouter } from "next/navigation"
import HydrationBoundary from "@/components/HydrationBoundary"
import { generateStructuredData } from "@/lib/seo"
import Balancer from "react-wrap-balancer"
import { useAutoPlayOnView } from "@/hooks/use-auto-play-on-view"
import CarouselBanner from "@/components/ui/carousel-banner"

// StepCard component for mobile-optimized cards
function StepCard({ 
  title, 
  videoSrc, 
  step, 
  description, 
  alt 
}: { 
  title: string; 
  videoSrc: string; 
  step: number; 
  description: string;
  alt: string;
}) {
  const vref = useAutoPlayOnView<HTMLVideoElement>();
  
  return (
    <article className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,.06)] transition hover:shadow-[0_10px_28px_rgba(0,0,0,.10)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500">
      {/* Keep videos compact on mobile */}
      <div className="aspect-[4/5] md:aspect-[3/4] overflow-hidden">
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="relative w-full h-full group"
        >
          <Image
            src={videoSrc}
            alt={alt}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover"
            unoptimized
          />
          {/* Gradient and overlayed text - Hidden by default, shown on hover */}
          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-white font-extrabold text-xs">{`Step ${step}: ${title}`}</p>
            <p className="text-white/90 text-[10px] leading-snug">{description}</p>
          </div>
        </motion.div>
      </div>
      <div className="px-2.5 py-2">
        <p className="text-[12px] sm:text-sm font-semibold text-center tabular-nums">
          Step {step}: {title}
        </p>
      </div>
    </article>
  );
}

export default function Home() {
  const { t, isRTL } = useTranslation()
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeMachineColor, setActiveMachineColor] = useState("cyan") // Default to cyan
  const [isClient, setIsClient] = useState(false)

  // Handle hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Carousel banner data
  const carouselItems = [
    {
      id: 1,
      type: "hero" as const, // Special type for the original hero content
      src: "", // Not used for hero type
      alt: "Drinkmate Hero Section"
    },
    {
      id: 2,
      type: "banner" as const,
      src: "/images/banner/WhatsApp Image 2025-08-27 at 7.09.33 PM (1).webp", 
      alt: "Drinkmate Soda Makers Collection",
      mobileSrc: "/images/banner/WhatsApp Image 2025-08-27 at 7.09.32 PM (1).webp",
      mobileAlt: "Drinkmate Soda Makers Collection Mobile"
    },
    {
      id: 3,
      type: "banner" as const,
      src: "/images/banner/flavor banner.webp",
      alt: "Premium Italian Flavors Collection", 
      mobileSrc: "/images/banner/flavor mobile.webp",
      mobileAlt: "Premium Italian Flavors Collection Mobile"
    }
  ]

  const slides = [
    {
      headline: t("home.carousel.slide1.headline"),
      description: t("home.carousel.slide1.description"),
      buttonText: t("home.carousel.slide1.buttonText"),
      offerText: t("home.carousel.slide1.offerText"),
      imageSrc: "/images/co2-cylinders.png",
      imageAlt: "CO2 Cylinders",
      showYellowCircle: true,
      yellowCircleData: {
        carbonatesUpto: t("home.carousel.slide1.carbonatesUpto"),
        liters: t("home.carousel.slide1.liters"),
        litersOfDrink: t("home.carousel.slide1.litersOfDrink"),
      },
      multiImages: [], // Not used for this slide
    },
    {
      headline: t("home.carousel.slide2.headline"),
      description: t("home.carousel.slide2.description"),
      buttonText: t("home.carousel.slide2.buttonText"),
      offerText: "",
      imageSrc: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1756657902/energy-cola-flavors_lx3fvx.png",
      imageAlt: "Energy Drink & Cola Flavor",
      showYellowCircle: false,
      yellowCircleData: null,
      multiImages: [], // Not used for this slide
    },
    {
      headline: t("home.carousel.slide3.headline"),
      description: t("home.carousel.slide3.description"),
      buttonText: t("home.carousel.slide3.buttonText"),
      offerText: "",
      imageSrc: null, // Not a single image for this slide
      imageAlt: "Drinkmate products",
      showYellowCircle: false,
      yellowCircleData: null,
      multiImages: [
        {
          src: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1756559855/Artic-Black-Machine---Front_pxsies.png",
          alt: "Drinkmate Machine",
          width: 193,
          height: 493,
          top: 28, // Relative to the main gray container
          left: 1160, // Relative to the main gray container
          zIndex: 2, // Machine is in front
          // Responsive positioning using percentages
          responsiveTop: "20%",
          responsiveLeft: "60%",
          responsiveWidth: 60,
          responsiveHeight: 150,
        },
        {
          src: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1756893591/co2-cylinder-single_dcrdnx.png",
          alt: "CO2 Cylinder",
          width: 340,
          height: 340,
          top: 28, // Relative to the main gray container
          left: 1170, // Relative to the main gray container
          zIndex: 1, // Cylinder is behind machine
          // Responsive positioning using percentages
          responsiveTop: "20%",
          responsiveLeft: "62%",
          responsiveWidth: 100,
          responsiveHeight: 100,
        },
        {
          src: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1756559866/Strawberry-Lemon-Flavor_sjdzju.png",
          alt: "Strawberry Lemon Flavor",
          width: 100,
          height: 257,
          top: 135, // Relative to the main gray container
          left: 1350, // Relative to the main gray container
          zIndex: 3, // Strawberry is in front of machine
          // Responsive positioning using percentages
          responsiveTop: "40%",
          responsiveLeft: "70%",
          responsiveWidth: 30,
          responsiveHeight: 80,
        },
      ],
    },
  ]
  
  const steps = [
    {
      id: 1,
      title: t("home.howItWorks.steps.step1.title"),
      description: t("home.howItWorks.steps.step1.description"),
      img: "/images/step/step 1.webp",
      alt: t("home.howItWorks.steps.step1.alt"),
    },
    {
      id: 2,
      title: t("home.howItWorks.steps.step2.title"),
      description: t("home.howItWorks.steps.step2.description"),
      img: "/images/step/step 2.webp",
      alt: t("home.howItWorks.steps.step2.alt"),
    },
    {
      id: 3,
      title: t("home.howItWorks.steps.step3.title"),
      description: t("home.howItWorks.steps.step3.description"),
      img: "/images/step/step 3.webp",
      alt: t("home.howItWorks.steps.step3.alt"),
    },
    {
      id: 4,
      title: t("home.howItWorks.steps.step4.title"),
      description: t("home.howItWorks.steps.step4.description"),
      img: "/images/step/step 4.webp", // 👉 Add this image to your public/images
      alt: t("home.howItWorks.steps.step4.alt"),
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  const slide = slides[currentSlide]

  // Calculate the starting X position of the right grid column relative to the max-w-7xl container
  // max-w-7xl is 1280px. Inner content area (1280 - 2*p-16) = 1152px.
  // Grid columns: (1152px - gap-8) / 2 = (1152 - 32) / 2 = 560px per column.
  // Left column starts at 64px (p-16). Right column starts at 64px + 560px + 32px = 656px.
  const rightColumnStartX = 656

  const baseMachines = [
    { id: "red", src: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1756657901/drinkmate-machine-red_lkj7c9.png", alt: "Drinkmate OmniFizz Red" },
    { id: "cyan", src: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1756657904/drinkmate-machine-blue_fs1bk8.png", alt: "Drinkmate OmniFizz Blue" },
    { id: "black", src: "https://res.cloudinary.com/dw2h8hejn/image/upload/v1756657900/drinkmate-machine-black-small_mztxfb.png", alt: "Drinkmate OmniFizz Black" },
  ]

  const machineStyles = {
    red: {
      red: {
        width: 140,
        height: 350,
        top: "50px",
        left: "50%",
        transform: "translateX(-50%)",
        opacity: 1,
        zIndex: 2,
        borderRadius: "5px",
        // Desktop styles
        mdWidth: 320,
        mdHeight: 750,
        mdTop: "50px",
      },
      cyan: {
        width: 70,
        height: 175,
        top: "300px",
        left: "30%",
        transform: "translateX(-50%)",
        opacity: 0.5,
        zIndex: 1,
        // Desktop styles
        mdWidth: 120,
        mdHeight: 300,
        mdTop: "400px",
        mdLeft: "25%",
      },
      black: {
        width: 60,
        height: 150,
        top: "300px",
        left: "70%",
        transform: "translateX(-50%)",
        opacity: 0,
        zIndex: 0,
        borderRadius: "5px",
        // Desktop styles
        mdWidth: 100,
        mdHeight: 250,
        mdTop: "400px",
        mdLeft: "75%",
      },
    },
    cyan: {
      red: {
        width: 70,
        height: 175,
        top: "300px",
        left: "30%",
        transform: "translateX(-50%)",
        opacity: 0.5,
        zIndex: 1,
        borderRadius: "5px",
        // Desktop styles
        mdWidth: 120,
        mdHeight: 300,
        mdTop: "400px",
        mdLeft: "25%",
      },
      cyan: { 
        width: 140, 
        height: 350, 
        top: "50px", 
        left: "50%", 
        transform: "translateX(-50%)", 
        opacity: 1, 
        zIndex: 2,
        // Desktop styles
        mdWidth: 320,
        mdHeight: 750,
        mdTop: "50px",
      },
      black: {
        width: 60,
        height: 150,
        top: "300px",
        left: "70%",
        transform: "translateX(-50%)",
        opacity: 0.5,
        zIndex: 1,
        borderRadius: "5px",
        // Desktop styles
        mdWidth: 100,
        mdHeight: 250,
        mdTop: "400px",
        mdLeft: "75%",
      },
    },
    black: {
      red: {
        width: 70,
        height: 175,
        top: "300px",
        left: "30%",
        transform: "translateX(-50%)",
        opacity: 0, // Hide red machine
        zIndex: 0,
        borderRadius: "5px",
        // Desktop styles
        mdWidth: 120,
        mdHeight: 300,
        mdTop: "400px",
        mdLeft: "25%",
      },
      cyan: {
        width: 70,
        height: 175,
        top: "300px",
        left: "70%",
        transform: "translateX(-50%)",
        opacity: 0.5,
        zIndex: 1,
        // Desktop styles
        mdWidth: 100,
        mdHeight: 300,
        mdTop: "400px",
        mdLeft: "75%",
      },
      black: {
        width: 120,
        height: 280,
        top: "50px",
        left: "50%",
        transform: "translateX(-50%)",
        opacity: 1,
        zIndex: 2,
        borderRadius: "5px",
        // Desktop styles
        mdWidth: 280,
        mdHeight: 580,
        mdTop: "50px",
      },
    },
  }



  // Generate structured data for the home page
  const homeStructuredData = generateStructuredData({
    type: 'WebSite',
    name: 'DrinkMate - Premium Soda Makers & Flavors',
    description: 'Create delicious carbonated beverages at home with DrinkMate soda makers, premium Italian flavors, and CO2 cylinders. Free shipping and 30-day money-back guarantee.',
    url: '/',
  })

  return (
    <>
      {/* Structured Data for SEO - Only render on client to prevent hydration mismatch */}
      {isClient && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData) }}
        />
      )}
      
      <PageLayout currentPage="home">
      <HydrationBoundary>
      {/* Hero Section - Carousel Banner */}
      <section className="py-6 md:py-16 px-8 md:px-20 lg:px-24 xl:px-32 2xl:px-40 relative z-30" suppressHydrationWarning>
        <div className="w-full rounded-b-3xl relative overflow-hidden shadow-2xl shadow-gray-200/50" suppressHydrationWarning>
          <CarouselBanner 
            items={carouselItems}
            autoPlay={true}
            autoPlayInterval={5000}
            className="w-full"
            renderCustomContent={(item, isActive) => {
              if (item.type === "hero") {
                return (
                  <div className="w-full bg-gradient-to-b from-white via-white/95 to-[#f8fafc] rounded-b-3xl relative overflow-hidden min-h-[600px] backdrop-blur-sm shadow-2xl shadow-gray-200/50 border border-white/20">
                    {/* Product Images (Absolute Positioning) */}
                    <Image
                      src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756893175/drinkmate-machine-hero_ckcqe4.png"
                      alt="Drinkmate OmniFizz Soda Maker"
                      width={242}
                      height={417}
                      quality={85}
                      priority
                      className="absolute object-contain hidden md:block drop-shadow-2xl"
                      style={{ top: "203px", left: "121px" }}
                    />
                    <Image
                      src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756893175/italian-strawberry-lemon_zp1jui.png"
                      alt="Italian Strawberry Lemon Flavor"
                      width={99}
                      height={206}
                      quality={85}
                      priority
                      className="absolute object-contain hidden md:block drop-shadow-xl"
                      style={{ top: "414px", left: "313px" }}
                    />

                    {/* Mobile Product Images */}
                    <div className="block md:hidden w-full" dir="ltr">
                      <div className="flex flex-row items-end justify-center p-6">
                        <Image
                          src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756893175/drinkmate-machine-hero_ckcqe4.png"
                          alt="Drinkmate OmniFizz Soda Maker"
                          width={140}
                          height={220}
                          quality={85}
                          priority
                          className="object-contain drop-shadow-2xl"
                        />
                        <Image
                          src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756893175/italian-strawberry-lemon_zp1jui.png"
                          alt="Italian Strawberry Lemon Flavor"
                          width={80}
                          height={160}
                          quality={85}
                          priority
                          className="object-contain drop-shadow-xl"
                        />
                      </div>

                      {/* Mobile Content - After Images */}
                      <div className="text-center px-6 py-10 bg-white/98 backdrop-blur-md rounded-3xl mx-6 shadow-2xl shadow-gray-200/40 mb-8 hover:shadow-3xl hover:bg-white transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up border border-white/50">
                        <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
                          <h1
                            className={`text-2xl font-bold text-gray-900 leading-tight ${isRTL ? "font-cairo text-right" : "font-montserrat"} animate-slide-in-up tracking-tight`}
                          >
                            {t("home.hero.title")}
                          </h1>
                          <h2
                            className={`text-lg text-gray-600 font-semibold ${isRTL ? "font-cairo text-right" : "font-montserrat"} animate-slide-in-up delay-200 tracking-wide`}
                          >
                            {t("home.hero.subtitle")}
                          </h2>
                          <p
                            className={`text-gray-600 text-sm leading-relaxed ${isRTL ? "font-noto-arabic text-right" : "font-noto-sans"} px-2 animate-slide-in-up delay-300 font-medium`}
                          >
                            {t("home.hero.description")}
                          </p>
                          <div
                            className={`flex ${isRTL ? "flex-row-reverse" : "flex-row"} gap-4 justify-center animate-slide-in-up delay-500`}
                          >
                            <button
                              onClick={() => router.push("/shop")}
                              className="px-8 py-4 text-gray-700 border-2 border-gray-300 bg-white/90 backdrop-blur-sm hover:bg-white hover:border-gray-400 font-semibold rounded-xl min-w-[130px] transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md text-sm"
                            >
                              {t("home.hero.exploreMore")}
                            </button>
                            <button
                              onClick={() => router.push("/shop")}
                              className="bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] hover:from-[#0bc4e8] hover:to-[#09b3d1] text-white px-8 py-4 font-semibold shadow-xl border-2 border-[#12d6fa]/20 rounded-xl min-w-[130px] transition-all duration-300 transform hover:scale-105 hover:shadow-2xl backdrop-blur-sm text-sm"
                            >
                              {t("home.hero.buyNow")}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content (positioned to the right on desktop, below images on mobile) */}
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-4 md:right-[550px] left-4 md:left-auto" : "left-4 md:left-[550px] right-4 md:right-auto"} w-auto md:w-[500px] ${isRTL ? "md:pl-4" : "md:pr-4"} md:block hidden`}
                    >
                      <div
                        className={`space-y-6 md:space-y-8 text-center ${isRTL ? "md:text-right rtl" : "md:text-left ltr"} animate-fade-in-up`}
                        dir={isRTL ? "rtl" : "ltr"}
                      >
                        <h1
                          className={`text-3xl md:text-5xl lg:text-6xl font-semibold text-gray-900 leading-tight ${isRTL ? "font-cairo" : "font-montserrat"} animate-slide-in-left tracking-tight`}
                        >
                          {t("home.hero.title")}
                        </h1>
                        <h2
                          className={`text-lg md:text-2xl text-gray-600 font-medium ${isRTL ? "font-cairo" : "font-montserrat"} animate-slide-in-left delay-200 tracking-wide`}
                        >
                          {t("home.hero.subtitle")}
                        </h2>
                        <p
                          className={`text-gray-600 text-base md:text-lg leading-relaxed ${isRTL ? "font-noto-arabic" : "font-noto-sans"} max-w-md ${isRTL ? "md:ml-auto" : "md:mr-auto"} animate-slide-in-left delay-300 font-medium`}
                        >
                          {t("home.hero.description")}
                        </p>
                        <div
                          className={`flex flex-row ${isRTL ? "space-x-reverse space-x-4 flex-row-reverse" : "space-x-4"} justify-center md:${isRTL ? "justify-start" : "justify-start"} gap-4 animate-slide-in-left delay-500`}
                        >
                          <Button
                            onClick={() => router.push("/shop")}
                            variant="outline"
                            className="px-8 py-4 text-gray-700 border-2 border-gray-300 bg-white/80 backdrop-blur-sm min-w-[140px] hover:bg-white hover:border-gray-400 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold rounded-xl"
                          >
                            {t("home.hero.exploreMore")}
                          </Button>
                          <Button
                            onClick={() => router.push("/shop")}
                            className="bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] hover:from-[#0bc4e8] hover:to-[#09b3d1] text-white px-8 py-4 min-w-[140px] shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 font-semibold rounded-xl backdrop-blur-sm border border-white/20"
                          >
                            {t("home.hero.buyNow")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
        </div>
      </section>

      {/* Refill Section */}
      <section className="py-6 md:py-16 px-8 md:px-20 lg:px-24 xl:px-32 2xl:px-40 animate-fade-in-up">
        <div className="w-full bg-gradient-to-br from-[#f8fafc] via-[#f3f3f3] to-[#f1f5f9] rounded-3xl relative min-h-[350px] md:h-[250px] flex items-center justify-between px-8 md:px-16 lg:px-20 xl:px-24 shadow-2xl shadow-gray-200/40 backdrop-blur-sm border border-white/30">
          {/* Left Navigation Button */}
          <Button
            className="rounded-full w-12 h-12 flex items-center justify-center border-2 border-gray-300/50 bg-white/90 backdrop-blur-md text-gray-700 shadow-xl z-10 hover:bg-white hover:border-gray-400 hover:shadow-2xl transition-all duration-300 transform hover:scale-110"
            onClick={prevSlide}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          {/* Main Content Area - Responsive Layout */}
          <div className="flex-1 mx-4 md:mx-0 md:absolute md:top-[44px] md:left-[125px]">
            <div className="w-full md:w-[520px] h-auto md:h-[138px] flex flex-col justify-between text-center md:text-left">
              <div className="space-y-3 md:space-y-4 mb-4 md:mb-0">
                <h2
                  className={`text-xl md:text-4xl font-semibold text-gray-800 leading-tight ${isRTL ? "font-cairo" : "font-montserrat"} tracking-wide`}
                >
                  {slide.headline}
                </h2>
                <p
                  className={`text-gray-700 text-sm md:text-[15px] md:whitespace-nowrap ${isRTL ? "font-noto-arabic" : "font-noto-sans"} font-medium leading-relaxed`}
                >
                  {slide.description}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
                {slide.buttonText && (
                  <Button
                    onClick={() => {
                      if (slide.buttonText === "Refill Now") {
                        router.push("/co2")
                      } else if (slide.buttonText === "Shop Now") {
                        // Check if this is the second slide by looking at the slide content
                        if (slide.headline && slide.headline.includes("ENERGY DRINK & COLA FLAVOR")) {
                          // Second slide - navigate directly to flavor page
                          router.push("/shop/flavor")
                        } else {
                          router.push("/shop/sodamakers")
                        }
                      } else {
                        router.push("/shop/sodamakers")
                      }
                    }}
                    className={`font-medium px-6 py-3 rounded-full min-w-[140px] ${
                      slide.buttonText === "Shop Now"
                        ? "bg-[#a8f387] hover:bg-[#9ae374] text-black"
                        : "bg-[#a8f387] hover:bg-[#9ae374] text-black"
                    }`}
                  >
                    {slide.buttonText}
                  </Button>
                )}
                {slide.offerText && <span className="text-sm text-gray-500">{slide.offerText}</span>}
              </div>
            </div>
          </div>

          {/* Product Image Container */}
          {slide.imageSrc ? (
            <div className="hidden md:flex absolute right-[100px] h-full justify-center items-center">
              <Image
                src={slide.imageSrc || "/placeholder.svg"}
                alt={slide.imageAlt}
                width={300}
                height={200}
                className="object-cover w-auto h-full"
              />
              {/* Yellow 60 Liters Circle */}
              {slide.showYellowCircle && slide.yellowCircleData && (
                <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 rounded-full w-28 h-28 flex flex-col items-center justify-center text-white font-bold text-center p-2 shadow-md">
                  <span className="text-[10px]">{slide.yellowCircleData.carbonatesUpto}</span>
                  <span className="text-4xl">{slide.yellowCircleData.liters}</span>
                  <span className="text-[10px]">{slide.yellowCircleData.litersOfDrink}</span>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Multi-image container for the third slide - Desktop */}
              <div className="hidden md:block absolute inset-0 overflow-hidden">
                <div className="relative w-full h-full">
                  {slide.multiImages &&
                    slide.multiImages.map((img, index) => (
                      <Image
                        key={index}
                        src={img.src || "/placeholder.svg"}
                        alt={img.alt}
                        width={img.width}
                        height={img.height}
                        className="absolute object-contain"
                        style={{ 
                          top: `${img.top}px`, 
                          left: `${img.left}px`, 
                          zIndex: img.zIndex,
                          // Ensure images stay within container bounds
                          maxWidth: '100%',
                          maxHeight: '100%'
                        }}
                      />
                    ))}
                </div>
              </div>
              {/* Mobile responsive multi-image container for the third slide */}
              <div className="block md:hidden absolute inset-0 overflow-hidden">
                <div className="relative w-full h-full flex items-end justify-end pr-4 pb-4">
                  {slide.multiImages &&
                    slide.multiImages.map((img, index) => (
                      <Image
                        key={index}
                        src={img.src || "/placeholder.svg"}
                        alt={img.alt}
                        width={img.responsiveWidth || img.width}
                        height={img.responsiveHeight || img.height}
                        className="absolute object-contain"
                        style={{ 
                          top: img.responsiveTop || '50%', 
                          left: img.responsiveLeft || '50%', 
                          zIndex: img.zIndex,
                          // Ensure images stay within container bounds
                          maxWidth: '80%',
                          maxHeight: '80%',
                          // Use transform to center and scale properly
                          transform: 'translate(-50%, -50%)',
                          transformOrigin: 'center center'
                        }}
                      />
                    ))}
                </div>
              </div>
            </>
          )}

          {/* Right Navigation Button */}
          <Button
            className="rounded-full w-12 h-12 flex items-center justify-center border-2 border-gray-300/50 bg-white/90 backdrop-blur-md text-gray-700 shadow-xl z-10 hover:bg-white hover:border-gray-400 hover:shadow-2xl transition-all duration-300 transform hover:scale-110"
            onClick={nextSlide}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Slideshow Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${index === currentSlide ? "bg-yellow-400" : "bg-gray-300"}`}
              ></div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="py-6 md:py-16 px-8 md:px-20 lg:px-24 xl:px-32 2xl:px-40 animate-fade-in-up">
        <div className="w-full">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12" dir={isRTL ? "rtl" : "ltr"}>
            <h2
              className={`text-2xl md:text-3xl font-medium text-gray-800 ${isRTL ? "font-cairo" : "font-montserrat"} animate-slide-in-up tracking-wide`}
            >
              {t("home.productCategories.title")}
            </h2>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {/* Soda Makers */}
            <Link
              href="/shop/soda-makers"
              className="text-center space-y-3 md:space-y-4 group cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-3 animate-slide-in-up block"
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="bg-gradient-to-b from-white via-white/95 to-[#f8fafc] rounded-2xl p-4 md:p-8 relative overflow-hidden h-[200px] md:h-[270px] group shadow-xl shadow-gray-200/30 group-hover:shadow-2xl group-hover:shadow-gray-200/40 transition-all duration-500 backdrop-blur-sm border border-white/40 group-hover:border-white/60">
                {/* Multiple Machine Images in Row */}
                <div className="flex justify-center items-end space-x-2 h-full">
                  <Image
                    src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756561291/Zoomed_In_Machines_uqufys.png"
                    alt="Soda Makers"
                    width={180}
                    height={225}
                    className="object-contain transition-all duration-500 ease-out translate-y-[50px] group-hover:translate-y-0 scale-150 group-hover:scale-200 hover:scale-225 animate-pop-up drop-shadow-2xl"
                  />
                </div>
              </div>
              <h3
                className={`text-base md:text-xl font-semibold text-gray-800 ${isRTL ? "font-cairo text-right" : "font-montserrat"} group-hover:text-[#12d6fa] transition-colors duration-300 tracking-wide`}
              >
                {t("home.productCategories.sodaMakers")}
              </h3>
            </Link>

            {/* CO2 */}
            <Link
              href="/shop/co2-cylinders"
              className="text-center space-y-3 md:space-y-4 group cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-3 animate-slide-in-up delay-200 block"
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="bg-gradient-to-b from-white via-white/95 to-[#f8fafc] rounded-2xl p-4 md:p-8 relative overflow-hidden h-[200px] md:h-[270px] group shadow-xl shadow-gray-200/30 group-hover:shadow-2xl group-hover:shadow-gray-200/40 transition-all duration-500 backdrop-blur-sm border border-white/40 group-hover:border-white/60">
                {/* Multiple CO2 Images in Row */}
                <div className="flex justify-center items-end space-x-2 h-full">
                  <Image
                    src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756561290/CO2_Zoomed_fwlyev.png"
                    alt="CO2"
                    width={180}
                    height={225}
                    className="object-contain transition-all duration-500 ease-out translate-y-[50px] group-hover:translate-y-0 scale-150 group-hover:scale-200 hover:scale-225 animate-pop-up drop-shadow-2xl"
                  />
                </div>
              </div>
              <h3
                className={`text-base md:text-xl font-semibold text-gray-800 ${isRTL ? "font-cairo text-right" : "font-montserrat"} group-hover:text-[#12d6fa] transition-colors duration-300 tracking-wide`}
              >
                {t("home.productCategories.co2")}
              </h3>
            </Link>

            {/* Premium Italian Flavors */}
            <Link
              href="/shop/flavor"
              className="text-center space-y-3 md:space-y-4 group cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-3 animate-slide-in-up delay-300 block"
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="bg-gradient-to-b from-white via-white/95 to-[#f8fafc] rounded-2xl p-4 md:p-8 relative overflow-hidden h-[200px] md:h-[270px] group shadow-xl shadow-gray-200/30 group-hover:shadow-2xl group-hover:shadow-gray-200/40 transition-all duration-500 backdrop-blur-sm border border-white/40 group-hover:border-white/60">
                {/* Multiple Flavor Images from Flavors Folder in Row */}
                <div className="flex justify-center items-end space-x-2 h-full">
                  <Image
                    src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756561291/Zoomed_In_Flavor_yiy4ca.png"
                    alt="Premium Italian Flavors"
                    width={180}
                    height={225}
                    className="object-contain transition-all duration-500 ease-out translate-y-[50px] group-hover:translate-y-0 scale-150 group-hover:scale-200 hover:scale-225 animate-pop-up drop-shadow-2xl"
                  />
                </div>
              </div>
              <h3
                className={`text-base md:text-xl font-semibold text-gray-800 ${isRTL ? "font-cairo text-right" : "font-montserrat"} group-hover:text-[#12d6fa] transition-colors duration-300 tracking-wide`}
              >
                {t("home.productCategories.premiumItalianFlavors")}
              </h3>
            </Link>

            {/* Accessories */}
            <LoadingLink
              href="/shop/accessories"
              className="text-center space-y-3 md:space-y-4 group cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-3 animate-slide-in-up delay-500 block"
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="bg-gradient-to-b from-white via-white/95 to-[#f8fafc] rounded-2xl p-4 md:p-8 relative overflow-hidden h-[200px] md:h-[270px] group shadow-xl shadow-gray-200/30 group-hover:shadow-2xl group-hover:shadow-gray-200/40 transition-all duration-500 backdrop-blur-sm border border-white/40 group-hover:border-white/60">
                {/* Multiple Accessory Images in Row */}
                <div className="flex justify-center items-end space-x-2 h-full">
                  <Image
                    src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1756561289/Accessories_Zoomed_aarhge.png"
                    alt="Accessories"
                    width={180}
                    height={225}
                    className="object-contain transition-all duration-500 ease-out translate-y-[50px] group-hover:translate-y-0 scale-150 group-hover:scale-200 hover:scale-225 animate-pop-up drop-shadow-2xl"
                  />
                </div>
              </div>
              <h3
                className={`text-base md:text-xl font-semibold text-gray-800 ${isRTL ? "font-cairo text-right" : "font-montserrat"} group-hover:text-[#12d6fa] transition-colors duration-300 tracking-wide`}
              >
                {t("home.productCategories.accessories")}
              </h3>
            </LoadingLink>
          </div>
        </div>
      </section>

      {/* Horizontal Border */}
      <div className="w-full px-12 md:px-20 lg:px-24 xl:px-32 2xl:px-40 py-4">
        <hr className="border-gray-200/60 shadow-sm" />
      </div>

      {/* Mega Offer Section */}
      <section className="py-6 md:py-16 px-8 md:px-20 lg:px-24 xl:px-32 2xl:px-40 animate-fade-in-up">
        <div className="w-full">
          {/* First Card - Drinkmate OmniFizz */}
          <div className="bg-gradient-to-br from-white via-white/95 to-[#f8fafc] rounded-b-3xl py-6 md:py-20 px-4 md:px-8 lg:px-12 xl:px-16 pb-4 relative overflow-hidden mb-8 shadow-2xl shadow-gray-200/40 backdrop-blur-sm border border-white/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-6 md:space-y-8 max-w-lg animate-slide-in-left order-1 md:order-1" dir={isRTL ? "rtl" : "ltr"}>
                <h2
                  className={`text-2xl md:text-6xl font-medium text-gray-800 leading-tight ${isRTL ? "font-cairo text-right" : "font-montserrat"} animate-slide-in-left delay-200 tracking-wide`}
                >
                  {t("home.megaOffer.title")}
                </h2>
                <p
                  className={`text-sm md:text-lg text-gray-600 leading-relaxed ${isRTL ? "font-noto-arabic text-right" : "font-noto-sans"} animate-slide-in-left delay-300 font-medium`}
                >
                  {t("home.megaOffer.description")}
                </p>

                {/* Available Color Options */}
                <div className="space-y-3 md:space-y-4">
                  <h3
                    className={`text-xs md:text-base font-bold text-black ${isRTL ? "font-cairo text-right" : "font-montserrat"} tracking-wide`}
                  >
                    {t("home.megaOffer.availableColors")}
                  </h3>
                  <div
                    className={`flex ${isRTL ? "flex-row-reverse" : ""} space-x-3 md:space-x-4 ${isRTL ? "space-x-reverse justify-start" : "justify-start"}`}
                  >
                    <button
                      className="w-8 h-8 md:w-12 md:h-12 bg-red-500 rounded-lg cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 border-2 border-white/50 hover:border-white/80"
                      onClick={() => setActiveMachineColor("red")}
                      aria-label="Select Red Machine"
                    ></button>
                    <button
                      className="w-8 h-8 md:w-12 md:h-12 bg-[#badee4] rounded-lg cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 border-2 border-white/50 hover:border-white/80"
                      onClick={() => setActiveMachineColor("cyan")}
                      aria-label="Select Cyan Machine"
                    ></button>
                    <button
                      className="w-8 h-8 md:w-12 md:h-12 bg-black rounded-lg cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 border-2 border-white/50 hover:border-white/80"
                      onClick={() => setActiveMachineColor("black")}
                      aria-label="Select Black Machine"
                    ></button>
                  </div>
                </div>

                {/* Buttons */}
                <div
                  className={`flex ${isRTL ? "flex-row-reverse space-x-reverse" : "flex-row"} space-x-3 md:space-x-4 justify-center ${isRTL ? "md:justify-start" : "md:justify-start"}`}
                >
                  <Button
                    onClick={() => router.push("/shop/bundles")}
                    variant="outline"
                    className="px-4 md:px-8 py-3 md:py-4 text-gray-700 border-2 border-gray-300 bg-white/80 backdrop-blur-sm min-w-[120px] md:min-w-[140px] hover:bg-white hover:border-gray-400 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold rounded-xl text-sm md:text-base"
                  >
                    {t("home.megaOffer.offersBundles")}
                  </Button>
                  <Button
                    onClick={() => router.push("/shop")}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold px-4 md:px-8 py-3 md:py-4 min-w-[120px] md:min-w-[140px] shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 rounded-xl backdrop-blur-sm border border-yellow-300/30 text-sm md:text-base"
                  >
                    {t("home.megaOffer.exploreMore")}
                  </Button>
                </div>
              </div>

              {/* Right Image - Slideshow */}
              <div className="relative flex justify-center items-center h-[450px] md:h-[800px] order-2 md:order-2">
                {baseMachines.map((machine) => {
                  const styles = (machineStyles as any)[activeMachineColor]?.[machine.id]
                  if (!styles) return null // Fallback in case a style is not defined for a state
                  return (
                    <React.Fragment key={machine.id}>
                      <Image
                        src={machine.src || "/placeholder.svg"}
                        alt={machine.alt}
                        width={styles.width}
                        height={styles.height}
                        className="absolute object-contain transition-all duration-300 ease-in-out md:hidden"
                        style={{
                          top: styles.top,
                          left: styles.left,
                          transform: styles.transform || (activeMachineColor === machine.id ? "scale(1)" : "scale(0.95)"),
                          opacity: activeMachineColor === machine.id ? 1 : Math.max(styles.opacity, 0.6), // Increased minimum opacity to 60%
                          zIndex: styles.zIndex,
                          borderRadius: styles.borderRadius || "0px",
                          filter: activeMachineColor === machine.id ? "none" : "grayscale(10%) brightness(1.1)", // Reduced grayscale, added brightness
                        }}
                      />
                      <Image
                        src={machine.src || "/placeholder.svg"}
                        alt={machine.alt}
                        width={styles.mdWidth || styles.width}
                        height={styles.mdHeight || styles.height}
                        className="absolute object-contain transition-all duration-300 ease-in-out hidden md:block"
                        style={{
                          top: styles.mdTop || styles.top,
                          left: styles.mdLeft || styles.left,
                          transform: styles.transform || (activeMachineColor === machine.id ? "scale(1)" : "scale(0.95)"),
                          opacity: activeMachineColor === machine.id ? 1 : Math.max(styles.opacity, 0.6), // Increased minimum opacity to 60%
                          zIndex: styles.zIndex,
                          borderRadius: styles.borderRadius || "0px",
                          filter: activeMachineColor === machine.id ? "none" : "grayscale(10%) brightness(1.1)", // Reduced grayscale, added brightness
                        }}
                      />
                    </React.Fragment>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Horizontal Border */}
      <div className="w-full px-12 md:px-20 lg:px-24 xl:px-32 2xl:px-40 py-4">
        <hr className="border-gray-200/60 shadow-sm" />
      </div>

      {/* Second Card - How does it work */}

      <section className="max-w-screen-xl mx-auto px-4 md:px-6 py-6 md:py-16 overflow-x-clip">
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Left copy */}
          <div className="lg:col-span-5" dir={isRTL ? "rtl" : "ltr"}>
            <h2 className={`font-bold leading-tight text-[#12d6fa] text-[clamp(22px,6vw,44px)] ${isRTL ? "font-cairo text-end" : "font-montserrat text-start"}`}>
              <Balancer>{t("home.howItWorks.title")}</Balancer>
            </h2>
            <p className={`mt-2 text-sm text-black/70 ${isRTL ? "font-noto-arabic text-end" : "font-noto-sans text-start"}`}>
              {t("home.howItWorks.description")}
            </p>
          </div>

          {/* Cards */}
          <div className="lg:col-span-7">
            <ul className="grid gap-3 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <motion.li
                  key={step.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                >
                  <StepCard 
                    title={step.title}
                    videoSrc={step.img || "/placeholder.svg"}
                    step={step.id}
                    description={step.description}
                    alt={step.alt}
                  />
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Horizontal Border */}
      <div className="w-full px-12 md:px-20 lg:px-24 xl:px-32 2xl:px-40 py-4">
        <hr className="border-gray-200" />
      </div>

      {/* CO₂ Section */}
      <div className="relative w-full">
        <section className="relative w-full">
          {/* 🌍 Mobile & Tablet (Responsive Fluid Layout) */}
          <div className="xl:hidden flex flex-col items-center text-center px-8 md:px-20 lg:px-24 xl:px-32 2xl:px-40 py-8 md:py-12 bg-white">
            {/* Image Container */}
            <div className="relative w-full h-[350px] sm:h-[400px] md:h-[450px] mb-0 overflow-visible">
              {/* Background Image */}
              <Image
                src="/images/food-grade-co2-text.png"
                alt="Food Grade CO2"
                fill
                className="object-contain opacity-90 z-0"
              />

              {/* Video Animation - Positioned above background */}
              <div className="absolute inset-0 z-10">
                <motion.div
                  animate={{
                    y: [0, -8, 0, -4, 0],
                    scale: [1, 1.02, 1, 1.01, 1],
                  }}
                  transition={{
                    duration: 6,
                    ease: "easeInOut",
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                  className="w-full h-full"
                >
                  <video 
                    src="https://res.cloudinary.com/dw2h8hejn/video/upload/v1756559849/Cylinders_Animation_hw9gdc.webm" 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    preload="auto"
                    crossOrigin="anonymous"
                    className="object-contain w-full h-full"
                  >
                    <source src="https://res.cloudinary.com/dw2h8hejn/video/upload/v1756559849/Cylinders_Animation_hw9gdc.webm" type="video/webm" />
                    Your browser does not support the video tag.
                  </video>
                </motion.div>
              </div>

              {/* Badge with animation */}
              <motion.div
                initial={{ scale: 0, rotate: -10, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{
                  delay: 0.5,
                  duration: 0.7,
                  type: "spring",
                  stiffness: 200,
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 rounded-full flex flex-col items-center justify-center text-white font-bold text-center shadow-lg w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 z-10"
              >
                <span className="text-[10px] sm:text-xs md:text-sm">Drinkmate</span>
                <span className="text-[22px] sm:text-2xl md:text-3xl">CO₂</span>
                <span className="text-[10px] sm:text-xs md:text-sm">Exchange</span>
              </motion.div>
            </div>

            {/* Content - Below Image */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              className="flex flex-col items-center mt-6"
            >
              <h2 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 ${isRTL ? "font-cairo text-right" : "font-montserrat"}`}>{t("home.co2Section.title")}</h2>
              <p className={`text-sm sm:text-base md:text-lg text-gray-700 max-w-md leading-relaxed ${isRTL ? "font-noto-arabic text-right" : "font-noto-sans"}`}>
                {t("home.co2Section.description")}
              </p>

              <div className="mt-6 flex flex-row space-x-4 justify-center">
                <Button
                  aria-label="Learn more about Drinkmate CO2 Exchange"
                  className={`bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-semibold shadow-md hover:bg-yellow-500 transition ${isRTL ? "font-cairo" : "font-montserrat"}`}
                >
                  {t("home.co2Section.learnMore")}
                </Button>
                <Button
                  aria-label="Explore CO2 Subscriptions"
                  className={`bg-purple text-gray-900 border border-gray-300 px-6 py-2 rounded-full font-semibold shadow-md hover:bg-gray-50 transition ${isRTL ? "font-cairo" : "font-montserrat"}`}
                >
                  {t("home.co2Section.exploreSubscriptions")}
                </Button>
              </div>
            </motion.div>
          </div>

          {/* 💻 Desktop (Pixel-Fixed Layout) */}
          <div className="hidden xl:block relative w-[1200px] h-[660px] mx-auto">
            {/* Background Images */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/food-grade-co2-text.png"
                alt="Food Grade CO2"
                fill
                className="object-cover opacity-90 rounded-[20px]"
              />

              {/* Advanced popup animation for desktop CO₂ image */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 20 }}
                animate={{
                  scale: [0.85, 1.05, 1],
                  opacity: [0, 1, 1],
                  y: [20, -5, 0],
                }}
                transition={{
                  duration: 1.2,
                  ease: "easeOut",
                  times: [0, 0.7, 1],
                }}
                className="absolute inset-0 rounded-[20px]"
              >
                <motion.div
                  animate={{
                    y: [0, -8, 0, -4, 0],
                    scale: [1, 1.02, 1, 1.01, 1],
                  }}
                  transition={{
                    duration: 6,
                    ease: "easeInOut",
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                  className="w-full h-full"
                >
                  <video 
                    src="https://res.cloudinary.com/dw2h8hejn/video/upload/v1756559849/Cylinders_Animation_hw9gdc.webm" 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    preload="auto"
                    crossOrigin="anonymous"
                    className="object-contain w-full h-full"
                  >
                    <source src="https://res.cloudinary.com/dw2h8hejn/video/upload/v1756559849/Cylinders_Animation_hw9gdc.webm" type="video/webm" />
                    Your browser does not support the video tag.
                  </video>
                </motion.div>
              </motion.div>
            </div>

            {/* Badge with advanced animation */}
            <motion.div
              initial={{ scale: 0, rotate: -10, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{
                delay: 0.5,
                duration: 0.8,
                type: "spring",
                stiffness: 200,
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              }}
              className="absolute bg-yellow-400 rounded-full flex flex-col items-center justify-center text-white font-bold text-center shadow-lg z-20 w-[124px] h-[124px] top-[250px] left-[643px]"
            >
              <motion.span
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="text-xs"
              >
                Drinkmate
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="text-3xl"
              >
                CO₂
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.5 }}
                className="text-xs"
              >
                Exchange
              </motion.span>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
              className="absolute z-10 flex flex-col items-end max-w-md top-[410px] right-[50px] text-right"
            >
              <h2 className={`text-[40px] font-extrabold text-gray-900 mb-2 ${isRTL ? "font-cairo text-right" : "font-montserrat"}`}>{t("home.co2Section.title")}</h2>
              <p className={`text-lg text-gray-700 leading-relaxed max-w-sm ${isRTL ? "font-noto-arabic text-right" : "font-noto-sans"}`}>
                {t("home.co2Section.description")}
              </p>

              <div className="mt-6 flex flex-row space-x-4 justify-end">
                <Button
                  aria-label="Learn more about Drinkmate CO2 Exchange"
                  className={`bg-yellow-400 text-gray-900 px-8 py-3 rounded-full font-semibold shadow-md hover:bg-yellow-500 transition ${isRTL ? "font-cairo" : "font-montserrat"}`}
                >
                  {t("home.co2Section.learnMore")}
                </Button>
                <Button
                  aria-label="Explore CO2 Subscriptions"
                  className={`bg-purple text-gray-900 border border-gray-300 px-8 py-3 rounded-full font-semibold shadow-md hover:bg-gray-50 transition ${isRTL ? "font-cairo" : "font-montserrat"}`}
                >
                  {t("home.co2Section.exploreSubscriptions")}
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Horizontal Border */}
      <div className="w-full px-12 md:px-20 lg:px-24 xl:px-32 2xl:px-40 py-4">
        <hr className="border-gray-200" />
      </div>

      {/* Flavor Section */}
<section className="px-6 md:px-20 lg:px-24 xl:px-32 2xl:px-40">
  {/* Header */}
  <div className="text-center mb-2 md:mb-4" dir={isRTL ? "rtl" : "ltr"}>
    <div className="flex justify-center">
      <div className="bg-[#12d6fa] bg-clip-text">
        <p
          className={`text-base md:text-lg lg:text-xl font-medium mb-2 md:mb-3 text-transparent bg-clip-text bg-[#12d6fa] text-center ${
            isRTL ? "font-cairo" : "font-montserrat"
          }`}
        >
          {t("home.flavorSection.subtitle")}
        </p>
      </div>
    </div>
    <h2
      className={`text-2xl md:text-4xl lg:text-6xl font-medium bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent mb-3 md:mb-4 text-center ${
        isRTL ? "font-cairo" : "font-montserrat"
      }`}
    >
      {t("home.flavorSection.title")}
    </h2>
    <div className="w-16 md:w-24 h-1 bg-[#12d6fa] mx-auto rounded-full shadow-lg"></div>
  </div>

  <div
  className="mx-auto bg-white rounded-xl md:rounded-2xl relative overflow-hidden 
             h-[600px] md:h-[500px] lg:h-[550px]"
>
  <Image
    src="/images/flavor-section-background.png"
    alt="Italian Flavors and Cherry Cola Bottle"
    fill
    sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, 1200px"
    priority
    quality={90}
    className="object-cover rounded-xl md:rounded-2xl"
  />
</div>



</section>

      {/* Horizontal Border */}
      <div className="w-full px-12 md:px-20 lg:px-24 xl:px-32 2xl:px-40 py-2 md:py-8">
        <hr className="border-gray-200" />
      </div>
      {/* New Sections below Flavor Section */}
      <section className="py-6 md:py-16 px-8 md:px-20 lg:px-24 xl:px-32 2xl:px-40 animate-fade-in-up">
        <div className="w-full bg-white rounded-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 py-12">
            {/* How to Use */}
            <div
              className="text-center group cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-2 animate-slide-in-up"
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="bg-gradient-to-b from-white to-[#f3f3f3] rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 h-[280px] min-h-[280px]">
                <Image
                  src="/images/how-to-use-drinkmate.png"
                  alt="How to Use Drinkmate"
                  width={280}
                  height={200}
                  className="object-contain rounded-2xl w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3
                className={`text-lg md:text-xl font-medium text-gray-800 mt-6 ${isRTL ? "font-cairo text-right" : "font-montserrat"} group-hover:text-[#12d6fa] transition-colors duration-300`}
              >
                {t("home.additionalSections.howToUse.title")}
              </h3>
              <p
                className={`text-gray-600 text-sm px-2 ${isRTL ? "font-noto-arabic text-right" : "font-noto-sans"} group-hover:text-gray-700 transition-colors duration-300`}
              >
                {t("home.additionalSections.howToUse.description")}
              </p>
            </div>

            {/* Recipes */}
            <div
              className="text-center group cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-2 animate-slide-in-up delay-200"
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="bg-gradient-to-b from-white to-[#f3f3f3] rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 h-[280px] min-h-[280px]">
                <Image
                  src="/images/drink-recipes.png"
                  alt="Drink Recipes"
                  width={342.8571472167969}
                  height={270}
                  className="object-contain rounded-2xl w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3
                className={`text-lg md:text-xl font-medium text-gray-800 mt-6 ${isRTL ? "font-cairo text-right" : "font-montserrat"} group-hover:text-[#12d6fa] transition-colors duration-300`}
              >
                {t("home.additionalSections.recipes.title")}
              </h3>
              <p
                className={`text-gray-600 text-sm px-2 ${isRTL ? "font-noto-arabic text-right" : "font-noto-sans"} group-hover:text-gray-700 transition-colors duration-300`}
              >
                {t("home.additionalSections.recipes.description")}
              </p>
            </div>

            {/* Premium Italian Flavors */}
            <div
              className="text-center group cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-2 animate-slide-in-up delay-400"
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="bg-gradient-to-b from-white to-[#f3f3f3] rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 h-[280px] min-h-[280px]">
                <Image
                  src="/images/premium-italian-flavors.png"
                  alt="Premium Italian Flavors"
                  width={342}
                  height={251}
                  className="object-contain rounded-2xl w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3
                className={`text-lg md:text-xl font-medium text-gray-800 mt-6 ${isRTL ? "font-cairo text-right" : "font-montserrat"} group-hover:text-[#12d6fa] transition-colors duration-300`}
              >
                {t("home.additionalSections.premiumFlavors.title")}
              </h3>
              <p
                className={`text-gray-600 text-sm px-2 ${isRTL ? "font-noto-arabic text-right" : "font-noto-sans"} group-hover:text-gray-700 transition-colors duration-300`}
              >
                {t("home.additionalSections.premiumFlavors.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal Border */}
      <div className="w-full px-10 md:px-16 lg:px-20 xl:px-28 2xl:px-36 py-8">
        <hr className="border-gray-200" />
      </div>

      {/* Environmental Impact Section */}
      <section className="py-6 md:py-16 bg-gradient-to-b from-white to-gray-50/30 px-8 md:px-20 lg:px-24 xl:px-32 2xl:px-40 animate-fade-in-up delay-300">
        <div className="w-full">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12" dir={isRTL ? "rtl" : "ltr"}>
            <p
              className={`text-gray-600 text-base md:text-lg mb-2 font-medium tracking-wide ${isRTL ? "font-noto-arabic" : ""} animate-slide-in-up`}
            >
              {t("home.environmental.subtitle")}
            </p>
            <h2
              className={`text-3xl md:text-4xl font-medium text-purple-500 ${isRTL ? "font-cairo" : "font-montserrat"} animate-slide-in-up delay-200 tracking-wide leading-tight`}
            >
              {t("home.environmental.title")}
            </h2>
          </div>

          {/* Three Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div
              className="text-center animate-slide-in-up group cursor-pointer transition-all duration-500 hover:transform hover:-translate-y-3 hover:scale-[1.02]"
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="bg-white rounded-3xl overflow-hidden mb-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100/50 backdrop-blur-sm relative group-hover:border-[#12d6fa]/20">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#12d6fa]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Image
                  src="/images/plastic-impact.png"
                  alt="Our impact on One time plastic use"
                  width={300}
                  height={280}
                  className="object-cover w-full h-56 md:h-72 rounded-3xl group-hover:scale-110 transition-all duration-700 filter group-hover:brightness-105"
                />
              </div>
              <h3
                className={`text-base md:text-lg font-medium text-gray-700 ${isRTL ? "font-cairo" : "font-montserrat"} group-hover:text-[#12d6fa] transition-all duration-300 tracking-wide leading-relaxed px-2`}
              >
                {t("home.environmental.plasticImpact")}
              </h3>
            </div>

            <div
              className="text-center animate-slide-in-up delay-200 group cursor-pointer transition-all duration-500 hover:transform hover:-translate-y-3 hover:scale-[1.02]"
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="bg-white rounded-3xl overflow-hidden mb-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100/50 backdrop-blur-sm relative group-hover:border-[#12d6fa]/20">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#12d6fa]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Image
                  src="/images/natural-flavors.png"
                  alt="How our natural flavors are made"
                  width={300}
                  height={280}
                  className="object-cover w-full h-56 md:h-72 rounded-3xl group-hover:scale-110 transition-all duration-700 filter group-hover:brightness-105"
                />
              </div>
              <h3
                className={`text-base md:text-lg font-medium text-gray-700 ${isRTL ? "font-cairo" : "font-montserrat"} group-hover:text-[#12d6fa] transition-all duration-300 tracking-wide leading-relaxed px-2`}
              >
                {t("home.environmental.naturalFlavors")}
              </h3>
            </div>

            <div
              className="text-center animate-slide-in-up delay-400 group cursor-pointer transition-all duration-500 hover:transform hover:-translate-y-3 hover:scale-[1.02]"
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="bg-white rounded-3xl overflow-hidden mb-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100/50 backdrop-blur-sm relative group-hover:border-[#12d6fa]/20">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#12d6fa]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Image
                  src="/images/health-benefits.png"
                  alt="Health Benefits of sparkling water"
                  width={300}
                  height={280}
                  className="object-cover w-full h-56 md:h-72 rounded-3xl group-hover:scale-110 transition-all duration-700 filter group-hover:brightness-105"
                />
              </div>
              <h3
                className={`text-base md:text-lg font-medium text-gray-700 ${isRTL ? "font-cairo" : "font-montserrat"} group-hover:text-[#12d6fa] transition-all duration-300 tracking-wide leading-relaxed px-2`}
              >
                {t("home.environmental.healthBenefits")}
              </h3>
            </div>
          </div>
        </div>
      </section>
      </HydrationBoundary>
      </PageLayout>
    </>
  )
}
