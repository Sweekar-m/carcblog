# AGENTS.md — Startup Blog Platform (CarcBlog)

This file gives coding agents (Claude Code, Cursor, etc.) the context needed to work on this codebase correctly. It is derived from the project's BRD, PRD, Feature Specification, and TRD — read those documents in full for rationale; this file is the enforceable, day-to-day subset an agent needs while writing code.

**Source documents**: `brd.md` · `prd.md` · `Feature_Specification.md` · `TRD.md` · `design.md` (visual design system)

---

## 1. Product Context (from BRD/PRD)

A media platform for the startup ecosystem — news, founder stories, funding updates, product launches — combined with **structured data products** (startup directory, founder directory, funding tracker, jobs, events) that a traditional blog doesn't have. This structured-data angle is the core differentiator vs. TechCrunch/Inc42/Medium/Substack, so treat directory and tracker features as first-class, not bolt-ons.

**V1 is in scope for**: news/articles, categories, tags, startup directory, founder directory, funding tracker, events, jobs, search, newsletter, user accounts, comments, bookmarks, admin dashboard.

**V1 is explicitly out of scope** — do not build these unless asked, and flag if a request seems to require them: mobile apps, public API, multi-language support, premium membership/paywalls, community forum/marketplace.

**Monetization is phased** (ads/sponsored content now; premium/featured listings later; event & newsletter sponsorships, affiliate, paid reports last). Don't build paywall or premium-gating logic yet — it's Phase 2/3.

---

## 2. User Roles (from Feature Spec) — enforce in code

| Role | Can do |
|---|---|
| **Guest** | Browse, search, read public posts, view startup/founder profiles, subscribe to newsletter |
| **Registered User** | + bookmark, follow startups/categories, comment, manage profile, notifications |
| **Author** | + create/edit own articles, upload media, save drafts, schedule publishing |


Any new route or Sanity/Supabase mutation must be checked against this table. If a feature doesn't map cleanly to a role, ask before assuming permissions.

---

## 3. Technology Stack (from TRD) — do not substitute without asking

| Layer | Choice | Notes |
|---|---|---|
| Frontend framework | **Astro** | Islands architecture, SSR for SEO-critical pages |
| Language | **TypeScript** | Strict mode — see §7 |
| Styling | **Tailwind CSS** | Configured via `tailwind.config.ts`, themed with CarcBlog design tokens (§5) |
| Icons | **Lucide Icons** | |
| Animation | **Motion One** | Use for anything beyond simple CSS transitions |
| Forms | **React Hook Form** | Within React islands only |
| Validation | **Zod** | Both form validation and Sanity/API payload validation |
| State | **Nano Stores** | Cross-island shared state; don't reach for Redux/Zustand |
| Content authoring | **MDX** | For long-form editorial content where needed |
| Syntax highlighting | **Shiki** | For code blocks in articles |
| Images | **Astro Image** (frontend) + **Cloudinary** (storage) | Never raw `<img>` with unoptimized sources |
| CMS | **Sanity** | Articles, categories, authors, startup profiles, founder profiles, events, jobs, media, SEO fields |
| Auth | **Clerk** (preferred) — Supabase Auth as fallback | Google, GitHub, Email OTP |
| Database | **PostgreSQL via Supabase** | User accounts, bookmarks, comments, newsletter, notifications |
| Search | **Algolia** (preferred) — Meilisearch as fallback | Instant search, typo tolerance, filters |
| Payments | **Stripe** (global) / **Razorpay** (India) | Not active in V1 — infra only, no UI yet |
| Email | **Resend** (preferred) — SendGrid fallback | Newsletter, verification, password reset, notifications |
| Deployment | **Vercel** (frontend) / **Sanity Cloud** (CMS) / **Supabase** (DB) / **Cloudflare** (CDN) | |
| Analytics | Google Analytics, Search Console, Microsoft Clarity, Plausible (optional) | |
| Monitoring | Vercel Analytics, Sentry, UptimeRobot, Cloudflare Analytics | |

**Rule**: if a task seems to need a library/service not on this list, stop and flag it rather than adding a new dependency — this stack was deliberately chosen in the TRD.

---

## 4. Folder Structure (from TRD)

