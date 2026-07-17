import { c as createAstro, a as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead, F as Fragment } from "../../chunks/astro/server_DAEOSxK0.mjs";
import "kleur/colors";
import { $ as $$Layout } from "../../chunks/Layout_DwrBHQpm.mjs";
import { g as getCurrentUser } from "../../chunks/auth_kaaN19A4.mjs";
import { renderers } from "../../renderers.mjs";
const $$Astro = createAstro("https://carcblog.com");
const prerender = false;
const $$Analytics = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Analytics;
  const user = await getCurrentUser(Astro2.locals);
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Analytics - Dashboard", "description": "View your article statistics and insights" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-background"> <div class="flex min-h-screen">  <aside class="w-64 bg-border/50 border-r border-muted/50"> <div class="px-4 py-6"> <div class="flex items-center space-x-3 mb-6"> <div class="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center"> <span class="text-primary font-bold">C</span> </div> <span class="font-semibold text-lg text-foreground">${user?.full_name || "Carcblog"}</span> </div> <nav class="space-y-2"> <a href="/dashboard" class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary"> <span class="mr-3">🏠</span> <span>Overview</span> </a> <a href="/dashboard/articles" class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary"> <span class="mr-3">📝</span> <span>Articles</span> </a> <a href="/dashboard/analytics" class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary font-semibold"> <span class="mr-3">📊</span> <span>Analytics</span> </a> </nav> <div class="mt-8 pt-4 border-t border-muted/50"> <div class="flex items-center space-x-3 mb-4"> <div class="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-sm font-medium"> ${user ? user.full_name?.charAt(0).toUpperCase() : "U"} </div> <div> <p class="font-medium">${user?.full_name || "Welcome"}</p> <p class="text-xs text-muted-foreground">${user?.role || "Writer"}</p> </div> </div> <a href="/dashboard/profile" class="w-full flex items-center px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary"> <span class="mr-3">⚙️</span> <span>Profile</span> </a> </div> </div> </aside>  <main class="flex-1 p-6"> ${user ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <header class="mb-8"> <h1 class="text-2xl font-bold">Analytics</h1> <p class="text-muted-foreground">
Track the performance of your articles and audience engagement.
</p> </header> <div class="space-y-8">  <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4"> <div class="bg-background border border-muted/50 rounded-lg p-6"> <div class="flex items-center justify-between mb-4"> <div class="text-sm"> <p class="font-medium">Total views</p> <p class="text-xs text-muted-foreground">Last 30 days</p> </div> <div class="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center"> <span class="text-primary">👁️</span> </div> </div> <p class="text-3xl font-bold">--</p> </div> <div class="bg-background border border-muted/50 rounded-lg p-6"> <div class="flex items-center justify-between mb-4"> <div class="text-sm"> <p class="font-medium">Read time</p> <p class="text-xs text-muted-foreground">Total minutes</p> </div> <div class="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center"> <span class="text-primary">⏱️</span> </div> </div> <p class="text-3xl font-bold">--</p> </div> <div class="bg-background border border-muted/50 rounded-lg p-6"> <div class="flex items-center justify-between mb-4"> <div class="text-sm"> <p class="font-medium">Followers</p> <p class="text-xs text-muted-foreground">Total count</p> </div> <div class="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center"> <span class="text-primary">👥</span> </div> </div> <p class="text-3xl font-bold">--</p> </div> <div class="bg-background border border-muted/50 rounded-lg p-6"> <div class="flex items-center justify-between mb-4"> <div class="text-sm"> <p class="font-medium">Revenue</p> <p class="text-xs text-muted-foreground">Estimated monthly</p> </div> <div class="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center"> <span class="text-primary">💰</span> </div> </div> <p class="text-3xl font-bold">--</p> </div> </div>  <div class="space-y-8"> <div class="bg-background border border-muted/50 rounded-lg p-6"> <h2 class="text-xl font-bold mb-4">Views over time</h2> <div class="h-96"> <!-- In a real app, this would be a chart with real data --> <div class="flex h-full items-center justify-center text-muted-foreground">
Analytics data loading...
</div> </div> </div> <div class="grid gap-6 md:grid-cols-2"> <div class="bg-background border border-muted/50 rounded-lg p-6"> <h2 class="text-xl font-bold mb-4">Top articles</h2> <div class="space-y-4"> <!-- In a real app, this would fetch top articles --> <div class="text-center py-8 text-muted-foreground">
Loading top articles...
</div> </div> </div> <div class="bg-background border border-muted/50 rounded-lg p-6"> <h2 class="text-xl font-bold mb-4">Audience demographics</h2> <div class="space-y-4"> <!-- In a real app, this would fetch demographic data --> <div class="text-center py-8 text-muted-foreground">
Loading demographics...
</div> </div> </div> </div> </div>  <div class="flex justify-end space-x-4"> <button class="px-4 py-2 border border-muted/50 rounded-md hover:bg-muted/50 transition-colors text-sm font-medium">
Export CSV
</button> <button class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium">
Generate report
</button> </div> </div> ` })}` : renderTemplate`<div class="flex-1 flex flex-col items-center justify-center py-12"> <div class="text-center"> <p class="text-muted-foreground">
Please sign in to view your analytics.
</p> <a href="/sign-in" class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mt-4">
Sign in
</a> </div> </div>`} </main> </div> </div> ` })}`;
}, "D:/carcblog/src/pages/dashboard/analytics.astro", void 0);
const $$file = "D:/carcblog/src/pages/dashboard/analytics.astro";
const $$url = "/dashboard/analytics";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Analytics,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
