import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { TranslationProvider } from "@/lib/translation-context"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/lib/auth-context"
import SWRProvider from "@/lib/swr-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Drinkmate - Premium Soda Makers & Flavors",
  description: "Discover premium soda makers, natural flavors, and CO2 cylinders. Create delicious carbonated beverages at home with Drinkmate.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TranslationProvider>
          <CartProvider>
            <AuthProvider>
              <SWRProvider>
                {children}
              </SWRProvider>
            </AuthProvider>
          </CartProvider>
        </TranslationProvider>
      </body>
    </html>
  )
}
