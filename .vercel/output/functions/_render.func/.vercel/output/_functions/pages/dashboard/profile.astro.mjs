import { c as createAstro, a as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead, F as Fragment, d as addAttribute } from "../../chunks/astro/server_DAEOSxK0.mjs";
import "kleur/colors";
import { $ as $$Layout } from "../../chunks/Layout_DwrBHQpm.mjs";
import { g as getCurrentUser, s as supabase } from "../../chunks/auth_kaaN19A4.mjs";
import { renderers } from "../../renderers.mjs";
const $$Astro = createAstro("https://carcblog.com");
const prerender = false;
const $$Profile = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Profile;
  const user = await getCurrentUser(Astro2.locals);
  let profile = null;
  if (user) {
    try {
      const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (error) throw error;
      profile = profileData;
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      profile = {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        bio: user.bio,
        website: null,
        role: user.role,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Profile - Dashboard", "description": "Manage your account settings" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-background"> <div class="flex min-h-screen">  <aside class="w-64 bg-border/50 border-r border-muted/50"> <div class="px-4 py-6"> <div class="flex items-center space-x-3 mb-6"> <div class="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center"> <span class="text-primary font-bold">C</span> </div> <span class="font-semibold text-lg text-foreground">${user?.full_name || "Carcblog"}</span> </div> <nav class="space-y-2"> <a href="/dashboard" class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary"> <span class="mr-3">🏠</span> <span>Overview</span> </a> <a href="/dashboard/articles" class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary"> <span class="mr-3">📝</span> <span>Articles</span> </a> <a href="/dashboard/analytics" class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary"> <span class="mr-3">📊</span> <span>Analytics</span> </a> </nav> <div class="mt-8 pt-4 border-t border-muted/50"> <div class="flex items-center space-x-3 mb-4"> <div class="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-sm font-medium"> ${user ? user.full_name?.charAt(0).toUpperCase() : "U"} </div> <div> <p class="font-medium">${user?.full_name || "Welcome"}</p> <p class="text-xs text-muted-foreground">${user?.role || "Writer"}</p> </div> </div> <a href="/dashboard/profile" class="w-full flex items-center px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary font-semibold"> <span class="mr-3">⚙️</span> <span>Profile</span> </a> </div> </div> </aside>  <main class="flex-1 p-6"> ${user ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <header class="mb-8"> <h1 class="text-2xl font-bold">Profile</h1> <p class="text-muted-foreground">
Manage your account information and preferences.
</p> </header> <div class="max-w-2xl mx-auto"> <div class="bg-background border border-muted/50 rounded-lg p-6"> <div class="space-y-6"> <div class="text-center"> <div class="relative h-24 w-24 mx-auto mb-4"> ${profile?.avatar_url ? renderTemplate`<img${addAttribute(profile.avatar_url, "src")}${addAttribute(`${profile?.full_name || "User"}'s picture`, "alt")} class="w-full h-full rounded-full object-cover border-4 border-primary/20">` : renderTemplate`<div class="w-full h-full bg-primary/20 rounded-full flex items-center justify-center"> <span class="text-primary font-bold">${user?.full_name?.charAt(0) || "U"}</span> </div>`} <div class="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground shadow-md">
+
</div> </div> <h2 class="text-xl font-bold">${profile?.full_name || user?.full_name || "Anonymous User"}</h2> <p class="text-muted-foreground mt-2">${profile?.email || user?.email || "email@example.com"}</p> </div> <div class="space-y-4"> <div> <h3 class="text-lg font-semibold mb-2">Account</h3> <div class="space-y-2"> <div class="flex items-center space-x-3 p-3 bg-muted/50 rounded-md"> <div class="h-8 w-8 bg-primary/20 rounded-lg flex items-center justify-center"> <span class="text-primary">👤</span> </div> <div> <p class="font-medium">Username</p> <p class="text-sm text-muted-foreground">${profile?.username || "username"}</p> </div> </div> <div class="flex items-center space-x-3 p-3 bg-muted/50 rounded-md"> <div class="h-8 w-8 bg-primary/20 rounded-lg flex items-center justify-center"> <span class="text-primary">📧</span> </div> <div> <p class="font-medium">Email</p> <p class="text-sm text-muted-foreground">${profile?.email || user?.email || "email@example.com"}</p> </div> </div> <div class="flex items-center space-x-3 p-3 bg-muted/50 rounded-md"> <div class="h-8 w-8 bg-primary/20 rounded-lg flex items-center justify-center"> <span class="text-primary">🔒</span> </div> <div> <p class="font-medium">Password</p> <p class="text-sm text-muted-foreground">••••••••</p> </div> </div> <div class="flex items-center space-x-3 p-3 bg-muted/50 rounded-md"> <div class="h-8 w-8 bg-primary/20 rounded-lg flex items-center justify-center"> <span class="text-primary">🎖️</span> </div> <div> <p class="font-medium">Role</p> <p class="text-sm text-muted-foreground">${profile?.role || user?.role || "writer"}</p> </div> </div> </div> </div> <div> <h3 class="text-lg font-semibold mb-2">Bio</h3> <div class="space-y-2"> <p class="text-sm text-muted-foreground"> ${profile?.bio || user?.bio || "Tell people about yourself..."} </p> <textarea id="bio" rows="3" class="w-full px-3 py-2 border border-muted/50 rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 resize-none" placeholder="Tell people about yourself...">${profile?.bio || user?.bio || ""}
                        </textarea> </div> </div> <div> <h3 class="text-lg font-semibold mb-2">Social links</h3> <div class="space-y-2"> <div class="flex items-center space-x-3 p-3 bg-muted/50 rounded-md"> <div class="h-8 w-8 bg-primary/20 rounded-lg flex items-center justify-center"> <span class="text-primary">🐦</span> </div> <div> <p class="font-medium">Twitter</p> <input type="text" id="twitter" class="w-full px-3 py-2 border border-muted/50 rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0" placeholder="@yourhandle"> </div> </div> <div class="flex items-center space-x-3 p-3 bg-muted/50 rounded-md"> <div class="h-8 w-8 bg-primary/20 rounded-lg flex items-center justify-center"> <span class="text-primary">📷</span> </div> <div> <p class="font-medium">Instagram</p> <input type="text" id="instagram" class="w-full px-3 py-2 border border-muted/50 rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0" placeholder="@yourhandle"> </div> </div> <div class="flex items-center space-x-3 p-3 bg-muted/50 rounded-md"> <div class="h-8 w-8 bg-primary/20 rounded-lg flex items-center justify-center"> <span class="text-primary">🔗</span> </div> <div> <p class="font-medium">Personal website</p> <input type="url" id="website" class="w-full px-3 py-2 border border-muted/50 rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0" placeholder="https://yourwebsite.com"> </div> </div> </div> </div> <div> <h3 class="text-lg font-semibold mb-2">Preferences</h3> <div class="space-y-3"> <div class="flex items-start space-x-3"> <div class="h-4 w-4 rounded border-muted/50 text-primary bg-background focus:ring-primary"> <input type="checkbox" id="email-notifications" defaultChecked> </div> <div class="space-y-1"> <p class="font-medium">Email notifications for new followers</p> <p class="text-xs text-muted-foreground">Get notified when someone follows you</p> </div> </div> <div class="flex items-start space-x-3"> <div class="h-4 w-4 rounded border-muted/50 text-primary bg-background focus:ring-primary"> <input type="checkbox" id="newsletter"> </div> <div class="space-y-1"> <p class="font-medium">Newsletter subscription</p> <p class="text-xs text-muted-foreground">Receive monthly digest of top stories</p> </div> </div> <div class="flex items-start space-x-3"> <div class="h-4 w-4 rounded border-muted/50 text-primary bg-background focus:ring-primary"> <input type="checkbox" id="allow-comments" defaultChecked> </div> <div class="space-y-1"> <p class="font-medium">Allow comments on your articles</p> <p class="text-xs text-muted-foreground">Readers can leave comments on your published work</p> </div> </div> </div> </div> </div> <div class="mt-8"> <button id="saveButton" class="w-full flex justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium">
Save changes
</button> </div> </div> </div> </div> ` })}` : renderTemplate`<div class="flex-1 flex flex-col items-center justify-center py-12"> <div class="text-center"> <p class="text-muted-foreground">
Please sign in to view and edit your profile.
</p> <a href="/sign-in" class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mt-4">
Sign in
</a> </div> </div>`} </main> </div> </div> ` })} `;
}, "D:/carcblog/src/pages/dashboard/profile.astro", void 0);
const $$file = "D:/carcblog/src/pages/dashboard/profile.astro";
const $$url = "/dashboard/profile";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Profile,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
