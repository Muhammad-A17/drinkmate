"use client";

import { Disclosure } from "@/components/ui/disclosure";
import { Check, X } from "lucide-react";

interface ProductFeaturesProps {
  product: any;
}

export default function ProductFeatures({ product }: ProductFeaturesProps) {
  // Demo features if product doesn't have them defined
  const features = product.features || [
    {
      name: "Premium Quality",
      description: "Made with high-quality materials for durability and long-lasting performance."
    },
    {
      name: "Easy to Use",
      description: "Simple design with intuitive controls for hassle-free operation."
    },
    {
      name: "Versatile",
      description: "Works with a variety of beverages and carbonation levels."
    },
    {
      name: "Eco-Friendly",
      description: "Reduces plastic waste by eliminating the need for store-bought carbonated beverages."
    }
  ];
  
  // Demo specifications if product doesn't have them defined
  const specifications = product.specifications || {
    "Dimensions": "10 x 5 x 16 inches",
    "Weight": "4.2 pounds",
    "Materials": "BPA-free plastic, stainless steel",
    "Capacity": "1 liter bottle",
    "Warranty": "2-year limited warranty",
    "Package Includes": "Carbonator, 1 CO2 cylinder, 1 reusable bottle"
  };
  
  // Demo compatibility information
  const compatibility = product.compatibility || {
    compatible: ["Standard CO2 cylinders", "All Drinkmate bottles", "Most beverages"],
    notCompatible: ["Non-Drinkmate proprietary parts", "Industrial CO2 tanks"]
  };
  
  return (
    <div className="space-y-8">
      {/* Features section */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Key Features</h3>
        <ul className="space-y-4">
          {features.map((feature: { name: string; description: string }, index: number) => (
            <li key={index} className="flex">
              <div className="flex-shrink-0 mr-3 mt-1">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{feature.name}</p>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Specifications section */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          {Object.entries(specifications).map(([key, value]: [string, any]) => (
            <div key={key} className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-600">{key}</span>
              <span className="text-gray-800 font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Compatibility section */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Compatibility</h3>
        <div className="space-y-4">
          <div>
            <p className="font-medium text-gray-800 mb-2">Compatible with:</p>
            <ul className="space-y-2">
              {compatibility.compatible.map((item: string, index: number) => (
                <li key={index} className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium text-gray-800 mb-2">Not compatible with:</p>
            <ul className="space-y-2">
              {compatibility.notCompatible.map((item: string, index: number) => (
                <li key={index} className="flex items-center">
                  <X className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* FAQs section */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Frequently Asked Questions</h3>
        <div className="space-y-2">
          <Disclosure
            title="How do I set up my Drinkmate device?"
            content="Setting up your Drinkmate is simple! Attach the CO2 cylinder to the carbonator, fill the bottle with your desired beverage, and attach it to the machine. Press the button to carbonate to your desired level."
          />
          <Disclosure
            title="Can I carbonate drinks other than water?"
            content="Yes! Unlike many other carbonators, Drinkmate can carbonate virtually any beverage - water, juice, wine, cocktails, and more."
          />
          <Disclosure
            title="How long does a CO2 cylinder last?"
            content="A standard CO2 cylinder can carbonate approximately 60 liters of beverages, depending on your carbonation level preference."
          />
          <Disclosure
            title="Is the Drinkmate dishwasher safe?"
            content="The bottles are top-rack dishwasher safe. The carbonator unit should be wiped clean with a damp cloth only and never submerged in water."
          />
          <Disclosure
            title="Where can I purchase replacement parts?"
            content="Replacement bottles, CO2 cylinders, and other accessories are available on our website or from authorized retailers."
          />
        </div>
      </div>
    </div>
  );
}
