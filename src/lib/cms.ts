import { supabase, isSupabaseConfigured } from "./supabase";
import { getLocalEvents, saveLocalEvents, EventItem } from "@/data/events";
import { TEAM_MEMBERS, TeamMember } from "@/data/team";
import { GALLERY_ITEMS, GalleryItem } from "@/data/gallery";
import { getLocalAchievements, saveLocalAchievements, AchievementItem } from "@/data/achievements";

export interface CMSAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
  active: boolean;
  buttonText?: string;
  destinationUrl?: string;
  ownerUserId?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CMSAchievement extends AchievementItem {
  ownerUserId?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CMSEvent extends EventItem {
  ownerUserId?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CMSTeamMember extends TeamMember {
  portalRole?: "Super Admin" | "Editor" | "Member";
  email?: string;
  ownerUserId?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CMSGalleryItem extends GalleryItem {
  ownerUserId?: string;
  createdBy?: string;
  updatedBy?: string;
  placeholderColor?: "orange" | "blue" | "purple" | "mint";
}

// LocalStorage key constants
const STORAGE_KEYS = {
  TEAM: "aws_sbg_team",
  EVENTS: "aws_sbg_events",
  GALLERY: "aws_sbg_gallery",
  ACHIEVEMENTS: "aws_sbg_achievements",
  ANNOUNCEMENTS: "aws_sbg_announcements",
  SETTINGS: "aws_sbg_settings",
};

// Helper to check window
const isClient = typeof window !== "undefined";

// Custom event to trigger real-time updates within the same browser when localStorage is used
const triggerStorageRefresh = (key: string) => {
  if (isClient) {
    window.dispatchEvent(new Event("cms-data-updated"));
    // Also dispatch storage event for multi-tab support
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: key,
        newValue: localStorage.getItem(key),
      })
    );
  }
};

// --- EVENTS ---
export async function getEvents(): Promise<CMSEvent[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: false });
    if (error) throw error;
    return (data || []).map((d: any) => ({
      id: d.id,
      title: d.title,
      slug: d.slug,
      date: d.date,
      time: d.time || "",
      type: d.type,
      location: d.location,
      description: d.description,
      longDescription: d.long_description || "",
      registrationLink: d.registration_link,
      status: d.status,
      coverPlaceholderColor: d.cover_placeholder_color,
      imageUrl: d.image_url || "",
      ownerUserId: d.owner_user_id || "",
      createdBy: d.created_by || "",
      updatedBy: d.updated_by || "",
    }));
  } else {
    return getLocalEvents() as CMSEvent[];
  }
}

export async function saveEvent(
  id: string | null,
  eventData: Omit<CMSEvent, "id" | "ownerUserId" | "createdBy" | "updatedBy">,
  userAuthId: string | null
): Promise<CMSEvent> {
  const auditFields = {
    owner_user_id: userAuthId,
    updated_by: userAuthId,
    ...(id ? {} : { created_by: userAuthId }),
  };

  const dbRow = {
    title: eventData.title,
    slug: eventData.slug,
    date: eventData.date,
    time: eventData.time || "TBA",
    type: eventData.type,
    location: eventData.location,
    description: eventData.description,
    long_description: eventData.longDescription || "",
    registration_link: eventData.registrationLink,
    status: eventData.status,
    cover_placeholder_color: eventData.coverPlaceholderColor,
    image_url: eventData.imageUrl || null,
    ...auditFields,
  };

  if (isSupabaseConfigured && supabase) {
    if (id) {
      const { data, error } = await supabase
        .from("events")
        .update(dbRow)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      console.log("Database updated");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cms-data-updated"));
      }
      return {
        ...eventData,
        id: data.id,
        ownerUserId: data.owner_user_id,
        createdBy: data.created_by,
        updatedBy: data.updated_by,
      };
    } else {
      const { data, error } = await supabase
        .from("events")
        .insert([{ ...dbRow, owner_user_id: userAuthId || dbRow.owner_user_id }])
        .select()
        .single();
      if (error) throw error;
      console.log("Database updated");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cms-data-updated"));
      }
      return {
        ...eventData,
        id: data.id,
        ownerUserId: data.owner_user_id,
        createdBy: data.created_by,
        updatedBy: data.updated_by,
      };
    }
  } else {
    // LocalStorage Fallback
    const localEvents = getLocalEvents() as CMSEvent[];
    const item: CMSEvent = {
      ...eventData,
      id: id || Math.random().toString(36).substring(2, 9),
      ownerUserId: userAuthId || "sandbox-id",
      createdBy: id ? (localEvents.find((e) => e.id === id)?.createdBy || "sandbox-id") : (userAuthId || "sandbox-id"),
      updatedBy: userAuthId || "sandbox-id",
    };

    let updatedList: CMSEvent[];
    if (id) {
      updatedList = localEvents.map((e) => (e.id === id ? item : e));
    } else {
      updatedList = [item, ...localEvents];
    }
    saveLocalEvents(updatedList);
    triggerStorageRefresh(STORAGE_KEYS.EVENTS);
    console.log("Database updated");
    return item;
  }
}

