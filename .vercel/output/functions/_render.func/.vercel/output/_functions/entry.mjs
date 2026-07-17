import { renderers } from "./renderers.mjs";
import { c as createExports } from "./chunks/entrypoint_lNlleGiG.mjs";
import { manifest } from "./manifest_DBEw0cCA.mjs";
const _page0 = () => import("./pages/_image.astro.mjs");
const _page1 = () => import("./pages/404.astro.mjs");
const _page2 = () => import("./pages/about.astro.mjs");
const _page3 = () => import("./pages/article/_---slug_.astro.mjs");
const _page4 = () => import("./pages/auth/sign-in.astro.mjs");
const _page5 = () => import("./pages/auth/sign-up.astro.mjs");
const _page6 = () => import("./pages/dashboard/analytics.astro.mjs");
const _page7 = () => import("./pages/dashboard/articles/new.astro.mjs");
const _page8 = () => import("./pages/dashboard/articles.astro.mjs");
const _page9 = () => import("./pages/dashboard/profile.astro.mjs");
const _page10 = () => import("./pages/dashboard.astro.mjs");
const _page11 = () => import("./pages/design-system.astro.mjs");
const _page12 = () => import("./pages/discover.astro.mjs");
const _page13 = () => import("./pages/feed.astro.mjs");
const _page14 = () => import("./pages/search.astro.mjs");
const _page15 = () => import("./pages/sign-in.astro.mjs");
const _page16 = () => import("./pages/sign-up.astro.mjs");
const _page17 = () => import("./pages/topics.astro.mjs");
const _page18 = () => import("./pages/writers.astro.mjs");
const _page19 = () => import("./pages/index.astro.mjs");
const pageMap = /* @__PURE__ */ new Map([
  ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
  ["src/pages/404.astro", _page1],
  ["src/pages/about.astro", _page2],
  ["src/pages/article/[...slug].astro", _page3],
  ["src/pages/auth/sign-in.astro", _page4],
  ["src/pages/auth/sign-up.astro", _page5],
  ["src/pages/dashboard/analytics.astro", _page6],
  ["src/pages/dashboard/articles/new.astro", _page7],
  ["src/pages/dashboard/articles/index.astro", _page8],
  ["src/pages/dashboard/profile.astro", _page9],
  ["src/pages/dashboard/index.astro", _page10],
  ["src/pages/design-system.astro", _page11],
  ["src/pages/discover.astro", _page12],
  ["src/pages/feed.astro", _page13],
  ["src/pages/search.astro", _page14],
  ["src/pages/sign-in.astro", _page15],
  ["src/pages/sign-up.astro", _page16],
  ["src/pages/topics.astro", _page17],
  ["src/pages/writers.astro", _page18],
  ["src/pages/index.astro", _page19]
]);
const serverIslandMap = /* @__PURE__ */ new Map();
const _manifest = Object.assign(manifest, {
  pageMap,
  serverIslandMap,
  renderers,
  middleware: () => import("./_astro-internal_middleware.mjs")
});
const _args = {
  "middlewareSecret": "15d2b65b-95c7-4064-b665-d77e89f70690",
  "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
export {
  __astrojsSsrVirtualEntry as default,
  pageMap
};
