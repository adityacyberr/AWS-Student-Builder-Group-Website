export interface EventItem {
  id: string;
  title: string;
  slug: string;
  date: string;
  time?: string;
  type: 'Workshop' | 'Hackathon' | 'Meetup' | 'Webinar';
  location: string;
  description: string;
  longDescription?: string;
  registrationLink: string;
  status: 'upcoming' | 'completed';
  coverPlaceholderColor: 'orange' | 'blue' | 'purple' | 'mint' | 'amber';
}

export const EVENTS: EventItem[] = [
  {
    id: "upcoming-session-july-29",
    title: "Yet to be announced",
    slug: "yet-to-be-announced",
    date: "July 29, 2026",
    time: "TBA",
    type: "Meetup",
    location: "RIMT University Campus",
    description: "Details for this upcoming AWS developer meetup will be announced soon. Registrations will open shortly.",
    longDescription: "Our team is coordinating the speaker schedule and topic details for the upcoming AWS Student Builder Group session on July 29, 2026. Join our community on Meetup to get notified as soon as registrations open.",
    registrationLink: "https://www.meetup.com/aws-sbg-at-rimt-university/?eventOrigin=your_groups",
    status: "upcoming",
    coverPlaceholderColor: "orange"
  }
];

export function getLocalEvents(): EventItem[] {
  if (typeof window === "undefined") return EVENTS;
  const initialized = localStorage.getItem("aws_sbg_events_initialized");
  if (!initialized) {
    localStorage.setItem("aws_sbg_events", JSON.stringify(EVENTS));
    localStorage.setItem("aws_sbg_events_initialized", "true");
    return EVENTS;
  }
  const stored = localStorage.getItem("aws_sbg_events");
  return stored ? JSON.parse(stored) : [];
}

export function saveLocalEvents(events: EventItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("aws_sbg_events", JSON.stringify(events));
  localStorage.setItem("aws_sbg_events_initialized", "true");
}
