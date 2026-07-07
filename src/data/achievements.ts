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
  category: 'events' | 'workshops' | 'labs' | 'celebrations' | 'community' | 'achievements';
  placeholderColor: 'orange' | 'blue' | 'purple' | 'mint';
  imageUrl?: string;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "intro-pranav-bansal",
    title: "Introducing Group Leader — Pranav Bansal",
    date: "April 2026",
    description: "AWS Student Builder Group introduces Pranav Bansal as our Group Leader. Learn • Build • Lead.",
    category: "community",
    placeholderColor: "purple",
    imageUrl: "/gallery/intro-pranav-bansal.png"
  },
  {
    id: "intro-aditya-kumar",
    title: "Introducing Technical Head — Aditya Kumar",
    date: "April 2026",
    description: "AWS Student Builder Group introduces Aditya Kumar as our Technical Head. Learn • Build • Lead.",
    category: "community",
    placeholderColor: "blue",
    imageUrl: "/gallery/intro-aditya-kumar.png"
  },
  {
    id: "intro-amisha",
    title: "Introducing Marketing Head — Amisha",
    date: "April 2026",
    description: "AWS Student Builder Group introduces Amisha as our Marketing Head. Learn • Build • Lead.",
    category: "community",
    placeholderColor: "orange",
    imageUrl: "/gallery/intro-amisha.png"
  },
  {
    id: "intro-rinku-bhalotiya",
    title: "Introducing Event Head — Rinku Bhalotiya",
    date: "April 2026",
    description: "AWS Student Builder Group introduces Rinku Bhalotiya as our Event Head. Learn • Build • Lead.",
    category: "community",
    placeholderColor: "mint",
    imageUrl: "/gallery/intro-rinku-bhalotiya.png"
  },
  {
    id: "intro-amber-prashar",
    title: "Introducing Treasurer — Amber Prashar",
    date: "April 2026",
    description: "AWS Student Builder Group introduces Amber Prashar as our Treasurer. Learn • Build • Lead.",
    category: "community",
    placeholderColor: "orange",
    imageUrl: "/gallery/intro-amber-prashar.png"
  },
  {
    id: "intro-rohan-verma",
    title: "Introducing Director of Photography — Rohan Verma",
    date: "April 2026",
    description: "AWS Student Builder Group introduces Rohan Verma as our Director of Photography. Learn • Build • Lead.",
    category: "community",
    placeholderColor: "blue",
    imageUrl: "/gallery/intro-rohan-verma.png"
  },
  {
    id: "rimt-welcomes-aws-sbg",
    title: "RIMT University Welcomes AWS SBG",
    date: "April 2026",
    description: "Official announcement poster welcoming the AWS Student Builder Group at RIMT University under RIMT DRI.",
    category: "community",
    placeholderColor: "blue",
    imageUrl: "/gallery/rimt-welcomes-aws-sbg.jpg"
  },
  {
    id: "kiroverse-event-poster",
    title: "KIROverse — Build Smarter. Ship Faster.",
    date: "July 2026",
    description: "AWS Community Session featuring Bhoomi Raut on Kiro — the AI-powered IDE.",
    category: "events",
    placeholderColor: "purple",
    imageUrl: "/gallery/kiroverse-poster.jpg"
  },
  {
    id: "we-are-launching",
    title: "We Are Launching — A Community, Countless Possibilities",
    date: "April 2026",
    description: "Grand launch poster of AWS Student Builder Group. Learn. Build. Innovate. Together.",
    category: "community",
    placeholderColor: "blue",
    imageUrl: "/gallery/we-are-launching.jpg"
  },
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
