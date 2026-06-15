export interface GalleryItem {
  id: string;
  title: string;
  date: string;
  description: string;
  category: "workshops" | "events" | "community" | "celebrations";
  imageUrl: string;
  participants: number;
  location: string;
  photoCount: number;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "launch-celebration",
    title: "Chapter Launch Celebration",
    date: "12 Apr 2026",
    description: "Official launch event of the AWS Student Builder Group chapter under DRI, featuring leader welcome sessions and goals roadmap.",
    category: "celebrations",
    imageUrl: "/gallery/welcome-team.jpg",
    participants: 60,
    location: "DRI Sandbox",
    photoCount: 31,
  },
  {
    id: "security-workshop",
    title: "Cloud Security Workshop",
    date: "05 Apr 2026",
    description: "Advanced deep-dive on securing cloud assets, managing IAM users, defining security groups, and VPC firewall rules.",
    category: "workshops",
    imageUrl: "/gallery/launch-agenda.jpg",
    participants: 75,
    location: "Lab-3, RIMT University",
    photoCount: 20,
  },
];