```
frontend/
  app/                # Astro app shell / root config
  components/         # Reusable .astro and React island components
  layouts/             # Page-level layouts (BaseLayout, ArticleLayout, DirectoryLayout)
  pages/               # File-based routing
  content/             # MDX / local content if not sourced from Sanity
  styles/              # Tailwind config, global.css, design tokens
  hooks/               # React hooks (for islands)
  utils/               # Shared utilities
  types/               # Shared TypeScript types (mirror Sanity schemas here)
  services/            # API clients: Sanity, Supabase, Algolia, Clerk, Cloudinary, Resend
  config/              # Environment-driven config, constants
public/                # Static assets
```

If the real repo differs from this, follow what's actually there and flag the discrepancy — don't silently restructure.

---

## 5. Design System — Tailwind Integration

Full rationale and philosophy: `design.md`. The rules below are how those tokens map onto **Tailwind**, since the TRD specifies Tailwind CSS rather than a standalone utility-class CSS file.

### 5.1 Token → Tailwind theme mapping

Design tokens live in `tailwind.config.ts` under `theme.extend`, not as raw hex/px values in components:

```ts
// tailwind.config.ts (illustrative — match to actual file)
colors: {
  primary: { DEFAULT: '#0F172A', foreground: '#FFFFFF', hover: '#1E293B', press: '#334155' },
  accent: { DEFAULT: '#0EA5E9', foreground: '#0F172A', hover: '#0284C7', press: '#0369A1' },
  'accent-2': { DEFAULT: '#7C3AED', foreground: '#FFFFFF' },
  background: { DEFAULT: '#FFFFFF', alt: '#F8FAFC', muted: '#F1F5F9' },
  foreground: { DEFAULT: '#0F172A', muted: '#64748B', subtle: '#94A3B8' },
  border: { DEFAULT: '#E2E8F0', muted: '#CBD5E1' },
  success: '#059669', warning: '#D97706', error: '#DC2626', info: '#0284C7',
},
fontFamily: {
  sans: ['Inter var', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
  serif: ['Cormorant Garamond', 'Georgia', 'serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
},
borderRadius: {
  xs: '2px', sm: '4px', md: '6px', lg: '8px', xl: '12px', '2xl': '16px', '3xl': '20px',
},
spacing: {
  // extend Tailwind's default 4px-based scale to align to the 8px grid where the design system requires it
},
```

Dark mode: use Tailwind's `dark:` variant driven by a `data-theme="dark"` (or `class`) strategy — configure `darkMode: 'class'` in `tailwind.config.ts` and toggle at the `<html>` level, matching the token remaps documented in `design.md` §3.1.

### 5.2 Non-negotiable rules

1. **Never hardcode a hex/px value** in a component — use Tailwind theme classes (`bg-primary`, `text-foreground-muted`, `rounded-lg`, `p-6`) which resolve to the tokens above.
2. **Never invent new Tailwind theme values ad hoc** — if a needed color/spacing/radius doesn't exist, add it to `tailwind.config.ts` first and note why, rather than using arbitrary values (`bg-[#123456]`) except for genuine one-offs that don't warrant a token.
3. **Typography split**: Inter (`font-sans`) for all UI chrome/nav/buttons/labels/body; Cormorant Garamond (`font-serif`) reserved for article H1 headlines, pull quotes, and byline taglines only. Never serif on buttons, nav, or inputs.
4. **Dark mode is mandatory** for every new component — test both themes before considering a component done.
5. **Respect `prefers-reduced-motion`** for all Motion One animations and custom keyframes.
6. **Component patterns** (buttons, cards, inputs) should match the conventions in `design.md` §4 — radius, shadow, and hover behavior per component type — translated into Tailwind class combinations rather than custom CSS where possible.

---

## 6. Astro + React Island Conventions

- Default to `.astro` components (zero JS shipped). Only reach for a React island when the component needs client-side state or interactivity (forms, search-as-you-type, bookmarking toggle, comment box).
- Use the least eager client directive that works: `client:idle` or `client:visible` over `client:load`.
- Forms (newsletter signup, comment submission, contact) use **React Hook Form + Zod** inside an island — validate on both client and server (Zod schema shared between the two where possible).
- Cross-island state (e.g., auth session, bookmark state reflected in multiple components) goes through **Nano Stores** — don't prop-drill across island boundaries or introduce a separate state library.
- Images always go through `astro:assets` / `<Image />`, sourced from Cloudinary URLs — never unoptimized `<img src>`.

