import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://otflzhkcerzmaibmzgao.supabase.co";
const supabaseAnonKey = "sb_publishable_FuBvSFZ42xLpkfePmU5lng_vi0VCYbB";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function getCurrentUser(locals) {
  if (locals && typeof locals.auth === "function") {
    try {
      const auth = await locals.auth();
      const userId = auth?.userId;
      if (userId) {
        if (typeof locals.currentUser === "function") {
          const clerkUser = await locals.currentUser();
          if (clerkUser) {
            const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
            return {
              id: userId,
              full_name: clerkUser.fullName || `${clerkUser.firstName} ${clerkUser.lastName}`.trim() || "Carcblog Writer",
              username: clerkUser.username || clerkUser.emailAddresses?.[0]?.emailAddress.split("@")[0] || "writer",
              role: profile?.role || "writer",
              bio: profile?.bio || "Carcblog staff writer.",
              avatar_url: clerkUser.imageUrl || null
            };
          }
        }
      } else {
        return null;
      }
    } catch (e) {
      console.warn("Clerk getCurrentUser failed, using fallback:", e);
    }
  }
  return {
    id: "user_123",
    full_name: "John Doe",
    username: "johndoe",
    role: "writer",
    bio: "Software engineer and technical writer",
    avatar_url: null
  };
}
export {
  getCurrentUser as g,
  supabase as s
};
