"use client"
import { CylindersShopSection } from "@/components/sections/CylindersShopSection"
import PageLayout from "@/components/layout/PageLayout"
import Image from "next/image"

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
  return (
    <PageLayout currentPage="co2">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-white to-[#f3f3f3]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold text-black leading-tight tracking-tight font-montserrat">
              Refill / Exchange Cylinders
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-noto-sans">
              Never let your sparkling run out with our fast and amazing refill / exchange service.
            </p>
          </div>
        </div>
      </section>

      {/* Cylinders Shop Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <CylindersShopSection />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-b from-white to-[#f3f3f3]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black font-montserrat mb-4 tracking-tight">
              Drinkmate CO2 Benefits
            </h2>
            <p className="text-lg md:text-xl text-gray-600 font-noto-sans max-w-2xl mx-auto">
              Discover why our CO2 service is the best choice for your carbonation needs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => (
              <div
                key={benefit.id}
                className="bg-white rounded-2xl h-[280px] flex items-center justify-center transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-lg"
              >
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#12d6fa]/20 to-[#12d6fa]/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3 font-montserrat tracking-tight">{benefit.title}</h3>
                  <p className="text-gray-600 text-base leading-relaxed font-noto-sans">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* How It Works Section */}
      <section className="py-16 bg-gradient-to-b from-[#f3f3f3] to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black font-montserrat mb-4 tracking-tight">
              How Our CO2 Service Works
            </h2>
            <p className="text-lg md:text-xl text-gray-600 font-noto-sans max-w-2xl mx-auto">
              Simple steps to keep your drinks sparkling
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-lg">
              <div className="w-24 h-24 bg-gradient-to-br from-[#12d6fa]/20 to-[#12d6fa]/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-[#12d6fa] font-montserrat">1</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-3 font-montserrat tracking-tight">Order or Visit</h3>
              <p className="text-gray-600 text-base leading-relaxed font-noto-sans">
                Order online or visit our partner locations
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-lg">
              <div className="w-24 h-24 bg-gradient-to-br from-[#12d6fa]/20 to-[#12d6fa]/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-[#12d6fa] font-montserrat">2</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-3 font-montserrat tracking-tight">Exchange Cylinder</h3>
              <p className="text-gray-600 text-base leading-relaxed font-noto-sans">
                Hand over your empty cylinder for a full one
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-lg">
              <div className="w-24 h-24 bg-gradient-to-br from-[#12d6fa]/20 to-[#12d6fa]/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-[#12d6fa] font-montserrat">3</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-3 font-montserrat tracking-tight">Enjoy Sparkling</h3>
              <p className="text-gray-600 text-base leading-relaxed font-noto-sans">
                Start carbonating your favorite drinks immediately
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <header className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-bold text-black text-3xl md:text-4xl mb-4 tracking-tight">Cylinders FAQ</h2>
            <p className="font-semibold text-black text-lg md:text-xl">All the answers to your cylinders questions</p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {faqCards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-2xl p-6 flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <h3 className="text-lg font-bold text-black mb-3 tracking-tight">{card.question}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{card.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
