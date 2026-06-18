import { supabase, isSupabaseConfigured } from "./supabase";

export interface UserProfile {
  id: string;
  name: string;
  role: string; // public title (e.g. Group Leader)
  portal_role: "Super Admin" | "Editor" | "Member";
  email: string;
  photo?: string;
  owner_user_id?: string;
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  if (!isSupabaseConfigured || !supabase) {
    // Sandbox / Mock Mode
    return {
      id: "sandbox-id",
      name: "Sandbox Admin",
      role: "Group Leader",
      portal_role: "Super Admin",
      email: "admin@sbg-rimt.com",
      photo: "",
      owner_user_id: "sandbox-id",
    };
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return null;

    // Fetch matching team member by email
    const { data: profile, error: profileError } = await supabase
      .from("team_members")
      .select("id, name, role, portal_role, email, photo, owner_user_id")
      .eq("email", user.email)
      .maybeSingle();

    if (profileError) {
      console.warn("Error fetching team member profile:", profileError);
    }

    if (profile) {
      return {
        id: profile.id,
        name: profile.name,
        role: profile.role,
        portal_role: profile.portal_role as "Super Admin" | "Editor" | "Member",
        email: profile.email || user.email || "",
        photo: profile.photo || "",
        owner_user_id: profile.owner_user_id || "",
      };
    }

    // Fallback: If logged in but not in team_members list
    const isAdminEmail = 
      user.email === "adityacybersecurity@gmail.com" || 
      user.email === "admin@sbg-rimt.com" ||
      user.email?.endsWith("@sbg-rimt.com");

    return {
      id: user.id,
      name: user.email?.split("@")[0] || "User",
      role: isAdminEmail ? "Super Admin" : "External User",
      portal_role: isAdminEmail ? "Super Admin" : "Member",
      email: user.email || "",
      owner_user_id: user.id,
    };
  } catch (err) {
    console.warn("Failed to get current user profile:", err);
    return null;
  }
}
