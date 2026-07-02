import { EventItem } from "@/data/events";

export const KIROVERSE_JSON = {
  description: "Join us at an insightful session on Kiro - the AI powered IDE transforming the way developers build with speed, intelligence, and confidence. This workshop is designed for student developers, tech enthusiasts, and cloud builders who want to learn how to build smarter and ship faster using state-of-the-art AI-assisted coding tools.",
  whatYouWillLearn: [
    "Introduction to Kiro and AI-assisted development environments",
    "How to write cleaner code, generate test cases, and find bugs using AI",
    "Integrating AI IDE tools into your development workflow",
    "Best practices for prompting and generating robust code structures",
    "Hands-on demonstration: Building and shipping a project in record time"
  ],
  speakers: [
    {
      name: "Bhoomi Raut",
      role: "AWS Cloud Club Captain & AWS Academy Graduate",
      company: "AWS Cloud Club",
      bio: "B.Tech Computer Science graduate, MBA learner, and AWS Cloud Club Captain specializing in serverless workflows and responsible AI.",
      linkedin: "https://www.linkedin.com/in/bhoomi-ganesh-raut",
      image: "/events/bhoomi-raut.jpg"
    }
  ],
  faqs: [
    {
      question: "Who can attend this workshop?",
      answer: "This workshop is open to all students at RIMT University and external developers who are interested in AI coding assistants and modern web development."
    },
    {
      question: "Are there any prerequisites?",
      answer: "Basic programming knowledge is helpful. Bring your laptop if you want to follow along with the live demonstrations."
    },
    {
      question: "Is this event free?",
      answer: "Yes! The workshop is completely free to attend, but registration on Meetup is required to reserve your seat."
    }
  ]
};

export function enrichEvent(event: EventItem): EventItem {
  if (event.slug === "kiroverse") {
    return {
      ...event,
      imageUrl: event.imageUrl || "/events/kiroverse-poster.png",
      longDescription: event.longDescription && event.longDescription.trim().startsWith('{')
        ? event.longDescription
        : JSON.stringify(KIROVERSE_JSON)
    };
  }
  return event;
}
