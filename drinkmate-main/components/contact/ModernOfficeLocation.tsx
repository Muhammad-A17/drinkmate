"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

export default function OfficeLocationMap() {
  const [mapError, setMapError] = useState(false);

  const handleMapError = () => {
    setMapError(true);
  };

  return (
    <Card className="border-0 shadow-xl overflow-hidden">
      <CardContent className="p-0">
        <div className="relative h-96">
          {!mapError ? (
            <iframe
              title="Office Location Map - As Salamah, Jeddah Saudi Arabia"
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d118705.28384206911!2d39.153901!3d21.603867!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15c3da788bcdab8f%3A0x98a80959d085f39a!2sAs%20Salamah%2C%20Jeddah%20Saudi%20Arabia!5e0!3m2!1sen!2sus!4v1758055262450!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onError={handleMapError}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8 text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Office Location</h3>
              <p className="text-gray-600 mb-4">As Salamah, Jeddah, Saudi Arabia</p>
              <a
                href="https://www.google.com/maps/search/As+Salamah,+Jeddah+Saudi+Arabia"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open in Google Maps
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
