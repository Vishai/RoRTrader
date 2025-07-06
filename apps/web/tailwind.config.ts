import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0A0A0B',
          secondary: '#141416',
          tertiary: '#1C1C1F',
          elevated: '#242428',
        },
        accent: {
          primary: '#00D4FF',
          secondary: '#00FF88',
          warning: '#FFB800',
          danger: '#FF3366',
          purple: '#9945FF',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B8B8BD',
          tertiary: '#6B6B73',
          disabled: '#3A3A40',
        },
        border: {
          DEFAULT: '#2A2A30',
          hover: '#3A3A40',
          focus: '#00D4FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'pulse-glow': 'glow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        glow: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(0, 212, 255, 0.8)',
          },
        },
        slideUp: {
          from: {
            transform: 'translateY(100%)',
          },
          to: {
            transform: 'translateY(0)',
          },
        },
        slideDown: {
          from: {
            transform: 'translateY(-100%)',
          },
          to: {
            transform: 'translateY(0)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 212, 255, 0.3)',
        'glow-lg': '0 0 40px rgba(0, 212, 255, 0.5)',
        'inner-glow': 'inset 0 0 20px rgba(0, 212, 255, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #00D4FF 0%, #00FF88 100%)',
        'gradient-dark': 'linear-gradient(180deg, #1C1C1F 0%, #0A0A0B 100%)',
        'gradient-card': 'linear-gradient(145deg, #1C1C1F 0%, #141416 100%)',
        'gradient-glow': 'radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.1) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}

export default config
