"use client";

import { useState } from 'react';

export default function TestFontsPage() {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Font Testing Page
        </h1>
        
        <div className="mb-8">
          <button
            onClick={toggleLanguage}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Switch to {language === 'en' ? 'Arabic' : 'English'}
          </button>
        </div>

        <div className="space-y-8">
          {/* Primary Font Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Primary Font (Montserrat/Cairo)
            </h2>
            <div className="space-y-2">
              <p className="text-lg font-primary">
                This is primary font text - {language === 'en' ? 'English text' : 'نص عربي'}
              </p>
              <p className="text-base font-primary">
                Regular weight - {language === 'en' ? 'Regular text' : 'نص عادي'}
              </p>
              <p className="text-base font-primary font-semibold">
                Semibold weight - {language === 'en' ? 'Semibold text' : 'نص سميك'}
              </p>
              <p className="text-base font-primary font-bold">
                Bold weight - {language === 'en' ? 'Bold text' : 'نص عريض'}
              </p>
            </div>
          </div>

          {/* Secondary Font Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Secondary Font (Noto Sans/Noto Sans Arabic)
            </h2>
            <div className="space-y-2">
              <p className="text-lg font-secondary">
                This is secondary font text - {language === 'en' ? 'English text' : 'نص عربي'}
              </p>
              <p className="text-base font-secondary">
                Regular weight - {language === 'en' ? 'Regular text' : 'نص عادي'}
              </p>
              <p className="text-base font-secondary font-semibold">
                Semibold weight - {language === 'en' ? 'Semibold text' : 'نص سميك'}
              </p>
            </div>
          </div>

          {/* Direct Font Family Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Direct Font Family Classes
            </h2>
            <div className="space-y-2">
              <p className="text-lg font-montserrat">
                Montserrat font - {language === 'en' ? 'English text' : 'نص عربي'}
              </p>
              <p className="text-lg font-cairo">
                Cairo font - {language === 'en' ? 'English text' : 'نص عربي'}
              </p>
              <p className="text-lg font-noto-sans">
                Noto Sans font - {language === 'en' ? 'English text' : 'نص عربي'}
              </p>
            </div>
          </div>

          {/* CSS Variables Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              CSS Variables Test
            </h2>
            <div className="space-y-2">
              <p style={{ fontFamily: 'var(--font-primary)' }}>
                CSS var(--font-primary) - {language === 'en' ? 'English text' : 'نص عربي'}
              </p>
              <p style={{ fontFamily: 'var(--font-secondary)' }}>
                CSS var(--font-secondary) - {language === 'en' ? 'English text' : 'نص عربي'}
              </p>
            </div>
          </div>

          {/* Font Loading Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Font Loading Status
            </h2>
            <div className="space-y-2 text-sm">
              <p>Check browser developer tools to see if fonts are loading correctly.</p>
              <p>Look for network requests to fonts.googleapis.com or fonts.gstatic.com</p>
              <p>Inspect elements to see which fonts are actually being applied</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
