"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import PageLayout from "@/components/layout/PageLayout"
import { useTranslation } from "@/lib/translation-context"
import { useRouter } from "next/navigation"

export default function Home() {
  const { t, isRTL, isHydrated } = useTranslation()
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeMachineColor, setActiveMachineColor] = useState("cyan") // Default to cyan

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
      buttonText: "",
      offerText: "",
      imageSrc: "/images/energy-cola-flavors.png",
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
          src: "/images/drinkmate-machine.png",
          alt: "Drinkmate Machine",
          width: 121,
          height: 345,
          top: 18, // Relative to the main gray container
          left: 1324, // Relative to the main gray container
          zIndex: 2, // Machine is in front
        },
        {
          src: "/images/co2-cylinder-single.png",
          alt: "CO2 Cylinder",
          width: 340,
          height: 340,
          top: 28, // Relative to the main gray container
          left: 1281, // Relative to the main gray container
          zIndex: 1, // Cylinder is behind machine
        },
        {
          src: "/images/strawberry-lemon-flavor.png",
          alt: "Strawberry Lemon Flavor",
          width: 55,
          height: 157,
          top: 135, // Relative to the main gray container
          left: 1500, // Relative to the main gray container
          zIndex: 3, // Strawberry is in front of machine
        },
      ],
    },
  ]
  const steps = [
    {
      id: 1,
      title: "Fill",
      description: "Fill the bottle with your desired beverage.",
      img: "/images/step/step 1.webp",
      alt: "Step 1: Fill Bottle",
    },
    {
      id: 2,
      title: "Fizz",
      description: "Press the button to carbonate your drink.",
      img: "/images/step/step 2.webp",
      alt: "Step 2: Carbonate Drink",
    },
    {
      id: 3,
      title: "Flip",
      description: "Open the valve on the Fizz Infuser to release the pressure.",
      img: "/images/step/step 3.webp",
      alt: "Step 3: Flip to Release Pressure",
    },
    {
      id: 4,
      title: "Enjoy!",
      description: "Fill into a glass and enjoy the drink.",
      img: "/images/step/step 4.webp", // 👉 Add this image to your public/images
      alt: "Step 4: Enjoy Drink",
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
    { id: "red", src: "/images/drinkmate-machine-red.png", alt: "Drinkmate OmniFizz Red" },
    { id: "cyan", src: "/images/drinkmate-machine-blue.png", alt: "Drinkmate OmniFizz Blue" },
    { id: "black", src: "/images/drinkmate-machine-black-small.png", alt: "Drinkmate OmniFizz Black" },
  ]

  const machineStyles = {
    red: {
      red: {
        width: 258,
        height: 645,
        top: "78px",
        left: `${801 - rightColumnStartX}px`,
        opacity: 1,
        zIndex: 2,
        borderRadius: "5px",
      },
      cyan: {
        width: 91.04199981689453,
        height: 221,
        top: "290px",
        left: `${1076.2 - rightColumnStartX}px`,
        opacity: 0.5,
        zIndex: 1,
      },
      black: {
        width: 77,
        height: 221,
        top: "290px",
        left: `${1083 - rightColumnStartX}px`,
        opacity: 0,
        zIndex: 0,
        borderRadius: "5px",
      },
    },
    cyan: {
      red: {
        width: 100,
        height: 251,
        top: "278px",
        left: `${640 - rightColumnStartX}px`,
        opacity: 0.5,
        zIndex: 1,
        borderRadius: "5px",
      },
      cyan: { width: 255, height: 619, top: "90px", left: `${828 - rightColumnStartX}px`, opacity: 1, zIndex: 2 },
      black: {
        width: 77,
        height: 221,
        top: "290px",
        left: `${1083 - rightColumnStartX}px`,
        opacity: 0.5,
        zIndex: 1,
        borderRadius: "5px",
      },
    },
    black: {
      red: {
        width: 100,
        height: 251,
        top: "278px",
        left: `${640 - rightColumnStartX}px`,
        opacity: 0, // Hide red machine
        zIndex: 0,
        borderRadius: "5px",
      },
      cyan: {
        width: 94, // Updated width
        height: 227, // Updated height
        top: "286px", // Updated top
        left: `${720 - rightColumnStartX}px`, // Updated left
        opacity: 0.5,
        zIndex: 1,
      },
      black: {
        width: 218, // Updated width
        height: 623, // Updated height
        top: "89px", // Updated top
        left: `${847 - rightColumnStartX}px`, // Updated left
        opacity: 1,
        zIndex: 2,
        borderRadius: "5px",
      },
    },
  }

  // Don't render until hydration is complete to prevent mismatches
  if (!isHydrated) {
    return (
      <PageLayout currentPage="home">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#12d6fa] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout currentPage="home">
      {/* Hero Section */}
      <section className="py-8 md:py-16 px-12 md:px-20 lg:px-24 xl:px-32 2xl:px-40 relative z-30">
        <div className="w-full bg-gradient-to-b from-white via-white/95 to-[#f8fafc] rounded-b-3xl relative overflow-hidden min-h-[400px] md:h-[600px] backdrop-blur-sm shadow-2xl shadow-gray-200/50 border border-white/20">
          {/* Product Images (Absolute Positioning) */}
          <Image
            src="/images/drinkmate-machine-hero.png"
            alt="Drinkmate OmniFizz Soda Maker"
            width={242}
            height={417}
            quality={85}
            priority
            className="absolute object-contain hidden md:block drop-shadow-2xl"
            style={{ top: "203px", left: "121px" }}
          />
          <Image
            src="/images/italian-strawberry-lemon.png"
            alt="Italian Strawberry Lemon Flavor"
            width={99}
            height={206}
            quality={85}
            priority
            className="absolute object-contain hidden md:block drop-shadow-xl"
            style={{ top: "414px", left: "313px" }}
          />

          {/* Mobile Product Images */}
          <div className="block md:hidden w-full">
            <div className="flex flex-row items-center justify-center space-x-6 p-4">
              <Image
                src="/images/drinkmate-machine-hero.png"
                alt="Drinkmate OmniFizz Soda Maker"
                width={120}
                height={200}
                quality={85}
                priority
                className="object-contain drop-shadow-xl"
              />
              <Image
                src="/images/italian-strawberry-lemon.png"
                alt="Italian Strawberry Lemon Flavor"
                width={80}
                height={160}
                quality={85}
                priority
                className="object-contain drop-shadow-lg"
              />
            </div>

            {/* Mobile Content - After Images */}
            <div className="text-center px-6 py-8 bg-white/90 backdrop-blur-md rounded-2xl mx-2 shadow-2xl shadow-gray-200/30 mb-8 hover:shadow-3xl hover:bg-white/95 transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up border border-white/40">
              <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
                <h1
                  className={`text-2xl font-bold text-black leading-tight ${isRTL ? "font-cairo text-right" : "font-montserrat"} drop-shadow-sm animate-slide-in-up tracking-tight`}
                >
                  {t("home.hero.title")}
                </h1>
                <h2
                  className={`text-lg text-gray-700 font-semibold ${isRTL ? "font-cairo text-right" : "font-montserrat"} opacity-90 animate-slide-in-up delay-200 tracking-wide`}
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
                    className="px-8 py-4 text-gray-700 border-2 border-gray-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-gray-400 font-semibold rounded-xl min-w-[140px] transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md"
                  >
                    {t("home.hero.exploreMore")}
                  </button>
                  <button
                    onClick={() => router.push("/shop")}
                    className="bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] hover:from-[#0bc4e8] hover:to-[#09b3d1] text-white px-8 py-4 font-semibold shadow-xl border-2 border-[#12d6fa]/20 rounded-xl min-w-[140px] transition-all duration-300 transform hover:scale-105 hover:shadow-2xl backdrop-blur-sm"
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
                className={`text-3xl md:text-5xl lg:text-6xl font-bold text-black leading-tight ${isRTL ? "font-cairo" : "font-montserrat"} drop-shadow-lg animate-slide-in-left tracking-tight`}
              >
                {t("home.hero.title")}
              </h1>
              <h2
                className={`text-lg md:text-2xl text-gray-700 font-semibold ${isRTL ? "font-cairo" : "font-montserrat"} opacity-90 animate-slide-in-left delay-200 tracking-wide`}
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
      </section>

      {/* Refill Section */}
      <section className="py-8 md:py-16 px-12 md:px-20 lg:px-24 xl:px-32 2xl:px-40 animate-fade-in-up">
        <div className="w-full bg-gradient-to-br from-[#f8fafc] via-[#f3f3f3] to-[#f1f5f9] rounded-3xl relative min-h-[300px] md:h-[250px] flex items-center justify-between px-10 md:px-16 lg:px-20 xl:px-24 shadow-2xl shadow-gray-200/40 backdrop-blur-sm border border-white/30">
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
              <div className="space-y-4 mb-4 md:mb-0">
                <h2
                  className={`text-2xl md:text-4xl font-semibold text-black leading-tight ${isRTL ? "font-cairo" : "font-montserrat"} tracking-tight drop-shadow-sm`}
                >
                  {slide.headline}
                </h2>
                <p
                  className={`text-gray-700 text-sm md:text-[15px] md:whitespace-nowrap ${isRTL ? "font-noto-arabic" : "font-noto-sans"} font-medium`}
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
                        router.push("/shop")
                      } else {
                        router.push("/shop")
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
            // Multi-image container for the third slide
            <div className="hidden md:block absolute inset-0">
              {slide.multiImages &&
                slide.multiImages.map((img, index) => (
                  <Image
                    key={index}
                    src={img.src || "/placeholder.svg"}
                    alt={img.alt}
                    width={img.width}
                    height={img.height}
                    className="absolute object-contain"
                    style={{ top: `${img.top}px`, left: `${img.left}px`, zIndex: img.zIndex }}
                  />
                ))}
            </div>
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
      <section className="py-8 md:py-16 px-12 md:px-20 lg:px-24 xl:px-32 2xl:px-40 animate-fade-in-up">
        <div className="w-full">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12" dir={isRTL ? "rtl" : "ltr"}>
            <h2
              className={`text-3xl md:text-4xl font-semibold text-black ${isRTL ? "font-cairo" : "font-montserrat"} animate-slide-in-up tracking-tight drop-shadow-sm`}
            >
              {t("home.productCategories.title")}
            </h2>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {/* Soda Makers */}
            <Link
              href="/shop/soda-makers"
              className="text-center space-y-4 group cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-3 animate-slide-in-up block"
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="bg-gradient-to-b from-white via-white/95 to-[#f8fafc] rounded-3xl p-4 md:p-8 relative overflow-hidden h-[280px] md:h-[270px] group shadow-xl shadow-gray-200/30 group-hover:shadow-2xl group-hover:shadow-gray-200/40 transition-all duration-500 backdrop-blur-sm border border-white/40 group-hover:border-white/60">
                {/* Multiple Machine Images in Row */}
                <div className="flex justify-center items-end space-x-2 h-full">
                  <Image
                    src="/images/02 - Soda Makers/soda-maker-group.png"
                    alt="Soda Makers"
                    width={180}
                    height={225}
                    className="object-contain transition-all duration-500 ease-out translate-y-[50px] group-hover:translate-y-0 scale-150 group-hover:scale-200 hover:scale-225 animate-pop-up drop-shadow-2xl"
                  />
                </div>
              </div>
              <h3
                className={`text-lg md:text-xl font-bold text-black ${isRTL ? "font-cairo text-right" : "font-montserrat"} group-hover:text-[#12d6fa] transition-colors duration-300 tracking-wide drop-shadow-sm`}
              >
                {t("home.productCategories.sodaMakers")}
              </h3>
            </Link>

            {/* CO2 */}
            <Link
              href="/co2"
              className="text-center space-y-4 group cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-3 animate-slide-in-up delay-200 block"
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="bg-gradient-to-b from-white via-white/95 to-[#f8fafc] rounded-3xl p-4 md:p-8 relative overflow-hidden h-[280px] md:h-[270px] group shadow-xl shadow-gray-200/30 group-hover:shadow-2xl group-hover:shadow-gray-200/40 transition-all duration-500 backdrop-blur-sm border border-white/40 group-hover:border-white/60">
                {/* Multiple CO2 Images in Row */}
                <div className="flex justify-center items-end space-x-2 h-full">
                  <Image
                    src="/images/03 - CO2/co2-group-cylinder.png"
                    alt="CO2"
                    width={180}
                    height={225}
                    className="object-contain transition-all duration-500 ease-out translate-y-[50px] group-hover:translate-y-0 scale-150 group-hover:scale-200 hover:scale-225 animate-pop-up drop-shadow-2xl"
                  />
                </div>
              </div>
              <h3
                className={`text-lg md:text-xl font-bold text-black ${isRTL ? "font-cairo text-right" : "font-montserrat"} group-hover:text-[#12d6fa] transition-colors duration-300 tracking-wide drop-shadow-sm`}
              >
                {t("home.productCategories.co2")}
              </h3>
            </Link>

            {/* Premium Italian Flavors */}
            <Link
              href="/shop/flavor"
              className="text-center space-y-4 group cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-3 animate-slide-in-up delay-300 block"
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="bg-gradient-to-b from-white via-white/95 to-[#f8fafc] rounded-3xl p-4 md:p-8 relative overflow-hidden h-[280px] md:h-[270px] group shadow-xl shadow-gray-200/30 group-hover:shadow-2xl group-hover:shadow-gray-200/40 transition-all duration-500 backdrop-blur-sm border border-white/40 group-hover:border-white/60">
                {/* Multiple Flavor Images from Flavors Folder in Row */}
                <div className="flex justify-center items-end space-x-2 h-full">
                  <Image
                    src="/images/01 - Flavors/strawberry-group.png"
                    alt="Premium Italian Flavors"
                    width={180}
                    height={225}
                    className="object-contain transition-all duration-500 ease-out translate-y-[50px] group-hover:translate-y-0 scale-150 group-hover:scale-200 hover:scale-225 animate-pop-up drop-shadow-2xl"
                  />
                </div>
              </div>
              <h3
                className={`text-lg md:text-xl font-bold text-black ${isRTL ? "font-cairo text-right" : "font-montserrat"} group-hover:text-[#12d6fa] transition-colors duration-300 tracking-wide drop-shadow-sm`}
              >
                {t("home.productCategories.premiumItalianFlavors")}
              </h3>
            </Link>

            {/* Accessories */}
            <Link
              href="/shop/accessories"
              className="text-center space-y-4 group cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-3 animate-slide-in-up delay-500 block"
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="bg-gradient-to-b from-white via-white/95 to-[#f8fafc] rounded-3xl p-4 md:p-8 relative overflow-hidden h-[280px] md:h-[270px] group shadow-xl shadow-gray-200/30 group-hover:shadow-2xl group-hover:shadow-gray-200/40 transition-all duration-500 backdrop-blur-sm border border-white/40 group-hover:border-white/60">
                {/* Multiple Accessory Images in Row */}
                <div className="flex justify-center items-end space-x-2 h-full">
                  <Image
                    src="/images/05 - Accessories-20250824T073107Z-1-001/05 - Accessories/empty-bottle-group.png"
                    alt="Accessories"
                    width={180}
                    height={225}
                    className="object-contain transition-all duration-500 ease-out translate-y-[50px] group-hover:translate-y-0 scale-150 group-hover:scale-200 hover:scale-225 animate-pop-up drop-shadow-2xl"
                  />
                </div>
              </div>
              <h3
                className={`text-lg md:text-xl font-bold text-black ${isRTL ? "font-cairo text-right" : "font-montserrat"} group-hover:text-[#12d6fa] transition-colors duration-300 tracking-wide drop-shadow-sm`}
              >
                {t("home.productCategories.accessories")}
              </h3>
            </Link>
          </div>
        </div>
      </section>

      {/* Horizontal Border */}
      <div className="w-full px-12 md:px-20 lg:px-24 xl:px-32 2xl:px-40 py-4">
        <hr className="border-gray-200/60 shadow-sm" />
      </div>

      {/* Mega Offer Section */}
      <section className="py-8 md:py-16 px-12 md:px-20 lg:px-24 xl:px-32 2xl:px-40 animate-fade-in-up">
        <div className="w-full">
          {/* First Card - Drinkmate OmniFizz */}
          <div className="bg-gradient-to-br from-white via-white/95 to-[#f8fafc] rounded-b-3xl py-8 md:py-16 px-6 md:px-8 lg:px-12 xl:px-16 pb-4 relative overflow-hidden mb-8 shadow-2xl shadow-gray-200/40 backdrop-blur-sm border border-white/30">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left Content */}
              <div className="space-y-6 md:space-y-8 max-w-lg animate-slide-in-left" dir={isRTL ? "rtl" : "ltr"}>
                <h2
                  className={`text-4xl md:text-6xl font-semibold text-black leading-tight ${isRTL ? "font-cairo text-right" : "font-montserrat"} animate-slide-in-left delay-200 tracking-tight drop-shadow-lg`}
                >
                  {t("home.megaOffer.title")}
                </h2>
                <p
                  className={`text-base md:text-lg text-gray-600 leading-relaxed ${isRTL ? "font-noto-arabic text-right" : "font-noto-sans"} animate-slide-in-left delay-300 font-medium`}
                >
                  {t("home.megaOffer.description")}
                </p>

                {/* Available Color Options */}
                <div className="space-y-4">
                  <h3
                    className={`text-sm md:text-base font-bold text-black ${isRTL ? "font-cairo text-right" : "font-montserrat"} tracking-wide`}
                  >
                    {t("home.megaOffer.availableColors")}
                  </h3>
                  <div
                    className={`flex ${isRTL ? "flex-row-reverse" : ""} space-x-4 ${isRTL ? "space-x-reverse justify-start" : "justify-start"}`}
                  >
                    <button
                      className="w-10 h-10 md:w-12 md:h-12 bg-red-500 rounded-lg cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 border-2 border-white/50 hover:border-white/80"
                      onClick={() => setActiveMachineColor("red")}
                      aria-label="Select Red Machine"
                    ></button>
                    <button
                      className="w-10 h-10 md:w-12 md:h-12 bg-[#badee4] rounded-lg cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 border-2 border-white/50 hover:border-white/80"
                      onClick={() => setActiveMachineColor("cyan")}
                      aria-label="Select Cyan Machine"
                    ></button>
                    <button
                      className="w-10 h-10 md:w-12 md:h-12 bg-black rounded-lg cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 border-2 border-white/50 hover:border-white/80"
                      onClick={() => setActiveMachineColor("black")}
                      aria-label="Select Black Machine"
                    ></button>
                  </div>
                </div>

                {/* Buttons */}
                <div
                  className={`flex ${isRTL ? "flex-row-reverse space-x-reverse" : "flex-row"} space-x-4 justify-center ${isRTL ? "md:justify-start" : "md:justify-start"}`}
                >
                  <Button
                    onClick={() => router.push("/shop/bundles")}
                    variant="outline"
                    className="px-8 py-4 text-gray-700 border-2 border-gray-300 bg-white/80 backdrop-blur-sm min-w-[140px] hover:bg-white hover:border-gray-400 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold rounded-xl"
                  >
                    {t("home.megaOffer.offersBundles")}
                  </Button>
                  <Button
                    onClick={() => router.push("/shop")}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold px-8 py-4 min-w-[140px] shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 rounded-xl backdrop-blur-sm border border-yellow-300/30"
                  >
                    {t("home.megaOffer.exploreMore")}
                  </Button>
                </div>
              </div>

              {/* Right Image - Slideshow */}
              <div className="relative flex justify-center items-center h-[750px] md:h-[700px]">
                {baseMachines.map((machine) => {
                  const styles = (machineStyles as any)[activeMachineColor]?.[machine.id]
                  if (!styles) return null // Fallback in case a style is not defined for a state
                  return (
                    <Image
                      key={machine.id}
                      src={machine.src || "/placeholder.svg"}
                      alt={machine.alt}
                      width={styles.width}
                      height={styles.height}
                      className="absolute object-contain transition-all duration-300 ease-in-out"
                      style={{
                        top: styles.top,
                        left: styles.left,
                        opacity: activeMachineColor === machine.id ? 1 : Math.max(styles.opacity, 0.6), // Increased minimum opacity to 60%
                        zIndex: styles.zIndex,
                        borderRadius: styles.borderRadius || "0px",
                        filter: activeMachineColor === machine.id ? "none" : "grayscale(10%) brightness(1.1)", // Reduced grayscale, added brightness
                        transform: activeMachineColor === machine.id ? "scale(1)" : "scale(0.95)", // Slight scale down for inactive machines
                      }}
                    />
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

      <div className="py-8 md:py-16 px-12 md:px-20 lg:px-24 xl:px-32 2xl:px-40">
        {/* Container Card */}
        <div className="max-w-full mx-auto bg-gradient-to-b from-white to-[#f3f3f3] rounded-2xl py-8 px-12 md:px-20 lg:px-24 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Side - Text Content */}
            <div className="lg:w-1/4 flex-shrink-0">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#12d6fa] leading-tight mb-6">
                How does the
                <br />
                Drinkmate
                <br />
                OmniFizz work?
              </h2>
              <p className="text-lg md:text-xl text-gray-600">
                Three simple steps that show you how to use the Drinkmate OmniFizz
              </p>
            </div>

            {/* Right Side - Steps Grid */}
            <div className="lg:w-3/4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full overflow-x-visible">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className="flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  aria-label={`Step ${step.id}: ${step.title}`}
                >
                  {/* Step Image */}
                  <div className="relative w-full h-[320px] sm:h-[320px] md:h-[320px] lg:h-[320px] mb-4">
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative w-full h-full"
                    >
                      <Image
                        src={step.img || "/placeholder.svg"}
                        alt={step.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                        priority={index < 2}
                        className="object-cover rounded-2xl shadow-lg"
                      />
                      {/* Gradient and overlayed text */}
                      <div className="absolute inset-x-0 bottom-0 p-4 rounded-b-2xl bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                        <p className="text-white font-extrabold text-lg">{`Step ${step.id}: ${step.title}`}</p>
                        <p className="text-white/90 text-sm leading-snug">{step.description}</p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Border */}
      <div className="w-full px-12 md:px-20 lg:px-24 xl:px-32 2xl:px-40 py-4">
        <hr className="border-gray-200" />
      </div>

      {/* CO₂ Section */}
      <div className="relative w-full">
        <section className="relative w-full">
          {/* 🌍 Mobile & Tablet (Responsive Fluid Layout) */}
          <div className="xl:hidden flex flex-col items-center text-center px-12 md:px-20 lg:px-24 xl:px-32 2xl:px-40 py-12 bg-white">
            {/* Image Container */}
            <div className="relative w-full h-[350px] sm:h-[400px] md:h-[450px] mb-0 overflow-visible">
              <Image
                src="/images/food-grade-co2-text.png"
                alt="Food Grade CO2"
                fill
                className="object-contain opacity-90"
              />

              {/* Advanced popup animation for CO₂ image */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{
                  scale: [0.8, 1.05, 1],
                  opacity: [0, 1, 1],
                  y: [20, -5, 0],
                }}
                transition={{
                  duration: 1.2,
                  ease: "easeOut",
                  times: [0, 0.7, 1],
                }}
                className="absolute inset-0"
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
                  <Image src="/videos/cylinder-anim.png" alt="CO2 Cylinders" fill priority className="object-contain" />
                </motion.div>
              </motion.div>

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
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Why CO₂?</h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-700 max-w-md leading-relaxed">
                CO₂ gas adds bubbles and fizz to your water. Our Food Grade CO₂ ensures safe, fresh, and sparkling
                drinks every time.
              </p>

              <div className="mt-6 flex flex-row space-x-4 justify-center">
                <Button
                  aria-label="Learn more about Drinkmate CO2 Exchange"
                  className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-semibold shadow-md hover:bg-yellow-500 transition"
                >
                  Learn More
                </Button>
                <Button
                  aria-label="Explore CO2 Subscriptions"
                  className="bg-purple text-gray-900 border border-gray-300 px-6 py-2 rounded-full font-semibold shadow-md hover:bg-gray-50 transition"
                >
                  Explore Subscriptions
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
                    y: [0, -10, 0, -5, 0],
                    scale: [1, 1.02, 1, 1.01, 1],
                  }}
                  transition={{
                    duration: 7,
                    ease: "easeInOut",
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                  className="w-full h-full"
                >
                  <Image
                    src="/videos/cylinder-anim.png"
                    alt="CO2 Cylinders"
                    fill
                    priority
                    className="object-contain rounded-[20px]"
                  />
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
              <h2 className="text-[40px] font-extrabold text-gray-900 mb-2">Why CO₂?</h2>
              <p className="text-lg text-gray-700 leading-relaxed max-w-sm">
                CO₂ gas adds bubbles and fizz to your water. Our Food Grade CO₂ ensures safe, fresh, and sparkling
                drinks every time.
              </p>

              <div className="mt-6 flex flex-row space-x-4 justify-end">
                <Button
                  aria-label="Learn more about Drinkmate CO2 Exchange"
                  className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-full font-semibold shadow-md hover:bg-yellow-500 transition"
                >
                  Learn More
                </Button>
                <Button
                  aria-label="Explore CO2 Subscriptions"
                  className="bg-purple text-gray-900 border border-gray-300 px-8 py-3 rounded-full font-semibold shadow-md hover:bg-gray-50 transition"
                >
                  Explore Subscriptions
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
      <section className="py-16 px-12 md:px-20 lg:px-24 xl:px-32 2xl:px-40">
        {/* Header */}
        <div className="text-center pt-12 mb-8">
          <div className="inline-block bg-[#12d6fa]  bg-clip-text">
            <p className="text-lg md:text-xl font-medium mb-3 text-transparent bg-clip-text bg-[#12d6fa] ">
              Don't just sparkle water
            </p>
          </div>
          <h2 className="text-4xl md:text-6xl font-semibold bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent mb-4 drop-shadow-lg">
            Sparkle Anything
          </h2>
          <div className="w-24 h-1 bg-[#12d6fa]  mx-auto rounded-full shadow-lg"></div>
        </div>

        <div
          className="mx-auto bg-gradient-to-b from-white to-[#f3f3f3] rounded-2xl relative overflow-hidden"
          style={{ height: "600px" }}
        >
          {/* Main Content with Background Image */}
          <Image
            src="/images/flavor-section-background.png"
            alt="Italian Flavors and Cherry Cola Bottle"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, 1200px"
            priority
            quality={90}
            className="absolute object-cover rounded-2xl"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      </section>

      {/* Horizontal Border */}
      <div className="w-full px-12 md:px-20 lg:px-24 xl:px-32 2xl:px-40 py-8">
        <hr className="border-gray-200" />
      </div>
      {/* New Sections below Flavor Section */}
      <section className="py-8 md:py-16 px-12 md:px-20 lg:px-24 xl:px-32 2xl:px-40 animate-fade-in-up">
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
                className={`text-lg md:text-xl font-semibold text-black mt-6 ${isRTL ? "font-cairo text-right" : "font-montserrat"} group-hover:text-[#12d6fa] transition-colors duration-300`}
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
                className={`text-lg md:text-xl font-semibold text-black mt-6 ${isRTL ? "font-cairo text-right" : "font-montserrat"} group-hover:text-[#12d6fa] transition-colors duration-300`}
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
                className={`text-lg md:text-xl font-semibold text-black mt-6 ${isRTL ? "font-cairo text-right" : "font-montserrat"} group-hover:text-[#12d6fa] transition-colors duration-300`}
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
      <section className="py-8 md:py-16 bg-gradient-to-b from-white to-gray-50/30 px-12 md:px-20 lg:px-24 xl:px-32 2xl:px-40 animate-fade-in-up delay-300">
        <div className="w-full">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12" dir={isRTL ? "rtl" : "ltr"}>
            <p
              className={`text-gray-600 text-base md:text-lg mb-2 font-medium tracking-wide ${isRTL ? "font-noto-arabic" : ""} animate-slide-in-up`}
            >
              {t("home.environmental.subtitle")}
            </p>
            <h2
              className={`text-3xl md:text-4xl font-semibold text-purple-400 ${isRTL ? "font-cairo" : "font-montserrat"} animate-slide-in-up delay-200 tracking-tight leading-tight`}
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
                className={`text-base md:text-lg font-semibold text-gray-800 ${isRTL ? "font-cairo" : "font-montserrat"} group-hover:text-[#12d6fa] transition-all duration-300 tracking-wide leading-relaxed px-2`}
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
                className={`text-base md:text-lg font-semibold text-gray-800 ${isRTL ? "font-cairo" : "font-montserrat"} group-hover:text-[#12d6fa] transition-all duration-300 tracking-wide leading-relaxed px-2`}
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
                className={`text-base md:text-lg font-semibold text-gray-800 ${isRTL ? "font-cairo" : "font-montserrat"} group-hover:text-[#12d6fa] transition-all duration-300 tracking-wide leading-relaxed px-2`}
              >
                {t("home.environmental.healthBenefits")}
              </h3>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
