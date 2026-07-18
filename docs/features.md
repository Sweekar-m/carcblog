# CarcBlog Feature List (Updated)

## ✅ Core Content
- [x] Home page — hero, real published articles (Supabase, with mock fallback), grid, CTA
- [x] About page
- [x] Design System showcase page
- [x] Discover / Browse articles
- [x] Article feed — real published articles
- [x] Topics / Categories browsing
- [x] Writers directory
- [x] Article detail page — real data fetch by slug, reading progress, author bio, cover image
- [x] Search page (UI only; search integration pending)
- [x] 404 page

## ✅ User & Authentication
- [x] Clerk auth (email, social, OTP)
- [x] Onboarding flow → Supabase upsert
- [x] Profile view/edit
- [x] Role selection (reader/writer) during onboarding
- [x] Role-based dashboard access — only writers see/reach `/dashboard/*`
- [x] Persistent navbar auth state — avatar vs "Get Started", stable across navigation, resets only on logout

## ✅ Writer / Creator Tools
- [x] Real article publishing — form → API → Supabase insert
- [x] Dashboard articles list — shows writer's own real articles (draft + published)
- [x] Article creation form wired to `/api/articles`
- [x] Redirect to article/dashboard on successful publish
- [ ] Edit existing article (currently create-only — no update flow yet)
- [ ] Delete/unpublish article
- [ ] Draft autosave

## 🚧 Community Features (still UI stubs, not wired)
- [ ] Follow / Unfollow writers
- [ ] Bookmarking / Save-for-later
- [ ] Comments on articles ← recommended next
- [ ] Newsletter subscription (needs Resend/SendGrid)

## 🚧 Data & CMS
- [x] Supabase `articles` table — now with `excerpt`, `cover_image_url` columns
- [x] Sanity still configured (currently secondary/unused for real posts — Supabase is primary now)
- [ ] Events module
- [ ] Jobs board
- [ ] Startup / Founder directory
- [ ] Funding tracker

## 🚧 Admin & Moderation
- [ ] Admin dashboard
- [ ] Content moderation tools

## 🚧 Monetization (Phase 2 — out of scope for V1)
- [ ] Ad placeholders
- [ ] Sponsored content labels
- [ ] Premium/gated content

## 🚧 Technical & Infrastructure
- [x] Astro SSR + Islands
- [x] TypeScript strict mode
- [x] Tailwind + design tokens, dark mode
- [x] Lucide icons, Motion One
- [x] React Hook Form + Zod
- [x] Middleware-based auth + role checking
- [ ] XML sitemap
- [ ] RSS/Atom feed
- [ ] Open Graph / Twitter Card / JSON-LD SEO
- [ ] Accessibility audit
- [ ] Performance/Lighthouse benchmarking

---

**Suggested build order from here:** Comments → Bookmarking → Follow/Unfollow → Newsletter → SEO pass → Admin dashboard.