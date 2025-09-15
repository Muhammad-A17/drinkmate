"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Save, RefreshCw } from "lucide-react"
import AdminLayout from "@/components/layout/AdminLayout"

interface CartSettings {
  freeShipping: {
    threshold: number
    enabled: boolean
    copyEn: string
    copyAr: string
    unlockedCopyEn: string
    unlockedCopyAr: string
  }
  secureCheckout: {
    enabled: boolean
    textEn: string
    textAr: string
  }
  recommendations: {
    enabled: boolean
    maxCount: number
    source: 'auto' | 'manual'
    excludeInCart: boolean
    titleEn: string
    titleAr: string
  }
  freeGift: {
    enabled: boolean
    threshold: number
    maxGift: number
    titleEn: string
    titleAr: string
    descriptionEn: string
    descriptionAr: string
  }
  stickyCheckout: {
    enabled: boolean
    textEn: string
    textAr: string
  }
  general: {
    emptyCartEn: string
    emptyCartAr: string
    continueShoppingEn: string
    continueShoppingAr: string
    clearCartEn: string
    clearCartAr: string
    saveForLaterEn: string
    saveForLaterAr: string
    removeEn: string
    removeAr: string
    addToCartEn: string
    addToCartAr: string
    lineTotalEn: string
    lineTotalAr: string
    subtotalEn: string
    subtotalAr: string
    shippingEn: string
    shippingAr: string
    taxEn: string
    taxAr: string
    discountEn: string
    discountAr: string
    totalEn: string
    totalAr: string
    couponPlaceholderEn: string
    couponPlaceholderAr: string
    applyCouponEn: string
    applyCouponAr: string
    secureCheckoutEn: string
    secureCheckoutAr: string
    notePlaceholderEn: string
    notePlaceholderAr: string
    noteLabelEn: string
    noteLabelAr: string
  }
}

const defaultSettings: CartSettings = {
  freeShipping: {
    threshold: 150,
    enabled: true,
    copyEn: "Add {amount} more for free shipping",
    copyAr: "أضف {amount} أكثر للحصول على الشحن المجاني",
    unlockedCopyEn: "You've unlocked free shipping!",
    unlockedCopyAr: "لقد حصلت على الشحن المجاني!"
  },
  secureCheckout: {
    enabled: true,
    textEn: "Secure Checkout",
    textAr: "الدفع الآمن"
  },
  recommendations: {
    enabled: true,
    maxCount: 6,
    source: 'auto',
    excludeInCart: true,
    titleEn: "Items you may like",
    titleAr: "عناصر قد تعجبك"
  },
  freeGift: {
    enabled: true,
    threshold: 100,
    maxGift: 1,
    titleEn: "Select a FREE product",
    titleAr: "اختر منتج مجاني",
    descriptionEn: "You qualify for one free product! Choose from the options below.",
    descriptionAr: "أنت مؤهل للحصول على منتج مجاني! اختر من الخيارات أدناه."
  },
  stickyCheckout: {
    enabled: true,
    textEn: "Secure Checkout",
    textAr: "الدفع الآمن"
  },
  general: {
    emptyCartEn: "Your cart is empty.",
    emptyCartAr: "سلة التسوق فارغة.",
    continueShoppingEn: "Continue Shopping",
    continueShoppingAr: "متابعة التسوق",
    clearCartEn: "Clear Cart",
    clearCartAr: "مسح السلة",
    saveForLaterEn: "Save for later",
    saveForLaterAr: "حفظ للم later",
    removeEn: "Remove",
    removeAr: "إزالة",
    addToCartEn: "Add",
    addToCartAr: "إضافة",
    lineTotalEn: "Line total",
    lineTotalAr: "المجموع الفرعي",
    subtotalEn: "Subtotal",
    subtotalAr: "المجموع الفرعي",
    shippingEn: "Shipping",
    shippingAr: "الشحن",
    taxEn: "Tax",
    taxAr: "الضريبة",
    discountEn: "Discount",
    discountAr: "خصم",
    totalEn: "Total",
    totalAr: "المجموع",
    couponPlaceholderEn: "Coupon code",
    couponPlaceholderAr: "رمز الكوبون",
    applyCouponEn: "Apply",
    applyCouponAr: "تطبيق",
    secureCheckoutEn: "Secure Checkout",
    secureCheckoutAr: "الدفع الآمن",
    notePlaceholderEn: "Special handling instructions…",
    notePlaceholderAr: "تعليمات خاصة للمعالجة...",
    noteLabelEn: "Add instructions for packing your order (optional)",
    noteLabelAr: "أضف تعليمات لتعبئة طلبك (اختياري)"
  }
}

