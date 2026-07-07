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
    id: "intro-pranav-bansal",
    title: "Introducing Group Leader — Pranav Bansal",
    date: "14 Apr 2026",
    description: "AWS Student Builder Group introduces Pranav Bansal, B.Tech ECE AIML, as our Group Leader. Learn • Build • Lead.",
    category: "community",
    imageUrl: "/gallery/intro-pranav-bansal.png",
    participants: 1,
    location: "RIMT University",
    photoCount: 1,
    instagramUrl: "https://www.instagram.com/aws.rimt?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
  },
  {
    id: "intro-aditya-kumar",
    title: "Introducing Technical Head — Aditya Kumar",
    date: "14 Apr 2026",
    description: "AWS Student Builder Group introduces Aditya Kumar, B.Tech CSE Cyber, as our Technical Head. Learn • Build • Lead.",
    category: "community",
    imageUrl: "/gallery/intro-aditya-kumar.png",
    participants: 1,
    location: "RIMT University",
    photoCount: 1,
    instagramUrl: "https://www.instagram.com/aws.rimt?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
  },
  {
    id: "intro-amisha",
    title: "Introducing Marketing Head — Amisha",
    date: "14 Apr 2026",
    description: "AWS Student Builder Group introduces Amisha, B.Tech CSE AIML, as our Marketing Head. Learn • Build • Lead.",
    category: "community",
    imageUrl: "/gallery/intro-amisha.png",
    participants: 1,
    location: "RIMT University",
    photoCount: 1,
    instagramUrl: "https://www.instagram.com/aws.rimt?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
  },
  {
    id: "intro-rinku-bhalotiya",
    title: "Introducing Event Head — Rinku Bhalotiya",
    date: "14 Apr 2026",
    description: "AWS Student Builder Group introduces Rinku Bhalotiya, B.Tech CSE, as our Event Head. Learn • Build • Lead.",
    category: "community",
    imageUrl: "/gallery/intro-rinku-bhalotiya.png",
    participants: 1,
    location: "RIMT University",
    photoCount: 1,
    instagramUrl: "https://www.instagram.com/aws.rimt?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
  },
  {
    id: "intro-amber-prashar",
    title: "Introducing Treasurer — Amber Prashar",
    date: "14 Apr 2026",
    description: "AWS Student Builder Group introduces Amber Prashar, B.Tech CSE AIML, as our Treasurer. Learn • Build • Lead.",
    category: "community",
    imageUrl: "/gallery/intro-amber-prashar.png",
    participants: 1,
    location: "RIMT University",
    photoCount: 1,
    instagramUrl: "https://www.instagram.com/aws.rimt?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
  },
  {
    id: "intro-rohan-verma",
    title: "Introducing Director of Photography — Rohan Verma",
    date: "14 Apr 2026",
    description: "AWS Student Builder Group introduces Rohan Verma, B.Tech CE AIML, as our Director of Photography. Learn • Build • Lead.",
    category: "community",
    imageUrl: "/gallery/intro-rohan-verma.png",
    participants: 1,
    location: "RIMT University",
    photoCount: 1,
    instagramUrl: "https://www.instagram.com/aws.rimt?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
  },
  {
    id: "rimt-welcomes-aws-sbg",
    title: "RIMT University Welcomes AWS SBG",
    date: "05 Apr 2026",
    description: "Official announcement poster welcoming the AWS Student Builder Group at RIMT University. Highlighting opportunities in Cloud Computing, AI/ML, DevOps, and Community Growth under RIMT DRI.",
    category: "community",
    imageUrl: "/gallery/rimt-welcomes-aws-sbg.jpg",
    participants: 120,
    location: "RIMT University",
    photoCount: 1,
    instagramUrl: "https://www.instagram.com/aws.rimt?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
  },
  {
    id: "kiroverse-event-poster",
    title: "KIROverse — Build Smarter. Ship Faster.",
    date: "31 July 2026",
    description: "AWS Community Session featuring Bhoomi Raut as the guest speaker. An insightful session on Kiro — the AI-powered IDE transforming the way developers build with speed, intelligence, and confidence.",
    category: "events",
    imageUrl: "/gallery/kiroverse-poster.jpg",
    participants: 0,
    location: "Seminar Hall, B Block, RIMT University",
    photoCount: 1,
    eventId: "kiroverse",
    instagramUrl: "https://www.instagram.com/aws.rimt?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
  },
  {
    id: "we-are-launching",
    title: "We Are Launching — A Community, Countless Possibilities",
    date: "10 Apr 2026",
    description: "The grand launch poster of AWS Student Builder Group at RIMT University. Learn. Build. Innovate. Together. Empowering students to build skills and turn ideas into real-world impact.",
    category: "community",
    imageUrl: "/gallery/we-are-launching.jpg",
    participants: 150,
    location: "RIMT University Campus",
    photoCount: 1,
    instagramUrl: "https://www.instagram.com/aws.rimt?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
  },
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
    instagramUrl: "https://www.instagram.com/aws.rimt?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
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
    instagramUrl: "https://www.instagram.com/aws.rimt?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
  }
];
