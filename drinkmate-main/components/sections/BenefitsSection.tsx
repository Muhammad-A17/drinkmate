import React from "react";

export const BenefitsSection = (): JSX.Element => {
  const benefitCards = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
  ];

  return (
    <section className="w-full">
      <header className="text-center mb-12">
        <h2 className="text-4xl font-bold text-black font-montserrat mb-4">
          Cylinders FAQ
        </h2>

        <p className="text-xl text-gray-600 font-noto-sans">
          All the answers to your cylinders questions
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {benefitCards.map((card) => (
          <div
            key={card.id}
            className="bg-[#f3f3f3] rounded-[20px] h-[300px] flex items-center justify-center"
            role="listitem"
          >
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#12d6fa]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#12d6fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">FAQ Item {card.id}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <a
          href="#"
          className="inline-block bg-[#af87ce] hover:bg-[#9a6fb8] text-white px-8 py-3 rounded-md font-medium transition-colors duration-200"
          aria-label="Learn more about cylinders FAQ"
        >
          Learn More
        </a>
      </div>
    </section>
  );
};
