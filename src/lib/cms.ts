import { supabase, isSupabaseConfigured } from "./supabase";
import { getLocalEvents, saveLocalEvents, EventItem } from "@/data/events";
import { TEAM_MEMBERS, TeamMember } from "@/data/team";
import { GALLERY_ITEMS, GalleryItem } from "@/data/gallery";
import { getLocalAchievements, saveLocalAchievements, AchievementItem } from "@/data/achievements";
import { getLocalSpeakers, saveLocalSpeakers, SpeakerItem } from "@/data/speakers";
import { emitCmsUpdate } from "./cmsEvents";

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
  SPEAKERS: "aws_sbg_speakers",
};

// Helper to check window
const isClient = typeof window !== "undefined";

// Custom event to trigger real-time updates within the same browser when localStorage is used
const triggerStorageRefresh = (key: string) => {
  if (isClient) {
    let entity: any = null;
    if (key === STORAGE_KEYS.EVENTS) entity = "events";
    else if (key === STORAGE_KEYS.TEAM) entity = "team_members";
    else if (key === STORAGE_KEYS.GALLERY) entity = "gallery_images";
    else if (key === STORAGE_KEYS.ACHIEVEMENTS) entity = "achievements";
    else if (key === STORAGE_KEYS.ANNOUNCEMENTS) entity = "announcements";
    else if (key === STORAGE_KEYS.SPEAKERS) entity = "speakers";
    
    if (entity) {
      emitCmsUpdate(entity);
    } else {
      window.dispatchEvent(new Event("cms-data-updated"));
    }

    // Also dispatch storage event for multi-tab support
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: key,
        newValue: localStorage.getItem(key),
      })
    );
  }
};

// --- STORAGE CLEANUP HELPER ---
export async function deleteStorageFile(publicUrl: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase || !publicUrl) return;
  try {
    const marker = "/storage/v1/object/public/builder-assets/";
    const markerIdx = publicUrl.indexOf(marker);
    if (markerIdx === -1) return;
    const filePath = publicUrl.substring(markerIdx + marker.length);
    if (!filePath) return;
    
    console.log(`[Storage Cleanup] Deleting: ${filePath}`);
    const { error } = await supabase.storage.from("builder-assets").remove([filePath]);
    if (error) {
      console.warn(`[Storage Cleanup] Error removing file '${filePath}':`, error.message);
    } else {
      console.log(`[Storage Cleanup] Successfully removed file '${filePath}'`);
    }
  } catch (err: any) {
    console.warn("[Storage Cleanup] Exception during deletion:", err.message || err);
  }
}

export interface ActivityLogParams {
  userId: string | null;
  userName?: string | null;
  action: 'create' | 'update' | 'delete' | 'upload';
  entityType: 'event' | 'announcement' | 'gallery_image' | 'achievement' | 'team_member' | 'settings' | 'speaker';
  entityId?: string;
  metadata?: Record<string, any>;
}

export async function logActivity(params: ActivityLogParams): Promise<void> {
  if (!isSupabaseConfigured || !supabase || !params.userId) return;
  try {
    const { error } = await supabase.from("activity_logs").insert([{
      user_id: params.userId,
      user_name: params.userName || "Unknown Admin",
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId || null,
      metadata: params.metadata || {},
    }]);
    if (error) {
      console.warn("[Activity Log] Failed to insert log entry:", error.message);
    }
  } catch (err: any) {
    console.warn("[Activity Log] Exception during logging:", err.message || err);
  }
}

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

export async function checkSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  if (!slug) return false;
  const trimmed = slug.trim().toLowerCase();
  if (isSupabaseConfigured && supabase) {
    let query = supabase.from("events").select("id").eq("slug", trimmed);
    if (excludeId) {
      query = query.neq("id", excludeId);
    }
    const { data, error } = await query;
    if (error) {
      console.error("Error checking slug availability:", error);
      return false;
    }
    return (data || []).length === 0;
  } else {
    const localEvents = getLocalEvents() as CMSEvent[];
    const match = localEvents.find((e) => e.slug.trim().toLowerCase() === trimmed && e.id !== excludeId);
    return !match;
  }
}

