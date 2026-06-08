import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      colors: {
        // Bloomberg Glassmorphic Palette
        slate: {
          950: '#030712',
          900: '#0f172a',
        },
        // Semantic Colors
        trust: '#0ea5e9',      // Sky Blue - Trust/Information
        bull: '#10b981',       // Emerald - Bull/Buy/Long
        bear: '#ef4444',       // Rose - Bear/Sell/Short
        caution: '#f59e0b',    // Amber - Caution/Shariah Alert
        // Additional UI Colors
        accent: '#06b6d4',     // Cyan - Primary accent
        success: '#10b981',    // Green - Success
        error: '#ef4444',      // Red - Error/Alert
        warning: '#f59e0b',    // Amber - Warning
        info: '#0ea5e9',       // Blue - Info
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '16px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        // Bloomberg gradient
        'gradient-bloomberg': 'linear-gradient(135deg, #030712 0%, #0f172a 100%)',
        // Glassmorphic effect
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      },
      boxShadow: {
        // Glassmorphic shadows
        'glass-sm': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-md': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        // Glow effects
        'glow-trust': '0 0 20px rgba(14, 165, 233, 0.3)',
        'glow-bull': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-bear': '0 0 20px rgba(239, 68, 68, 0.3)',
        'glow-caution': '0 0 20px rgba(245, 158, 11, 0.3)',
        // Neon glow
        'neon-trust': '0 0 10px rgba(14, 165, 233, 0.5), 0 0 20px rgba(14, 165, 233, 0.3)',
        'neon-bull': '0 0 10px rgba(16, 185, 129, 0.5), 0 0 20px rgba(16, 185, 129, 0.3)',
        'neon-bear': '0 0 10px rgba(239, 68, 68, 0.5), 0 0 20px rgba(239, 68, 68, 0.3)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(239, 68, 68, 0.5)' },
        },
        countUp: {
          '0%': { '--num': '0' },
          '100%': { '--num': '100' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in',
        slideUp: 'slideUp 0.5s ease-out',
        slideDown: 'slideDown 0.5s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out infinite',
        countUp: 'countUp 2s ease-out forwards',
        marquee: 'marquee 30s linear infinite',
        shimmer: 'shimmer 2s infinite',
      },
      transitionDuration: {
        250: '250ms',
        350: '350ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    // Custom utilities
    function ({ addUtilities }: any) {
      addUtilities({
        '.glass': {
          'background': 'rgba(15, 23, 42, 0.5)',
          'backdrop-filter': 'blur(16px)',
          'border': '1px solid rgba(255, 255, 255, 0.05)',
        },
        '.glass-sm': {
          'background': 'rgba(15, 23, 42, 0.4)',
          'backdrop-filter': 'blur(8px)',
          'border': '1px solid rgba(255, 255, 255, 0.05)',
        },
        '.glass-border': {
          'border': '1px solid rgba(255, 255, 255, 0.1)',
          'background': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        },
        '.text-gradient': {
          'background': 'linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
      });
    },
  ],
} satisfies Config;

export default config;
