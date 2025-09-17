// Temporary font fallbacks due to Google Fonts being blocked
// import { Cairo, Montserrat, Noto_Sans, Noto_Sans_Arabic } from 'next/font/google'

// Fallback font configuration
export const cairo = {
  variable: '--font-cairo',
  className: 'font-sans',
}

export const montserrat = {
  variable: '--font-montserrat', 
  className: 'font-sans',
}

export const notoSans = {
  variable: '--font-noto-sans',
  className: 'font-sans',
}

export const notoArabic = {
  variable: '--font-noto-arabic',
  className: 'font-sans',
}

/* Original implementation (restore when Google Fonts access is available):
import { Cairo, Montserrat, Noto_Sans, Noto_Sans_Arabic } from 'next/font/google'

export const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-cairo',
  weight: ['400', '500', '600', '700'],
})

export const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700'],
})

export const notoSans = Noto_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans',
  weight: ['400', '600'],
})

export const notoArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-noto-arabic',
  weight: ['400', '600'],
})
*/
