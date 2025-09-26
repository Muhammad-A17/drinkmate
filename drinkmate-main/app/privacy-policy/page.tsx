"use client"

import PageLayout from "@/components/layout/PageLayout"
import { Shield, Lock, Eye, Database, UserCheck } from "lucide-react"
import { useTranslation } from "@/lib/contexts/translation-context"

export default function PrivacyPolicy() {
  const { t, isRTL } = useTranslation()

  return (
    <PageLayout currentPage="privacy-policy">
      <div className="min-h-screen bg-gradient-to-b from-white to-[#f3f3f3] py-16" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#12d6fa] rounded-full mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold text-gray-900 mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              {t('privacyPolicy.hero.title')}
            </h1>
            <p className={`text-xl text-gray-600 max-w-2xl mx-auto ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
              {t('privacyPolicy.hero.subtitle')}
            </p>
            <div className="w-24 h-1 bg-[#a8f387] mx-auto mt-6 rounded-full"></div>
          </div>

          {/* Last Updated */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-12">
            <div className="flex items-center space-x-3 text-gray-600">
              <Lock className="w-5 h-5" />
              <span className={`font-medium ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>{t('privacyPolicy.hero.lastUpdated')}</span>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Information We Collect */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className={`text-2xl font-bold text-gray-900 mb-4 flex items-center ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                <Database className="w-6 h-6 text-[#12d6fa] mr-3" />
                {t('privacyPolicy.sections.informationWeCollect.title')}
              </h2>
              <div className={`prose prose-lg text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                <p className="mb-4">{t('privacyPolicy.sections.informationWeCollect.description')}</p>
                <h3 className={`text-xl font-semibold text-gray-800 mb-3 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('privacyPolicy.sections.informationWeCollect.personalInfo')}</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>{t('privacyPolicy.sections.personalInfoDetails.nameContact')}</li>
                  <li>{t('privacyPolicy.sections.personalInfoDetails.paymentBilling')}</li>
                  <li>{t('privacyPolicy.sections.personalInfoDetails.orderHistory')}</li>
                  <li>{t('privacyPolicy.sections.personalInfoDetails.customerService')}</li>
                </ul>
                
                <h3 className={`text-xl font-semibold text-gray-800 mb-3 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('privacyPolicy.sections.informationWeCollect.usageData')}</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>{t('privacyPolicy.sections.usageDataDetails.ipDevice')}</li>
                  <li>{t('privacyPolicy.sections.usageDataDetails.websiteUsage')}</li>
                  <li>{t('privacyPolicy.sections.usageDataDetails.browserOS')}</li>
                </ul>
                
                <h3 className={`text-xl font-semibold text-gray-800 mb-3 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('privacyPolicy.sections.informationWeCollect.cookies')}</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t('privacyPolicy.sections.cookiesDetails.trackingTech')}</li>
                  <li>{t('privacyPolicy.sections.cookiesDetails.sessionData')}</li>
                  <li>{t('privacyPolicy.sections.cookiesDetails.thirdPartyAnalytics')}</li>
                </ul>
              </div>
            </div>

            {/* How We Use Information */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className={`text-2xl font-bold text-gray-900 mb-4 flex items-center ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                <UserCheck className="w-6 h-6 text-[#12d6fa] mr-3" />
                {t('privacyPolicy.sections.howWeUseInformation.title')}
              </h2>
              <div className={`prose prose-lg text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                <p className="mb-4">{t('privacyPolicy.sections.howWeUseInformation.description')}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t('privacyPolicy.sections.purposesDetails.processOrders')}</li>
                  <li>{t('privacyPolicy.sections.purposesDetails.customerSupport')}</li>
                  <li>{t('privacyPolicy.sections.purposesDetails.updatesMarketing')}</li>
                  <li>{t('privacyPolicy.sections.purposesDetails.improveServices')}</li>
                  <li>{t('privacyPolicy.sections.purposesDetails.securityFraud')}</li>
                </ul>
              </div>
            </div>

            {/* Information Sharing */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className={`text-2xl font-bold text-gray-900 mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('privacyPolicy.sections.informationSharing.title')}</h2>
              <div className={`prose prose-lg text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                <p className="mb-4">
                  {t('privacyPolicy.sections.informationSharing.description')}
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t('privacyPolicy.sections.exceptionsDetails.explicitConsent')}</li>
                  <li>{t('privacyPolicy.sections.exceptionsDetails.legalObligations')}</li>
                  <li>{t('privacyPolicy.sections.exceptionsDetails.protectRights')}</li>
                  <li>{t('privacyPolicy.sections.exceptionsDetails.trustedProviders')}</li>
                </ul>
              </div>
            </div>

            {/* Data Security */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className={`text-2xl font-bold text-gray-900 mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('privacyPolicy.sections.dataSecurity.title')}</h2>
              <div className={`prose prose-lg text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                <p className="mb-4">
                  {t('privacyPolicy.sections.dataSecurity.description')}
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t('privacyPolicy.sections.securityDetails.encryption')}</li>
                  <li>{t('privacyPolicy.sections.securityDetails.securityAssessments')}</li>
                  <li>{t('privacyPolicy.sections.securityDetails.accessControls')}</li>
                  <li>{t('privacyPolicy.sections.securityDetails.secureTransmission')}</li>
                </ul>
              </div>
            </div>

            {/* Your Rights */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className={`text-2xl font-bold text-gray-900 mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('privacyPolicy.sections.yourRights.title')}</h2>
              <div className={`prose prose-lg text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                <p className="mb-4">{t('privacyPolicy.sections.yourRights.description')}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t('privacyPolicy.sections.rightsDetails.accessData')}</li>
                  <li>{t('privacyPolicy.sections.rightsDetails.correctInfo')}</li>
                  <li>{t('privacyPolicy.sections.rightsDetails.deleteData')}</li>
                  <li>{t('privacyPolicy.sections.rightsDetails.optOutMarketing')}</li>
                  <li>{t('privacyPolicy.sections.rightsDetails.dataPortability')}</li>
                </ul>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className={`text-2xl font-bold text-gray-900 mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('privacyPolicy.sections.contactUs.title')}</h2>
              <div className={`prose prose-lg text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                <p className="mb-4">
                  {t('privacyPolicy.sections.contactUs.description')}
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p><strong>Email:</strong> {t('privacyPolicy.sections.contactUs.email')}</p>
                  <p><strong>Phone:</strong> {t('privacyPolicy.sections.contactUs.phone')}</p>
                  <p><strong>Address:</strong> {t('privacyPolicy.sections.address')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
