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
    id: "cloud-101",
    title: "Cloud Computing 101 Workshop",
    date: "15 May 2026",
    description: "Hands-on workshop introducing AWS fundamentals, core services (S3, EC2), and cloud concepts to student builders.",
    category: "workshops",
    imageUrl: "/gallery/cloud-101.png",
    participants: 120,
    location: "RIMT University",
    photoCount: 24,
  },
  {
    id: "aws-cloud-day",
    title: "AWS Cloud Day",
    date: "10 May 2026",
    description: "Immersive cloud learning, presentation pitches, and real-time AWS project showcase with guest speakers.",
    category: "events",
    imageUrl: "/gallery/cloud-day.png",
    participants: 250,
    location: "Audi-2, RIMT University",
    photoCount: 18,
  },
  {
    id: "community-meetup",
    title: "Community Meetup",
    date: "02 May 2026",
    description: "Collaborative student sync, chapter operations kickoff, and builder core team registration briefing.",
    category: "community",
    imageUrl: "/gallery/community-meetup.png",
    participants: 45,
    location: "Cybersecurity Hub",
    photoCount: 16,
  },
  {
    id: "devops-workshop",
    title: "DevOps on AWS Workshop",
    date: "28 Apr 2026",
    description: "Practical developer workshop focusing on AWS CI/CD pipelines, automated testing, and CodePipeline deployment steps.",
    category: "workshops",
    imageUrl: "/gallery/cloud-101.png",
    participants: 80,
    location: "Lab-4, RIMT University",
    photoCount: 22,
  },
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
  {
    id: "coding-hangout",
    title: "Coding & Cloud Hangout",
    date: "30 Mar 2026",
    description: "Peer programming session, sharing AWS cloud architecture patterns, and open-source project building.",
    category: "community",
    imageUrl: "/gallery/community-meetup.png",
    participants: 35,
    location: "Campus Lawn",
    photoCount: 14,
  },
  {
    id: "tech-talk-s1",
    title: "Tech Talk: Scalable Apps on AWS",
    date: "20 Mar 2026",
    description: "Core session explaining cloud high-availability configurations, auto-scaling groups, and multi-AZ database backups.",
    category: "events",
    imageUrl: "/gallery/cloud-day.png",
    participants: 110,
    location: "Conference Hall",
    photoCount: 19,
  },
];
