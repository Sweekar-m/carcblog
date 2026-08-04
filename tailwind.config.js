/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx,vue}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2rem',
        '2xl': '2rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1280px',
      },
    },
    extend: {
      // ─── Colors — MiniMax v2 palette ───
      colors: {
        primary: '#0F172A',
        'primary-active': '#000000',
        ink: '#0F172A',
        'ink-strong': '#000000',

        // Text & Neutral Tones
        charcoal: '#334155',
        slate: '#475569',
        steel: '#64748B',
        stone: '#94A3B8',
        body: '#334155',
        'body-strong': '#0F172A',
        muted: '#64748B',
        'muted-soft': '#94A3B8',

        // Surfaces / Canvas
        canvas: '#FFFFFF',
        surface: '#F8FAFC',
        'surface-soft': '#F1F5F9',
        'surface-card': '#FFFFFF',
        'surface-strong': '#F1F5F9',

        // Hairlines
        hairline: '#E2E8F0',
        'hairline-soft': '#F1F5F9',
        'hairline-strong': '#CBD5E1',

        // On-color
        'on-primary': '#FFFFFF',
        'on-dark': '#FFFFFF',
        'on-dark-soft': '#94A3B8',

        // Category Brand Accent Colors (MiniMax Product Encoding — Design.md §24-45)
        'brand-coral': '#FF5A36',      // Funding & Capital
        'brand-magenta': '#E019C9',    // Founder Stories
        'brand-blue': '#0066FF',       // Product Launches & Tech
        'brand-purple': '#6D28D9',     // AI & Deep Tech
        'brand-emerald': '#059669',    // Founders & Investors Directory
        'brand-amber': '#D97706',      // Government Schemes
        'brand-cyan': '#06B6D4',
        'brand-blue-deep': '#0284C7',
        'brand-blue-700': '#0369A1',
        'brand-blue-200': '#E0F2FE',

        // Semantic
        'semantic-success': '#059669',
        'semantic-error': '#DC2626',
        'semantic-warning': '#D97706',
      },

      // ─── Accent Gradient Pairs (Design.md §37-45) ───
      backgroundImage: {
        'gradient-coral': 'linear-gradient(135deg, #FF5A36, #C2410C)',
        'gradient-blue': 'linear-gradient(135deg, #0066FF, #1E3A8A)',
        'gradient-magenta': 'linear-gradient(135deg, #E019C9, #86198F)',
        'gradient-purple': 'linear-gradient(135deg, #6D28D9, #4C1D95)',
        'gradient-emerald': 'linear-gradient(135deg, #059669, #064E3B)',
        'gradient-amber': 'linear-gradient(135deg, #D97706, #92400E)',
      },

      // ─── Font Families ───
      fontFamily: {
        sans: ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        mono: ['"Fira Code"', 'monospace'],
      },

      // ─── Font Sizes (MiniMax typography scale) ───
      fontSize: {
        'hero-display': ['5rem', { lineHeight: '1.10', letterSpacing: '-0.025em' }],     // 80px
        'display-lg':   ['3.5rem', { lineHeight: '1.10', letterSpacing: '-0.02em' }],     // 56px
        'heading-lg':   ['2.5rem', { lineHeight: '1.20', letterSpacing: '-0.015em' }],    // 40px
        'heading-md':   ['2rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],      // 32px
        'heading-sm':   ['1.5rem', { lineHeight: '1.30', letterSpacing: '0' }],           // 24px
        'card-title':   ['1.25rem', { lineHeight: '1.40', letterSpacing: '0' }],         // 20px
        'subtitle':     ['1.125rem', { lineHeight: '1.50', letterSpacing: '0' }],        // 18px
        'body-md':      ['1rem', { lineHeight: '1.50', letterSpacing: '0' }],            // 16px
        'body-sm':      ['0.875rem', { lineHeight: '1.50', letterSpacing: '0' }],        // 14px
        'caption':      ['0.8125rem', { lineHeight: '1.70', letterSpacing: '0' }],       // 13px
        'micro':        ['0.75rem', { lineHeight: '1.50', letterSpacing: '0' }],          // 12px
        'button-md':    ['0.875rem', { lineHeight: '1.40', letterSpacing: '0' }],        // 14px
      },

      // ─── Font Weights ───
      fontWeight: {
        regular:  '400',
        medium:   '500',
        semibold: '600',
        bold:     '700',
      },

      // ─── Border Radius Scale ───
      borderRadius: {
        'xs':   '4px',
        'sm':   '6px',
        'md':   '8px',
        'lg':   '12px',
        'xl':   '16px',
        'xxl':  '20px',
        'xxxl': '24px',
        'hero': '32px',
        'pill': '9999px',
        'full': '9999px',
      },

      // ─── Spacing Scale ───
      spacing: {
        'xxs': '4px',
        'xs':  '8px',
        'sm':  '12px',
        'md':  '16px',
        'lg':  '20px',
        'xl':  '24px',
        'xxl': '32px',
        'xxxl': '40px',
        'section-sm': '48px',
        'section': '64px',
        'section-lg': '80px',
        'hero': '96px',
      },

      // ─── Box Shadows ───
      boxShadow: {
        'subtle': '0px 1px 2px 0px rgba(0, 0, 0, 0.04)',
        'card': '0px 4px 6px 0px rgba(0, 0, 0, 0.08)',
        'atmospheric': '0px 0px 22px 0px rgba(0, 0, 0, 0.08)',
        'modal': '0px 12px 16px -4px rgba(36, 36, 36, 0.08)',
      },

      // ─── Height tokens ───
      height: {
        'nav': '64px',
        'btn': '40px',
        'input': '40px',
      },

      // ─── Max Width ───
      maxWidth: {
        'content': '1280px',
        'prose': '720px',
        'reading': '720px',
      },
    },
  },
  plugins: [],
};