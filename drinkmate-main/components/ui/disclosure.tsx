"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

interface DisclosureProps {
  title: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
}

export function Disclosure({ title, content, defaultOpen = false }: DisclosureProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <button
        type="button"
        className="flex justify-between items-center w-full p-4 text-left font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#12d6fa] focus:ring-inset"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen ? "true" : "false"}
      >
        <span>{title}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="p-4 pt-0 border-t border-gray-200 text-gray-600">
          {content}
        </div>
      )}
    </div>
  );
}
