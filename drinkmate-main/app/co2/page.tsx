"use client";

import React from "react";
import { CylindersShopSection } from "@/components/sections/CylindersShopSection";
import { ExchangeProgramSection } from "@/components/sections/ExchangeProgramSection";
import PageLayout from "@/components/layout/PageLayout";
import Footer from "@/components/layout/Footer";
import Image from "next/image";

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
];

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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
  },
  {
    id: 3,
    title: "Quality Assured",
    description: "Premium CO2 with safety guarantee",
    icon: (
      <svg className="w-7 h-7 text-[#12d6fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 4,
    title: "24/7 Support",
    description: "Always here when you need us",
    icon: (
      <svg className="w-7 h-7 text-[#12d6fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
      </svg>
    ),
  },
];

export default function CO2() {
  return (
    <PageLayout currentPage="co2">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-white to-[#f3f3f3] animate-fade-in-up">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-black leading-tight font-montserrat animate-slide-in-left">
                Refill / Exchange
                <br />
                <span className="text-[#12d6fa]">CO2 Cylinders</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-noto-sans animate-slide-in-left delay-200">
                Never let your sparkling run out with our fast and amazing refill / exchange service.
                Get your cylinders refilled or exchange them for full ones instantly.
              </p>
              <div className="flex flex-wrap gap-4 animate-slide-in-left delay-400">
                <button className="bg-[#12d6fa] hover:bg-[#0bc4e8] text-white px-6 py-3 rounded-md font-medium transition-colors duration-200">
                  Get Started
                </button>
                <button className="px-6 py-3 text-gray-600 border border-gray-300 rounded-md font-medium hover:bg-gray-50 transition-colors duration-200">
                  Learn More
                </button>
              </div>
            </div>

            {/* Right illustration */}
            <div className="relative flex justify-center">
              <div className="w-full max-w-sm h-[280px] sm:h-[320px] bg-gradient-to-br from-[#f3f3f3] to-[#e5e5e5] rounded-2xl flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/co2-cylinder-new.png"
                  alt="CO2 Cylinder"
                  width={200}
                  height={300}
                  className="object-contain"
                />
              </div>
            </div>
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
            <h2 className="text-3xl md:text-4xl font-bold text-black font-montserrat mb-4">
              Drinkmate CO2 Benefits
            </h2>
            <p className="text-lg md:text-xl text-gray-600 font-noto-sans max-w-2xl mx-auto">
              Discover why our CO2 service is the best choice for your carbonation needs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.id} className="bg-white rounded-[20px] h-[280px] flex items-center justify-center shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-[#12d6fa]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3 font-montserrat">{benefit.title}</h3>
                  <p className="text-gray-600 text-base leading-relaxed font-noto-sans">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exchange Program Section */}
      <section className="py-16 bg-gradient-to-r from-[#f3f3f3] to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left content */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#12d6fa]/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#12d6fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-black font-montserrat">
                    Exchange Program
                  </h2>
                </div>
                
                <p className="text-lg md:text-xl text-gray-600 font-noto-sans leading-relaxed">
                  Drinkmate's cylinder exchange program lets customers exchange their empty cylinder for a full cylinder and just pay for the refill.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[#12d6fa]/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#12d6fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">Instant exchange service</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[#12d6fa]/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#12d6fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">Pay only for refill cost</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[#12d6fa]/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#12d6fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">Multiple exchange locations</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <a
                    href="#exchange"
                    className="inline-flex items-center gap-2 bg-[#af87ce] hover:bg-[#9a6fb8] text-white px-8 py-4 rounded-md font-medium transition-colors duration-200 text-lg"
                    role="button"
                  >
                    Exchange Now
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </div>
              
              {/* Right visual */}
              <div className="relative flex justify-center">
                <div className="w-full max-w-sm h-[300px] bg-gradient-to-br from-[#f3f3f3] to-[#e5e5e5] rounded-2xl flex items-center justify-center overflow-hidden">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-[#12d6fa]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-[#12d6fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-700">CO2 Exchange</p>
                    <p className="text-sm text-gray-500">Quick & Easy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gradient-to-b from-[#f3f3f3] to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black font-montserrat mb-4">
              How Our CO2 Service Works
            </h2>
            <p className="text-lg md:text-xl text-gray-600 font-noto-sans max-w-2xl mx-auto">
              Simple steps to keep your drinks sparkling
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-[20px] p-8 text-center shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-24 h-24 bg-[#12d6fa]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-[#12d6fa] font-montserrat">1</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-3 font-montserrat">Order or Visit</h3>
              <p className="text-gray-600 text-base leading-relaxed font-noto-sans">Order online or visit our partner locations</p>
            </div>
            
            <div className="bg-white rounded-[20px] p-8 text-center shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-24 h-24 bg-[#12d6fa]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-[#12d6fa] font-montserrat">2</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-3 font-montserrat">Exchange Cylinder</h3>
              <p className="text-gray-600 text-base leading-relaxed font-noto-sans">Hand over your empty cylinder for a full one</p>
            </div>
            
            <div className="bg-white rounded-[20px] p-8 text-center shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-24 h-24 bg-[#12d6fa]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-[#12d6fa] font-montserrat">3</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-3 font-montserrat">Enjoy Sparkling</h3>
              <p className="text-gray-600 text-base leading-relaxed font-noto-sans">Start carbonating your favorite drinks immediately</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <header className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-bold text-black text-3xl md:text-4xl mb-4">
              Cylinders FAQ
            </h2>
            <p className="font-medium text-black text-lg md:text-xl">
              All the answers to your cylinders questions
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {faqCards.map((card) => (
              <div
                key={card.id}
                className="bg-[#f3f3f3] rounded-[20px] p-6 flex flex-col h-full"
              >
                <h3 className="text-lg font-semibold text-black mb-3">
                  {card.question}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {card.answer}
                </p>
              </div>
            ))}
          </div>

          
        </div>
      </section>

      
    
    </PageLayout>
  );
}
