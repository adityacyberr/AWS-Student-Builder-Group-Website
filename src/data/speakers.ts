export interface SpeakerItem {
  id: string;
  name: string;
  title: string;
  bio: string;
  imageUrl?: string;
  achievements: string[];
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  eventId?: string;
  isFeatured: boolean;
  sortOrder: number;
  quote?: string;
}

export const SPEAKERS: SpeakerItem[] = [
  {
    id: "bhoomi-raut-speaker-id",
    name: "Bhoomi Raut",
    title: "AWS Community Builder | AWS 3X Certified | Public Speaker",
    bio: "B.Tech Computer Science graduate and MBA learner, building my career at the intersection of technology, management, and applied learning. Passionate about cloud, AI, and developer community building.",
    imageUrl: "/events/bhoomi-raut.png",
    achievements: [
      "AWS Community Builder",
      "AWS 3X Certified",
      "AWS New Voices 2025 & 2026",
      "AWS UG Pune"
    ],
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/bhoomi-ganesh-raut",
      twitter: "",
      website: ""
    },
    isFeatured: true,
    sortOrder: 0,
    quote: "Building the future with cloud, code and community."
  }
];

export function getLocalSpeakers(): SpeakerItem[] {
  if (typeof window === "undefined") return SPEAKERS;
  
  const stored = localStorage.getItem("aws_sbg_speakers");
  let localList: SpeakerItem[] = [];
  
  if (stored) {
    try {
      localList = JSON.parse(stored);
    } catch (e) {
      localList = [];
    }
  }

  const initialized = localStorage.getItem("aws_sbg_speakers_initialized");
  if (!initialized || localList.length === 0) {
    localStorage.setItem("aws_sbg_speakers", JSON.stringify(SPEAKERS));
    localStorage.setItem("aws_sbg_speakers_initialized", "true");
    return SPEAKERS;
  }

  // Merge hardcoded SPEAKERS that are missing in local storage
  let updated = false;
  SPEAKERS.forEach((hardcodedSpeaker) => {
    const exists = localList.some(s => s.id === hardcodedSpeaker.id || s.name === hardcodedSpeaker.name);
    if (!exists) {
      localList.push(hardcodedSpeaker);
      updated = true;
    }
  });

  if (updated) {
    localStorage.setItem("aws_sbg_speakers", JSON.stringify(localList));
  }

  return localList;
}

export function saveLocalSpeakers(speakers: SpeakerItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("aws_sbg_speakers", JSON.stringify(speakers));
  localStorage.setItem("aws_sbg_speakers_initialized", "true");
}
