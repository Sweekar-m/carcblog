import { c as createAstro, a as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead, F as Fragment, d as addAttribute } from "../../chunks/astro/server_DAEOSxK0.mjs";
import "kleur/colors";
import { $ as $$Layout } from "../../chunks/Layout_DwrBHQpm.mjs";
import { a as getArticlesByAuthor } from "../../chunks/sanity_BghatMyn.mjs";
import { g as getCurrentUser } from "../../chunks/auth_kaaN19A4.mjs";
import { renderers } from "../../renderers.mjs";
const $$Astro = createAstro("https://carcblog.com");
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const user = await getCurrentUser(Astro2.locals);
  const articles = user ? await getArticlesByAuthor(user.id) : [];
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "My Articles - Dashboard", "description": "Manage your published articles and drafts" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-background"> <div class="flex min-h-screen">  <aside class="w-64 bg-border/50 border-r border-muted/50"> <div class="px-4 py-6"> <div class="flex items-center space-x-3 mb-6"> <div class="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center"> <span class="text-primary font-bold">C</span> </div> <span class="font-semibold text-lg text-foreground">Carcblog</span> </div> <nav class="space-y-2"> <a href="/dashboard" class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary"> <span class="mr-3">🏠</span> <span>Overview</span> </a> <a href="/dashboard/articles" class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary font-semibold"> <span class="mr-3">📝</span> <span>Articles</span> </a> <a href="/dashboard/analytics" class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary"> <span class="mr-3">📊</span> <span>Analytics</span> </a> </nav> <div class="mt-8 pt-4 border-t border-muted/50"> <div class="flex items-center space-x-3 mb-4"> <div class="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-sm font-medium">
U
</div> <div> <p class="font-medium">Welcome</p> <p class="text-xs text-muted-foreground">Writer</p> </div> </div> <a href="/dashboard/profile" class="w-full flex items-center px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary"> <span class="mr-3">⚙️</span> <span>Profile</span> </a> </div> </div> </aside>  <main class="flex-1 p-6"> <header class="mb-6"> <h1 class="text-2xl font-bold">My Articles</h1> <p class="text-muted-foreground mt-2">
Manage your published articles and drafts.
</p> <div class="mt-4 flex items-center space-x-4"> <a href="/dashboard/articles/new" class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
New article
</a> </div> </header> <div class="space-y-6">  <section> <h2 class="text-xl font-bold mb-4">Published</h2> <div class="space-y-4"> ${articles.length > 0 ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate`${articles.map((article) => renderTemplate`<article${addAttribute(article._id, "key")} class="bg-background border border-muted/50 rounded-lg p-6 hover:border-primary/20 transition-colors cursor-pointer"> <div class="flex items-start space-x-4"> ${article.coverImage ? renderTemplate`<div class="h-12 w-12 flex-shrink-0"> <img${addAttribute(article.coverImage, "src")}${addAttribute(article.title, "alt")} class="w-full h-full object-cover rounded-lg"> </div>` : renderTemplate`<div class="h-12 w-12 flex-shrink-0 bg-primary/20 rounded-flex flex items-center justify-center"> <span class="text-primary font-bold">${article.title.charAt(0).toUpperCase()}</span> </div>`} <div> <h3 class="font-semibold text-lg">${article.title}</h3> <p class="text-sm text-muted-foreground truncate max-w-xs"> ${article.excerpt || "No preview available"} </p> <div class="mt-2 flex items-center space-x-4 text-sm text-muted-foreground"> <span> <time${addAttribute(article.publishedAt, "datetime")}> ${new Date(article.publishedAt).toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: "numeric"
  })} </time> </span> <span>•</span> <span>${article.author?.name || "Anonymous"} Author</span> </div> </div> </div> </article>`)}` })}` : renderTemplate`<div class="bg-background border border-muted/50 rounded-lg p-6"> <p class="text-center text-muted-foreground py-8">
No published articles yet. <a href="/dashboard/articles/new" class="font-medium text-primary hover:text-primary/90">Create your first article</a> to get started!
</p> </div>`} </div> </section>  <section> <h2 class="text-xl font-bold mb-4">Drafts</h2> <div class="space-y-4">  <div class="bg-background border border-muted/50 rounded-lg p-6"> <p class="text-center text-muted-foreground py-8">
No drafts yet. Ideas waiting to be written?
</p> </div> </div> </section> </div> </main> </div> </div> ` })}`;
}, "D:/carcblog/src/pages/dashboard/articles/index.astro", void 0);
const $$file = "D:/carcblog/src/pages/dashboard/articles/index.astro";
const $$url = "/dashboard/articles";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
