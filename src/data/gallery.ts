export interface GalleryItem {
  id: string;
  title: string;
  date: string;
  description: string;
  category: "events" | "workshops" | "labs" | "celebrations" | "community" | "achievements";
  imageUrl: string;
  participants: number;
  location: string;
  photoCount: number;
  eventId?: string;
  instagramUrl?: string;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "launch-agenda",
    title: "AWS SBG Launch Celebration",
    date: "12 Apr 2026",
    description: "Official launch of the AWS Student Builder Group at RIMT University, introducing our student core committee and cloud roadmap.",
    category: "events",
    imageUrl: "/gallery/launch-agenda.jpg",
    participants: 80,
    location: "DRI Sandbox, RIMT University",
    photoCount: 12,
    instagramUrl: "https://www.instagram.com/aws.rimt/"
  },
  {
    id: "welcome-team",
    title: "University Welcomes AWS SBG",
    date: "05 Apr 2026",
    description: "RIMT University officially welcomes the AWS Student Builder Group chapter, fostering student collaborations and cloud innovations.",
    category: "community",
    imageUrl: "/gallery/welcome-team.jpg",
    participants: 120,
    location: "Auditorium, RIMT University",
    photoCount: 15,
    instagramUrl: "https://www.instagram.com/aws.rimt/"
  }
];
