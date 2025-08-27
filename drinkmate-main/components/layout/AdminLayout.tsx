"use client"

import React, { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/translation-context"
import { useAdminTranslation } from "@/lib/use-admin-translation"
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Package, 
  FileText, 
  BarChart2, 
  Settings, 
  LogOut,
  ChevronDown,
  Menu,
  X,
  Flag,
  Globe,
  MessageSquare,
  FolderOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuth()
  const { isRTL, language, setLanguage } = useTranslation()
  const { t } = useAdminTranslation()

  // Protect admin routes
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user && !user.isAdmin))) {
      router.push("/login?redirect=admin")
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, user, isLoading, router])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  // Navigation items
  const navItems = [
    { 
      name: t("common.dashboard"), 
      href: "/admin", 
      icon: <LayoutDashboard className="w-5 h-5" /> 
    },
    { 
      name: t("common.users"), 
      href: "/admin/users", 
      icon: <Users className="w-5 h-5" /> 
    },
    { 
      name: t("common.products"), 
      href: "/admin/products", 
      icon: <Package className="w-5 h-5" /> 
    },
    { 
      name: "Bundles", 
      href: "/admin/bundles", 
      icon: <Package className="w-5 h-5" /> 
    },
    { 
      name: "Reviews", 
      href: "/admin/reviews", 
      icon: <MessageSquare className="w-5 h-5" /> 
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: <FolderOpen className="w-5 h-5" />
    },
    { 
      name: t("common.orders"), 
      href: "/admin/orders", 
      icon: <ShoppingBag className="w-5 h-5" /> 
    },
    { 
      name: "CO2 Cylinders", 
      href: "/admin/co2-cylinders", 
      icon: <Package className="w-5 h-5" /> 
    },
    { 
      name: "Refill Cylinders", 
      href: "/admin/refill-cylinders", 
      icon: <Package className="w-5 h-5" /> 
    },
    { 
      name: "CO2 Orders", 
      href: "/admin/co2-orders", 
      icon: <ShoppingBag className="w-5 h-5" /> 
    },
    { 
      name: "Blog", 
      href: "/admin/blog", 
      icon: <FileText className="w-5 h-5" /> 
    },
    { 
      name: "Testimonials", 
      href: "/admin/testimonials", 
      icon: <FileText className="w-5 h-5" /> 
    },
    { 
      name: "Contact", 
      href: "/admin/contact", 
      icon: <FileText className="w-5 h-5" /> 
    },
    { 
      name: t("common.content"), 
      href: "/admin/content", 
      icon: <FileText className="w-5 h-5" /> 
    },
    { 
      name: t("common.analytics"), 
      href: "/admin/analytics", 
      icon: <BarChart2 className="w-5 h-5" /> 
    },
    { 
      name: t("common.settings"), 
      href: "/admin/settings", 
      icon: <Settings className="w-5 h-5" /> 
    },
  ]

  // If loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#12d6fa]" />
        <span className="ml-2">{t("common.loading")}</span>
      </div>
    )
  }

  // If not admin, show error
  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto py-12">
        <Alert variant="destructive">
          <AlertDescription>You do not have permission to access this page</AlertDescription>
        </Alert>
        <Button 
          className="mt-4" 
          onClick={() => router.push("/")}
        >
          Return to Homepage
        </Button>
      </div>
    )
  }

  return (
    <div className={`flex h-screen bg-gray-100 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Sidebar for desktop */}
      <aside 
        className={`bg-white shadow-md fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
          isSidebarOpen ? "w-64" : "w-20"
        } ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className={`flex items-center ${isSidebarOpen ? "justify-between" : "justify-center"} h-16 px-4 border-b`}>
            <Link href="/admin" className={`flex items-center ${!isSidebarOpen && "justify-center"}`}>
              {isSidebarOpen ? (
                <Image
                  src="/images/drinkmate-logo.png"
                  alt="Drinkmate"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                />
              ) : (
                <div className="w-8 h-8 bg-[#12d6fa] rounded-full flex items-center justify-center text-white font-bold">
                  D
                </div>
              )}
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:block text-gray-500 hover:text-gray-900"
            >
              <ChevronDown 
                className={`w-5 h-5 transform transition-transform ${!isSidebarOpen ? "rotate-90" : "-rotate-90"}`} 
              />
            </button>
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center ${
                        isSidebarOpen ? "justify-start px-4" : "justify-center"
                      } py-3 rounded-md transition-colors ${
                        isActive
                          ? "bg-[#e6f9fd] text-[#12d6fa]"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      {isSidebarOpen && (
                        <span className="ml-3 text-sm font-medium">{item.name}</span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User info and logout */}
          <div className={`border-t p-4 ${isSidebarOpen ? "" : "flex justify-center"}`}>
            {isSidebarOpen ? (
              <>
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#12d6fa] flex items-center justify-center text-white">
                    {user?.username?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                    <p className="text-xs text-gray-500">Admin</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center"
                  onClick={handleLogout}
                >
                  <LogOut className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="bg-white shadow-sm h-16 flex items-center px-6">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="ml-4 lg:ml-0">
            <h1 className="text-xl font-semibold text-gray-800">{t("dashboard.title")}</h1>
          </div>
          <div className="ml-auto flex items-center">
            <div className="mr-6 flex items-center">
              <div className="mr-3 hidden sm:flex items-center text-gray-600">
                <Globe className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Language:</span>
              </div>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button 
                  onClick={() => setLanguage("EN")} 
                  className={`px-3 py-2 flex items-center gap-2 transition-colors ${language === "EN" ? "bg-[#12d6fa] text-white" : "bg-white hover:bg-gray-50 text-gray-700"}`}
                  title="Switch to English"
                >
                  <Flag className="w-4 h-4" />
                  <span className="font-medium">EN</span>
                </button>
                <div className="w-px h-6 bg-gray-300"></div>
                <button 
                  onClick={() => setLanguage("AR")} 
                  className={`px-3 py-2 flex items-center gap-2 transition-colors ${language === "AR" ? "bg-[#12d6fa] text-white" : "bg-white hover:bg-gray-50 text-gray-700"}`}
                  title="Switch to Arabic"
                >
                  <Flag className="w-4 h-4" />
                  <span className="font-medium">عربي</span>
                </button>
              </div>
            </div>
            <span className="text-sm text-gray-600 mr-4 hidden sm:inline-block">
              {t("common.welcome")}, {user?.username}
            </span>
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">
              {t("common.viewSite")}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>

      {/* Mobile sidebar backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
    </div>
  )
}
