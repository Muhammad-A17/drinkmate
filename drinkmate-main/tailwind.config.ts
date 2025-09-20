import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      scale: {
        200: '2',  // 200% zoom
        350: '3.5',  // 350% zoom
        400: '4',   // 400% zoom
        425: '4.25', // 425% zoom
        450: '4.5', // 450% zoom
        475: '4.75', // 475% zoom
        500: '5', // 500% zoom
        525: '5.25', // 525% zoom
        550: '5.5', // 550% zoom
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pop-up': 'popUp 0.6s ease-out',
        'scale-up': 'scaleUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        popUp: {
          '0%': { transform: 'scale(0.8) translateY(20px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      colors: {
        // Soft Drinkmate Brand Colors
        brand: {
          50: '#EAFBFE', // Icon chip background
          100: '#D5F7FD',
          200: '#ABEFFB',
          300: '#81E7F9',
          400: '#57DFF7',
          500: '#04C4DB', // Primary aqua
          600: '#02B4CA', // Primary hover
          700: '#0294A3',
          800: '#01747C',
          900: '#015455',
          DEFAULT: '#04C4DB',
          dark: '#02B4CA',
          light: '#EAFBFE'
        },
        surface: {
          50: '#F7FBFD', // Surface background
          100: '#EFF7FA',
          200: '#DFEFF5',
          300: '#CFE7F0',
          400: '#BFDFEB',
          500: '#AFD7E6',
          600: '#9FCFE1',
          700: '#8FC7DC',
          800: '#7FBFD7',
          900: '#6FB7D2',
        },
        ink: {
          50: '#F8FAFB',
          100: '#F1F5F7',
          200: '#E2EBF0',
          300: '#D1DDE6',
          400: '#B8C9D6',
          500: '#9BB0C1',
          600: '#7A95A8',
          700: '#5A6B7B', // Text secondary
          800: '#4A5A6A',
          900: '#0E1B2A', // Text primary
        },
        outline: {
          50: '#F8FAFB',
          100: '#F1F5F7',
          200: '#E9EFF4', // Outline/border
          300: '#E1E8ED',
          400: '#D9E1E6',
          500: '#D1DADF',
          600: '#C9D3D8',
          700: '#C1CCD1',
          800: '#B9C5CA',
          900: '#B1BEC3',
        },
        success: { 
          DEFAULT: '#22C55E', 
          light: '#dcfce7',
          dark: '#16a34a'
        },
        danger: { 
          DEFAULT: '#ef4444', 
          light: '#fee2e2', // Validation error border
          dark: '#b91c1c' // Validation error text
        },
        warning: { 
          DEFAULT: '#F59E0B', 
          light: '#fef3c7',
          dark: '#d97706'
        },
        // Existing shadcn colors
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        destructive: 'var(--destructive)',
        'destructive-foreground': 'var(--destructive-foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        chart: {
          1: 'var(--chart-1)',
          2: 'var(--chart-2)',
          3: 'var(--chart-3)',
          4: 'var(--chart-4)',
          5: 'var(--chart-5)',
        },
        sidebar: 'var(--sidebar)',
        'sidebar-foreground': 'var(--sidebar-foreground)',
        'sidebar-primary': 'var(--sidebar-primary)',
        'sidebar-primary-foreground': 'var(--sidebar-primary-foreground)',
        'sidebar-accent': 'var(--sidebar-accent)',
        'sidebar-accent-foreground': 'var(--sidebar-accent-foreground)',
        'sidebar-border': 'var(--sidebar-border)',
        'sidebar-ring': 'var(--sidebar-ring)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        soft: '16px', // Card radius
        pill: '999px', // Button radius
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(2, 51, 72, .12)', // Soft shadow
        'card-elevated': '0 14px 40px -12px rgba(2, 51, 72, .18)', // Focus elevated
        'card-hover': '0 8px 25px -8px rgba(2, 51, 72, .15)', // Hover shadow
      },
      spacing: {
        'card-padding': '20px', // Card inner padding
        'card-padding-lg': '24px', // Card inner padding large
        'section-gap': '32px', // Section gaps
        'section-gap-lg': '40px', // Section gaps large
        'grid-gutter': '24px', // Grid gutter
      },
      fontSize: {
        'h1': ['36px', '44px'], // H1 36/44
        'h2': ['24px', '32px'], // H2 24/32
        'card-title': ['18px', '26px'], // Card title 18/26
        'body': ['15px', '22px'], // Body 15/22
        'secondary': ['13px', '20px'], // Secondary/help text 13/20
      },
      fontFamily: {
        // Primary fonts with proper fallbacks
        cairo: ['var(--font-cairo)', 'Cairo', 'var(--font-noto-arabic)', 'Noto Sans Arabic', 'system-ui', 'sans-serif'],
        montserrat: ['var(--font-montserrat)', 'Montserrat', 'var(--font-noto-sans)', 'Noto Sans', 'system-ui', 'sans-serif'],
        
        // Semantic aliases for easy usage
        primary: ['var(--font-primary)'],
        secondary: ['var(--font-secondary)'],
        
        // Fallback system fonts
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['var(--geist-mono)', 'monospace'],
        
      },
      aspectRatio: {
        'auto': 'auto',
        'square': '1 / 1',
        'video': '16 / 9',
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
        '9/16': '9 / 16',
      },
    maxWidth: {
      '8xl': '88rem',
      '9xl': '96rem',
      '10xl': '100rem',
    },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
    require('tailwindcss-rtl'),
  ],
}

export default config