export async function saveEvent(
  id: string | null,
  eventData: Omit<CMSEvent, "id" | "ownerUserId" | "createdBy" | "updatedBy">,
  userAuthId: string | null,
  userName?: string | null
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

      await logActivity({
        userId: userAuthId,
        userName,
        action: 'update',
        entityType: 'event',
        entityId: data.id,
        metadata: { title: eventData.title, slug: eventData.slug }
      });

      emitCmsUpdate("events");
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

      await logActivity({
        userId: userAuthId,
        userName,
        action: 'create',
        entityType: 'event',
        entityId: data.id,
        metadata: { title: eventData.title, slug: eventData.slug }
      });

      emitCmsUpdate("events");
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

export async function deleteEvent(
  id: string,
  userAuthId?: string | null,
  userName?: string | null
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    let imageUrl = "";
    try {
      const { data } = await supabase.from("events").select("image_url").eq("id", id).single();
      if (data) imageUrl = data.image_url || "";
    } catch (e) {
      console.warn("Could not fetch event image URL before delete", e);
    }

    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) throw error;

    if (imageUrl) {
      await deleteStorageFile(imageUrl);
    }

    await logActivity({
      userId: userAuthId || null,
      userName: userName || null,
      action: 'delete',
      entityType: 'event',
      entityId: id,
      metadata: { imageUrl }
    });

    emitCmsUpdate("events");
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
  userAuthId: string | null,
  userName?: string | null
): Promise<CMSTeamMember> {
  const auditFields = {
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

      await logActivity({
        userId: userAuthId,
        userName,
        action: 'update',
        entityType: 'team_member',
        entityId: data.id,
        metadata: { name: memberData.name, role: memberData.role }
      });

      emitCmsUpdate("team_members");
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

      await logActivity({
        userId: userAuthId,
        userName,
        action: 'create',
        entityType: 'team_member',
        entityId: data.id,
        metadata: { name: memberData.name, role: memberData.role }
      });

      emitCmsUpdate("team_members");
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

export async function deleteTeamMember(
  id: string,
  userAuthId?: string | null,
  userName?: string | null
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    let photoUrl = "";
    try {
      const { data } = await supabase.from("team_members").select("photo").eq("id", id).single();
      if (data) photoUrl = data.photo || "";
    } catch (e) {
      console.warn("Could not fetch team member photo before delete", e);
    }

    const { error } = await supabase.from("team_members").delete().eq("id", id);
    if (error) throw error;

    if (photoUrl) {
      await deleteStorageFile(photoUrl);
    }

    await logActivity({
      userId: userAuthId || null,
      userName: userName || null,
      action: 'delete',
      entityType: 'team_member',
      entityId: id,
      metadata: { photoUrl }
    });

    emitCmsUpdate("team_members");
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
  userAuthId: string | null,
  userName?: string | null
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

      await logActivity({
        userId: userAuthId,
        userName,
        action: 'update',
        entityType: 'gallery_image',
        entityId: data.id,
        metadata: { title: imageData.title }
      });

      emitCmsUpdate("gallery_images");
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

      await logActivity({
        userId: userAuthId,
        userName,
        action: 'create',
        entityType: 'gallery_image',
        entityId: data.id,
        metadata: { title: imageData.title }
      });

      emitCmsUpdate("gallery_images");
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

export async function deleteGalleryImage(
  id: string,
  userAuthId?: string | null,
  userName?: string | null
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    let imageUrl = "";
    try {
      const { data } = await supabase.from("gallery_images").select("image_url").eq("id", id).single();
      if (data) imageUrl = data.image_url || "";
    } catch (e) {
      console.warn("Could not fetch gallery image URL before delete", e);
    }

    const { error } = await supabase.from("gallery_images").delete().eq("id", id);
    if (error) throw error;

    if (imageUrl) {
      await deleteStorageFile(imageUrl);
    }

    await logActivity({
      userId: userAuthId || null,
      userName: userName || null,
      action: 'delete',
      entityType: 'gallery_image',
      entityId: id,
      metadata: { imageUrl }
    });

    emitCmsUpdate("gallery_images");
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
  userAuthId: string | null,
  userName?: string | null
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

      await logActivity({
        userId: userAuthId,
        userName,
        action: 'update',
        entityType: 'achievement',
        entityId: data.id,
        metadata: { title: achievementData.title }
      });

      emitCmsUpdate("achievements");
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

      await logActivity({
        userId: userAuthId,
        userName,
        action: 'create',
        entityType: 'achievement',
        entityId: data.id,
        metadata: { title: achievementData.title }
      });

      emitCmsUpdate("achievements");
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

export async function deleteAchievement(
  id: string,
  userAuthId?: string | null,
  userName?: string | null
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("achievements").delete().eq("id", id);
    if (error) throw error;

    await logActivity({
      userId: userAuthId || null,
      userName: userName || null,
      action: 'delete',
      entityType: 'achievement',
      entityId: id
    });

    emitCmsUpdate("achievements");
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
  userAuthId: string | null,
  userName?: string | null
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

      await logActivity({
        userId: userAuthId,
        userName,
        action: 'update',
        entityType: 'announcement',
        entityId: data.id,
        metadata: { title: annData.title }
      });

      emitCmsUpdate("announcements");
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

      await logActivity({
        userId: userAuthId,
        userName,
        action: 'create',
        entityType: 'announcement',
        entityId: data.id,
        metadata: { title: annData.title }
      });

      emitCmsUpdate("announcements");
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

export async function deleteAnnouncement(
  id: string,
  userAuthId?: string | null,
  userName?: string | null
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) throw error;

    await logActivity({
      userId: userAuthId || null,
      userName: userName || null,
      action: 'delete',
      entityType: 'announcement',
      entityId: id
    });

    emitCmsUpdate("announcements");
  } else {
    const localAnn = await getAnnouncements();
    const filtered = localAnn.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(filtered));
    triggerStorageRefresh(STORAGE_KEYS.ANNOUNCEMENTS);
  }
}

// --- SPEAKERS VIEW & ACTIONS ---

export interface CMSSpeaker extends SpeakerItem {
  ownerUserId?: string;
  createdBy?: string;
  updatedBy?: string;
}

export async function getSpeakers(): Promise<CMSSpeaker[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("speakers")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      if (data) {
        return (data as any[]).map((d) => ({
          id: d.id,
          name: d.name,
          title: d.title,
          bio: d.bio,
          imageUrl: d.image_url || "",
          achievements: d.achievements || [],
          socialLinks: {
            linkedin: d.social_links?.linkedin || "",
            twitter: d.social_links?.twitter || "",
            website: d.social_links?.website || ""
          },
          eventId: d.event_id || "",
          isFeatured: d.is_featured,
          sortOrder: d.sort_order,
          quote: d.quote || "",
          ownerUserId: d.owner_user_id,
          createdBy: d.created_by,
          updatedBy: d.updated_by
        }));
      }
    } catch (err) {
      console.warn("Error fetching speakers from Supabase, falling back to local:", err);
    }
  }
  
  // LocalStorage / static fallback
  const local = getLocalSpeakers();
  return local.map(s => ({
    ...s,
    ownerUserId: "sandbox-id",
    createdBy: "sandbox-id",
    updatedBy: "sandbox-id"
  }));
}

