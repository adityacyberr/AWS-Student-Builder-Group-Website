"use client";

import { useState, useEffect } from "react";
import { getLocalEvents, saveLocalEvents, EventItem } from "@/data/events";
import { getLocalAchievements, saveLocalAchievements, AchievementItem } from "@/data/achievements";
import { TEAM_MEMBERS, TeamMember } from "@/data/team";
import { GALLERY_ITEMS, GalleryItem } from "@/data/achievements";
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Edit2, 
  Settings, 
  Users, 
  CheckCircle,
  Save,
  LogOut,
  AlertTriangle,
  Trophy,
  Image as ImageIcon,
  Megaphone,
  BarChart3,
  Lock,
  Upload,
  ExternalLink,
  X
} from "lucide-react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  date: string;
  active: boolean;
}

interface StatItem {
  id?: string;
  label: string;
  value: string;
  display_order: number;
}

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [activeTab, setActiveTab] = useState<"events" | "achievements" | "team" | "gallery" | "announcements" | "stats" | "settings">("events");
  const [notification, setNotification] = useState<string | null>(null);

  // Data states
  const [events, setEvents] = useState<EventItem[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [meetupUrl, setMeetupUrl] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // CRUD Forms Toggles & Loading States
  const [uploading, setUploading] = useState(false);
  
  // Events Form
  const [showEventForm, setShowEventForm] = useState(false);
  const [editEventId, setEditEventId] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventSlug, setEventSlug] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventType, setEventType] = useState<'Workshop' | 'Hackathon' | 'Meetup' | 'Webinar'>("Workshop");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventLongDescription, setEventLongDescription] = useState("");
  const [eventStatus, setEventStatus] = useState<'upcoming' | 'completed'>("upcoming");
  const [eventCoverColor, setEventCoverColor] = useState<'orange' | 'blue' | 'purple' | 'mint' | 'amber'>("orange");
  const [eventRegLink, setEventRegLink] = useState("https://www.meetup.com/aws-sbg-at-rimt-university/?eventOrigin=your_groups");

  // Achievements Form
  const [showAchievementForm, setShowAchievementForm] = useState(false);
  const [editAchievementId, setEditAchievementId] = useState<string | null>(null);
  const [achTitle, setAchTitle] = useState("");
  const [achDate, setAchDate] = useState("");
  const [achBadge, setAchBadge] = useState<'charter' | 'team' | 'milestone'>("milestone");
  const [achDesc, setAchDesc] = useState("");

  // Team Form
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editTeamId, setEditTeamId] = useState<string | null>(null);
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState("");
  const [memberBranch, setMemberBranch] = useState("");
  const [memberSpecialization, setMemberSpecialization] = useState("");
  const [memberBio, setMemberBio] = useState("");
  const [memberQuote, setMemberQuote] = useState("");
  const [memberFocusAreas, setMemberFocusAreas] = useState("");
  const [memberInitials, setMemberInitials] = useState("");
  const [memberThemeColor, setMemberThemeColor] = useState("orange");
  const [memberPhoto, setMemberPhoto] = useState("");
  const [memberLinkedin, setMemberLinkedin] = useState("javascript:void(0)");
  const [memberGithub, setMemberGithub] = useState("javascript:void(0)");
  const [memberDisplayOrder, setMemberDisplayOrder] = useState(1);

  // Gallery Form
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [editGalleryId, setEditGalleryId] = useState<string | null>(null);
  const [galTitle, setGalTitle] = useState("");
  const [galDate, setGalDate] = useState("");
  const [galDesc, setGalDesc] = useState("");
  const [galCategory, setGalCategory] = useState<'events' | 'workshops' | 'labs'>("events");
  const [galColor, setGalColor] = useState<'orange' | 'blue' | 'purple' | 'mint'>("orange");
  const [galImageUrl, setGalImageUrl] = useState("");

  // Announcement Form
  const [showAnnounceForm, setShowAnnounceForm] = useState(false);
  const [editAnnounceId, setEditAnnounceId] = useState<string | null>(null);
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annDate, setAnnDate] = useState("");
  const [annActive, setAnnActive] = useState(true);

  // Stats Form
  const [showStatForm, setShowStatForm] = useState(false);
  const [editStatId, setEditStatId] = useState<string | null>(null);
  const [statLabel, setStatLabel] = useState("");
  const [statValue, setStatValue] = useState("");
  const [statOrder, setStatOrder] = useState(1);

  // Auth Effect
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Data Loading Effect
  useEffect(() => {
    if (!authLoading && (!isSupabaseConfigured || session)) {
      loadAllData();
    }
  }, [session, authLoading]);

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const loadAllData = async () => {
    // 1. Events
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("events").select("*").order("date", { ascending: false });
        if (!error && data) {
          setEvents(data.map((d: any) => ({
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
          })));
        }
      } catch (err) { console.error(err); }
    } else {
      setEvents(getLocalEvents());
    }

    // 2. Achievements
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("achievements").select("*").order("date", { ascending: false });
        if (!error && data) {
          setAchievements(data.map((d: any) => ({
            id: d.id,
            title: d.title,
            date: d.date,
            description: d.description,
            badgeType: d.badge_type,
          })));
        }
      } catch (err) { console.error(err); }
    } else {
      setAchievements(getLocalAchievements());
    }

    // 3. Team Members
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("team_members").select("*").order("display_order", { ascending: true });
        if (!error && data) {
          setTeamMembers(data.map((d: any) => ({
            id: d.id,
            name: d.name,
            role: d.role,
            branch: d.branch,
            specialization: d.specialization,
            bio: d.bio,
            quote: d.quote,
            focusAreas: d.focus_areas,
            initials: d.initials,
            themeColor: d.theme_color,
            photo: d.photo || "",
            linkedin: d.linkedin,
            github: d.github,
            displayOrder: d.display_order,
          })));
        }
      } catch (err) { console.error(err); }
    } else {
      const stored = localStorage.getItem("aws_sbg_team");
      if (stored) {
        setTeamMembers(JSON.parse(stored));
      } else {
        setTeamMembers(TEAM_MEMBERS);
        localStorage.setItem("aws_sbg_team", JSON.stringify(TEAM_MEMBERS));
      }
    }

    // 4. Gallery Items
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("gallery_images").select("*").order("created_at", { ascending: false });
        if (!error && data) {
          setGalleryItems(data.map((d: any) => ({
            id: d.id,
            title: d.title,
            date: d.date,
            description: d.description,
            category: d.category,
            placeholderColor: d.placeholder_color,
            imageUrl: d.image_url || "",
          })));
        }
      } catch (err) { console.error(err); }
    } else {
      const stored = localStorage.getItem("aws_sbg_gallery");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const defaultIds = new Set(["inaugural-launch", "core-planning-session", "genai-labs-setup", "launch-agenda", "welcome-team"]);
          const customItems = parsed.filter(
            (item: any) => !defaultIds.has(item.id)
          );
          const merged = [...GALLERY_ITEMS, ...customItems];
          setGalleryItems(merged);
          localStorage.setItem("aws_sbg_gallery", JSON.stringify(merged));
        } catch (e) {
          console.error(e);
          setGalleryItems([]);
        }
      } else {
        setGalleryItems(GALLERY_ITEMS);
        localStorage.setItem("aws_sbg_gallery", JSON.stringify(GALLERY_ITEMS));
      }
    }

    // 5. Announcements
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
        if (!error && data) {
          setAnnouncements(data);
        }
      } catch (err) { console.error(err); }
    } else {
      const stored = localStorage.getItem("aws_sbg_announcements");
      setAnnouncements(stored ? JSON.parse(stored) : []);
    }

    // 6. Homepage Stats
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("homepage_stats").select("*").order("display_order", { ascending: true });
        if (!error && data) {
          setStats(data);
        }
      } catch (err) { console.error(err); }
    } else {
      const stored = localStorage.getItem("aws_sbg_stats");
      if (stored) {
        setStats(JSON.parse(stored));
      } else {
        const initialStats = [
          { label: "Members", value: "150+", display_order: 1 },
          { label: "Bootcamps", value: "3+", display_order: 2 },
          { label: "Hands-On", value: "100%", display_order: 3 },
        ];
        setStats(initialStats);
        localStorage.setItem("aws_sbg_stats", JSON.stringify(initialStats));
      }
    }

    // 7. Site Settings
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("site_settings").select("*");
        if (!error && data) {
          data.forEach((row: any) => {
            if (row.key === "meetup_url") setMeetupUrl(row.value);
            if (row.key === "whatsapp_url") setWhatsappUrl(row.value);
            if (row.key === "contact_email") setContactEmail(row.value);
          });
        }
      } catch (err) { console.error(err); }
    } else {
      setMeetupUrl(localStorage.getItem("aws_sbg_meetup_url") || "https://www.meetup.com/aws-sbg-at-rimt-university/?eventOrigin=your_groups");
      setWhatsappUrl(localStorage.getItem("aws_sbg_whatsapp_url") || "https://chat.whatsapp.com/aws-sbg-rimt");
      setContactEmail(localStorage.getItem("aws_sbg_contact_email") || "sbg.rimt@gmail.com");
    }
  };

  // Image upload handler
  const handleImageUpload = async (file: File, folder: "team" | "gallery"): Promise<string | null> => {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("builder-assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("builder-assets")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image to storage");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "team" | "gallery") => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = await handleImageUpload(file, type);
      if (url) {
        if (type === "team") {
          setMemberPhoto(url);
          showToast("Photo uploaded to Supabase Storage!");
        } else {
          setGalImageUrl(url);
          showToast("Image uploaded to Supabase Storage!");
        }
      }
    }
  };

  // Auth Submit Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured || !supabase) return;
    try {
      setAuthLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert(`Authentication failed: ${error.message}`);
      } else {
        showToast("Signed in successfully!");
      }
    } catch (err: any) {
      alert(err.message || "An authentication error occurred.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      showToast("Logged out successfully.");
    }
  };

  // 1. CREATE/UPDATE EVENT
  const handleCreateOrUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDate || !eventLocation || !eventDescription) {
      alert("Please complete all required fields.");
      return;
    }

    const calculatedSlug = eventSlug || eventTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const eventData: Partial<EventItem> = {
      title: eventTitle,
      slug: calculatedSlug,
      date: eventDate,
      time: eventTime,
      type: eventType,
      location: eventLocation,
      description: eventDescription,
      longDescription: eventLongDescription,
      registrationLink: eventRegLink,
      status: eventStatus,
      coverPlaceholderColor: eventCoverColor
    };

    if (isSupabaseConfigured && supabase) {
      try {
        if (editEventId) {
          const { error } = await supabase.from("events").update({
            title: eventData.title,
            slug: eventData.slug,
            date: eventData.date,
            time: eventData.time,
            type: eventData.type,
            location: eventData.location,
            description: eventData.description,
            long_description: eventData.longDescription,
            registration_link: eventData.registrationLink,
            status: eventData.status,
            cover_placeholder_color: eventData.coverPlaceholderColor
          }).eq("id", editEventId);
          if (error) throw error;
          showToast("Event updated successfully!");
        } else {
          const { error } = await supabase.from("events").insert({
            title: eventData.title,
            slug: eventData.slug,
            date: eventData.date,
            time: eventData.time,
            type: eventData.type,
            location: eventData.location,
            description: eventData.description,
            long_description: eventData.longDescription,
            registration_link: eventData.registrationLink,
            status: eventData.status,
            cover_placeholder_color: eventData.coverPlaceholderColor
          });
          if (error) throw error;
          showToast("Event created successfully!");
        }
      } catch (err) {
        console.error(err);
        alert("Database transaction failed");
      }
    } else {
      // Local fallback
      const finalEvent: EventItem = {
        id: editEventId || calculatedSlug,
        title: eventData.title!,
        slug: eventData.slug!,
        date: eventData.date!,
        time: eventData.time,
        type: eventData.type!,
        location: eventData.location!,
        description: eventData.description!,
        longDescription: eventData.longDescription,
        registrationLink: eventData.registrationLink!,
        status: eventData.status!,
        coverPlaceholderColor: eventData.coverPlaceholderColor!
      };
      let list = getLocalEvents();
      if (editEventId) {
        list = list.map(ev => ev.id === editEventId ? finalEvent : ev);
      } else {
        list = [finalEvent, ...list];
      }
      saveLocalEvents(list);
      showToast("Saved to browser sandbox storage.");
    }
    resetEventForm();
    loadAllData();
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("events").delete().eq("id", id);
        if (error) throw error;
        showToast("Deleted event from Supabase.");
      } catch (err) {
        console.error(err);
        alert("Delete failed");
      }
    } else {
      const list = getLocalEvents().filter(ev => ev.id !== id);
      saveLocalEvents(list);
      showToast("Removed from sandbox memory.");
    }
    loadAllData();
  };

  const handleEditEventClick = (e: EventItem) => {
    setEditEventId(e.id);
    setEventTitle(e.title);
    setEventSlug(e.slug);
    setEventDate(e.date);
    setEventTime(e.time || "");
    setEventType(e.type);
    setEventLocation(e.location);
    setEventDescription(e.description);
    setEventLongDescription(e.longDescription || "");
    setEventStatus(e.status);
    setEventCoverColor(e.coverPlaceholderColor);
    setEventRegLink(e.registrationLink);
    setShowEventForm(true);
  };

  const resetEventForm = () => {
    setEditEventId(null);
    setEventTitle("");
    setEventSlug("");
    setEventDate("");
    setEventTime("");
    setEventType("Workshop");
    setEventLocation("");
    setEventDescription("");
    setEventLongDescription("");
    setEventStatus("upcoming");
    setEventCoverColor("orange");
    setEventRegLink("https://www.meetup.com/aws-sbg-at-rimt-university/?eventOrigin=your_groups");
    setShowEventForm(false);
  };

  // 2. CREATE/UPDATE ACHIEVEMENT
  const handleCreateOrUpdateAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achTitle || !achDate || !achDesc) {
      alert("Please complete all required fields.");
      return;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        if (editAchievementId) {
          const { error } = await supabase.from("achievements").update({
            title: achTitle,
            date: achDate,
            description: achDesc,
            badge_type: achBadge
          }).eq("id", editAchievementId);
          if (error) throw error;
          showToast("Milestone updated.");
        } else {
          const { error } = await supabase.from("achievements").insert({
            title: achTitle,
            date: achDate,
            description: achDesc,
            badge_type: achBadge
          });
          if (error) throw error;
          showToast("Milestone created.");
        }
      } catch (err) {
        console.error(err);
        alert("Operation failed");
      }
    } else {
      const finalAch: AchievementItem = {
        id: editAchievementId || `achievement-${Date.now()}`,
        title: achTitle,
        date: achDate,
        description: achDesc,
        badgeType: achBadge
      };
      let list = getLocalAchievements();
      if (editAchievementId) {
        list = list.map(a => a.id === editAchievementId ? finalAch : a);
      } else {
        list = [finalAch, ...list];
      }
      saveLocalAchievements(list);
      showToast("Saved to sandbox.");
    }
    resetAchievementForm();
    loadAllData();
  };

  const handleDeleteAchievement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this achievement?")) return;
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("achievements").delete().eq("id", id);
        if (error) throw error;
        showToast("Deleted milestone.");
      } catch (err) {
        console.error(err);
      }
    } else {
      const list = getLocalAchievements().filter(a => a.id !== id);
      saveLocalAchievements(list);
    }
    loadAllData();
  };

  const handleEditAchievementClick = (a: AchievementItem) => {
    setEditAchievementId(a.id);
    setAchTitle(a.title);
    setAchDate(a.date);
    setAchBadge(a.badgeType);
    setAchDesc(a.description);
    setShowAchievementForm(true);
  };

  const resetAchievementForm = () => {
    setEditAchievementId(null);
    setAchTitle("");
    setAchDate("");
    setAchBadge("milestone");
    setAchDesc("");
    setShowAchievementForm(false);
  };

  // 3. CREATE/UPDATE TEAM MEMBER
  const handleCreateOrUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName || !memberRole || !memberBranch || !memberSpecialization || !memberInitials || !memberQuote || !memberBio) {
      alert("Please fill all required team details.");
      return;
    }

    const areas = memberFocusAreas.split(",").map(t => t.trim()).filter(Boolean);

    const teamData = {
      name: memberName,
      role: memberRole,
      branch: memberBranch,
      specialization: memberSpecialization,
      bio: memberBio,
      quote: memberQuote,
      focus_areas: areas,
      initials: memberInitials,
      theme_color: memberThemeColor,
      photo: memberPhoto || null,
      linkedin: memberLinkedin,
      github: memberGithub,
      display_order: Number(memberDisplayOrder),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        if (editTeamId) {
          const { error } = await supabase.from("team_members").update(teamData).eq("id", editTeamId);
          if (error) throw error;
          showToast("Member details updated!");
        } else {
          const { error } = await supabase.from("team_members").insert(teamData);
          if (error) throw error;
          showToast("Member created successfully!");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to save member details.");
      }
    } else {
      const finalMember: TeamMember = {
        id: editTeamId || `team-${Date.now()}`,
        name: teamData.name,
        role: teamData.role,
        branch: teamData.branch,
        specialization: teamData.specialization,
        bio: teamData.bio,
        quote: teamData.quote,
        focusAreas: teamData.focus_areas,
        initials: teamData.initials,
        themeColor: teamData.theme_color,
        photo: teamData.photo || "",
        linkedin: teamData.linkedin,
        github: teamData.github,
        displayOrder: teamData.display_order
      };
      let list = JSON.parse(localStorage.getItem("aws_sbg_team") || "[]");
      if (editTeamId) {
        list = list.map((m: any) => m.id === editTeamId ? finalMember : m);
      } else {
        list = [...list, finalMember];
      }
      localStorage.setItem("aws_sbg_team", JSON.stringify(list));
      showToast("Saved in browser Sandbox.");
    }
    resetTeamForm();
    loadAllData();
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("team_members").delete().eq("id", id);
        if (error) throw error;
        showToast("Member deleted.");
      } catch (err) { console.error(err); }
    } else {
      let list = JSON.parse(localStorage.getItem("aws_sbg_team") || "[]");
      list = list.filter((m: any) => m.id !== id);
      localStorage.setItem("aws_sbg_team", JSON.stringify(list));
    }
    loadAllData();
  };

  const handleEditTeamClick = (m: TeamMember) => {
    setEditTeamId(m.id);
    setMemberName(m.name);
    setMemberRole(m.role);
    setMemberBranch(m.branch);
    setMemberSpecialization(m.specialization);
    setMemberBio(m.bio);
    setMemberQuote(m.quote);
    setMemberFocusAreas(m.focusAreas.join(", "));
    setMemberInitials(m.initials);
    setMemberThemeColor(m.themeColor);
    setMemberPhoto(m.photo || "");
    setMemberLinkedin(m.linkedin);
    setMemberGithub(m.github);
    setMemberDisplayOrder(m.displayOrder);
    setShowTeamForm(true);
  };

  const resetTeamForm = () => {
    setEditTeamId(null);
    setMemberName("");
    setMemberRole("");
    setMemberBranch("");
    setMemberSpecialization("");
    setMemberBio("");
    setMemberQuote("");
    setMemberFocusAreas("");
    setMemberInitials("");
    setMemberThemeColor("orange");
    setMemberPhoto("");
    setMemberLinkedin("javascript:void(0)");
    setMemberGithub("javascript:void(0)");
    setMemberDisplayOrder(1);
    setShowTeamForm(false);
  };

  // 4. CREATE/UPDATE GALLERY
  const handleCreateOrUpdateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galTitle || !galDate || !galDesc) {
      alert("Please fill in all details.");
      return;
    }

    const galleryData = {
      title: galTitle,
      date: galDate,
      description: galDesc,
      category: galCategory,
      placeholder_color: galColor,
      image_url: galImageUrl || null
    };

    if (isSupabaseConfigured && supabase) {
      try {
        if (editGalleryId) {
          const { error } = await supabase.from("gallery_images").update(galleryData).eq("id", editGalleryId);
          if (error) throw error;
          showToast("Gallery image updated.");
        } else {
          const { error } = await supabase.from("gallery_images").insert(galleryData);
          if (error) throw error;
          showToast("Gallery image published.");
        }
      } catch (err) { console.error(err); }
    } else {
      const finalItem: GalleryItem = {
        id: editGalleryId || `gal-${Date.now()}`,
        title: galleryData.title,
        date: galleryData.date,
        description: galleryData.description,
        category: galleryData.category,
        placeholderColor: galleryData.placeholder_color,
        imageUrl: galleryData.image_url || ""
      };
      let list = JSON.parse(localStorage.getItem("aws_sbg_gallery") || "[]");
      if (editGalleryId) {
        list = list.map((g: any) => g.id === editGalleryId ? finalItem : g);
      } else {
        list = [finalItem, ...list];
      }
      localStorage.setItem("aws_sbg_gallery", JSON.stringify(list));
      showToast("Saved image slot to Sandbox.");
    }
    resetGalleryForm();
    loadAllData();
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("gallery_images").delete().eq("id", id);
      } catch (err) { console.error(err); }
    } else {
      let list = JSON.parse(localStorage.getItem("aws_sbg_gallery") || "[]");
      list = list.filter((g: any) => g.id !== id);
      localStorage.setItem("aws_sbg_gallery", JSON.stringify(list));
    }
    loadAllData();
  };

  const handleEditGalleryClick = (g: GalleryItem) => {
    setEditGalleryId(g.id);
    setGalTitle(g.title);
    setGalDate(g.date);
    setGalDesc(g.description);
    setGalCategory(g.category);
    setGalColor(g.placeholderColor);
    setGalImageUrl(g.imageUrl || "");
    setShowGalleryForm(true);
  };

  const resetGalleryForm = () => {
    setEditGalleryId(null);
    setGalTitle("");
    setGalDate("");
    setGalDesc("");
    setGalCategory("events");
    setGalColor("orange");
    setGalImageUrl("");
    setShowGalleryForm(false);
  };

  // 5. CREATE/UPDATE ANNOUNCEMENT
  const handleCreateOrUpdateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent || !annDate) return;

    const announceData = {
      title: annTitle,
      content: annContent,
      date: annDate,
      active: annActive
    };

    if (isSupabaseConfigured && supabase) {
      try {
        if (editAnnounceId) {
          await supabase.from("announcements").update(announceData).eq("id", editAnnounceId);
        } else {
          await supabase.from("announcements").insert(announceData);
        }
      } catch (err) { console.error(err); }
    } else {
      const finalAnn = {
        id: editAnnounceId || `ann-${Date.now()}`,
        ...announceData
      };
      let list = JSON.parse(localStorage.getItem("aws_sbg_announcements") || "[]");
      if (editAnnounceId) {
        list = list.map((a: any) => a.id === editAnnounceId ? finalAnn : a);
      } else {
        list = [finalAnn, ...list];
      }
      localStorage.setItem("aws_sbg_announcements", JSON.stringify(list));
    }
    resetAnnounceForm();
    loadAllData();
  };

  const handleDeleteAnnounce = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    if (isSupabaseConfigured && supabase) {
      await supabase.from("announcements").delete().eq("id", id);
    } else {
      let list = JSON.parse(localStorage.getItem("aws_sbg_announcements") || "[]");
      list = list.filter((a: any) => a.id !== id);
      localStorage.setItem("aws_sbg_announcements", JSON.stringify(list));
    }
    loadAllData();
  };

  const handleEditAnnounceClick = (a: AnnouncementItem) => {
    setEditAnnounceId(a.id);
    setAnnTitle(a.title);
    setAnnContent(a.content);
    setAnnDate(a.date);
    setAnnActive(a.active);
    setShowAnnounceForm(true);
  };

  const resetAnnounceForm = () => {
    setEditAnnounceId(null);
    setAnnTitle("");
    setAnnContent("");
    setAnnDate("");
    setAnnActive(true);
    setShowAnnounceForm(false);
  };

  // 6. CREATE/UPDATE STAT
  const handleCreateOrUpdateStat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statLabel || !statValue) return;

    const statData = {
      label: statLabel,
      value: statValue,
      display_order: Number(statOrder)
    };

    if (isSupabaseConfigured && supabase) {
      try {
        if (editStatId) {
          await supabase.from("homepage_stats").update(statData).eq("id", editStatId);
        } else {
          await supabase.from("homepage_stats").insert(statData);
        }
      } catch (err) { console.error(err); }
    } else {
      const finalStat = {
        id: editStatId || `stat-${Date.now()}`,
        ...statData
      };
      let list = JSON.parse(localStorage.getItem("aws_sbg_stats") || "[]");
      if (editStatId) {
        list = list.map((s: any) => s.id === editStatId ? finalStat : s);
      } else {
        list = [...list, finalStat];
      }
      localStorage.setItem("aws_sbg_stats", JSON.stringify(list));
    }
    resetStatForm();
    loadAllData();
  };

  const handleDeleteStat = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    if (isSupabaseConfigured && supabase) {
      await supabase.from("homepage_stats").delete().eq("id", id);
    } else {
      let list = JSON.parse(localStorage.getItem("aws_sbg_stats") || "[]");
      list = list.filter((s: any) => s.id !== id);
      localStorage.setItem("aws_sbg_stats", JSON.stringify(list));
    }
    loadAllData();
  };

  const handleEditStatClick = (s: StatItem) => {
    setEditStatId(s.id || null);
    setStatLabel(s.label);
    setStatValue(s.value);
    setStatOrder(s.display_order);
    setShowStatForm(true);
  };

  const resetStatForm = () => {
    setEditStatId(null);
    setStatLabel("");
    setStatValue("");
    setStatOrder(1);
    setShowStatForm(false);
  };

  // 7. SITE SETTINGS SAVE
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("site_settings").upsert([
          { key: "meetup_url", value: meetupUrl },
          { key: "whatsapp_url", value: whatsappUrl },
          { key: "contact_email", value: contactEmail },
        ]);
        showToast("Settings saved in Supabase!");
      } catch (err) {
        console.error(err);
        alert("Failed to save settings.");
      }
    } else {
      localStorage.setItem("aws_sbg_meetup_url", meetupUrl);
      localStorage.setItem("aws_sbg_whatsapp_url", whatsappUrl);
      localStorage.setItem("aws_sbg_contact_email", contactEmail);
      showToast("Settings saved to Sandbox.");
    }
  };

  // Login view if needed
  if (isSupabaseConfigured && !session && !authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
        <div className="relative w-full max-w-md p-8 rounded-2xl border border-slate-900 bg-slate-950/80 shadow-2xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="h-12 w-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Lock className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-white">Admin Authentication</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unlock chapter configuration by signing in with your administrator credentials.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sbg-rimt.com"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-900/50 border border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-900/50 border border-slate-800 text-white placeholder-slate-700 focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/10 active:scale-98"
              >
                Log In
              </button>
            </form>
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-300">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <span>Checking credentials...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-2 bg-emerald-500 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-semibold animate-bounce">
          <CheckCircle className="h-4 w-4" />
          {notification}
        </div>
      )}

      {/* Admin Sidebar */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-900 bg-slate-980 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">AWS SBG Portal</h2>
            <p className="text-lg font-black text-white mt-1">Admin Dashboard</p>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("events")}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "events" 
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/15" 
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Calendar className="h-4.5 w-4.5" />
              Manage Events
            </button>
            <button
              onClick={() => setActiveTab("achievements")}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "achievements" 
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/15" 
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Trophy className="h-4.5 w-4.5" />
              Manage Milestones
            </button>
            <button
              onClick={() => setActiveTab("team")}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "team" 
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/15" 
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Users className="h-4.5 w-4.5" />
              Manage Team
            </button>
            <button
              onClick={() => setActiveTab("gallery")}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "gallery" 
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/15" 
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <ImageIcon className="h-4.5 w-4.5" />
              Manage Gallery
            </button>
            <button
              onClick={() => setActiveTab("announcements")}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "announcements" 
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/15" 
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Megaphone className="h-4.5 w-4.5" />
              Announcements
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "stats" 
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/15" 
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <BarChart3 className="h-4.5 w-4.5" />
              Homepage Stats
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "settings" 
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/15" 
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Settings className="h-4.5 w-4.5" />
              Site Settings
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-900 mt-8 md:mt-0 flex flex-col gap-3">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-900 flex items-start gap-2">
            {isSupabaseConfigured ? (
              <>
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Supabase Mode: Database operations are shared live.
                </p>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Sandbox Mode: Changes are saved to local browser memory.
                </p>
              </>
            )}
          </div>
          {isSupabaseConfigured && session && (
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-red-900/40 text-xs text-red-400 hover:bg-red-500/10 transition-all text-center"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          )}
          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-800 text-xs text-slate-400 hover:text-white hover:bg-slate-900 transition-all text-center"
          >
            Exit Dashboard
          </Link>
        </div>
      </div>

      {/* Admin Content Area */}
      <div className="flex-grow p-6 md:p-10 overflow-y-auto">
        
        {/* TAB 1: EVENTS */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-4">
              <div>
                <h1 className="text-2xl font-black text-white">Event Administrator</h1>
                <p className="text-xs text-slate-400">Create, edit, or remove club sessions.</p>
              </div>
              {!showEventForm && (
                <button
                  onClick={() => setShowEventForm(true)}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/10"
                >
                  <Plus className="h-4 w-4" />
                  Create Event
                </button>
              )}
            </div>

            {showEventForm && (
              <form onSubmit={handleCreateOrUpdateEvent} className="p-6 rounded-xl border border-slate-900 bg-slate-980 space-y-6 max-w-3xl">
                <h3 className="text-lg font-bold text-white border-b border-slate-900 pb-2">
                  {editEventId ? "Modify Event Details" : "Construct New Event"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Event Title *</label>
                    <input
                      type="text" required value={eventTitle} onChange={(e) => setEventTitle(e.target.value)}
                      placeholder="AWS Practitioner Session"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Slug (URL Endpoint)</label>
                    <input
                      type="text" value={eventSlug} onChange={(e) => setEventSlug(e.target.value)}
                      placeholder="aws-practitioner-session (auto generated)"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date *</label>
                    <input
                      type="text" required value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                      placeholder="July 15, 2026"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time</label>
                    <input
                      type="text" value={eventTime} onChange={(e) => setEventTime(e.target.value)}
                      placeholder="10:00 AM - 4:00 PM IST"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Event Type</label>
                    <select
                      value={eventType} onChange={(e) => setEventType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none focus:border-orange-500/50"
                    >
                      <option value="Workshop">Workshop</option>
                      <option value="Hackathon">Hackathon</option>
                      <option value="Meetup">Meetup</option>
                      <option value="Webinar">Webinar</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location *</label>
                    <input
                      type="text" required value={eventLocation} onChange={(e) => setEventLocation(e.target.value)}
                      placeholder="Main Seminar Hall, School of Computing"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                    <select
                      value={eventStatus} onChange={(e) => setEventStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none focus:border-orange-500/50"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Theme Color</label>
                    <select
                      value={eventCoverColor} onChange={(e) => setEventCoverColor(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none focus:border-orange-500/50"
                    >
                      <option value="orange">Orange</option>
                      <option value="blue">Blue</option>
                      <option value="purple">Purple</option>
                      <option value="mint">Mint</option>
                      <option value="amber">Amber</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registration Link</label>
                    <input
                      type="text" value={eventRegLink} onChange={(e) => setEventRegLink(e.target.value)}
                      placeholder="Meetup URL"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Summary Description *</label>
                  <input
                    type="text" required value={eventDescription} onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="Short description snippet (under 200 chars)..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-orange-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detailed Long Description</label>
                  <textarea
                    rows={4} value={eventLongDescription} onChange={(e) => setEventLongDescription(e.target.value)}
                    placeholder="Detailed topics covered, certification path, mentors, guidelines..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-orange-500/50 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md">
                    <Save className="h-4 w-4" /> Save Event
                  </button>
                  <button type="button" onClick={resetEventForm} className="px-4 py-2.5 rounded-lg border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-950/80">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-980 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-900">
                    <tr>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60">
                    {events.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-900/20">
                        <td className="px-6 py-4 font-bold text-white max-w-[200px] truncate">{e.title}</td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 border border-slate-850 text-slate-400">
                            {e.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-400">{e.date}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            e.status === "upcoming" ? "bg-orange-500/10 text-orange-400" : "bg-slate-900 text-slate-500"
                          }`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                          <button onClick={() => handleEditEventClick(e)} className="p-1.5 rounded hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-400 hover:text-white">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDeleteEvent(e.id)} className="p-1.5 rounded hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-400 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACHIEVEMENTS */}
        {activeTab === "achievements" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-4">
              <div>
                <h1 className="text-2xl font-black text-white">Milestone Administrator</h1>
                <p className="text-xs text-slate-400">Manage community achievements.</p>
              </div>
              {!showAchievementForm && (
                <button
                  onClick={() => setShowAchievementForm(true)}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md"
                >
                  <Plus className="h-4 w-4" /> Create Milestone
                </button>
              )}
            </div>

            {showAchievementForm && (
              <form onSubmit={handleCreateOrUpdateAchievement} className="p-6 rounded-xl border border-slate-900 bg-slate-980 space-y-6 max-w-3xl">
                <h3 className="text-lg font-bold text-white border-b border-slate-900 pb-2">
                  {editAchievementId ? "Modify Milestone Details" : "Construct New Milestone"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Milestone Title *</label>
                    <input
                      type="text" required value={achTitle} onChange={(e) => setAchTitle(e.target.value)}
                      placeholder="Official Chapter Charter Approved"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white placeholder-slate-700 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date *</label>
                    <input
                      type="text" required value={achDate} onChange={(e) => setAchDate(e.target.value)}
                      placeholder="June 2026"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white placeholder-slate-700 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Badge Icon Type</label>
                    <select
                      value={achBadge} onChange={(e) => setAchBadge(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none"
                    >
                      <option value="milestone">Trophy (Milestone)</option>
                      <option value="charter">Award Ribbon (Charter)</option>
                      <option value="team">Check Circle (Team / Org)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Milestone Description *</label>
                  <textarea
                    rows={4} required value={achDesc} onChange={(e) => setAchDesc(e.target.value)}
                    placeholder="Describe the milestone and its community impact..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white placeholder-slate-700 focus:outline-none resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md">
                    <Save className="h-4 w-4" /> Save Milestone
                  </button>
                  <button type="button" onClick={resetAchievementForm} className="px-4 py-2.5 rounded-lg border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-950/80">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-980 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-900">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Badge</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60">
                  {achievements.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-900/20">
                      <td className="px-6 py-4 font-bold text-white max-w-[200px] truncate">{a.title}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 border border-slate-850 text-slate-400 capitalize">
                          {a.badgeType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">{a.date}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => handleEditAchievementClick(a)} className="p-1.5 rounded hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-400 hover:text-white">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteAchievement(a.id)} className="p-1.5 rounded hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-400 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: TEAM MEMBERS */}
        {activeTab === "team" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-4">
              <div>
                <h1 className="text-2xl font-black text-white">Team Coordinator</h1>
                <p className="text-xs text-slate-400">Manage community builder profiles.</p>
              </div>
              {!showTeamForm && (
                <button
                  onClick={() => setShowTeamForm(true)}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md"
                >
                  <Plus className="h-4 w-4" /> Add Builder
                </button>
              )}
            </div>

            {showTeamForm && (
              <form onSubmit={handleCreateOrUpdateTeam} className="p-6 rounded-xl border border-slate-900 bg-slate-980 space-y-6 max-w-3xl">
                <h3 className="text-lg font-bold text-white border-b border-slate-900 pb-2">
                  {editTeamId ? "Modify Builder Details" : "Register New Builder"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Builder Name *</label>
                    <input
                      type="text" required value={memberName} onChange={(e) => setMemberName(e.target.value)}
                      placeholder="Aditya Kumar"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role Title *</label>
                    <input
                      type="text" required value={memberRole} onChange={(e) => setMemberRole(e.target.value)}
                      placeholder="Technical Head"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Initials *</label>
                    <input
                      type="text" required value={memberInitials} onChange={(e) => setMemberInitials(e.target.value)}
                      placeholder="AK"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Branch *</label>
                    <input
                      type="text" required value={memberBranch} onChange={(e) => setMemberBranch(e.target.value)}
                      placeholder="B.Tech CSE"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specialization *</label>
                    <input
                      type="text" required value={memberSpecialization} onChange={(e) => setMemberSpecialization(e.target.value)}
                      placeholder="Cybersecurity"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Display Order (Sorting)</label>
                    <input
                      type="number" required value={memberDisplayOrder} onChange={(e) => setMemberDisplayOrder(Number(e.target.value))}
                      placeholder="1"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Photo upload */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avatar Photo</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text" value={memberPhoto} onChange={(e) => setMemberPhoto(e.target.value)}
                        placeholder="Image URL or upload"
                        className="flex-grow px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none font-mono"
                      />
                      {isSupabaseConfigured && (
                        <label className="cursor-pointer inline-flex items-center justify-center p-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
                          {uploading ? "..." : <Upload className="h-4 w-4" />}
                          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "team")} className="hidden" disabled={uploading} />
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Theme Color</label>
                    <select
                      value={memberThemeColor} onChange={(e) => setMemberThemeColor(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none"
                    >
                      <option value="orange">Orange (AWS Core)</option>
                      <option value="blue">Blue</option>
                      <option value="purple">Purple</option>
                      <option value="grey">Grey</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LinkedIn Profile URL</label>
                    <input
                      type="text" value={memberLinkedin} onChange={(e) => setMemberLinkedin(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GitHub Profile URL</label>
                    <input
                      type="text" value={memberGithub} onChange={(e) => setMemberGithub(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Focus Areas (Comma-separated)</label>
                  <input
                    type="text" value={memberFocusAreas} onChange={(e) => setMemberFocusAreas(e.target.value)}
                    placeholder="Cloud Security, IAM, Infrastructure, Web Dev"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signature Quote *</label>
                  <input
                    type="text" required value={memberQuote} onChange={(e) => setMemberQuote(e.target.value)}
                    placeholder="Secure by design — building cloud skills the right way."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Bio Biography *</label>
                  <textarea
                    rows={4} required value={memberBio} onChange={(e) => setMemberBio(e.target.value)}
                    placeholder="Describe focus, expertise, hands-on workshop track plans, and scale targets..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md">
                    <Save className="h-4 w-4" /> Save Profile
                  </button>
                  <button type="button" onClick={resetTeamForm} className="px-4 py-2.5 rounded-lg border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-950/80">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-980 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-900">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Specialization</th>
                    <th className="px-6 py-4">Order</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60">
                  {teamMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-900/20">
                      <td className="px-6 py-4 font-bold text-white">{m.name}</td>
                      <td className="px-6 py-4 text-xs text-orange-400">{m.role}</td>
                      <td className="px-6 py-4 text-xs text-slate-400">{m.specialization}</td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">{m.displayOrder}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => handleEditTeamClick(m)} className="p-1.5 rounded hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-400 hover:text-white">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteTeam(m.id)} className="p-1.5 rounded hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-400 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: GALLERY */}
        {activeTab === "gallery" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-4">
              <div>
                <h1 className="text-2xl font-black text-white">Gallery Coordinator</h1>
                <p className="text-xs text-slate-400">Upload and configure workshop memory images.</p>
              </div>
              {!showGalleryForm && (
                <button
                  onClick={() => setShowGalleryForm(true)}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md"
                >
                  <Plus className="h-4 w-4" /> Add Gallery Image
                </button>
              )}
            </div>

            {showGalleryForm && (
              <form onSubmit={handleCreateOrUpdateGallery} className="p-6 rounded-xl border border-slate-900 bg-slate-980 space-y-6 max-w-3xl">
                <h3 className="text-lg font-bold text-white border-b border-slate-900 pb-2">
                  {editGalleryId ? "Modify Gallery Image" : "Publish Gallery Slot"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Image Title *</label>
                    <input
                      type="text" required value={galTitle} onChange={(e) => setGalTitle(e.target.value)}
                      placeholder="Inaugural Meetup Setup"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date *</label>
                    <input
                      type="text" required value={galDate} onChange={(e) => setGalDate(e.target.value)}
                      placeholder="June 2026"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                    <select
                      value={galCategory} onChange={(e) => setGalCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none"
                    >
                      <option value="events">Events</option>
                      <option value="workshops">Workshops</option>
                      <option value="labs">Labs</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Placeholder Color</label>
                    <select
                      value={galColor} onChange={(e) => setGalColor(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none"
                    >
                      <option value="orange">Orange</option>
                      <option value="blue">Blue</option>
                      <option value="purple">Purple</option>
                      <option value="mint">Mint</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Image Asset</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text" value={galImageUrl} onChange={(e) => setGalImageUrl(e.target.value)}
                      placeholder="Asset URL path or Upload"
                      className="flex-grow px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none font-mono"
                    />
                    {isSupabaseConfigured && (
                      <label className="cursor-pointer inline-flex items-center justify-center p-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
                        {uploading ? "..." : <Upload className="h-4 w-4" />}
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "gallery")} className="hidden" disabled={uploading} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Brief Description *</label>
                  <textarea
                    rows={3} required value={galDesc} onChange={(e) => setGalDesc(e.target.value)}
                    placeholder="Briefly describe the setup snapshot..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md">
                    <Save className="h-4 w-4" /> Publish Image
                  </button>
                  <button type="button" onClick={resetGalleryForm} className="px-4 py-2.5 rounded-lg border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-950/80">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-980 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-900">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60">
                  {galleryItems.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-900/20">
                      <td className="px-6 py-4 font-bold text-white max-w-[200px] truncate">{g.title}</td>
                      <td className="px-6 py-4 text-xs uppercase text-slate-400">{g.category}</td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">{g.date}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => handleEditGalleryClick(g)} className="p-1.5 rounded hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-400 hover:text-white">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteGallery(g.id)} className="p-1.5 rounded hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-400 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: ANNOUNCEMENTS */}
        {activeTab === "announcements" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-4">
              <div>
                <h1 className="text-2xl font-black text-white">Announcements</h1>
                <p className="text-xs text-slate-400">Set active website banners dynamically.</p>
              </div>
              {!showAnnounceForm && (
                <button
                  onClick={() => setShowAnnounceForm(true)}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md"
                >
                  <Plus className="h-4 w-4" /> Create Announcement
                </button>
              )}
            </div>

            {showAnnounceForm && (
              <form onSubmit={handleCreateOrUpdateAnnouncement} className="p-6 rounded-xl border border-slate-900 bg-slate-980 space-y-6 max-w-3xl">
                <h3 className="text-lg font-bold text-white border-b border-slate-900 pb-2">
                  {editAnnounceId ? "Edit Announcement" : "Create Announcement"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Announcement Title *</label>
                    <input
                      type="text" required value={annTitle} onChange={(e) => setAnnTitle(e.target.value)}
                      placeholder="Registrations Open!"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date *</label>
                    <input
                      type="text" required value={annDate} onChange={(e) => setAnnDate(e.target.value)}
                      placeholder="June 12"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Content Summary *</label>
                  <input
                    type="text" required value={annContent} onChange={(e) => setAnnContent(e.target.value)}
                    placeholder="AWS Practitioner bootcamp starting soon. Apply now!"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox" id="annActive" checked={annActive} onChange={(e) => setAnnActive(e.target.checked)}
                    className="rounded border-slate-900 text-orange-500 focus:ring-0 bg-slate-950 h-4 w-4"
                  />
                  <label htmlFor="annActive" className="text-xs text-slate-400 font-bold uppercase tracking-wider cursor-pointer">
                    Show as active banner on Home page
                  </label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md">
                    <Save className="h-4 w-4" /> Save Banner
                  </button>
                  <button type="button" onClick={resetAnnounceForm} className="px-4 py-2.5 rounded-lg border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-950/80">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-980 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-900">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Content</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Banner Active</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60">
                  {announcements.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-900/20">
                      <td className="px-6 py-4 font-bold text-white max-w-[150px] truncate">{a.title}</td>
                      <td className="px-6 py-4 text-xs text-slate-400 max-w-[250px] truncate">{a.content}</td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">{a.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          a.active ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-900 text-slate-500"
                        }`}>
                          {a.active ? "ACTIVE" : "HIDDEN"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => handleEditAnnounceClick(a)} className="p-1.5 rounded hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-400 hover:text-white">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteAnnounce(a.id)} className="p-1.5 rounded hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-400 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: HOMEPAGE STATS */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-4">
              <div>
                <h1 className="text-2xl font-black text-white">Homepage Statistics</h1>
                <p className="text-xs text-slate-400">Manage the key highlight values on the hero section.</p>
              </div>
              {!showStatForm && (
                <button
                  onClick={() => setShowStatForm(true)}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md"
                >
                  <Plus className="h-4 w-4" /> Add Stat
                </button>
              )}
            </div>

            {showStatForm && (
              <form onSubmit={handleCreateOrUpdateStat} className="p-6 rounded-xl border border-slate-900 bg-slate-980 space-y-6 max-w-2xl">
                <h3 className="text-lg font-bold text-white border-b border-slate-900 pb-2">
                  {editStatId ? "Edit Stat" : "Create Stat"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stat Label *</label>
                    <input
                      type="text" required value={statLabel} onChange={(e) => setStatLabel(e.target.value)}
                      placeholder="Members"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stat Value *</label>
                    <input
                      type="text" required value={statValue} onChange={(e) => setStatValue(e.target.value)}
                      placeholder="150+"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort Order</label>
                    <input
                      type="number" required value={statOrder} onChange={(e) => setStatOrder(Number(e.target.value))}
                      placeholder="1"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md">
                    <Save className="h-4 w-4" /> Save Stat
                  </button>
                  <button type="button" onClick={resetStatForm} className="px-4 py-2.5 rounded-lg border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-950/80 max-w-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-980 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-900">
                  <tr>
                    <th className="px-6 py-4">Value</th>
                    <th className="px-6 py-4">Label</th>
                    <th className="px-6 py-4 font-mono">Order</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60">
                  {stats.map((s) => (
                    <tr key={s.id || s.label} className="hover:bg-slate-900/20">
                      <td className="px-6 py-4 font-black text-white">{s.value}</td>
                      <td className="px-6 py-4 text-xs text-slate-400">{s.label}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{s.display_order}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => handleEditStatClick(s)} className="p-1.5 rounded hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-400 hover:text-white">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteStat(s.id || s.label)} className="p-1.5 rounded hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-400 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: SITE SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="border-b border-slate-900 pb-4">
              <h1 className="text-2xl font-black text-white">Site Constants</h1>
              <p className="text-xs text-slate-400">Configure global metadata endpoints and connections.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="p-6 rounded-xl border border-slate-900 bg-slate-980 space-y-6 max-w-2xl">
              <h3 className="text-lg font-bold text-white border-b border-slate-900 pb-2">Community Settings</h3>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Meetup Chapter URL</label>
                  <input
                    type="url" value={meetupUrl} onChange={(e) => setMeetupUrl(e.target.value)}
                    placeholder="https://www.meetup.com/aws-sbg-at-rimt-university/..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white placeholder-slate-800 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WhatsApp Group URL</label>
                  <input
                    type="url" value={whatsappUrl} onChange={(e) => setWhatsappUrl(e.target.value)}
                    placeholder="https://chat.whatsapp.com/..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white placeholder-slate-800 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">General Contact Email</label>
                  <input
                    type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="sbg.rimt@gmail.com"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-900 text-sm text-white placeholder-slate-800 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 shadow-md">
                  <Save className="h-4 w-4" /> Save Constants
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
