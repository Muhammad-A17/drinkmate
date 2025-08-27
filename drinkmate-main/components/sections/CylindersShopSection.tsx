import React from "react";
import SaudiRiyal from "@/components/ui/SaudiRiyal";

export const CylindersShopSection = (): JSX.Element => {
  const cylinderProducts = [
    {
      id: 1,
      title: "Cylinder Subscription Service",
      description:
        "A customised service that provides cylinder service as per your needs.",
      priceLabel: "Subscriptions starts from",
      price: "150.00",
    },
    {
      id: 2,
      title: "Refill / Exchange Cylinder",
      description:
        "Refill / exchange your empty cylinder for a full cylinder and only pay for the refill.",
      priceLabel: "Refill / Exchange starts from",
      price: "65.00",
    },
    {
      id: 3,
      title: "New / Spare Cylinder",
      description:
        "Have a spare cylinder so you never run out of sparkling drinks.",
      priceLabel: "Buy a new cylinder just for",
      price: "175.00",
    },
  ];

  return (
    <section className="w-full">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-black font-montserrat mb-4">
          Choose Your Service
        </h2>
        <p className="text-xl text-gray-600 font-noto-sans max-w-2xl mx-auto">
          Select the perfect CO2 service for your needs
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cylinderProducts.map((product) => (
          <article
            key={product.id}
            className="flex flex-col items-center gap-6 p-8 bg-[#f3f3f3] rounded-[20px] h-full"
          >
            <div className="w-full h-48 bg-white rounded-[15px] flex items-center justify-center">
              <div className="w-16 h-16 bg-[#12d6fa]/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[#12d6fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            </div>

            <h3 className="text-xl font-bold text-black text-center font-montserrat">
              {product.title}
            </h3>

            <p className="text-gray-600 text-center font-noto-sans leading-relaxed">
              {product.description}
            </p>

            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium mb-2">
                {product.priceLabel}
              </p>
              <p className="text-2xl font-bold text-black">
                                 <SaudiRiyal amount={parseFloat(product.price)} size="xl" />
              </p>
            </div>

            <button className="w-full bg-[#16d6fa] hover:bg-[#14c4e8] text-white py-3 px-6 rounded-md font-medium transition-colors duration-200">
              Shop Now
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};
