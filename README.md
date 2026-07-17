# Carcblog

A production-grade, serverless-first modern publication platform built with Astro.

## Features

- ✅ Serverless-first architecture with Astro
- ✅ Clerk authentication for secure user management
- ✅ Sanity CMS for content management
- ✅ Supabase for relational data (profiles, subscriptions, etc.)
- ✅ Tailwind CSS for beautiful, responsive design
- ✅ Role-based access (readers vs writers)
- ✅ SEO optimized with semantic HTML and structured data
- ✅ Premium aesthetic avoiding generic templates
- ✅ Mobile-first responsive design

## Tech Stack

- **Framework**: Astro 4.0+
- **Authentication**: Clerk
- **CMS**: Sanity.io
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS with custom design tokens
- **Type Safety**: TypeScript + Zod
- **Utilities**: clsx, tailwind-merge

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your environment variables
4. Run the development server: `npm run dev`

## Environment Variables

See `.env.example` for required variables:
- Clerk authentication keys
- Supabase connection details
- Sanity CMS configuration
- Site metadata

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── layout/         # Layout components (header, footer, etc.)
│   └── ui/             # Primitive UI components (buttons, cards, etc.)
├── lib/                # Utilities and external service clients
│   ├── sanity.ts       # Sanity client and queries
│   └── supabase.ts     # Supabase client and helpers
├── routes/             # Pages and API routes
│   ├── (dashboard)/    # Protected writer dashboard routes
│   ├── articles/       # Article viewing and creation
│   ├── about.astro     # About page
│   ├── writers.astro   # Writers directory
│   ├── topics.astro    # Topic browsing
│   ├── search.astro    # Search functionality
│   ├── sign-in.astro   # Authentication pages
│   └── sign-up.astro
├── styles/             # CSS and design tokens
│   ├── globals.css     # Global styles and utilities
│   └── tokens.css      # Design tokens (colors, spacing, etc.)
└── layouts/            # Layout components
```

## Design System

Carcblog uses a custom design system implemented through CSS tokens in `src/styles/tokens.css`:

- **Colors**: Primary, background, foreground, and muted tones
- **Spacing**: Consistent spacing scale
- **Typography**: Font families and sizes
- **Radii**: Border radius values
- **Shadows**: Elevation shadows

## License

MIT