export async function deleteEvent(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) throw error;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cms-data-updated"));
    }
  } else {
    const localEvents = getLocalEvents() as CMSEvent[];
    const filtered = localEvents.filter((e) => e.id !== id);
    saveLocalEvents(filtered);
    triggerStorageRefresh(STORAGE_KEYS.EVENTS);
  }
}

// --- TEAM MEMBERS ---
export async function getTeamMembers(): Promise<CMSTeamMember[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data || []).map((d: any) => ({
      id: d.id,
      name: d.name,
      role: d.role,
      branch: d.branch,
      specialization: d.specialization,
      bio: d.bio,
      quote: d.quote,
      focusAreas: d.focus_areas || [],
      initials: d.initials,
      themeColor: d.theme_color,
      photo: d.photo || "",
      linkedin: d.linkedin || "",
      github: d.github || "",
      displayOrder: d.display_order,
      portalRole: d.portal_role,
      email: d.email || "",
      ownerUserId: d.owner_user_id || "",
      createdBy: d.created_by || "",
      updatedBy: d.updated_by || "",
    }));
  } else {
    if (!isClient) return TEAM_MEMBERS as CMSTeamMember[];
    const stored = localStorage.getItem(STORAGE_KEYS.TEAM);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(TEAM_MEMBERS));
      return TEAM_MEMBERS as CMSTeamMember[];
    }
    return JSON.parse(stored);
  }
}

export async function saveTeamMember(
  id: string | null,
  memberData: Omit<CMSTeamMember, "id" | "ownerUserId" | "createdBy" | "updatedBy">,
  userAuthId: string | null
): Promise<CMSTeamMember> {
  const auditFields = {
    owner_user_id: userAuthId,
    updated_by: userAuthId,
    ...(id ? {} : { created_by: userAuthId }),
  };

  const dbRow = {
    name: memberData.name,
    role: memberData.role,
    branch: memberData.branch,
    specialization: memberData.specialization,
    bio: memberData.bio,
    quote: memberData.quote,
    focus_areas: memberData.focusAreas || [],
    initials: memberData.initials,
    theme_color: memberData.themeColor,
    photo: memberData.photo || null,
    linkedin: memberData.linkedin || "",
    github: memberData.github || "",
    display_order: memberData.displayOrder,
    portal_role: memberData.portalRole || "Member",
    email: memberData.email || "",
    ...auditFields,
  };

  if (isSupabaseConfigured && supabase) {
    if (id) {
      const { data, error } = await supabase
        .from("team_members")
        .update(dbRow)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      console.log("Database updated");
      return {
        ...memberData,
        id: data.id,
        ownerUserId: data.owner_user_id,
        createdBy: data.created_by,
        updatedBy: data.updated_by,
      };
    } else {
      const { data, error } = await supabase
        .from("team_members")
        .insert([dbRow])
        .select()
        .single();
      if (error) throw error;
      console.log("Database updated");
      return {
        ...memberData,
        id: data.id,
        ownerUserId: data.owner_user_id,
        createdBy: data.created_by,
        updatedBy: data.updated_by,
      };
    }
  } else {
    const localTeam = await getTeamMembers();
    const item: CMSTeamMember = {
      ...memberData,
      id: id || Math.random().toString(36).substring(2, 9),
      ownerUserId: userAuthId || "sandbox-id",
      createdBy: id ? (localTeam.find((t) => t.id === id)?.createdBy || "sandbox-id") : (userAuthId || "sandbox-id"),
      updatedBy: userAuthId || "sandbox-id",
    };

    let updatedList: CMSTeamMember[];
    if (id) {
      updatedList = localTeam.map((t) => (t.id === id ? item : t));
    } else {
      updatedList = [...localTeam, item];
    }
    localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(updatedList));
    triggerStorageRefresh(STORAGE_KEYS.TEAM);
    console.log("Database updated");
    return item;
  }
}

