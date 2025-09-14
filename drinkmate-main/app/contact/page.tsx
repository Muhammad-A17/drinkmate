"use client"

import type React from "react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  ChevronDown,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowDown,
  Zap,
} from "lucide-react"
import { useState, useRef } from "react"
import PageLayout from "@/components/layout/PageLayout"
import { useTranslation } from "@/lib/translation-context"
import { contactAPI } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { toArabicNumerals } from "@/lib/utils"
import CustomerChatWidget from "@/components/chat/CustomerChatWidget"

export default function Contact() {
  const { t, isRTL, language } = useTranslation()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.username || "",
    email: user?.email || "",
    subject: "",
    message: "",
    phone: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openFAQ, setOpenFAQ] = useState<number | null>(null) // No FAQ open by default for cleaner initial view
  const [showAllMethods, setShowAllMethods] = useState(false) // Progressive disclosure for contact methods
  const [isChatOpen, setIsChatOpen] = useState(false) // Live chat state

  const formRef = useRef<HTMLElement>(null)
  const faqRef = useRef<HTMLElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const contactData = {
        ...formData,
        userId: user?._id,
      }

      const response = await contactAPI.submitContact(contactData)

      if (response.success) {
        toast.success(t("contact.form.sendMessage") + " " + t("contact.form.title"), {
          duration: 5000,
          icon: <CheckCircle className="h-5 w-5" />,
        })
        // Reset form after success
        setFormData({
          name: user?.username || "",
          email: user?.email || "",
          subject: "",
          message: "",
          phone: "",
        })
      } else {
        toast.error(response.message || t("contact.form.sendMessage") + " " + t("contact.form.title"), {
          duration: 5000,
          icon: <AlertCircle className="h-5 w-5" />,
        })
      }
    } catch (err: any) {
      console.error("Contact form submission error:", err)
      toast.error(err.response?.data?.message || t("contact.form.title"), {
        duration: 5000,
        icon: <AlertCircle className="h-5 w-5" />,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const startNewMessage = () => {
    setFormData({
      name: user?.username || "",
      email: user?.email || "",
      subject: "",
      message: "",
      phone: "",
    })
  }

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <PageLayout currentPage="contact">
      {/* Hero Section with Quick Actions */}
      <section className="relative py-8 md:py-16 bg-white animate-fade-in-up overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://res.cloudinary.com/dw2h8hejn/image/upload/v1757148169/javier-balseiro-EjJ7ffSd8iA-unsplash_xpsedo.webp"
            alt="Contact Us Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="text-center space-y-4 md:space-y-6">
            <h1
              className={`text-3xl md:text-5xl font-bold text-white leading-tight ${isRTL ? "font-cairo" : "font-montserrat"} animate-slide-in-up tracking-tight`}
            >
              {t("contact.title")}
            </h1>
            <p
              className={`text-base md:text-xl text-gray-200 max-w-3xl mx-auto ${isRTL ? "font-noto-arabic" : "font-noto-sans"} animate-slide-in-up delay-200 leading-relaxed`}
            >
              {t("contact.description")}
            </p>

         
          </div>
        </div>
      </section>

      {/* Quick Contact Methods */}
      <section className="py-8 md:py-16 bg-white animate-fade-in-up">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8">
            {/* Live Chat */}
            <div className="text-center p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#12d6fa]/10 via-[#12d6fa]/5 to-white border border-[#12d6fa]/20 shadow-xl animate-fade-in-up group cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-3 hover:shadow-2xl backdrop-blur-sm">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-[#12d6fa] to-[#0bc4e8] rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <MessageCircle className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3
                className={`text-lg md:text-xl font-bold text-black mb-3 md:mb-4 ${isRTL ? "font-cairo" : "font-montserrat"} tracking-tight`}
              >
                Live Chat Support
              </h3>
              <p
                className={`text-gray-600 text-sm md:text-base mb-3 md:mb-4 ${isRTL ? "font-noto-arabic" : "font-noto-sans"} leading-relaxed`}
              >
                Get instant help from our support team
              </p>
              <Button
                onClick={() => {
                  if (!user) {
                    toast.error('Please login to use live chat')
                    return
                  }
                  setIsChatOpen(true)
                }}
                className="bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] hover:from-[#0bc4e8] hover:to-[#09b3d6] text-white px-6 py-2 font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                Start Live Chat
              </Button>
              <p className="text-xs md:text-sm text-gray-500 font-medium mt-2">Available 9 AM - 12 AM Saudi Time</p>
            </div>

            {/* Phone Support */}
            <div className="text-center p-6 md:p-8 rounded-2xl bg-white shadow-xl animate-fade-in-up delay-200 group cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-3 hover:shadow-2xl border border-gray-100">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <Phone className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3
                className={`text-lg md:text-xl font-bold text-black mb-3 md:mb-4 ${isRTL ? "font-cairo" : "font-montserrat"} tracking-tight`}
              >
                {t("contact.phoneSupport.title")}
              </h3>
              <p
                className={`text-gray-600 text-sm md:text-base mb-3 md:mb-4 ${isRTL ? "font-noto-arabic" : "font-noto-sans"} leading-relaxed`}
              >
                {t("contact.phoneSupport.description")}
              </p>
              <p className="text-xl md:text-2xl font-bold text-[#12d6fa] tracking-tight">{language === 'AR' ? toArabicNumerals('+966 50 123 4567') : '+966 50 123 4567'}</p>
              <p className="text-xs md:text-sm text-gray-500 font-medium">{t("contact.phoneSupport.hours")}</p>
            </div>

            {/* Email Support */}
            <div className="text-center p-6 md:p-8 rounded-2xl bg-white shadow-xl animate-fade-in-up delay-300 group cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-3 hover:shadow-2xl border border-gray-100">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-[#a8f387] to-[#96e075] rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <Mail className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3
                className={`text-lg md:text-xl font-bold text-black mb-3 md:mb-4 ${isRTL ? "font-cairo" : "font-montserrat"} tracking-tight`}
              >
                {t("contact.emailSupport.title")}
              </h3>
              <p
                className={`text-gray-600 text-sm md:text-base mb-3 md:mb-4 ${isRTL ? "font-noto-arabic" : "font-noto-sans"} leading-relaxed`}
              >
                {t("contact.emailSupport.description")}
              </p>
              <Button
                onClick={() => scrollToSection(formRef)}
                className="bg-gradient-to-r from-[#a8f387] to-[#96e075] hover:from-[#96e075] hover:to-[#84d663] text-white px-6 py-2 font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                {t("contact.form.sendMessage")}
              </Button>
            </div>
          </div>

          {!showAllMethods && (
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setShowAllMethods(true)}
                className="text-[#12d6fa] hover:text-[#0bc4e8] hover:bg-[#12d6fa]/10 flex items-center gap-2 mx-auto font-semibold px-6 py-3 rounded-xl transition-all duration-300"
              >
                {t("contact.offices.title")}
                <ArrowDown className="w-4 h-4" />
              </Button>
            </div>
          )}

          {showAllMethods && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 animate-fade-in-up">
              <div className="text-center p-6 md:p-8 rounded-2xl bg-white shadow-xl group cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-3 hover:shadow-2xl border border-gray-100">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <MapPin className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3
                  className={`text-lg md:text-xl font-bold text-black mb-3 md:mb-4 ${isRTL ? "font-cairo" : "font-montserrat"} tracking-tight`}
                >
                  {t("contact.officeLocation.title")}
                </h3>
                <p
                  className={`text-gray-600 text-sm md:text-base mb-3 md:mb-4 ${isRTL ? "font-noto-arabic" : "font-noto-sans"} leading-relaxed`}
                >
                  {t("contact.officeLocation.description")}
                </p>
                <p className="text-sm text-gray-700 font-medium">
                  {t("contact.offices.riyadh.address")}
                </p>
                <p className="text-xs md:text-sm text-gray-500 font-medium">
                  {t("contact.officeLocation.appointment")}
                </p>
              </div>

              <div className="text-center p-6 md:p-8 rounded-2xl bg-white shadow-xl group cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-3 hover:shadow-2xl border border-gray-100">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-[#12d6fa] to-[#0bc4e8] rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <Phone className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3
                  className={`text-lg md:text-xl font-bold text-black mb-3 md:mb-4 ${isRTL ? "font-cairo" : "font-montserrat"} tracking-tight`}
                >
                  {t("contact.phoneSupport.title")}
                </h3>
                <p
                  className={`text-gray-600 text-sm md:text-base mb-3 md:mb-4 ${isRTL ? "font-noto-arabic" : "font-noto-sans"} leading-relaxed`}
                >
                  {t("contact.phoneSupport.description")}
                </p>
                <p className="text-xl md:text-2xl font-bold text-[#12d6fa] tracking-tight">{language === 'AR' ? toArabicNumerals('+966 50 123 4567') : '+966 50 123 4567'}</p>
                <p className="text-xs md:text-sm text-gray-500 font-medium">{t("contact.phoneSupport.hours")}</p>
              </div>

              <div className="text-center p-6 md:p-8 rounded-2xl bg-white shadow-xl group cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-3 hover:shadow-2xl border border-gray-100">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-[#a8f387] to-[#96e075] rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <Mail className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3
                  className={`text-lg md:text-xl font-bold text-black mb-3 md:mb-4 ${isRTL ? "font-cairo" : "font-montserrat"} tracking-tight`}
                >
                  {t("contact.emailSupport.title")}
                </h3>
                <p
                  className={`text-gray-600 text-sm md:text-base mb-3 md:mb-4 ${isRTL ? "font-noto-arabic" : "font-noto-sans"} leading-relaxed`}
                >
                  {t("contact.emailSupport.description")}
                </p>
                <p className="text-base md:text-lg font-bold text-[#a8f387]">support@drinkmate.com</p>
                <p className="text-xs md:text-sm text-gray-500 font-medium">{t("contact.emailSupport.response")}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Contact Form */}
      <section ref={formRef} className="py-8 md:py-16 bg-white animate-fade-in-up">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-100">
            <div className="text-center mb-6 md:mb-8">
              <h2
                className={`text-2xl md:text-3xl font-bold text-black mb-3 md:mb-4 ${isRTL ? "font-cairo" : "font-montserrat"} animate-slide-in-up tracking-tight`}
              >
                {t("contact.form.title")}
              </h2>
              <p
                className={`text-gray-600 text-sm md:text-base ${isRTL ? "font-noto-arabic" : "font-noto-sans"} animate-slide-in-up delay-200 leading-relaxed`}
              >
                {t("contact.form.subtitle")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("contact.form.fullName")}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa] transition-all duration-300 hover:border-gray-300 font-medium"
                    placeholder={t("contact.form.placeholders.fullName")}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("contact.form.email")}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa] transition-all duration-300 hover:border-gray-300 font-medium"
                    placeholder={t("contact.form.placeholders.email")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("contact.form.subject")}
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa] transition-all duration-300 hover:border-gray-300 font-medium"
                  >
                    <option value="">{t("contact.form.placeholders.subject")}</option>
                    <option value="general">{t("contact.form.subjects.general")}</option>
                    <option value="product">{t("contact.form.subjects.product")}</option>
                    <option value="support">{t("contact.form.subjects.support")}</option>
                    <option value="order">{t("contact.form.subjects.order")}</option>
                    <option value="refund">{t("contact.form.subjects.refund")}</option>
                    <option value="other">{t("contact.form.subjects.other")}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("contact.form.phone")} <span className="text-gray-500 font-normal">({t("contact.form.optional")})</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa] transition-all duration-300 hover:border-gray-300 font-medium"
                    placeholder={t("contact.form.placeholders.phone")}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("contact.form.message")}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#12d6fa] focus:border-[#12d6fa] transition-all duration-300 hover:border-gray-300 resize-vertical font-medium"
                  placeholder={t("contact.form.placeholders.message")}
                ></textarea>
              </div>

              <div className="text-center">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[#12d6fa] to-[#0bc4e8] hover:from-[#0bc4e8] hover:to-[#09b3d6] text-white px-8 py-3 text-base md:text-lg font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t("contact.form.sending")}
                    </>
                  ) : (
                    t("contact.form.sendMessage")
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section ref={faqRef} className="py-8 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2
              className={`text-2xl md:text-4xl font-bold text-black mb-4 ${isRTL ? "font-cairo" : "font-montserrat"} tracking-tight`}
            >
              {t("contact.faq.title")}
            </h2>
            <p
              className={`text-gray-600 text-base md:text-lg ${isRTL ? "font-noto-arabic" : "font-noto-sans"} leading-relaxed`}
            >
              {t("contact.faq.subtitle")}
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: t("contact.faq.questions.q1"),
                answer: t("contact.faq.questions.a1"),
              },
              {
                question: t("contact.faq.questions.q2"),
                answer: t("contact.faq.questions.a2"),
              },
              {
                question: t("contact.faq.questions.q3"),
                answer: t("contact.faq.questions.a3"),
              },
              {
                question: t("contact.faq.questions.q4"),
                answer: t("contact.faq.questions.a4"),
              },
              {
                question: t("contact.faq.questions.q5"),
                answer: t("contact.faq.questions.a5"),
              },
              {
                question: t("contact.faq.questions.q6"),
                answer: t("contact.faq.questions.a6"),
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="border-2 border-gray-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className={`w-full px-6 py-4 text-left flex items-center justify-between transition-all duration-300 ${
                    openFAQ === index
                      ? "bg-gradient-to-r from-[#12d6fa]/10 to-[#12d6fa]/5 border-l-4 border-l-[#12d6fa]"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`font-semibold text-sm md:text-base transition-colors duration-300 ${
                      openFAQ === index ? "text-[#12d6fa]" : "text-black"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 transition-all duration-300 ${
                      openFAQ === index ? "rotate-180 text-[#12d6fa]" : "text-gray-500"
                    }`}
                  />
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-4 bg-gradient-to-r from-[#12d6fa]/5 to-transparent animate-fade-in-up">
                    <p className="text-gray-700 text-sm md:text-base leading-relaxed font-medium">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-8 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2
              className={`text-2xl md:text-4xl font-bold text-black mb-4 ${isRTL ? "font-cairo" : "font-montserrat"} tracking-tight`}
            >
              {t("contact.offices.title")}
            </h2>
            <p
              className={`text-gray-600 text-base md:text-lg ${isRTL ? "font-noto-arabic" : "font-noto-sans"} leading-relaxed`}
            >
              {t("contact.offices.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <MapPin className="w-6 h-6 text-[#12d6fa] mr-3" />
                <h3
                  className={`text-lg md:text-xl font-bold text-black ${isRTL ? "font-cairo" : "font-montserrat"} tracking-tight`}
                >
                  {t("contact.offices.riyadh.title")}
                </h3>
              </div>
              <p className="text-gray-600 text-sm md:text-base mb-4 font-medium leading-relaxed">
                {t("contact.offices.riyadh.address")}
              </p>
              <div className="space-y-2 text-sm md:text-base">
                <p className="flex items-center font-medium">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  {t("contact.offices.riyadh.hours")}
                </p>
                <p className="flex items-center font-medium">
                  <Phone className="w-4 h-4 mr-2 text-gray-500" />
                  {t("contact.offices.riyadh.phone")}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <MapPin className="w-6 h-6 text-[#a8f387] mr-3" />
                <h3
                  className={`text-lg md:text-xl font-bold text-black ${isRTL ? "font-cairo" : "font-montserrat"} tracking-tight`}
                >
                  {t("contact.offices.jeddah.title")}
                </h3>
              </div>
              <p className="text-gray-600 text-sm md:text-base mb-4 font-medium leading-relaxed">
                {t("contact.offices.jeddah.address")}
              </p>
              <div className="space-y-2 text-sm md:text-base">
                <p className="flex items-center font-medium">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  {t("contact.offices.jeddah.hours")}
                </p>
                <p className="flex items-center font-medium">
                  <Phone className="w-4 h-4 mr-2 text-gray-500" />
                  {t("contact.offices.jeddah.phone")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Chat Widget */}
      <CustomerChatWidget 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </PageLayout>
  )
}
