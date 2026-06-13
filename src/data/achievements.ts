export interface AchievementItem {
  id: string;
  title: string;
  date: string;
  description: string;
  badgeType: 'charter' | 'team' | 'milestone';
}

export const ACHIEVEMENTS: AchievementItem[] = [];

export function getLocalAchievements(): AchievementItem[] {
  if (typeof window === "undefined") return ACHIEVEMENTS;
  const initialized = localStorage.getItem("aws_sbg_achievements_initialized");
  if (!initialized) {
    localStorage.setItem("aws_sbg_achievements", JSON.stringify(ACHIEVEMENTS));
    localStorage.setItem("aws_sbg_achievements_initialized", "true");
    return ACHIEVEMENTS;
  }
  const stored = localStorage.getItem("aws_sbg_achievements");
  return stored ? JSON.parse(stored) : [];
}

export function saveLocalAchievements(achievements: AchievementItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("aws_sbg_achievements", JSON.stringify(achievements));
  localStorage.setItem("aws_sbg_achievements_initialized", "true");
}

export interface GalleryItem {
  id: string;
  title: string;
  date: string;
  description: string;
  category: 'events' | 'workshops' | 'labs';
  placeholderColor: 'orange' | 'blue' | 'purple' | 'mint';
  imageUrl?: string;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "launch-agenda",
    title: "Official Launch & Agenda",
    date: "June 2026",
    description: "The launch poster and academic roadmap details for the AWS Student Builder Group chapter at RIMT University, outlining core certification goals.",
    category: "events",
    placeholderColor: "orange",
    imageUrl: "/gallery/launch-agenda.jpg"
  },
  {
    id: "welcome-team",
    title: "Official Chapter Welcome",
    date: "June 2026",
    description: "Announcement card welcoming the AWS SBG to campus, introducing the founding student leaders under RIMT DRI.",
    category: "events",
    placeholderColor: "blue",
    imageUrl: "/gallery/welcome-team.jpg"
  }
];