export async function deleteTeamMember(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("team_members").delete().eq("id", id);
    if (error) throw error;
  } else {
    const localTeam = await getTeamMembers();
    const filtered = localTeam.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(filtered));
    triggerStorageRefresh(STORAGE_KEYS.TEAM);
  }
}

// --- GALLERY IMAGES ---
export async function getGalleryImages(): Promise<CMSGalleryItem[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((d: any) => ({
      id: d.id,
      title: d.title,
      date: d.date,
      description: d.description,
      category: d.category,
      imageUrl: d.image_url || "",
      placeholderColor: d.placeholder_color || "orange",
      eventId: d.event_id || "",
      instagramUrl: d.instagram_url || "",
      participants: d.participants || 0,
      location: d.location || "RIMT University",
      photoCount: d.photo_count || 1,
      ownerUserId: d.owner_user_id || "",
      createdBy: d.created_by || "",
      updatedBy: d.updated_by || "",
    }));
  } else {
    if (!isClient) return GALLERY_ITEMS as CMSGalleryItem[];
    const stored = localStorage.getItem(STORAGE_KEYS.GALLERY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(GALLERY_ITEMS));
      return GALLERY_ITEMS as CMSGalleryItem[];
    }
    return JSON.parse(stored);
  }
}

export async function saveGalleryImage(
  id: string | null,
  imageData: Omit<CMSGalleryItem, "id" | "ownerUserId" | "createdBy" | "updatedBy">,
  userAuthId: string | null
): Promise<CMSGalleryItem> {
  const auditFields = {
    owner_user_id: userAuthId,
    updated_by: userAuthId,
    ...(id ? {} : { created_by: userAuthId }),
  };

  let dbCategory = imageData.category;
  if (dbCategory === "community" || dbCategory === "celebrations") {
    dbCategory = "events";
  }

  const dbRow = {
    title: imageData.title,
    date: imageData.date,
    description: imageData.description,
    category: dbCategory,
    placeholder_color: imageData.placeholderColor || "orange",
    image_url: imageData.imageUrl,
    event_id: imageData.eventId || null,
    instagram_url: imageData.instagramUrl || null,
    ...auditFields,
  };

  if (isSupabaseConfigured && supabase) {
    if (id) {
      const { data, error } = await supabase
        .from("gallery_images")
        .update(dbRow)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      console.log("Database updated");
      return {
        ...imageData,
        id: data.id,
        ownerUserId: data.owner_user_id,
        createdBy: data.created_by,
        updatedBy: data.updated_by,
      };
    } else {
      const { data, error } = await supabase
        .from("gallery_images")
        .insert([dbRow])
        .select()
        .single();
      if (error) throw error;
      console.log("Database updated");
      return {
        ...imageData,
        id: data.id,
        ownerUserId: data.owner_user_id,
        createdBy: data.created_by,
        updatedBy: data.updated_by,
      };
    }
  } else {
    const localGallery = await getGalleryImages();
    const item: CMSGalleryItem = {
      ...imageData,
      id: id || Math.random().toString(36).substring(2, 9),
      ownerUserId: userAuthId || "sandbox-id",
      createdBy: id ? (localGallery.find((g) => g.id === id)?.createdBy || "sandbox-id") : (userAuthId || "sandbox-id"),
      updatedBy: userAuthId || "sandbox-id",
    };

    let updatedList: CMSGalleryItem[];
    if (id) {
      updatedList = localGallery.map((g) => (g.id === id ? item : g));
    } else {
      updatedList = [item, ...localGallery];
    }
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(updatedList));
    triggerStorageRefresh(STORAGE_KEYS.GALLERY);
    console.log("Database updated");
    return item;
  }
}

