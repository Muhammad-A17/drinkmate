"use client"

import React from "react"
import Image from "next/image"

interface Step {
  id: string
  title: string
  description: string
  image?: string
}

interface HowToUseSection {
  title: string
  steps: Step[]
}

interface HowToUseSectionProps {
  howToUse: HowToUseSection
}

export default function HowToUseSection({ howToUse }: HowToUseSectionProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
      <h2 className="text-xl font-bold text-center mb-6 md:mb-8">{howToUse.title}</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {howToUse.steps.map((step, index) => (
          <div key={step.id} className="relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative h-[200px] sm:h-[220px] md:h-[250px] bg-black">
              <Image
                src={step.image || "/images/placeholder.jpg"}
                alt={step.title}
                fill
                className="object-cover opacity-80"
              />
              <div className="absolute bottom-0 left-0 p-4 sm:p-5 md:p-6 text-white">
                <h3 className="font-bold text-lg sm:text-xl mb-1 sm:mb-2">{step.title}</h3>
                <p className="font-medium text-xs sm:text-sm">
                  {step.description.split("\n").map((line, lineIndex) => (
                    <React.Fragment key={lineIndex}>
                      {line}
                      {lineIndex < step.description.split("\n").length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
