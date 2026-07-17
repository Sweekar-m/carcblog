import { a as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from "../../../chunks/astro/server_DAEOSxK0.mjs";
import "kleur/colors";
import { $ as $$Layout } from "../../../chunks/Layout_DwrBHQpm.mjs";
import { s as sanityClient } from "../../../chunks/sanity_BghatMyn.mjs";
/* empty css                                     */
import { renderers } from "../../../renderers.mjs";
const prerender = false;
async function POST({ request, locals }) {
  try {
    const { userId, sessionId, getToken } = await locals.auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    if (!data.title || !data.content) {
      return new Response(JSON.stringify({ error: "Title and content are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const articleData = {
      title: data.title,
      slug: {
        current: data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "").substring(0, 60)
        // Limit slug length
      },
      publishedAt: data["publish-immediately"] ? (/* @__PURE__ */ new Date()).toISOString() : null,
      excerpt: data.subtitle || data.content.substring(0, 150) + "...",
      body: [
        {
          _type: "block",
          style: "normal",
          children: [
            {
              _type: "span",
              text: data.content,
              marks: []
            }
          ]
        }
      ],
      author: {
        _type: "reference",
        _ref: userId
        // Assuming user ID in Clerk matches author ID in Sanity
      }
    };
    if (data.coverImageUrl) {
      articleData.coverImage = {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: await uploadImageToSanity(data.coverImageUrl)
        }
      };
    }
    if (data.topics) {
      const topics = data.topics.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
    }
    const result = await sanityClient.create({
      _type: "article",
      ...articleData
    });
    return new Response(JSON.stringify({
      success: true,
      articleId: result._id,
      slug: result.slug.current
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error creating article:", error);
    return new Response(JSON.stringify({ error: "Failed to create article" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
const $$New = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "New Article - Dashboard", "description": "Create a new article", "data-astro-cid-ifxmnai6": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-background" data-astro-cid-ifxmnai6> <div class="flex min-h-screen" data-astro-cid-ifxmnai6>  <aside class="w-64 bg-border/50 border-r border-muted/50" data-astro-cid-ifxmnai6> <div class="px-4 py-6" data-astro-cid-ifxmnai6> <div class="flex items-center space-x-3 mb-6" data-astro-cid-ifxmnai6> <div class="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center" data-astro-cid-ifxmnai6> <span class="text-primary font-bold" data-astro-cid-ifxmnai6>C</span> </div> <span class="font-semibold text-lg text-foreground" data-astro-cid-ifxmnai6>Carcblog</span> </div> <nav class="space-y-2" data-astro-cid-ifxmnai6> <a href="/dashboard" class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary" data-astro-cid-ifxmnai6> <span class="mr-3" data-astro-cid-ifxmnai6>🏠</span> <span data-astro-cid-ifxmnai6>Overview</span> </a> <a href="/dashboard/articles" class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary" data-astro-cid-ifxmnai6> <span class="mr-3" data-astro-cid-ifxmnai6>📝</span> <span data-astro-cid-ifxmnai6>Articles</span> </a> <a href="/dashboard/analytics" class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary" data-astro-cid-ifxmnai6> <span class="mr-3" data-astro-cid-ifxmnai6>📊</span> <span data-astro-cid-ifxmnai6>Analytics</span> </a> </nav> <div class="mt-8 pt-4 border-t border-muted/50" data-astro-cid-ifxmnai6> <div class="flex items-center space-x-3 mb-4" data-astro-cid-ifxmnai6> <div class="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-sm font-medium" data-astro-cid-ifxmnai6>
U
</div> <div data-astro-cid-ifxmnai6> <p class="font-medium" data-astro-cid-ifxmnai6>Welcome</p> <p class="text-xs text-muted-foreground" data-astro-cid-ifxmnai6>Writer</p> </div> </div> <a href="/dashboard/profile" class="w-full flex items-center px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary" data-astro-cid-ifxmnai6> <span class="mr-3" data-astro-cid-ifxmnai6>⚙️</span> <span data-astro-cid-ifxmnai6>Profile</span> </a> </div> </div> </aside>  <main class="flex-1 p-6" data-astro-cid-ifxmnai6> <header class="mb-8" data-astro-cid-ifxmnai6> <h1 class="text-2xl font-bold" data-astro-cid-ifxmnai6>New Article</h1> <p class="text-muted-foreground" data-astro-cid-ifxmnai6>
Share your thoughts and ideas with the world.
</p> </header> <form id="articleForm" class="space-y-6" method="POST" data-astro-cid-ifxmnai6> <div data-astro-cid-ifxmnai6> <label class="block text-sm font-medium text-foreground mb-2" data-astro-cid-ifxmnai6>Title</label> <input type="text" required class="w-full px-4 py-2 border border-muted/50 rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0" placeholder="Enter article title" data-astro-cid-ifxmnai6> </div> <div data-astro-cid-ifxmnai6> <label class="block text-sm font-medium text-foreground mb-2" data-astro-cid-ifxmnai6>Subtitle (optional)</label> <input type="text" class="w-full px-4 py-2 border border-muted/50 rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0" placeholder="Enter subtitle" data-astro-cid-ifxmnai6> </div> <div data-astro-cid-ifxmnai6> <label class="block text-sm font-medium text-foreground mb-2" data-astro-cid-ifxmnai6>Cover Image URL (optional)</label> <input type="url" class="w-full px-4 py-2 border border-muted/50 rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0" placeholder="https://example.com/image.jpg" data-astro-cid-ifxmnai6> </div> <div data-astro-cid-ifxmnai6> <label class="block text-sm font-medium text-foreground mb-2" data-astro-cid-ifxmnai6>Topics (comma-separated)</label> <input type="text" class="w-full px-4 py-2 border border-muted/50 rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0" placeholder="technology, science, ai" data-astro-cid-ifxmnai6> </div> <div class="border-t border-muted/50 pt-4" data-astro-cid-ifxmnai6> <label class="block text-sm font-medium text-foreground mb-2" data-astro-cid-ifxmnai6>Content</label> <div class="relative" data-astro-cid-ifxmnai6> <textarea id="content" rows="20" class="w-full px-4 py-2 border border-muted/50 rounded-md bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0" placeholder="Write your article here..." required data-astro-cid-ifxmnai6></textarea> <div class="absolute bottom-2 right-2 text-xs text-muted-foreground" data-astro-cid-ifxmnai6> <span id="word-count" data-astro-cid-ifxmnai6>0</span> words
</div> </div> </div> <div class="flex items-center space-x-4" data-astro-cid-ifxmnai6> <label class="flex items-center space-x-2 text-sm font-medium text-foreground" data-astro-cid-ifxmnai6> <input type="checkbox" id="publish-immediate" checked data-astro-cid-ifxmnai6>
Publish immediately
</label> </div> <div class="mt-6" data-astro-cid-ifxmnai6> <button type="submit" id="submitButton" class="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50" data-astro-cid-ifxmnai6>
Publish article
</button> </div> </form> <div id="formResponse" class="mt-4 hidden" data-astro-cid-ifxmnai6></div> </main> </div> </div> ` })}  `;
}, "D:/carcblog/src/pages/dashboard/articles/new.astro", void 0);
const $$file = "D:/carcblog/src/pages/dashboard/articles/new.astro";
const $$url = "/dashboard/articles/new";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST,
  default: $$New,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
