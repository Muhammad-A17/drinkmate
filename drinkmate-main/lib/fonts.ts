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
