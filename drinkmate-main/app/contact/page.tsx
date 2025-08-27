"use client"

import type React from "react"

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

export default function Contact() {
  const { t, isRTL } = useTranslation()
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
        toast.success("Your message has been sent successfully! We'll get back to you soon.", {
          duration: 5000,
          icon: <CheckCircle className="h-5 w-5" />
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
        toast.error(response.message || "Failed to send message. Please try again.", {
          duration: 5000,
          icon: <AlertCircle className="h-5 w-5" />
        })
      }
    } catch (err: any) {
      console.error("Contact form submission error:", err)
      toast.error(err.response?.data?.message || "An error occurred. Please try again later.", {
        duration: 5000,
        icon: <AlertCircle className="h-5 w-5" />
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
      <section className="py-8 md:py-16 bg-gradient-to-b from-white to-[#f3f3f3] animate-fade-in-up">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-4 md:space-y-6">
            <h1
              className={`text-3xl md:text-5xl font-bold text-black leading-tight ${isRTL ? "font-cairo" : "font-montserrat"} animate-slide-in-up`}
            >
              {t("contact.title")}
            </h1>
            <p
              className={`text-base md:text-xl text-gray-600 max-w-3xl mx-auto ${isRTL ? "font-noto-arabic" : "font-noto-sans"} animate-slide-in-up delay-200`}
            >
              {t("contact.description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 animate-slide-in-up delay-400">
              <Button
                onClick={() => scrollToSection(formRef)}
                className="bg-[#12d6fa] hover:bg-[#0bc4e8] text-white px-8 py-3 text-lg font-medium transition-all duration-200 hover:shadow-md flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Send Message
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open("tel:+966501234567")}
                className="border-[#12d6fa] text-[#12d6fa] hover:bg-[#12d6fa] hover:text-white px-8 py-3 text-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Call Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact Methods */}
      <section className="py-8 md:py-16 bg-white animate-fade-in-up">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
            <div className="text-center p-6 md:p-8 rounded-3xl bg-gradient-to-b from-[#12d6fa]/10 to-[#12d6fa]/5 border-2 border-[#12d6fa]/20 shadow-lg animate-fade-in-up group cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-[#12d6fa] rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3
                className={`text-lg md:text-xl font-bold text-black mb-3 md:mb-4 ${isRTL ? "font-cairo" : "font-montserrat"}`}
              >
                Urgent Support
              </h3>
              <p
                className={`text-gray-600 text-sm md:text-base mb-3 md:mb-4 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
              >
                Need immediate help? Call us directly
              </p>
              <p className="text-xl md:text-2xl font-bold text-[#12d6fa]">+966 50 123 4567</p>
              <p className="text-xs md:text-sm text-gray-500">Available 24/7</p>
            </div>

            <div className="text-center p-6 md:p-8 rounded-3xl bg-gradient-to-b from-white to-[#f3f3f3] shadow-lg animate-fade-in-up delay-200 group cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-[#a8f387] rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3
                className={`text-lg md:text-xl font-bold text-black mb-3 md:mb-4 ${isRTL ? "font-cairo" : "font-montserrat"}`}
              >
                General Inquiries
              </h3>
              <p
                className={`text-gray-600 text-sm md:text-base mb-3 md:mb-4 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
              >
                Send us a detailed message below
              </p>
              <Button
                onClick={() => scrollToSection(formRef)}
                className="bg-[#a8f387] hover:bg-[#96e075] text-white px-6 py-2"
              >
                Send Message
              </Button>
            </div>
          </div>

          {!showAllMethods && (
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setShowAllMethods(true)}
                className="text-[#12d6fa] hover:text-[#0bc4e8] flex items-center gap-2 mx-auto"
              >
                View More Contact Options
                <ArrowDown className="w-4 h-4" />
              </Button>
            </div>
          )}

          {showAllMethods && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 animate-fade-in-up">
              <div className="text-center p-6 md:p-8 rounded-3xl bg-gradient-to-b from-white to-[#f3f3f3] shadow-lg group cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3
                  className={`text-lg md:text-xl font-bold text-black mb-3 md:mb-4 ${isRTL ? "font-cairo" : "font-montserrat"}`}
                >
                  {t("contact.officeLocation.title")}
                </h3>
                <p
                  className={`text-gray-600 text-sm md:text-base mb-3 md:mb-4 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                >
                  {t("contact.officeLocation.description")}
                </p>
                <p className="text-sm text-gray-700">
                  King Fahd Road, Riyadh
                  <br />
                  Saudi Arabia
                </p>
                <p className="text-xs md:text-sm text-gray-500">{t("contact.officeLocation.appointment")}</p>
              </div>

              <div className="text-center p-6 md:p-8 rounded-3xl bg-gradient-to-b from-white to-[#f3f3f3] shadow-lg group cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#12d6fa] rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3
                  className={`text-lg md:text-xl font-bold text-black mb-3 md:mb-4 ${isRTL ? "font-cairo" : "font-montserrat"}`}
                >
                  {t("contact.phoneSupport.title")}
                </h3>
                <p
                  className={`text-gray-600 text-sm md:text-base mb-3 md:mb-4 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                >
                  {t("contact.phoneSupport.description")}
                </p>
                <p className="text-xl md:text-2xl font-bold text-[#12d6fa]">+966 50 123 4567</p>
                <p className="text-xs md:text-sm text-gray-500">{t("contact.phoneSupport.hours")}</p>
              </div>

              <div className="text-center p-6 md:p-8 rounded-3xl bg-gradient-to-b from-white to-[#f3f3f3] shadow-lg group cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#a8f387] rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3
                  className={`text-lg md:text-xl font-bold text-black mb-3 md:mb-4 ${isRTL ? "font-cairo" : "font-montserrat"}`}
                >
                  {t("contact.emailSupport.title")}
                </h3>
                <p
                  className={`text-gray-600 text-sm md:text-base mb-3 md:mb-4 ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}
                >
                  {t("contact.emailSupport.description")}
                </p>
                <p className="text-base md:text-lg font-semibold text-[#a8f387]">support@drinkmate.com</p>
                <p className="text-xs md:text-sm text-gray-500">{t("contact.emailSupport.response")}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Contact Form */}
      <section ref={formRef} className="py-8 md:py-16 bg-[#f3f3f3] animate-fade-in-up">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg">
            <div className="text-center mb-6 md:mb-8">
              <h2
                className={`text-2xl md:text-3xl font-bold text-black mb-3 md:mb-4 ${isRTL ? "font-cairo" : "font-montserrat"} animate-slide-in-up`}
              >
                {t("contact.form.title")}
              </h2>
              <p
                className={`text-gray-600 text-sm md:text-base ${isRTL ? "font-noto-arabic" : "font-noto-sans"} animate-slide-in-up delay-200`}
              >
                {t("contact.form.subtitle")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#12d6fa] focus:border-transparent"
                      placeholder={t("contact.form.placeholders.fullName")}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#12d6fa] focus:border-transparent"
                      placeholder={t("contact.form.placeholders.email")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("contact.form.subject")}
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#12d6fa] focus:border-transparent"
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
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("contact.form.phone")} <span className="text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#12d6fa] focus:border-transparent"
                      placeholder={t("contact.form.placeholders.phone")}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#12d6fa] focus:border-transparent resize-vertical"
                    placeholder={t("contact.form.placeholders.message")}
                  ></textarea>
                </div>

                <div className="text-center">
                  <Button
                    type="submit"
                    className="bg-[#12d6fa] hover:bg-[#0bc4e8] text-white px-8 py-3 text-base md:text-lg font-medium transition-all duration-200 hover:shadow-md"
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
              className={`text-2xl md:text-4xl font-bold text-black mb-4 ${isRTL ? "font-cairo" : "font-montserrat"}`}
            >
              {t("contact.faq.title")}
            </h2>
            <p className={`text-gray-600 text-base md:text-lg ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
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
                className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className={`w-full px-6 py-4 text-left flex items-center justify-between transition-all duration-200 ${
                    openFAQ === index ? "bg-[#12d6fa]/10 border-l-4 border-l-[#12d6fa]" : "hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`font-medium text-sm md:text-base transition-colors duration-200 ${
                      openFAQ === index ? "text-[#12d6fa] font-semibold" : "text-black"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 transition-all duration-200 ${
                      openFAQ === index ? "rotate-180 text-[#12d6fa]" : "text-gray-500"
                    }`}
                  />
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-4 bg-[#12d6fa]/5 animate-fade-in-up">
                    <p className="text-gray-700 text-sm md:text-base leading-relaxed">{faq.answer}</p>
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
              className={`text-2xl md:text-4xl font-bold text-black mb-4 ${isRTL ? "font-cairo" : "font-montserrat"}`}
            >
              {t("contact.offices.title")}
            </h2>
            <p className={`text-gray-600 text-base md:text-lg ${isRTL ? "font-noto-arabic" : "font-noto-sans"}`}>
              {t("contact.offices.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-[#f3f3f3] rounded-2xl p-6 md:p-8">
              <div className="flex items-center mb-4">
                <MapPin className="w-6 h-6 text-[#12d6fa] mr-3" />
                <h3 className={`text-lg md:text-xl font-bold text-black ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                  {t("contact.offices.riyadh.title")}
                </h3>
              </div>
              <p className="text-gray-600 text-sm md:text-base mb-4">{t("contact.offices.riyadh.address")}</p>
              <div className="space-y-2 text-sm md:text-base">
                <p className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  {t("contact.offices.riyadh.hours")}
                </p>
                <p className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-500" />
                  {t("contact.offices.riyadh.phone")}
                </p>
              </div>
            </div>

            <div className="bg-[#f3f3f3] rounded-2xl p-6 md:p-8">
              <div className="flex items-center mb-4">
                <MapPin className="w-6 h-6 text-[#a8f387] mr-3" />
                <h3 className={`text-lg md:text-xl font-bold text-black ${isRTL ? "font-cairo" : "font-montserrat"}`}>
                  {t("contact.offices.jeddah.title")}
                </h3>
              </div>
              <p className="text-gray-600 text-sm md:text-base mb-4">{t("contact.offices.jeddah.address")}</p>
              <div className="space-y-2 text-sm md:text-base">
                <p className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  {t("contact.offices.jeddah.hours")}
                </p>
                <p className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-500" />
                  {t("contact.offices.jeddah.phone")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