---

## 7. Coding Standards (from TRD §6)

- **TypeScript strict mode** — no implicit `any`, no `@ts-ignore` without a comment explaining why.
- **Prettier** for formatting, **ESLint** for linting — run both before considering a task complete if configured in `package.json`.
- **Naming**: `PascalCase` for components/types, `camelCase` for variables/functions, `kebab-case` for file names and routes.
- **Conventional Commits** for commit messages (`feat:`, `fix:`, `chore:`, `docs:`, etc.).
- **TSDoc** comments on exported functions/types, especially anything in `services/` or `utils/` that other modules depend on.
- Mirror **Sanity schema shapes** into `types/` so frontend components are typed against the actual CMS content model — don't hand-roll loosely-typed content props.

---

## 8. Non-Functional Requirements — hold every PR to these (from TRD §7–§9)

**Performance targets**: FCP < 1.5s · LCP < 2.5s · CLS < 0.1 · Performance score 95+ · SEO score 100 · Accessibility score 100.

Practical implications:
- Prefer static generation / SSR over client-side data fetching for anything SEO-relevant (articles, directory profiles, funding data).
- Lazy-load below-the-fold images and non-critical islands.
- Don't ship client JS for content that could render statically.

**SEO requirements** — every article/profile page needs: proper meta tags, canonical URL, Open Graph + Twitter Card tags, Schema.org structured data (Article, Organization, or Person schema as appropriate), and inclusion in the dynamic sitemap. Check for existing SEO utility components before building new meta-tag logic.

**Security requirements**: HTTPS-only assumptions, CSP-compatible code (no inline scripts/styles that would break a strict CSP), input validation via Zod on every form and API boundary, secure cookie handling for Clerk/Supabase sessions, no secrets in client-side code — all keys/tokens via environment variables, never hardcoded.

**Accessibility**: target WCAG AA (per `design.md`) and a 100 Lighthouse accessibility score — semantic HTML first, ARIA only to fill genuine gaps, visible focus states (already defined as design tokens), sufficient color contrast using only the defined token palette.

---

## 9. Content & Data Model Touchpoints

When building any feature that touches content, check whether it's a **Sanity-managed content type** or a **Supabase-managed relational record**:

- **Sanity** (content-editorial): articles, categories, tags, authors, startup profiles, founder profiles, events, jobs, media, SEO fields.
- **Supabase/Postgres** (user/relational data): user accounts, bookmarks, comments, newsletter subscriptions, notifications, and (later) premium features.

Don't put user-generated data (comments, bookmarks) into Sanity, and don't put editorial content into Supabase — this split is intentional per the TRD architecture (`User → CDN → Astro Frontend → Sanity CMS → Content APIs`, with Supabase as the separate relational store for account-linked data).

---

## 10. Workflow Expectations

- Before creating a new component, check `components/` for an existing one serving the same purpose — extend/compose rather than duplicate.
- Before adding a new design token, check `tailwind.config.ts` and `design.md` first.
- Don't introduce new dependencies (a different CMS client, a different form library, a different state manager) without flagging it — the stack in §3 was deliberately chosen.
- Any feature touching monetization (ads, sponsored content, premium gating, payments) should be flagged for scope confirmation — V1 excludes premium membership and most monetization UI; only Phase 1 items (display ads, sponsored articles) are in scope now.
- Any feature request matching the "Out of Scope (V1)" list (§1) should be flagged before building, even if it seems straightforward to add.

---

## 11. What "Done" Looks Like

A component/page/feature is complete when it:
- Uses only Tailwind theme values sourced from design tokens (no hardcoded hex/px)
- Works correctly in light and dark mode
- Respects `prefers-reduced-motion`
- Is typed against the correct data source (Sanity content type or Supabase table) via `types/`
- Meets the performance/SEO/accessibility bars in §8 for anything user-facing and indexable
- Respects the role permission table in §2 for anything gated
- Matches existing component/service patterns, or was explicitly flagged as introducing a new one

---

*Companion docs: `brd.md` (business context) · `prd.md` (product requirements) · `Feature_Specification.md` (feature/role detail) · `TRD.md` (full technical architecture) · `design.md` (design system rationale)*