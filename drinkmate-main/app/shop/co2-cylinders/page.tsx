"use client"
import { CylindersShopSection } from "@/components/sections/CylindersShopSection"
import PageLayout from "@/components/layout/PageLayout"
import Image from "next/image"
import { useTranslation } from "@/lib/translation-context"

const faqCards = [
  {
    id: 1,
    question: "How do I exchange my empty CO2 cylinder?",
    answer:
      "Simply bring your empty cylinder to one of our partner locations or order an exchange online. You'll receive a full one instantly.",
  },
  {
    id: 2,
    question: "How long does delivery take?",
    answer:
      "Delivery typically takes 1–2 business days depending on your location. Same-day service is available in select areas.",
  },
  {
    id: 3,
    question: "Are your CO2 cylinders safe?",
    answer:
      "Yes. All of our CO2 cylinders go through strict quality checks and meet international safety standards before being refilled and reused.",
  },
  {
    id: 4,
    question: "How many liters of soda can one cylinder make?",
    answer:
      "On average, one 60L CO2 cylinder can carbonate up to 60 liters of sparkling water depending on your preferred level of carbonation.",
  },
]

const benefits = [
  {
    id: 1,
    title: "Fast Service",
    description: "Quick refill and exchange",
    icon: (
      <svg className="w-7 h-7 text-[#12d6fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Cost Effective",
    description: "Save money with our exchange program",
    icon: (
      <svg className="w-7 h-7 text-[#12d6fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
        />
      </svg>
    ),
  },
  {
    id: 3,
    title: "Quality Assured",
    description: "Premium CO2 with safety guarantee",
    icon: (
      <svg className="w-7 h-7 text-[#12d6fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    id: 4,
    title: "24/7 Support",
    description: "Always here when you need us",
    icon: (
      <svg className="w-7 h-7 text-[#12d6fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"
        />
      </svg>
    ),
  },
]

export default function CO2() {
  const { isRTL } = useTranslation()

  return (
    <PageLayout currentPage="shop">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 bg-white animate-fade-in-up overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1757151268/banner-5185319_ntnjqe.jpg"
            alt="CO2 Cylinders Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4">
          <div className="text-center space-y-4 sm:space-y-6">
            <h1
              className={`text-2xl sm:text-3xl md:text-5xl font-bold text-white leading-tight ${isRTL ? "font-cairo" : "font-montserrat"} animate-slide-in-up tracking-tight`}
            >
              Refill / Exchange Cylinders
            </h1>
            <p
              className={`text-sm sm:text-base md:text-xl text-gray-200 max-w-3xl mx-auto ${isRTL ? "font-noto-arabic" : "font-noto-sans"} animate-slide-in-up delay-200 leading-relaxed`}
            >
              Never let your sparkling run out with our fast and amazing refill / exchange service.
            </p>
          </div>
        </div>
      </section>

      {/* Shop CO2 Cylinders Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-[#f3f3f3]">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <CylindersShopSection type="all" />
        </div>
      </section>

      {/* Exchange Cylinders Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <CylindersShopSection type="exchange" />
        </div>
      </section>

      {/* Refill Cylinders Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <CylindersShopSection type="refill" />
        </div>
      </section>
    
      {/* FAQ Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <header className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <h2 className="font-bold text-black text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4 tracking-tight">Cylinders FAQ</h2>
            <p className="font-semibold text-black text-base sm:text-lg md:text-xl">All the answers to your cylinders questions</p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {faqCards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-gray-100"
              >
                <h3 className="text-base sm:text-lg font-bold text-black mb-2 sm:mb-3 tracking-tight">{card.question}</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{card.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </PageLayout>
  )
}
