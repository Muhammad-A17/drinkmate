import React from "react";

export const ExchangeProgramSection = (): JSX.Element => {
  return (
    <section className="w-full text-center">
      <h2 className="text-4xl font-bold text-black font-montserrat mb-6">
        Exchange Program
      </h2>

      <p className="text-xl text-gray-600 font-noto-sans leading-relaxed max-w-2xl mx-auto mb-8">
        Drinkmate&apos;s cylinder exchange program let the customer
        exchange their empty cylinder for a full cylinder and just
        pay for the refill.
      </p>

      <a
        href="#exchange"
        className="inline-block bg-[#af87ce] hover:bg-[#9a6fb8] text-white px-8 py-3 rounded-md font-medium transition-colors duration-200"
        role="button"
      >
        Exchange Now
      </a>
    </section>
  );
};
