import { c as createAstro, a as createComponent, m as maybeRenderHead, d as addAttribute, b as renderTemplate, r as renderComponent, F as Fragment, f as renderHead, e as renderSlot } from "./astro/server_DAEOSxK0.mjs";
import "kleur/colors";
/* empty css                             */
import "clsx";
const $$Astro$1 = createAstro("https://carcblog.com");
const $$Nav = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Nav;
  let userId = null;
  let user = null;
  if (typeof Astro2.locals.auth === "function") {
    try {
      const auth = await Astro2.locals.auth();
      userId = auth?.userId;
      if (userId && typeof Astro2.locals.currentUser === "function") {
        user = await Astro2.locals.currentUser();
      }
    } catch (e) {
      console.warn("Auth check failed in Nav:", e);
    }
  }
  const currentPath = new URL(Astro2.request.url).pathname;
  const isActive = (href) => href === "/" ? currentPath === "/" : currentPath.startsWith(href);
  return renderTemplate`${maybeRenderHead()}<header class="nav-root" role="banner" data-astro-cid-afdttjsk> <div class="nav-inner" data-astro-cid-afdttjsk> <!-- ── Logo ── --> <a href="/" class="nav-logo" aria-label="Carcblog home" data-astro-cid-afdttjsk> <span class="logo-mark" aria-hidden="true" data-astro-cid-afdttjsk>C</span> <span class="logo-text" data-astro-cid-afdttjsk>arcblog</span> </a> <!-- ── Primary nav links (desktop) ── --> <nav class="nav-links" aria-label="Primary navigation" data-astro-cid-afdttjsk> ${[
    { href: "/feed", label: "Feed" },
    { href: "/discover", label: "Discover" },
    { href: "/topics", label: "Topics" },
    { href: "/writers", label: "Writers" },
    { href: "/about", label: "About" }
  ].map(({ href, label }) => renderTemplate`<a${addAttribute(href, "href")}${addAttribute(`nav-link ${isActive(href) ? "nav-link--active" : ""}`, "class")}${addAttribute(isActive(href) ? "page" : void 0, "aria-current")} data-astro-cid-afdttjsk> ${label} </a>`)} </nav> <!-- ── Right cluster ── --> <div class="nav-actions" data-astro-cid-afdttjsk> <!-- Search — expands on click --> <div class="search-wrap" id="search-wrap" data-astro-cid-afdttjsk> <button class="search-trigger" id="search-trigger" aria-label="Open search" aria-expanded="false" aria-controls="search-input" data-astro-cid-afdttjsk> <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-astro-cid-afdttjsk> <circle cx="11" cy="11" r="8" data-astro-cid-afdttjsk></circle> <path d="m21 21-4.35-4.35" data-astro-cid-afdttjsk></path> </svg> </button> <div class="search-input-wrap" id="search-input-wrap" aria-hidden="true" data-astro-cid-afdttjsk> <input id="search-input" type="search" placeholder="Search articles…" class="search-input" autocomplete="off" tabindex="-1" data-astro-cid-afdttjsk> </div> </div> <!-- Auth: signed-in avatar OR sign-in link --> ${userId ? renderTemplate`<a href="/dashboard" class="nav-avatar-link" aria-label="Your dashboard" data-astro-cid-afdttjsk> <img${addAttribute(user?.imageUrl || "https://api.dicebear.com/7.x/initials/svg?seed=User", "src")} alt="Your profile" class="nav-avatar" width="28" height="28" data-astro-cid-afdttjsk> </a>` : renderTemplate`<a href="/auth/sign-in" class="nav-sign-in" data-astro-cid-afdttjsk>Sign in</a>`} <!-- CTA button --> ${userId ? renderTemplate`<a href="/dashboard/articles/new" class="nav-cta" data-astro-cid-afdttjsk>Write</a>` : renderTemplate`<a href="/auth/sign-up" class="nav-cta" data-astro-cid-afdttjsk>Get started</a>`} <!-- Mobile hamburger --> <button class="nav-burger" id="nav-burger" aria-label="Open menu" aria-expanded="false" aria-controls="nav-mobile" data-astro-cid-afdttjsk> <span class="burger-bar" data-astro-cid-afdttjsk></span> <span class="burger-bar" data-astro-cid-afdttjsk></span> <span class="burger-bar" data-astro-cid-afdttjsk></span> </button> </div> </div> <!-- ── Mobile drawer ── --> <div class="nav-mobile" id="nav-mobile" aria-hidden="true" data-astro-cid-afdttjsk> <nav aria-label="Mobile navigation" data-astro-cid-afdttjsk> ${[
    { href: "/feed", label: "Feed" },
    { href: "/discover", label: "Discover" },
    { href: "/topics", label: "Topics" },
    { href: "/writers", label: "Writers" },
    { href: "/about", label: "About" }
  ].map(({ href, label }) => renderTemplate`<a${addAttribute(href, "href")}${addAttribute(`mobile-link ${isActive(href) ? "mobile-link--active" : ""}`, "class")} data-astro-cid-afdttjsk> ${label} </a>`)} <div class="mobile-sep" data-astro-cid-afdttjsk></div> ${userId ? renderTemplate`<a href="/dashboard/articles/new" class="mobile-cta" data-astro-cid-afdttjsk>Write an article →</a>` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "data-astro-cid-afdttjsk": true }, { "default": async ($$result2) => renderTemplate` <a href="/auth/sign-in" class="mobile-link" data-astro-cid-afdttjsk>Sign in</a> <a href="/auth/sign-up" class="mobile-cta" data-astro-cid-afdttjsk>Get started free →</a> ` })}`} </nav> </div> </header> <!-- ── Interaction script (vanilla, no island needed) ── -->  `;
}, "D:/carcblog/src/components/layout/Nav.astro", void 0);
const $$Footer = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<footer class="footer" data-astro-cid-35ed7um5> <div class="max-w-[1024px] mx-auto px-6" data-astro-cid-35ed7um5> <!-- Grid Stacks --> <div class="footer-grid" data-astro-cid-35ed7um5> <!-- Logo column --> <div class="footer-logo-col" data-astro-cid-35ed7um5> <span class="footer-brand" data-astro-cid-35ed7um5>Carcblog</span> <p class="footer-tagline" data-astro-cid-35ed7um5>
The premium platform for thoughtful writers who demand excellence.
</p> </div> <!-- Links columns --> <div data-astro-cid-35ed7um5> <h5 class="footer-header" data-astro-cid-35ed7um5>Explore</h5> <div class="footer-links" data-astro-cid-35ed7um5> <a href="/" class="footer-link" data-astro-cid-35ed7um5>Home</a> <a href="/feed" class="footer-link" data-astro-cid-35ed7um5>Feed</a> <a href="/discover" class="footer-link" data-astro-cid-35ed7um5>Discover</a> <a href="/topics" class="footer-link" data-astro-cid-35ed7um5>Topics</a> <a href="/about" class="footer-link" data-astro-cid-35ed7um5>About</a> </div> </div> <div data-astro-cid-35ed7um5> <h5 class="footer-header" data-astro-cid-35ed7um5>Create</h5> <div class="footer-links" data-astro-cid-35ed7um5> <a href="/dashboard" class="footer-link" data-astro-cid-35ed7um5>Write</a> <a href="/dashboard/articles" class="footer-link" data-astro-cid-35ed7um5>Manage Articles</a> <a href="/dashboard/analytics" class="footer-link" data-astro-cid-35ed7um5>Analytics</a> <a href="/dashboard/settings" class="footer-link" data-astro-cid-35ed7um5>Settings</a> </div> </div> <div data-astro-cid-35ed7um5> <h5 class="footer-header" data-astro-cid-35ed7um5>Company</h5> <div class="footer-links" data-astro-cid-35ed7um5> <a href="#" class="footer-link" data-astro-cid-35ed7um5>Careers</a> <a href="#" class="footer-link" data-astro-cid-35ed7um5>Blog</a> <a href="#" class="footer-link" data-astro-cid-35ed7um5>Press</a> <a href="#" class="footer-link" data-astro-cid-35ed7um5>Contact</a> </div> </div> <div data-astro-cid-35ed7um5> <h5 class="footer-header" data-astro-cid-35ed7um5>Legal</h5> <div class="footer-links" data-astro-cid-35ed7um5> <a href="/terms" class="footer-link" data-astro-cid-35ed7um5>Terms</a> <a href="/privacy" class="footer-link" data-astro-cid-35ed7um5>Privacy</a> <a href="/copyright" class="footer-link" data-astro-cid-35ed7um5>Copyright</a> <a href="/accessibility" class="footer-link" data-astro-cid-35ed7um5>Accessibility</a> </div> </div> </div> <!-- Bottom Row --> <div class="footer-bottom" data-astro-cid-35ed7um5> <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4" data-astro-cid-35ed7um5> <span data-astro-cid-35ed7um5>Copyright &copy; ${(/* @__PURE__ */ new Date()).getFullYear()} Carcblog Inc. All rights reserved.</span> <div class="flex space-x-4" data-astro-cid-35ed7um5> <a href="/privacy" class="footer-legal-link" data-astro-cid-35ed7um5>Privacy Policy</a> <span class="text-ink/20" data-astro-cid-35ed7um5>|</span> <a href="/terms" class="footer-legal-link" data-astro-cid-35ed7um5>Terms of Use</a> </div> </div> </div> </div> </footer> `;
}, "D:/carcblog/src/components/layout/Footer.astro", void 0);
const $$Astro = createAstro("https://carcblog.com");
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title, description, children, className } = Astro2.props;
  return renderTemplate`<html lang="en" dir="ltr" data-theme="light"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title} | Carcblog</title><meta name="description"${addAttribute(description, "content")}><link rel="icon" href="/favicon.svg"><!-- Fonts: Inter (UI) + Cormorant Garamond (brand/editorial) + Fira Code (code) --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Inter:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">${renderHead()}</head> <body class="bg-background text-foreground antialiased min-h-screen flex flex-col"> ${renderComponent($$result, "Nav", $$Nav, {})} <main class="flex-grow w-full"> ${renderSlot($$result, $$slots["default"])} </main> ${renderComponent($$result, "Footer", $$Footer, {})} </body></html>`;
}, "D:/carcblog/src/components/layout/Layout.astro", void 0);
export {
  $$Layout as $
};
