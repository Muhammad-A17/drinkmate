"use client"

import PageLayout from "@/components/layout/PageLayout"
import { FileText, CheckCircle, AlertTriangle, Users, ShoppingCart, Shield } from "lucide-react"
import { useTranslation } from "@/lib/translation-context"

export default function TermsOfService() {
  const { t, isRTL } = useTranslation()

  return (
    <PageLayout currentPage="terms-of-service">
      <div className="min-h-screen bg-gradient-to-b from-white to-[#f3f3f3] py-16" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#a8f387] rounded-full mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold text-gray-900 mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
              {t('termsOfService.hero.title')}
            </h1>
            <p className={`text-xl text-gray-600 max-w-2xl mx-auto ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
              {t('termsOfService.hero.subtitle')}
            </p>
            <div className="w-24 h-1 bg-[#12d6fa] mx-auto mt-6 rounded-full"></div>
          </div>

          {/* Last Updated */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-12">
            <div className="flex items-center space-x-3 text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className={`font-medium ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>{t('termsOfService.hero.lastUpdated')}</span>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Acceptance of Terms */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className={`text-2xl font-bold text-gray-900 mb-4 flex items-center ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                {t('termsOfService.sections.acceptance.title')}
              </h2>
              <div className={`prose prose-lg text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                <p className="mb-4">
                  {t('termsOfService.sections.acceptance.description')}
                </p>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className={`text-2xl font-bold text-gray-900 mb-4 flex items-center ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                <ShoppingCart className="w-6 h-6 text-[#12d6fa] mr-3" />
                {t('termsOfService.sections.services.title')}
              </h2>
              <div className={`prose prose-lg text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                <p className="mb-4">{t('termsOfService.sections.services.description')}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t('termsOfService.sections.servicesDetails.productSales')}</li>
                  <li>{t('termsOfService.sections.servicesDetails.co2Services')}</li>
                  <li>{t('termsOfService.sections.servicesDetails.customerSupport')}</li>
                  <li>{t('termsOfService.sections.servicesDetails.onlineOrdering')}</li>
                </ul>
              </div>
            </div>

            {/* User Obligations */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className={`text-2xl font-bold text-gray-900 mb-4 flex items-center ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>
                <Users className="w-6 h-6 text-[#12d6fa] mr-3" />
                {t('termsOfService.sections.userObligations.title')}
              </h2>
              <div className={`prose prose-lg text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                <p className="mb-4">{t('termsOfService.sections.userObligations.description')}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t('termsOfService.sections.obligationsDetails.accurateInfo')}</li>
                  <li>{t('termsOfService.sections.obligationsDetails.safeUsage')}</li>
                  <li>{t('termsOfService.sections.obligationsDetails.intellectualProperty')}</li>
                  <li>{t('termsOfService.sections.obligationsDetails.accountSecurity')}</li>
                </ul>
              </div>
            </div>

            {/* Payment Terms */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className={`text-2xl font-bold text-gray-900 mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('termsOfService.sections.payment.title')}</h2>
              <div className={`prose prose-lg text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                <p className="mb-4">{t('termsOfService.sections.payment.description')}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t('termsOfService.sections.paymentDetails.sarPrices')}</li>
                  <li>{t('termsOfService.sections.paymentDetails.paymentMethods')}</li>
                  <li>{t('termsOfService.sections.paymentDetails.orderProcessing')}</li>
                  <li>{t('termsOfService.sections.paymentDetails.refundTiming')}</li>
                </ul>
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className={`text-2xl font-bold text-gray-900 mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('termsOfService.sections.shipping.title')}</h2>
              <div className={`prose prose-lg text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                <p className="mb-4">{t('termsOfService.sections.shipping.description')}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t('termsOfService.sections.shippingDetails.freeShipping')}</li>
                  <li>{t('termsOfService.sections.shippingDetails.standardDelivery')}</li>
                  <li>{t('termsOfService.sections.shippingDetails.expressDelivery')}</li>
                  <li>{t('termsOfService.sections.shippingDetails.localPickup')}</li>
                </ul>
              </div>
            </div>

            {/* Returns */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className={`text-2xl font-bold text-gray-900 mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('termsOfService.sections.returns.title')}</h2>
              <div className={`prose prose-lg text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                <p className="mb-4">{t('termsOfService.sections.returns.description')}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t('termsOfService.sections.returnsDetails.originalCondition')}</li>
                  <li>{t('termsOfService.sections.returnsDetails.freeReturn')}</li>
                  <li>{t('termsOfService.sections.returnsDetails.fullRefund')}</li>
                  <li>{t('termsOfService.sections.returnsDetails.co2NotEligible')}</li>
                </ul>
              </div>
            </div>

            {/* Warranty */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className={`text-2xl font-bold text-gray-900 mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('termsOfService.sections.warranty.title')}</h2>
              <div className={`prose prose-lg text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                <p className="mb-4">{t('termsOfService.sections.warranty.description')}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t('termsOfService.sections.warrantyDetails.sodaMakerWarranty')}</li>
                  <li>{t('termsOfService.sections.warrantyDetails.accessoriesWarranty')}</li>
                  <li>{t('termsOfService.sections.warrantyDetails.manufacturingDefects')}</li>
                  <li>{t('termsOfService.sections.warrantyDetails.normalWear')}</li>
                </ul>
              </div>
            </div>

            {/* Liability */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className={`text-2xl font-bold text-gray-900 mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('termsOfService.sections.liability.title')}</h2>
              <div className={`prose prose-lg text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                <p className="mb-4">{t('termsOfService.sections.liability.description')}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t('termsOfService.sections.liabilityDetails.maxLiability')}</li>
                  <li>{t('termsOfService.sections.liabilityDetails.noIndirectDamages')}</li>
                  <li>{t('termsOfService.sections.liabilityDetails.noMisuseLiability')}</li>
                  <li>{t('termsOfService.sections.liabilityDetails.forceMajeure')}</li>
                </ul>
              </div>
            </div>

            {/* Termination */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className={`text-2xl font-bold text-gray-900 mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('termsOfService.sections.termination.title')}</h2>
              <div className={`prose prose-lg text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                <p className="mb-4">{t('termsOfService.sections.termination.description')}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t('termsOfService.sections.terminationDetails.termsViolation')}</li>
                  <li>{t('termsOfService.sections.terminationDetails.fraudulentActivities')}</li>
                  <li>{t('termsOfService.sections.terminationDetails.nonPayment')}</li>
                  <li>{t('termsOfService.sections.terminationDetails.serviceAbuse')}</li>
                </ul>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className={`text-2xl font-bold text-gray-900 mb-4 ${isRTL ? 'font-cairo' : 'font-montserrat'}`}>{t('termsOfService.sections.contact.title')}</h2>
              <div className={`prose prose-lg text-gray-600 ${isRTL ? 'font-noto-arabic' : 'font-noto-sans'}`}>
                <p className="mb-4">
                  {t('termsOfService.sections.contact.description')}
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p><strong>Email:</strong> {t('termsOfService.sections.contact.email')}</p>
                  <p><strong>Phone:</strong> {t('termsOfService.sections.contact.phone')}</p>
                  <p><strong>Address:</strong> {t('termsOfService.sections.address')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
