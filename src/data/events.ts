export interface EventItem {
  id: string;
  title: string;
  slug: string;
  date: string;
  time?: string;
  type: 'Workshop' | 'Bootcamp' | 'Meetup' | 'Webinar' | 'Hackathon' | 'Celebration' | 'Community Event' | 'Other';
  location: string;
  description: string;
  longDescription?: string;
  registrationLink: string;
  status: 'upcoming' | 'completed';
  coverPlaceholderColor: 'orange' | 'blue' | 'purple' | 'mint' | 'amber';
  imageUrl?: string;
}

export const EVENTS: EventItem[] = [
  {
    id: "451397cf-9df9-4559-a27c-57eb9df77bcb",
    title: "KIROverse - Build Smarter. Ship Faster.",
    slug: "kiroverse",
    date: "July 31, 2026",
    time: "11:00 AM - 2:00 PM IST",
    type: "Workshop",
    location: "Seminar Hall, B Block, RIMT University",
    description: "Join us at an insightful session on Kiro - the AI powered IDE transforming the way developers build with speed, intelligence, and confidence.",
    longDescription: "Get ready to build smarter and ship faster as we explore Kiro, a cutting-edge platform designed to revolutionize the way you deploy and scale your web applications. Whether you're an experienced developer, a tech enthusiast, or a curious learner, this workshop will provide you with practical insights and hands-on experience to elevate your projects.",
    registrationLink: "https://www.meetup.com/aws-sbg-at-rimt-university/events/315511074/?utm_medium=referral&utm_campaign=share-btn_savedevents_share_modal&utm_source=link&utm_version=v2&member_id=481883308",
    status: "upcoming",
    coverPlaceholderColor: "purple",
    imageUrl: "/events/kiroverse-poster.png"
  }
];

export function getLocalEvents(): EventItem[] {
  if (typeof window === "undefined") return EVENTS;
  
  const stored = localStorage.getItem("aws_sbg_events");
  let localList: EventItem[] = [];
  
  if (stored) {
    try {
      localList = JSON.parse(stored);
    } catch (e) {
      localList = [];
    }
  }

  const initialized = localStorage.getItem("aws_sbg_events_initialized");
  if (!initialized || localList.length === 0) {
    localStorage.setItem("aws_sbg_events", JSON.stringify(EVENTS));
    localStorage.setItem("aws_sbg_events_initialized", "true");
    return EVENTS;
  }

  // Merge hardcoded EVENTS that are missing in local storage, and remove old placeholder
  let updated = false;
  const originalLength = localList.length;
  localList = localList.filter(e => e.id !== "upcoming-session-july-29" && e.slug !== "yet-to-be-announced");
  if (localList.length !== originalLength) {
    updated = true;
  }

  EVENTS.forEach((hardcodedEvent) => {
    const exists = localList.some(e => e.id === hardcodedEvent.id || e.slug === hardcodedEvent.slug);
    if (!exists) {
      localList.push(hardcodedEvent);
      updated = true;
    }
  });

  if (updated) {
    localStorage.setItem("aws_sbg_events", JSON.stringify(localList));
  }

  return localList;
}

export function saveLocalEvents(events: EventItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("aws_sbg_events", JSON.stringify(events));
  localStorage.setItem("aws_sbg_events_initialized", "true");
}
