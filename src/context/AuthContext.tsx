"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getCurrentUserProfile, UserProfile } from "@/lib/auth-helpers";
import { User, Session } from "@supabase/supabase-js";

interface ActiveSession {
  id: string;
  browser: string;
  os: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error: string | null }>;
  resetPassword: (password: string) => Promise<{ success: boolean; error: string | null }>;
  updateProfilePhoto: (file: File) => Promise<{ url: string | null; error: string | null }>;
  updateProfileDetails: (details: Partial<UserProfile> & { branch?: string; specialization?: string; bio?: string; quote?: string; focus_areas?: string[]; linkedin?: string; github?: string }) => Promise<{ success: boolean; error: string | null }>;
  activeSessions: ActiveSession[];
  refreshActiveSessions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  // Helper to synchronize cookie
  const syncCookie = (session: Session | null) => {
    if (session) {
      // Set session cookie (default max-age 2 hours or 7 days based on Remember Me, handle here or client-side default 7 days)
      document.cookie = `sb-session=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=604800; SameSite=Lax; Secure`;
    } else {
      document.cookie = "sb-session=; path=/; max-age=0; SameSite=Lax; Secure";
    }
  };

  const loadProfile = async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    const p = await getCurrentUserProfile();
    setProfile(p);
    

  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // Mock session for Sandbox/Local Development
      const mockProfile: UserProfile = {
        id: "sandbox-id",
        name: "Sandbox Admin",
        role: "Group Leader",
        portal_role: "Super Admin",
        email: "admin@sbg-rimt.com",
      };
      setProfile(mockProfile);
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        syncCookie(session);
        loadProfile(session.user).finally(() => setLoading(false));
      } else {
        setUser(null);
        setProfile(null);
        syncCookie(null);
        setLoading(false);
      }
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth State Changed Event:", event);
      if (session) {
        setUser(session.user);
        syncCookie(session);
        await loadProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
        syncCookie(null);
        
        // Only redirect to login if we are inside protected pages
        if (pathname.startsWith("/admin")) {
          router.push(`/admin/login?redirectTo=${encodeURIComponent(pathname)}`);
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  // Sign out from other sessions is mocked since standard Supabase Client does not allow listing sessions directly without custom RPC or admin functions
  const refreshActiveSessions = async () => {
    // Mock session list
    const agent = typeof window !== "undefined" ? window.navigator.userAgent : "";
    const isChrome = agent.includes("Chrome");
    const isMac = agent.includes("Macintosh");
    
    setActiveSessions([
      {
        id: "session-1",
        browser: isChrome ? "Chrome Browser" : "Safari Browser",
        os: isMac ? "macOS" : "Windows",
        ip: "192.168.1.1 (Current Session)",
        lastActive: new Date().toLocaleTimeString(),
        isCurrent: true,
      },
      {
        id: "session-2",
        browser: "Mobile Chrome",
        os: "iOS / Android",
        ip: "203.0.113.45",
        lastActive: "2 hours ago",
        isCurrent: false,
      }
    ]);
  };

  const login = async (email: string, password: string, rememberMe: boolean) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: "Supabase is not configured." };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data?.session) {
        // Adjust cookie duration based on Remember Me
        const maxAge = rememberMe ? 604800 * 4 : 604800; // 4 weeks vs 1 week
        document.cookie = `sb-session=${encodeURIComponent(JSON.stringify(data.session))}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
        setUser(data.user);
        const p = await getCurrentUserProfile();
        setProfile(p);
        return { error: null };
      }
      return { error: "Authentication failed. No session returned." };
    } catch (err: any) {
      return { error: err.message || "An error occurred during authentication." };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    syncCookie(null);
    // Hard refresh/redirect is standard to ensure all client state stores are completely destroyed
    window.location.href = "/";
  };

  const forgotPassword = async (email: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "Supabase is not configured." };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + "/reset-password",
      });
      if (error) throw error;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const resetPassword = async (password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "Supabase is not configured." };
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateProfilePhoto = async (file: File) => {
    if (!isSupabaseConfigured || !supabase || !profile) {
      return { url: null, error: "Supabase is not configured or user profile is missing." };
    }

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${profile.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `team-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("builder-assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("builder-assets")
        .getPublicUrl(filePath);

      // Save url to team_members
      const { error: updateError } = await supabase
        .from("team_members")
        .update({ photo: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, photo: publicUrl } as any : null);
      return { url: publicUrl, error: null };
    } catch (err: any) {
      return { url: null, error: err.message || "Failed to upload photo." };
    }
  };

  const updateProfileDetails = async (details: Partial<UserProfile> & { branch?: string; specialization?: string; bio?: string; quote?: string; focus_areas?: string[]; linkedin?: string; github?: string }) => {
    if (!isSupabaseConfigured || !supabase || !profile) {
      return { success: false, error: "Supabase is not configured or user profile is missing." };
    }

    try {
      const { error } = await supabase
        .from("team_members")
        .update({
          ...details,
          updated_at: new Date().toISOString()
        })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...details } as any : null);
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to update profile details." };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        logout,
        forgotPassword,
        resetPassword,
        updateProfilePhoto,
        updateProfileDetails,
        activeSessions,
        refreshActiveSessions,
      }}
    >
      {loading ? (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          <div className="relative flex flex-col items-center gap-6">
            <div className="h-16 w-16 rounded-full border border-orange-500/30 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-t-2 border-orange-500 animate-spin" />
              <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold text-lg">
                SBG
              </div>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Restoring Session</h3>
              <p className="text-xs text-slate-600 font-mono">Authenticating credentials...</p>
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