interface FreeGiftProduct {
  id: number
  name: string
  image: string
  originalPrice: number
  isActive: boolean
}

export default function CartSettingsPage() {
  const [settings, setSettings] = useState<CartSettings>(defaultSettings)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [freeGiftProducts, setFreeGiftProducts] = useState<FreeGiftProduct[]>([
    {
      id: 101,
      name: "Drinkmate Flavor Sachet - Cherry",
      image: "/images/italian-strawberry-lemon-syrup.png",
      originalPrice: 15.0,
      isActive: true,
    },
    {
      id: 102,
      name: "Drinkmate Flavor Sachet - Lemon",
      image: "/images/italian-strawberry-lemon-syrup.png",
      originalPrice: 15.0,
      isActive: true,
    },
    {
      id: 103,
      name: "Drinkmate Flavor Sachet - Peach",
      image: "/images/italian-strawberry-lemon-syrup.png",
      originalPrice: 15.0,
      isActive: true,
    },
  ])

  useEffect(() => {
    // Load settings from API or localStorage
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('cart-settings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
      
      const savedProducts = localStorage.getItem('free-gift-products')
      if (savedProducts) {
        setFreeGiftProducts(JSON.parse(savedProducts))
      }
    }
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save to localStorage (in real app, save to API)
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart-settings', JSON.stringify(settings))
        localStorage.setItem('free-gift-products', JSON.stringify(freeGiftProducts))
      }
      toast.success('Cart settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    toast.info('Settings reset to defaults')
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Cart Page Settings</h1>
            <p className="text-muted-foreground">Configure cart page content and behavior</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>

      <Tabs defaultValue="freeshipping" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="freeshipping">Free Shipping</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="freegift">Free Gift</TabsTrigger>
          <TabsTrigger value="sticky">Sticky CTA</TabsTrigger>
          <TabsTrigger value="copy">Copy & Text</TabsTrigger>
        </TabsList>

        {/* Free Shipping Settings */}
        <TabsContent value="freeshipping">
          <Card>
            <CardHeader>
              <CardTitle>Free Shipping Bar</CardTitle>
              <CardDescription>Configure free shipping thresholds and messaging</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="freeShippingEnabled"
                  checked={settings.freeShipping.enabled}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      freeShipping: { ...prev.freeShipping, enabled: checked }
                    }))
                  }
                />
                <Label htmlFor="freeShippingEnabled">Enable free shipping bar</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="threshold">Free Shipping Threshold (SAR)</Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={settings.freeShipping.threshold}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        freeShipping: { ...prev.freeShipping, threshold: Number(e.target.value) }
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="copyEn">English - Progress Message</Label>
                  <Textarea
                    id="copyEn"
                    value={settings.freeShipping.copyEn}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        freeShipping: { ...prev.freeShipping, copyEn: e.target.value }
                      }))
                    }
                    placeholder="Add {amount} more for free shipping"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Use {`{amount}`} for the remaining amount</p>
                </div>
                <div>
                  <Label htmlFor="copyAr">Arabic - Progress Message</Label>
                  <Textarea
                    id="copyAr"
                    value={settings.freeShipping.copyAr}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        freeShipping: { ...prev.freeShipping, copyAr: e.target.value }
                      }))
                    }
                    placeholder="أضف {amount} أكثر للحصول على الشحن المجاني"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unlockedCopyEn">English - Unlocked Message</Label>
                  <Input
                    id="unlockedCopyEn"
                    value={settings.freeShipping.unlockedCopyEn}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        freeShipping: { ...prev.freeShipping, unlockedCopyEn: e.target.value }
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="unlockedCopyAr">Arabic - Unlocked Message</Label>
                  <Input
                    id="unlockedCopyAr"
                    value={settings.freeShipping.unlockedCopyAr}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        freeShipping: { ...prev.freeShipping, unlockedCopyAr: e.target.value }
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security & Trust</CardTitle>
              <CardDescription>Configure security messaging and trust badges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="secureCheckoutEnabled"
                  checked={settings.secureCheckout.enabled}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      secureCheckout: { ...prev.secureCheckout, enabled: checked }
                    }))
                  }
                />
                <Label htmlFor="secureCheckoutEnabled">Show secure checkout badge</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="secureTextEn">English - Secure Checkout Text</Label>
                  <Input
                    id="secureTextEn"
                    value={settings.secureCheckout.textEn}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        secureCheckout: { ...prev.secureCheckout, textEn: e.target.value }
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="secureTextAr">Arabic - Secure Checkout Text</Label>
                  <Input
                    id="secureTextAr"
                    value={settings.secureCheckout.textAr}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        secureCheckout: { ...prev.secureCheckout, textAr: e.target.value }
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Settings */}
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Product Recommendations</CardTitle>
              <CardDescription>Configure recommendation source and display options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="recommendationsEnabled"
                  checked={settings.recommendations.enabled}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      recommendations: { ...prev.recommendations, enabled: checked }
                    }))
                  }
                />
                <Label htmlFor="recommendationsEnabled">Enable recommendations</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxCount">Maximum Recommendations</Label>
                  <Input
                    id="maxCount"
                    type="number"
                    min="1"
                    max="12"
                    value={settings.recommendations.maxCount}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        recommendations: { ...prev.recommendations, maxCount: Number(e.target.value) }
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="source">Recommendation Source</Label>
                  <select
                    id="source"
                    value={settings.recommendations.source}
                    aria-label="Recommendation source"
                    title="Select recommendation source"
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        recommendations: { ...prev.recommendations, source: e.target.value as 'auto' | 'manual' }
                      }))
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="auto">Automatic (AI/Algorithm)</option>
                    <option value="manual">Manual Curation</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="excludeInCart"
                  checked={settings.recommendations.excludeInCart}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      recommendations: { ...prev.recommendations, excludeInCart: checked }
                    }))
                  }
                />
                <Label htmlFor="excludeInCart">Exclude items already in cart</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recTitleEn">English - Section Title</Label>
                  <Input
                    id="recTitleEn"
                    value={settings.recommendations.titleEn}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        recommendations: { ...prev.recommendations, titleEn: e.target.value }
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="recTitleAr">Arabic - Section Title</Label>
                  <Input
                    id="recTitleAr"
                    value={settings.recommendations.titleAr}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        recommendations: { ...prev.recommendations, titleAr: e.target.value }
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Free Gift Settings */}
        <TabsContent value="freegift">
          <Card>
            <CardHeader>
              <CardTitle>Free Gift Widget</CardTitle>
              <CardDescription>Configure free gift eligibility and display</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="freeGiftEnabled"
                  checked={settings.freeGift.enabled}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      freeGift: { ...prev.freeGift, enabled: checked }
                    }))
                  }
                />
                <Label htmlFor="freeGiftEnabled">Enable free gift widget</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="giftThreshold">Free Gift Threshold (SAR)</Label>
                  <Input
                    id="giftThreshold"
                    type="number"
                    value={settings.freeGift.threshold}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        freeGift: { ...prev.freeGift, threshold: Number(e.target.value) }
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="maxGift">Maximum Free Gifts</Label>
                  <Input
                    id="maxGift"
                    type="number"
                    min="1"
                    max="5"
                    value={settings.freeGift.maxGift}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        freeGift: { ...prev.freeGift, maxGift: Number(e.target.value) }
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="giftTitleEn">English - Title</Label>
                  <Input
                    id="giftTitleEn"
                    value={settings.freeGift.titleEn}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        freeGift: { ...prev.freeGift, titleEn: e.target.value }
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="giftTitleAr">Arabic - Title</Label>
                  <Input
                    id="giftTitleAr"
                    value={settings.freeGift.titleAr}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        freeGift: { ...prev.freeGift, titleAr: e.target.value }
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="giftDescEn">English - Description</Label>
                  <Textarea
                    id="giftDescEn"
                    value={settings.freeGift.descriptionEn}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        freeGift: { ...prev.freeGift, descriptionEn: e.target.value }
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="giftDescAr">Arabic - Description</Label>
                  <Textarea
                    id="giftDescAr"
                    value={settings.freeGift.descriptionAr}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        freeGift: { ...prev.freeGift, descriptionAr: e.target.value }
                      }))
                    }
                  />
                </div>
              </div>

              {/* Free Gift Products Management */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Free Gift Products</h3>
                  <Button
                    onClick={() => {
                      const newProduct = {
                        id: Date.now(),
                        name: `New Free Gift ${freeGiftProducts.length + 1}`,
                        image: "/placeholder.svg",
                        originalPrice: 15.0,
                        isActive: true
                      }
                      setFreeGiftProducts(prev => [...prev, newProduct])
                    }}
                    size="sm"
                  >
                    Add Product
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {freeGiftProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-500">IMG</span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <Input
                          value={product.name}
                          onChange={(e) => {
                            const updated = [...freeGiftProducts]
                            updated[index].name = e.target.value
                            setFreeGiftProducts(updated)
                          }}
                          placeholder="Product name"
                        />
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={product.originalPrice}
                            onChange={(e) => {
                              const updated = [...freeGiftProducts]
                              updated[index].originalPrice = Number(e.target.value)
                              setFreeGiftProducts(updated)
                            }}
                            placeholder="Original price"
                            className="w-32"
                          />
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={product.isActive}
                              onCheckedChange={(checked) => {
                                const updated = [...freeGiftProducts]
                                updated[index].isActive = checked
                                setFreeGiftProducts(updated)
                              }}
                            />
                            <Label className="text-sm">Active</Label>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFreeGiftProducts(prev => prev.filter((_, i) => i !== index))
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sticky Checkout Settings */}
        <TabsContent value="sticky">
          <Card>
            <CardHeader>
              <CardTitle>Sticky Checkout Bar</CardTitle>
              <CardDescription>Configure mobile sticky checkout behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="stickyEnabled"
                  checked={settings.stickyCheckout.enabled}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      stickyCheckout: { ...prev.stickyCheckout, enabled: checked }
                    }))
                  }
                />
                <Label htmlFor="stickyEnabled">Enable sticky checkout bar</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stickyTextEn">English - Button Text</Label>
                  <Input
                    id="stickyTextEn"
                    value={settings.stickyCheckout.textEn}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        stickyCheckout: { ...prev.stickyCheckout, textEn: e.target.value }
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="stickyTextAr">Arabic - Button Text</Label>
                  <Input
                    id="stickyTextAr"
                    value={settings.stickyCheckout.textAr}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        stickyCheckout: { ...prev.stickyCheckout, textAr: e.target.value }
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Copy & Text Settings */}
        <TabsContent value="copy">
          <Card>
            <CardHeader>
              <CardTitle>Copy & Text Content</CardTitle>
              <CardDescription>Configure all text content for both English and Arabic</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emptyCartEn">English - Empty Cart Message</Label>
                  <Input
                    id="emptyCartEn"
                    value={settings.general.emptyCartEn}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, emptyCartEn: e.target.value }
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="emptyCartAr">Arabic - Empty Cart Message</Label>
                  <Input
                    id="emptyCartAr"
                    value={settings.general.emptyCartAr}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, emptyCartAr: e.target.value }
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="continueShoppingEn">English - Continue Shopping</Label>
                  <Input
                    id="continueShoppingEn"
                    value={settings.general.continueShoppingEn}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, continueShoppingEn: e.target.value }
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="continueShoppingAr">Arabic - Continue Shopping</Label>
                  <Input
                    id="continueShoppingAr"
                    value={settings.general.continueShoppingAr}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, continueShoppingAr: e.target.value }
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="couponPlaceholderEn">English - Coupon Placeholder</Label>
                  <Input
                    id="couponPlaceholderEn"
                    value={settings.general.couponPlaceholderEn}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, couponPlaceholderEn: e.target.value }
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="couponPlaceholderAr">Arabic - Coupon Placeholder</Label>
                  <Input
                    id="couponPlaceholderAr"
                    value={settings.general.couponPlaceholderAr}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, couponPlaceholderAr: e.target.value }
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="noteLabelEn">English - Note Label</Label>
                  <Input
                    id="noteLabelEn"
                    value={settings.general.noteLabelEn}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, noteLabelEn: e.target.value }
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="noteLabelAr">Arabic - Note Label</Label>
                  <Input
                    id="noteLabelAr"
                    value={settings.general.noteLabelAr}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, noteLabelAr: e.target.value }
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  )
}
