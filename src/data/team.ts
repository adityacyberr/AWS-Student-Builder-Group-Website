export interface TeamMember {
  id: string;
  name: string;
  role: string;
  branch: string;
  specialization: string;
  bio: string;
  quote: string;
  focusAreas: string[];
  initials: string;
  themeColor: string;
  photo: string;
  linkedin: string;
  github: string;
  displayOrder: number;
}

export interface FacultyAdvisor {
  name: string;
  role: string;
  department: string;
  bio: string;
  initials: string;
  themeColor: string;
  photo?: string;
  linkedin?: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "pranav-bansal",
    name: "Pranav Bansal",
    role: "Group Leader",
    branch: "B.Tech ECE",
    specialization: "AI & ML",
    bio: "Founder and driving force behind the chapter, setting the vision and building the partnerships that bring it to life. Passionate about applying AI/ML and edge computing on the cloud, and about creating a space where every student can become a builder.",
    quote: "Building a community where students learn, innovate, and grow through cloud, Generative AI, and AWS.",
    focusAreas: ["Community Strategy", "Generative AI", "Cloud Architecture", "Leadership"],
    initials: "PB",
    themeColor: "orange",
    photo: "/team/pranav.jpg",
    linkedin: "https://www.linkedin.com/in/pranav-bansal-31ba4a261/",
    github: "javascript:void(0)",
    displayOrder: 1
  },
  {
    id: "aditya-kumar",
    name: "Aditya",
    role: "Technical Head",
    branch: "B.Tech CSE",
    specialization: "Cybersecurity",
    photo: "/team/aditya.jpg",
    bio: "Leads all technical programming — hands-on workshops, cloud labs, and the club's own infrastructure. A cybersecurity enthusiast focused on secure cloud practices, IAM, and teaching builders to ship projects safely.",
    quote: "Secure by design — building cloud skills the right way.",
    focusAreas: ["Cloud Security", "IAM", "Hands-on Labs", "Web & Infrastructure"],
    initials: "AK",
    themeColor: "orange",
    linkedin: "https://www.linkedin.com/in/adityacyber/",
    github: "javascript:void(0)",
    displayOrder: 2
  },
  {
    id: "amisha",
    name: "Amisha",
    role: "Marketing Head",
    branch: "B.Tech CSE",
    specialization: "AI & ML",
    photo: "/team/amisha.jpg",
    bio: "Owns the club's brand, content, and outreach, turning every event into reach across LinkedIn and Instagram. Drives community growth and makes sure the right students hear about us.",
    quote: "Telling the story of every builder.",
    focusAreas: ["Brand & Content", "Social Growth", "Outreach", "Design"],
    initials: "AM",
    themeColor: "orange",
    linkedin: "https://www.linkedin.com/in/amisha-amisha-644aa3390/",
    github: "javascript:void(0)",
    displayOrder: 3
  },
  {
    id: "amber-prashar",
    name: "Amber Prashar",
    role: "Treasurer",
    branch: "B.Tech CSE",
    specialization: "AI & ML",
    photo: "/team/amber.jpg",
    bio: "Manages budgets, sponsorships, and resource planning so events run smoothly and sustainably. Keeps the club's operations financially healthy as it scales.",
    quote: "Making sure every resource builds something.",
    focusAreas: ["Budgeting", "Sponsorships", "Operations", "Resource Planning"],
    initials: "AP",
    themeColor: "orange",
    linkedin: "https://www.linkedin.com/in/amber-prashar-a57b65395/",
    github: "javascript:void(0)",
    displayOrder: 4
  },
  {
    id: "rohan-verma",
    name: "Rohan Verma",
    role: "Director of Photography",
    branch: "B.Tech CE",
    specialization: "AI & ML",
    photo: "/team/rohan.jpg",
    bio: "Documents every workshop and hackathon through photography, video, and visual storytelling — building the credibility archive that shows the world what the community does.",
    quote: "Capturing the moments that become our legacy.",
    focusAreas: ["Photography", "Videography", "Visual Storytelling", "Media"],
    initials: "RV",
    themeColor: "orange",
    linkedin: "https://www.linkedin.com/in/rohan-verma-5a768b3b3/",
    github: "javascript:void(0)",
    displayOrder: 5
  },
  {
    id: "rinku-bhalotiya",
    name: "Rinku Bhalotiya",
    role: "Event Head",
    branch: "B.Tech CSE",
    specialization: "Software Engineering",
    photo: "/team/rinku.jpg",
    bio: "Plans and runs workshops, bootcamps, and hackathons end-to-end, bridging industry mentors and student builders. Turns ideas into well-run events that people remember.",
    quote: "From idea to packed room.",
    focusAreas: ["Event Operations", "Hackathons", "Logistics", "Partnerships"],
    initials: "RB",
    themeColor: "orange",
    linkedin: "https://www.linkedin.com/in/rinku-bhalotiya-7507003b3/",
    github: "javascript:void(0)",
    displayOrder: 6
  }
];

export const FACULTY_ADVISOR: FacultyAdvisor = {
  name: "Faculty Advisor",
  role: "to be announced",
  department: "",
  bio: "",
  initials: "FA",
  themeColor: "grey"
};
