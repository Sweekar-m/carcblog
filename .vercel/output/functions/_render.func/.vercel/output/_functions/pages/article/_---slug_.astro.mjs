import { c as createAstro, a as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead, d as addAttribute } from "../../chunks/astro/server_DAEOSxK0.mjs";
import "kleur/colors";
import { $ as $$Layout } from "../../chunks/Layout_aVUSthtJ.mjs";
import { g as getArticleBySlug } from "../../chunks/sanity_BghatMyn.mjs";
/* empty css                                     */
import { renderers } from "../../renderers.mjs";
const $$Astro = createAstro("https://carcblog.com");
const prerender = false;
const $$ = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$;
  const { slug } = Astro2.params;
  const articleSlug = slug.join("/");
  const article = await getArticleBySlug(articleSlug);
  if (!article) {
    return Astro2.redirect("/404");
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `${article.title} - Carcblog`, "description": article.excerpt, "data-astro-cid-3p2gr3cb": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-[calc(100vh-var(--header-height))] flex flex-col" data-astro-cid-3p2gr3cb>  <header class="article-header text-center mb-8 pb-6 border-b border-border" data-astro-cid-3p2gr3cb> <div class="article-meta flex flex-col items-center space-x-3 space-y-2" data-astro-cid-3p2gr3cb> <div class="article-author flex items-center space-x-3" data-astro-cid-3p2gr3cb> ${article.author.image ? renderTemplate`<img${addAttribute(article.author.image, "src")}${addAttribute(article.author.name, "alt")} class="author-avatar h-8 w-8 rounded-full object-cover" data-astro-cid-3p2gr3cb>` : renderTemplate`<div class="author-avatar flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium text-xs" data-astro-cid-3p2gr3cb> ${article.author.name.charAt(0).toUpperCase()} </div>`} <div class="author-info text-left" data-astro-cid-3p2gr3cb> <div class="author-name font-semibold text-foreground" data-astro-cid-3p2gr3cb>${article.author.name}</div> <div class="author-title text-xs text-foreground-muted" data-astro-cid-3p2gr3cb>CarcBlog Contributor</div> </div> </div> <div class="publish-date text-sm text-foreground-muted" data-astro-cid-3p2gr3cb> ${new Date(article.publishedAt).toLocaleDateString(void 0, {
    year: "numeric",
    month: "long",
    day: "numeric"
  })} • 5 min read
</div> </div> <h1 class="article-title font-serif text-5xl font-bold text-foreground mb-4 leading-tight" data-astro-cid-3p2gr3cb> ${article.title} </h1> ${article.coverImage && renderTemplate`<div class="relative" data-astro-cid-3p2gr3cb> <img${addAttribute(article.coverImage, "src")}${addAttribute(article.title, "alt")} class="article-image w-full h-64 object-cover rounded-lg shadow-lg" loading="lazy" data-astro-cid-3p2gr3cb> </div>`} </header> <!-- Reading Progress Bar --> <div class="reading-progress h-0.5 bg-background-muted rounded-full overflow-hidden my-4" data-astro-cid-3p2gr3cb> <div class="reading-progress-fill h-full bg-accent-2 transition-all duration-100" id="progressBar" data-astro-cid-3p2gr3cb></div> </div> <!-- Article Content --> <article class="article-content prose prose-lg max-w-none" data-astro-cid-3p2gr3cb> ${article.body ? renderTemplate`<p data-astro-cid-3p2gr3cb>${article.body}</p>` : renderTemplate`<p class="text-foreground-muted" data-astro-cid-3p2gr3cb>Article content loading...</p>`} </article> ${article.author.bio && renderTemplate`<!-- Author Bio -->
      <section class="author-bio flex items-start mt-8 pt-6 border-t border-border" data-astro-cid-3p2gr3cb> ${article.author.image ? renderTemplate`<img${addAttribute(article.author.image, "src")}${addAttribute(article.author.name, "alt")} class="author-bio-avatar h-10 w-10 rounded-full object-cover" data-astro-cid-3p2gr3cb>` : renderTemplate`<div class="author-bio-avatar flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs" data-astro-cid-3p2gr3cb> ${article.author.name.charAt(0).toUpperCase()} </div>`} <div class="author-bio-content ml-4 flex-1" data-astro-cid-3p2gr3cb> <h3 class="author-bio-name font-semibold text-foreground text-lg" data-astro-cid-3p2gr3cb>${article.author.name}</h3> <div class="author-bio-title text-sm text-foreground-muted mb-2" data-astro-cid-3p2gr3cb>Contributor</div> <p class="author-bio-description text-sm text-foreground-muted" data-astro-cid-3p2gr3cb>${article.author.bio}</p> </div> </section>`} </div>  ` })} `;
}, "D:/carcblog/src/pages/article/[...slug].astro", void 0);
const $$file = "D:/carcblog/src/pages/article/[...slug].astro";
const $$url = "/article/[...slug]";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