export async function deleteGalleryImage(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("gallery_images").delete().eq("id", id);
    if (error) throw error;
  } else {
    const localGallery = await getGalleryImages();
    const filtered = localGallery.filter((g) => g.id !== id);
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(filtered));
    triggerStorageRefresh(STORAGE_KEYS.GALLERY);
  }
}

// --- ACHIEVEMENTS ---
export async function getAchievements(): Promise<CMSAchievement[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((d: any) => ({
      id: d.id,
      title: d.title,
      date: d.date,
      description: d.description,
      badgeType: d.badge_type,
      ownerUserId: d.owner_user_id || "",
      createdBy: d.created_by || "",
      updatedBy: d.updated_by || "",
    }));
  } else {
    return getLocalAchievements() as CMSAchievement[];
  }
}

export async function saveAchievement(
  id: string | null,
  achievementData: Omit<CMSAchievement, "id" | "ownerUserId" | "createdBy" | "updatedBy">,
  userAuthId: string | null
): Promise<CMSAchievement> {
  const auditFields = {
    owner_user_id: userAuthId,
    updated_by: userAuthId,
    ...(id ? {} : { created_by: userAuthId }),
  };

  const dbRow = {
    title: achievementData.title,
    date: achievementData.date,
    description: achievementData.description,
    badge_type: achievementData.badgeType,
    ...auditFields,
  };

  if (isSupabaseConfigured && supabase) {
    if (id) {
      const { data, error } = await supabase
        .from("achievements")
        .update(dbRow)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      console.log("Database updated");
      return {
        ...achievementData,
        id: data.id,
        ownerUserId: data.owner_user_id,
        createdBy: data.created_by,
        updatedBy: data.updated_by,
      };
    } else {
      const { data, error } = await supabase
        .from("achievements")
        .insert([dbRow])
        .select()
        .single();
      if (error) throw error;
      console.log("Database updated");
      return {
        ...achievementData,
        id: data.id,
        ownerUserId: data.owner_user_id,
        createdBy: data.created_by,
        updatedBy: data.updated_by,
      };
    }
  } else {
    const localAchievements = getLocalAchievements() as CMSAchievement[];
    const item: CMSAchievement = {
      ...achievementData,
      id: id || Math.random().toString(36).substring(2, 9),
      ownerUserId: userAuthId || "sandbox-id",
      createdBy: id ? (localAchievements.find((a) => a.id === id)?.createdBy || "sandbox-id") : (userAuthId || "sandbox-id"),
      updatedBy: userAuthId || "sandbox-id",
    };

    let updatedList: CMSAchievement[];
    if (id) {
      updatedList = localAchievements.map((a) => (a.id === id ? item : a));
    } else {
      updatedList = [item, ...localAchievements];
    }
    saveLocalAchievements(updatedList);
    triggerStorageRefresh(STORAGE_KEYS.ACHIEVEMENTS);
    console.log("Database updated");
    return item;
  }
}

