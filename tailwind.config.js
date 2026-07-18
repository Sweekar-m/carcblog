/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx,vue}',
  ],
  theme: {
    // Override container to cap at 1200px (design.md spec)
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
        '2xl': '1200px', // content cap from design.md
      },
    },
    extend: {
      // ─── Colors — exact tokens from design.md ───
      colors: {
        // Primary / ink
        primary: '#292524',
        'primary-active': '#0c0a09',
        ink: '#0c0a09',

        // Text
        body: '#4e4e4e',
        'body-strong': '#292524',
        muted: '#777169',
        'muted-soft': '#a8a29e',

        // Hairlines
        hairline: '#e7e5e4',
        'hairline-soft': '#f0efed',
        'hairline-strong': '#d6d3d1',

        // Surfaces / Canvas
        canvas: '#f5f5f5',
        'canvas-soft': '#fafafa',
        'canvas-deep': '#0c0a09',
        'surface-card': '#ffffff',
        'surface-strong': '#f0efed',
        'surface-dark': '#0c0a09',
        'surface-dark-elevated': '#1c1917',

        // On-color
        'on-primary': '#ffffff',
        'on-dark': '#ffffff',
        'on-dark-soft': '#a8a29e',

        // Atmospheric gradient orbs (background decoration ONLY)
        'gradient-mint': '#a7e5d3',
        'gradient-peach': '#f4c5a8',
        'gradient-lavender': '#c8b8e0',
        'gradient-sky': '#a8c8e8',
        'gradient-rose': '#e8b8c4',

        // Semantic
        'semantic-success': '#16a34a',
        'semantic-error': '#dc2626',
      },

      // ─── Font Families ───
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"EB Garamond"', '"Times New Roman"', 'serif'],
        mono: ['"Fira Code"', 'monospace'],
      },

      // ─── Font Sizes (design.md typography scale) ───
      fontSize: {
        'display-mega': ['4rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],       // 64px
        'display-xl':   ['3rem', { lineHeight: '1.08', letterSpacing: '-0.02em' }],       // 48px
        'display-lg':   ['2.25rem', { lineHeight: '1.17', letterSpacing: '-0.01em' }],    // 36px
        'display-md':   ['2rem', { lineHeight: '1.13', letterSpacing: '-0.01em' }],       // 32px
        'display-sm':   ['1.5rem', { lineHeight: '1.2', letterSpacing: '0' }],            // 24px
        'title-md':     ['1.25rem', { lineHeight: '1.35', letterSpacing: '0' }],          // 20px
        'title-sm':     ['1.125rem', { lineHeight: '1.44', letterSpacing: '0.01em' }],    // 18px
        'body-md':      ['1rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],         // 16px
        'body-sm':      ['0.9375rem', { lineHeight: '1.47', letterSpacing: '0.009em' }],  // 15px
        'caption':      ['0.875rem', { lineHeight: '1.5', letterSpacing: '0' }],          // 14px
        'caption-upper':['0.75rem', { lineHeight: '1.4', letterSpacing: '0.08em' }],      // 12px
        'btn':          ['0.9375rem', { lineHeight: '1', letterSpacing: '0' }],           // 15px
        'nav-link':     ['0.9375rem', { lineHeight: '1.4', letterSpacing: '0' }],         // 15px
      },

      // ─── Font Weights ───
      fontWeight: {
        light:    '300',
        regular:  '400',
        medium:   '500',
        semibold: '600',
        bold:     '700',
      },

      // ─── Border Radius — design.md rounded scale ───
      borderRadius: {
        'none': '0px',
        'xs':   '4px',
        'sm':   '6px',
        'md':   '8px',
        'lg':   '12px',
        'xl':   '16px',
        'xxl':  '24px',
        'pill': '9999px',
        'full': '9999px',
      },

      // ─── Spacing — design.md spacing scale ───
      spacing: {
        'xxs': '4px',
        'xs':  '8px',
        'sm':  '12px',
        'base': '16px',
        'md':  '20px',
        'lg':  '24px',
        'xl':  '32px',
        'xxl': '48px',
        'section': '96px',
      },

      // ─── Box Shadows — single soft drop (design.md elevation) ───
      boxShadow: {
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.04)',
        'soft':       '0 4px 16px rgba(0, 0, 0, 0.04)',
        'none':       'none',
      },

      // ─── Height tokens ───
      height: {
        'nav': '64px',
        'btn': '40px',
        'input': '44px',
      },

      // ─── Max Width ───
      maxWidth: {
        'content': '1200px',
        'reading': '680px',
      },

      // ─── Keyframes (accordion only) ───
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};