"use client"
import { useState } from "react"
import SaudiRiyal from "@/components/ui/SaudiRiyal"

const cylinderServices = [
  {
    id: 1,
    title: "Cylinder Subscription Service",
    description: "A customised service that provides cylinder service as per your needs.",
    price: "150.00",
    currency: "ê",
    buttonText: "Shop Now",
    type: "subscription",
  },
  {
    id: 2,
    title: "Refill / Exchange Cylinder",
    description: "Refill / exchange your empty cylinder for a full cylinder and only pay for the refill.",
    price: "65.00",
    currency: "ê",
    buttonText: "Shop Now",
    type: "refill",
  },
  {
    id: 3,
    title: "New / Spare Cylinder",
    description: "Have a spare cylinder so you never run out of sparkling drinks.",
    price: "175.00",
    currency: "ê",
    buttonText: "Shop Now",
    type: "new",
  },
]

export function CylindersShopSection() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-black font-montserrat mb-4 tracking-tight">
          Shop CO2 Cylinders
        </h2>
        <p className="text-lg md:text-xl text-gray-600 font-noto-sans max-w-2xl mx-auto">
          Choose the perfect CO2 solution for your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cylinderServices.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-lg"
            onMouseEnter={() => setHoveredCard(service.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="text-center space-y-6">
              <div className="w-56 h-56 bg-white rounded-2xl flex items-center justify-center mx-auto overflow-hidden">
                <img 
                  src={service.type === "subscription" 
                    ? "/images/02 - Soda Makers/Artic-Black-Machine---Front.png"
                    : service.type === "refill" 
                      ? "/images/02 - Soda Makers/Purple-Machine---Front.png" 
                      : "/images/02 - Soda Makers/Artic-Black-Machine---Front.png"
                  } 
                  alt={service.title}
                  className="w-40 h-40 object-contain"
                />
              </div>

              <div>
                <h3 className="text-xl font-bold text-black mb-3 font-montserrat tracking-tight">{service.title}</h3>
                <p className="text-gray-600 text-base leading-relaxed font-noto-sans mb-6">{service.description}</p>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">
                    {service.type === "subscription"
                      ? "Subscriptions starts from"
                      : service.type === "refill"
                        ? "Refill / Exchange starts from"
                        : "Buy a new cylinder just for"}
                  </p>
                  <div className="text-3xl font-bold text-black font-montserrat">
                    <SaudiRiyal amount={parseFloat(service.price)} size="sm" />
                  </div>
                </div>

                <button
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform ${
                    hoveredCard === service.id
                      ? "bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] text-white scale-105 shadow-xl"
                      : "bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] text-white hover:scale-105 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {service.buttonText}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