export async function deleteAchievement(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("achievements").delete().eq("id", id);
    if (error) throw error;
  } else {
    const localAchievements = getLocalAchievements() as CMSAchievement[];
    const filtered = localAchievements.filter((a) => a.id !== id);
    saveLocalAchievements(filtered);
    triggerStorageRefresh(STORAGE_KEYS.ACHIEVEMENTS);
  }
}

// --- ANNOUNCEMENTS ---
export async function getAnnouncements(): Promise<CMSAnnouncement[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((d: any) => ({
      id: d.id,
      title: d.title,
      content: d.content,
      date: d.date,
      active: d.active,
      buttonText: d.button_text || "",
      destinationUrl: d.destination_url || "",
      ownerUserId: d.owner_user_id || "",
      createdBy: d.created_by || "",
      updatedBy: d.updated_by || "",
    }));
  } else {
    if (!isClient) return [];
    const stored = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    if (!stored) {
      const defaultAnn = [
        {
          id: "default-ann",
          title: "AWS Cloud Bootcamp registrations are now open.",
          content: "Register today for our structured study track and get access to cloud sandbox environments.",
          date: "June 22, 2025",
          active: true,
          buttonText: "Learn More",
          destinationUrl: "https://www.meetup.com/aws-sbg-at-rimt-university/",
          ownerUserId: "sandbox-id",
          createdBy: "sandbox-id",
          updatedBy: "sandbox-id",
        },
      ];
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(defaultAnn));
      return defaultAnn;
    }
    return JSON.parse(stored);
  }
}

export async function saveAnnouncement(
  id: string | null,
  annData: Omit<CMSAnnouncement, "id" | "ownerUserId" | "createdBy" | "updatedBy">,
  userAuthId: string | null
): Promise<CMSAnnouncement> {
  const auditFields = {
    owner_user_id: userAuthId,
    updated_by: userAuthId,
    ...(id ? {} : { created_by: userAuthId }),
  };

  const dbRow = {
    title: annData.title,
    content: annData.content,
    date: annData.date,
    active: annData.active,
    button_text: annData.buttonText || null,
    destination_url: annData.destinationUrl || null,
    ...auditFields,
  };

  if (isSupabaseConfigured && supabase) {
    if (id) {
      const { data, error } = await supabase
        .from("announcements")
        .update(dbRow)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      console.log("Database updated");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cms-data-updated"));
      }
      return {
        ...annData,
        id: data.id,
        ownerUserId: data.owner_user_id,
        createdBy: data.created_by,
        updatedBy: data.updated_by,
      };
    } else {
      const { data, error } = await supabase
        .from("announcements")
        .insert([dbRow])
        .select()
        .single();
      if (error) throw error;
      console.log("Database updated");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cms-data-updated"));
      }
      return {
        ...annData,
        id: data.id,
        ownerUserId: data.owner_user_id,
        createdBy: data.created_by,
        updatedBy: data.updated_by,
      };
    }
  } else {
    const localAnn = await getAnnouncements();
    const item: CMSAnnouncement = {
      ...annData,
      id: id || Math.random().toString(36).substring(2, 9),
      ownerUserId: userAuthId || "sandbox-id",
      createdBy: id ? (localAnn.find((a) => a.id === id)?.createdBy || "sandbox-id") : (userAuthId || "sandbox-id"),
      updatedBy: userAuthId || "sandbox-id",
    };

    let updatedList: CMSAnnouncement[];
    if (id) {
      updatedList = localAnn.map((a) => (a.id === id ? item : a));
    } else {
      updatedList = [item, ...localAnn];
    }
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(updatedList));
    triggerStorageRefresh(STORAGE_KEYS.ANNOUNCEMENTS);
    console.log("Database updated");
    return item;
  }
}

export async function deleteAnnouncement(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) throw error;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cms-data-updated"));
    }
  } else {
    const localAnn = await getAnnouncements();
    const filtered = localAnn.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(filtered));
    triggerStorageRefresh(STORAGE_KEYS.ANNOUNCEMENTS);
  }
}
