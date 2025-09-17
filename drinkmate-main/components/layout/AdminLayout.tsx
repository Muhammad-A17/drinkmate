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
  FolderOpen,
  XCircle,
  Utensils,
  Star,
  Mail,
  Wrench,
  Database,
  Bug,
  TestTube
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
  const [isLayoutLoading, setIsLayoutLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const { isRTL, language, setLanguage } = useTranslation()
  const { t } = useAdminTranslation()

  // Debug logging
  useEffect(() => {
    console.log("AdminLayout auth state:", { 
      isAuthenticated, 
      user: user ? { 
        id: user._id, 
        email: user.email, 
        isAdmin: user.isAdmin 
      } : null,
      authLoading,
      pathname
    });
  }, [isAuthenticated, user, authLoading, pathname]);

  // Protect admin routes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Wait for auth to fully initialize
        if (authLoading) {
          return; // Still loading, wait
        }
        
        // If not authenticated and not loading, redirect to login
        if (!isAuthenticated && !authLoading) {
          console.log("User not authenticated, redirecting to login");
          router.push("/login?redirect=/admin");
          return;
        }
        
        // If authenticated but not admin, redirect to home
        if (isAuthenticated && user && !user.isAdmin) {
          console.log("User not admin, redirecting to home");
          router.push("/");
          return;
        }
        
        // User is authenticated and is an admin
        if (isAuthenticated && user && user.isAdmin) {
          console.log("Admin access granted");
          setIsLayoutLoading(false);
          setAuthError(null); // Clear any previous errors
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthError("Authentication check failed. Please try again.");
        router.push("/login?redirect=/admin");
      }
    };
    
    // Reduce delay for faster navigation
    const timer = setTimeout(checkAuth, 50);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, authLoading, router]);

  const handleLogout = async () => {
    try {
      setIsRefreshing(true);
      logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsRefreshing(false);
    }
  }

  const handleRefresh = () => {
    window.location.reload();
  }

  // Get page title based on current path
  const getPageTitle = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length === 1) return t("dashboard.title");
    
    const pageName = pathSegments[pathSegments.length - 1];
    const navItem = navItems.find(item => item.href.includes(pageName));
    return navItem ? navItem.name : pageName.charAt(0).toUpperCase() + pageName.slice(1);
  }

  // Get breadcrumbs
  const getBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length <= 1) return [];
    
    return pathSegments.map((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      const isLast = index === pathSegments.length - 1;
      return { name: segment, href, isLast };
    });
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
      icon: <Star className="w-5 h-5" /> 
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: <FolderOpen className="w-5 h-5" />
    },
    { 
      name: "Recipes", 
      href: "/admin/recipes", 
      icon: <Utensils className="w-5 h-5" /> 
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
      icon: <Star className="w-5 h-5" /> 
    },
    { 
      name: "Contact", 
      href: "/admin/contact", 
      icon: <Mail className="w-5 h-5" /> 
    },
      {
        name: "Chat Management",
        href: "/admin/chat-management",
        icon: <MessageSquare className="w-5 h-5" />
      },
    { 
      name: "Contact Settings", 
      href: "/admin/contact-settings", 
      icon: <Wrench className="w-5 h-5" /> 
    },
    { 
      name: "Cart Settings", 
      href: "/admin/cart-settings", 
      icon: <ShoppingBag className="w-5 h-5" /> 
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
    // Debug/Test pages (only show in development)
    ...(process.env.NODE_ENV === 'development' ? [
      { 
        name: "Debug", 
        href: "/admin/debug", 
        icon: <Bug className="w-5 h-5" /> 
      },
      { 
        name: "Test Dashboard", 
        href: "/admin/test-dashboard", 
        icon: <TestTube className="w-5 h-5" /> 
      },
      { 
        name: "Auth Debug", 
        href: "/admin/auth-debug", 
        icon: <Database className="w-5 h-5" /> 
      },
      { 
        name: "Debug Chat", 
        href: "/admin/debug-chat", 
        icon: <MessageSquare className="w-5 h-5" /> 
      },
      { 
        name: "Test", 
        href: "/admin/test", 
        icon: <TestTube className="w-5 h-5" /> 
      },
    ] : []),
  ]

  // If loading
  if (authLoading || isLayoutLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#12d6fa] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Admin Panel</h2>
          <p className="text-gray-500">Please wait while we verify your credentials...</p>
        </div>
      </div>
    )
  }

  // If there's an auth error
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
          <div className="space-y-3">
            <Button 
              className="w-full" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => router.push("/login")}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // If not admin, show error
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4 text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You do not have permission to access the admin panel.</p>
          <div className="space-y-3">
            <Button 
              className="w-full" 
              onClick={() => router.push("/")}
            >
              Return to Homepage
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => router.push("/login")}
            >
              Try Different Account
            </Button>
          </div>
        </div>
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
                  style={{ width: "auto", height: "auto" }}
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
              aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <ChevronDown 
                className={`w-5 h-5 transform transition-transform ${!isSidebarOpen ? "rotate-90" : "-rotate-90"}`} 
              />
            </button>
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-900"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {/* Main Navigation Group */}
              <li className="mb-4">
                <div className={`px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${!isSidebarOpen && 'text-center'}`}>
                  {isSidebarOpen ? "Main" : "•"}
                </div>
              </li>
              {navItems.slice(0, 3).map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center ${
                        isSidebarOpen ? "justify-start px-4" : "justify-center"
                      } py-3 rounded-md transition-all duration-200 ${
                        isActive
                          ? "bg-[#e6f9fd] text-[#12d6fa] shadow-sm"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <span className={`flex-shrink-0 ${isActive ? 'text-[#12d6fa]' : ''}`}>{item.icon}</span>
                      {isSidebarOpen && (
                        <span className="ml-3 text-sm font-medium">{item.name}</span>
                      )}
                    </Link>
                  </li>
                )
              })}
              
              {/* Content Management Group */}
              <li className="mb-4 mt-6">
                <div className={`px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${!isSidebarOpen && 'text-center'}`}>
                  {isSidebarOpen ? "Content" : "•"}
                </div>
              </li>
              {navItems.slice(3, 9).map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center ${
                        isSidebarOpen ? "justify-start px-4" : "justify-center"
                      } py-3 rounded-md transition-all duration-200 ${
                        isActive
                          ? "bg-[#e6f9fd] text-[#12d6fa] shadow-sm"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <span className={`flex-shrink-0 ${isActive ? 'text-[#12d6fa]' : ''}`}>{item.icon}</span>
                      {isSidebarOpen && (
                        <span className="ml-3 text-sm font-medium">{item.name}</span>
                      )}
                    </Link>
                  </li>
                )
              })}
              
              {/* Orders & Services Group */}
              <li className="mb-4 mt-6">
                <div className={`px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${!isSidebarOpen && 'text-center'}`}>
                  {isSidebarOpen ? "Orders & Services" : "•"}
                </div>
              </li>
              {navItems.slice(9, 13).map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center ${
                        isSidebarOpen ? "justify-start px-4" : "justify-center"
                      } py-3 rounded-md transition-all duration-200 ${
                        isActive
                          ? "bg-[#e6f9fd] text-[#12d6fa] shadow-sm"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <span className={`flex-shrink-0 ${isActive ? 'text-[#12d6fa]' : ''}`}>{item.icon}</span>
                      {isSidebarOpen && (
                        <span className="ml-3 text-sm font-medium">{item.name}</span>
                      )}
                    </Link>
                  </li>
                )
              })}
              
              {/* System Group */}
              <li className="mb-4 mt-6">
                <div className={`px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${!isSidebarOpen && 'text-center'}`}>
                  {isSidebarOpen ? "System" : "•"}
                </div>
              </li>
              {navItems.slice(13, -6).map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center ${
                        isSidebarOpen ? "justify-start px-4" : "justify-center"
                      } py-3 rounded-md transition-all duration-200 ${
                        isActive
                          ? "bg-[#e6f9fd] text-[#12d6fa] shadow-sm"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <span className={`flex-shrink-0 ${isActive ? 'text-[#12d6fa]' : ''}`}>{item.icon}</span>
                      {isSidebarOpen && (
                        <span className="ml-3 text-sm font-medium">{item.name}</span>
                      )}
                    </Link>
                  </li>
                )
              })}
              
              {/* Debug Group (only in development) */}
              {process.env.NODE_ENV === 'development' && (
                <>
                  <li className="mb-4 mt-6">
                    <div className={`px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${!isSidebarOpen && 'text-center'}`}>
                      {isSidebarOpen ? "Debug" : "•"}
                    </div>
                  </li>
                  {navItems.slice(-6).map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`flex items-center ${
                            isSidebarOpen ? "justify-start px-4" : "justify-center"
                          } py-3 rounded-md transition-all duration-200 ${
                            isActive
                              ? "bg-[#e6f9fd] text-[#12d6fa] shadow-sm"
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                        >
                          <span className={`flex-shrink-0 ${isActive ? 'text-[#12d6fa]' : ''}`}>{item.icon}</span>
                          {isSidebarOpen && (
                            <span className="ml-3 text-sm font-medium">{item.name}</span>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </>
              )}
            </ul>
          </nav>

          {/* User info and logout */}
          <div className={`border-t p-4 ${isSidebarOpen ? "" : "flex justify-center"}`}>
            {isSidebarOpen ? (
              <>
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#12d6fa] to-[#0fb8d9] flex items-center justify-center text-white font-semibold shadow-md">
                    {user?.username?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.username}</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                    onClick={handleLogout}
                    disabled={isRefreshing}
                  >
                    <LogOut className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    <span>{isRefreshing ? 'Logging out...' : 'Logout'}</span>
                  </Button>
                  <Link href="/" target="_blank">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      View Site
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#12d6fa] to-[#0fb8d9] flex items-center justify-center text-white font-semibold shadow-md mx-auto">
                  {user?.username?.charAt(0).toUpperCase() || "A"}
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleLogout}
                  disabled={isRefreshing}
                  title="Logout"
                  className="w-10 h-10 mx-auto"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
                <Link href="/" target="_blank">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    title="View Site"
                    className="w-10 h-10 mx-auto text-gray-600 hover:text-gray-900"
                  >
                    <Globe className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="bg-white shadow-sm h-auto min-h-16 flex flex-col px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none mr-3"
                aria-label="Open sidebar menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
                {/* Breadcrumbs */}
                {getBreadcrumbs().length > 0 && (
                  <nav className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                    <Link href="/admin" className="hover:text-[#12d6fa] transition-colors">
                      Admin
                    </Link>
                    {getBreadcrumbs().map((breadcrumb, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-gray-300">/</span>
                        {breadcrumb.isLast ? (
                          <span className="text-gray-700 font-medium">
                            {breadcrumb.name.charAt(0).toUpperCase() + breadcrumb.name.slice(1)}
                          </span>
                        ) : (
                          <Link 
                            href={breadcrumb.href} 
                            className="hover:text-[#12d6fa] transition-colors"
                          >
                            {breadcrumb.name.charAt(0).toUpperCase() + breadcrumb.name.slice(1)}
                          </Link>
                        )}
                      </div>
                    ))}
                  </nav>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <div className="hidden md:flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2"
                >
                  <Loader2 className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Link href="/" target="_blank">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    View Site
                  </Button>
                </Link>
              </div>
              
              {/* Language Switcher */}
              <div className="flex items-center">
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
              
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 hidden sm:inline-block">
                  {t("common.welcome")}, {user?.username}
                </span>
                <div className="w-8 h-8 rounded-full bg-[#12d6fa] flex items-center justify-center text-white font-semibold">
                  {user?.username?.charAt(0).toUpperCase() || "A"}
                </div>
              </div>
            </div>
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link href="/admin" className="flex items-center">
              <Image
                src="/images/drinkmate-logo.png"
                alt="Drinkmate"
                width={120}
                height={40}
                className="h-8 w-auto"
                style={{ width: "auto", height: "auto" }}
              />
            </Link>
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile navigation - same as desktop but full width */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {/* Main Navigation Group */}
              <li className="mb-4">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Main
                </div>
              </li>
              {navItems.slice(0, 3).map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={`flex items-center justify-start px-4 py-3 rounded-md transition-all duration-200 ${
                        isActive
                          ? "bg-[#e6f9fd] text-[#12d6fa] shadow-sm"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <span className={`flex-shrink-0 ${isActive ? 'text-[#12d6fa]' : ''}`}>{item.icon}</span>
                      <span className="ml-3 text-sm font-medium">{item.name}</span>
                    </Link>
                  </li>
                )
              })}
              
              {/* Content Management Group */}
              <li className="mb-4 mt-6">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Content
                </div>
              </li>
              {navItems.slice(3, 9).map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={`flex items-center justify-start px-4 py-3 rounded-md transition-all duration-200 ${
                        isActive
                          ? "bg-[#e6f9fd] text-[#12d6fa] shadow-sm"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <span className={`flex-shrink-0 ${isActive ? 'text-[#12d6fa]' : ''}`}>{item.icon}</span>
                      <span className="ml-3 text-sm font-medium">{item.name}</span>
                    </Link>
                  </li>
                )
              })}
              
              {/* Orders & Services Group */}
              <li className="mb-4 mt-6">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Orders & Services
                </div>
              </li>
              {navItems.slice(9, 13).map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={`flex items-center justify-start px-4 py-3 rounded-md transition-all duration-200 ${
                        isActive
                          ? "bg-[#e6f9fd] text-[#12d6fa] shadow-sm"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <span className={`flex-shrink-0 ${isActive ? 'text-[#12d6fa]' : ''}`}>{item.icon}</span>
                      <span className="ml-3 text-sm font-medium">{item.name}</span>
                    </Link>
                  </li>
                )
              })}
              
              {/* System Group */}
              <li className="mb-4 mt-6">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  System
                </div>
              </li>
              {navItems.slice(13, -6).map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={`flex items-center justify-start px-4 py-3 rounded-md transition-all duration-200 ${
                        isActive
                          ? "bg-[#e6f9fd] text-[#12d6fa] shadow-sm"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <span className={`flex-shrink-0 ${isActive ? 'text-[#12d6fa]' : ''}`}>{item.icon}</span>
                      <span className="ml-3 text-sm font-medium">{item.name}</span>
                    </Link>
                  </li>
                )
              })}
              
              {/* Debug Group (only in development) */}
              {process.env.NODE_ENV === 'development' && (
                <>
                  <li className="mb-4 mt-6">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Debug
                    </div>
                  </li>
                  {navItems.slice(-6).map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileSidebarOpen(false)}
                          className={`flex items-center justify-start px-4 py-3 rounded-md transition-all duration-200 ${
                            isActive
                              ? "bg-[#e6f9fd] text-[#12d6fa] shadow-sm"
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                        >
                          <span className={`flex-shrink-0 ${isActive ? 'text-[#12d6fa]' : ''}`}>{item.icon}</span>
                          <span className="ml-3 text-sm font-medium">{item.name}</span>
                        </Link>
                      </li>
                    )
                  })}
                </>
              )}
            </ul>
          </nav>

          {/* Mobile user section */}
          <div className="border-t p-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#12d6fa] to-[#0fb8d9] flex items-center justify-center text-white font-semibold shadow-md">
                {user?.username?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.username}</p>
                <p className="text-xs text-gray-500">Administrator</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                onClick={handleLogout}
                disabled={isRefreshing}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>{isRefreshing ? 'Logging out...' : 'Logout'}</span>
              </Button>
              <Link href="/" target="_blank">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  View Site
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