export async function saveSpeaker(
  speakerData: Omit<SpeakerItem, "id">,
  id?: string,
  userAuthId?: string | null,
  userName?: string | null
): Promise<CMSSpeaker> {
  const dbRow = {
    name: speakerData.name,
    title: speakerData.title,
    bio: speakerData.bio,
    image_url: speakerData.imageUrl || null,
    achievements: speakerData.achievements || [],
    social_links: speakerData.socialLinks || {},
    event_id: speakerData.eventId || null,
    is_featured: speakerData.isFeatured || false,
    sort_order: speakerData.sortOrder || 0,
    quote: speakerData.quote || null,
    updated_by: userAuthId || null
  };

  if (isSupabaseConfigured && supabase) {
    if (id) {
      const { data, error } = await supabase
        .from("speakers")
        .update(dbRow)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      
      await logActivity({
        userId: userAuthId || null,
        userName: userName || null,
        action: 'update',
        entityType: 'speaker',
        entityId: id,
        metadata: { name: speakerData.name }
      });

      emitCmsUpdate("speakers");
      return {
        ...speakerData,
        id: data.id,
        ownerUserId: data.owner_user_id,
        createdBy: data.created_by,
        updatedBy: data.updated_by
      };
    } else {
      const { data, error } = await supabase
        .from("speakers")
        .insert([{ ...dbRow, owner_user_id: userAuthId || null, created_by: userAuthId || null }])
        .select()
        .single();
      if (error) throw error;
      
      await logActivity({
        userId: userAuthId || null,
        userName: userName || null,
        action: 'create',
        entityType: 'speaker',
        entityId: data.id,
        metadata: { name: speakerData.name }
      });

      emitCmsUpdate("speakers");
      return {
        ...speakerData,
        id: data.id,
        ownerUserId: data.owner_user_id,
        createdBy: data.created_by,
        updatedBy: data.updated_by
      };
    }
  } else {
    // LocalStorage Fallback
    const local = getLocalSpeakers();
    const item: CMSSpeaker = {
      ...speakerData,
      id: id || Math.random().toString(36).substring(2, 9),
      ownerUserId: userAuthId || "sandbox-id",
      createdBy: id ? ((local.find((s) => s.id === id) as any)?.createdBy || "sandbox-id") : (userAuthId || "sandbox-id"),
      updatedBy: userAuthId || "sandbox-id",
    };

    let updatedList: CMSSpeaker[];
    if (id) {
      updatedList = local.map((s) => (s.id === id ? item : s));
    } else {
      updatedList = [item, ...local];
    }
    saveLocalSpeakers(updatedList);
    triggerStorageRefresh(STORAGE_KEYS.SPEAKERS);
    console.log("Database updated");
    return item;
  }
}

export async function deleteSpeaker(
  id: string,
  userAuthId?: string | null,
  userName?: string | null
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("speakers").delete().eq("id", id);
    if (error) throw error;

    await logActivity({
      userId: userAuthId || null,
      userName: userName || null,
      action: 'delete',
      entityType: 'speaker',
      entityId: id
    });

    emitCmsUpdate("speakers");
  } else {
    const local = getLocalSpeakers();
    const filtered = local.filter((s) => s.id !== id);
    saveLocalSpeakers(filtered);
    triggerStorageRefresh(STORAGE_KEYS.SPEAKERS);
  }
}
