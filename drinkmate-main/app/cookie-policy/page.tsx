"use client"

import PageLayout from "@/components/layout/PageLayout"
import { Cookie, Settings, Shield, Info, Eye, Trash2 } from "lucide-react"
import { useTranslation } from "@/lib/translation-context"

export default function CookiePolicy() {
  const { t, isRTL } = useTranslation()

  return (
    <PageLayout currentPage="cookie-policy">
      <div className="min-h-screen bg-gradient-to-b from-white to-[#f3f3f3] py-16" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500 rounded-full mb-6">
              <Cookie className="w-10 h-10 text-white" />
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold text-gray-900 mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              {t('cookiePolicy.hero.title')}
            </h1>
            <p className={`text-xl text-gray-600 max-w-2xl mx-auto ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
              {t('cookiePolicy.hero.subtitle')}
            </p>
            <div className="w-24 h-1 bg-[#12d6fa] mx-auto mt-6 rounded-full"></div>
          </div>

          {/* Last Updated */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-12">
            <div className="flex items-center space-x-3 text-gray-600">
              <Info className="w-5 h-5 text-blue-500" />
              <span className={`font-medium ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>{t('cookiePolicy.hero.lastUpdated')}</span>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* What Are Cookies */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className={`text-2xl font-bold text-gray-900 mb-4 flex items-center ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                <Cookie className="w-6 h-6 text-purple-500 mr-3" />
                {t('cookiePolicy.sections.whatAreCookies.title')}
              </h2>
              <div className={`prose prose-lg text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                <p className="mb-4">
                  {t('cookiePolicy.sections.whatAreCookies.description')}
                </p>
              </div>
            </div>

            {/* How We Use Cookies */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className={`text-2xl font-bold text-gray-900 mb-4 flex items-center ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                <Eye className="w-6 h-6 text-[#12d6fa] mr-3" />
                {t('cookiePolicy.sections.howWeUseCookies.title')}
              </h2>
              <div className={`prose prose-lg text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                <p className="mb-4">{t('cookiePolicy.sections.howWeUseCookies.description')}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t('cookiePolicy.sections.purposesDetails.rememberPreferences')}</li>
                  <li>{t('cookiePolicy.sections.purposesDetails.analyzeTraffic')}</li>
                  <li>{t('cookiePolicy.sections.purposesDetails.personalizedContent')}</li>
                  <li>{t('cookiePolicy.sections.purposesDetails.improveFunctionality')}</li>
                  <li>{t('cookiePolicy.sections.purposesDetails.ensureSecurity')}</li>
                </ul>
              </div>
            </div>

            {/* Types of Cookies */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className={`text-2xl font-bold text-gray-900 mb-4 flex items-center ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                <Settings className="w-6 h-6 text-[#12d6fa] mr-3" />
                {t('cookiePolicy.sections.typesOfCookies.title')}
              </h2>
              <div className={`prose prose-lg text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                <h3 className={`text-xl font-semibold text-gray-800 mb-3 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>Essential Cookies</h3>
                <p className="mb-4">
                  {t('cookiePolicy.sections.typesOfCookies.essential')}
                </p>
                
                <h3 className={`text-xl font-semibold text-gray-800 mb-3 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>Analytics Cookies</h3>
                <p className="mb-4">
                  {t('cookiePolicy.sections.typesOfCookies.analytics')}
                </p>
                
                <h3 className={`text-xl font-semibold text-gray-800 mb-3 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>Marketing Cookies</h3>
                <p className="mb-4">
                  {t('cookiePolicy.sections.typesOfCookies.marketing')}
                </p>
                
                <h3 className={`text-xl font-semibold text-gray-800 mb-3 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>Preference Cookies</h3>
                <p>
                  {t('cookiePolicy.sections.typesOfCookies.preferences')}
                </p>
              </div>
            </div>

            {/* Managing Cookies */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className={`text-2xl font-bold text-gray-900 mb-4 flex items-center ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                <Settings className="w-6 h-6 text-[#12d6fa] mr-3" />
                {t('cookiePolicy.sections.managingCookies.title')}
              </h2>
              <div className={`prose prose-lg text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                <p className="mb-4">{t('cookiePolicy.sections.managingCookies.description')}</p>
                <h3 className={`text-xl font-semibold text-gray-800 mb-3 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('cookiePolicy.sections.managingCookies.browser')}</h3>
                <p>
                  {t('cookiePolicy.sections.managingCookies.settings')}
                </p>
              </div>
            </div>

            {/* Third-Party Cookies */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className={`text-2xl font-bold text-gray-900 mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('cookiePolicy.sections.thirdPartyCookies.title')}</h2>
              <div className={`prose prose-lg text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                <p className="mb-4">{t('cookiePolicy.sections.thirdPartyCookies.description')}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t('cookiePolicy.sections.thirdPartyServices.googleAnalytics')}</li>
                  <li>{t('cookiePolicy.sections.thirdPartyServices.facebookPixel')}</li>
                  <li>{t('cookiePolicy.sections.thirdPartyServices.paymentProcessors')}</li>
                  <li>{t('cookiePolicy.sections.thirdPartyServices.socialMedia')}</li>
                </ul>
              </div>
            </div>

            {/* Updates */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className={`text-2xl font-bold text-gray-900 mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('cookiePolicy.sections.updates.title')}</h2>
              <div className={`prose prose-lg text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                <p>
                  {t('cookiePolicy.sections.updates.description')}
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className={`text-2xl font-bold text-gray-900 mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('cookiePolicy.sections.contact.title')}</h2>
              <div className={`prose prose-lg text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                <p className="mb-4">
                  {t('cookiePolicy.sections.contact.description')}
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p><strong>Email:</strong> {t('cookiePolicy.sections.contact.email')}</p>
                  <p><strong>Phone:</strong> +966 50 123 4567</p>
                  <p><strong>Address:</strong> {t('cookiePolicy.sections.address')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
