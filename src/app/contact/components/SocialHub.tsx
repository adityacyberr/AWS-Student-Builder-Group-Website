import { useRef, useEffect } from "react";
import { Mail, ArrowUpRight, Users } from "lucide-react";
import { motion, Variants } from "framer-motion";

interface SocialItem {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  colorClass: string;
  hoverBorder: string;
  hoverBg: string;
  hoverText: string;
}

const SOCIAL_ITEMS: SocialItem[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Connect with us on LinkedIn",
    href: "https://www.linkedin.com/company/awsrimt/",
    icon: (
      <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
    colorClass: "text-[#0077b5] bg-[#0077b5]/10 border-[#0077b5]/20",
    hoverBorder: "hover:border-[#0077b5]/40",
    hoverBg: "group-hover:bg-[#0077b5]/20",
    hoverText: "group-hover:text-[#0077b5]",
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Follow our updates & stories",
    href: "https://www.instagram.com/aws.rimt/",
    icon: (
      <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    colorClass: "text-[#e1306c] bg-[#e1306c]/10 border-[#e1306c]/20",
    hoverBorder: "hover:border-[#e1306c]/40",
    hoverBg: "group-hover:bg-[#e1306c]/20",
    hoverText: "group-hover:text-[#e1306c]",
  },
  {
    id: "github",
    name: "GitHub",
    description: "Explore our projects & code",
    href: "https://github.com/adityacyberr/AWS-Student-Builder-Group-Website",
    icon: (
      <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
      </svg>
    ),
    colorClass: "text-[#fafafa] bg-[#fafafa]/10 border-[#fafafa]/20",
    hoverBorder: "hover:border-[#fafafa]/40",
    hoverBg: "group-hover:bg-[#fafafa]/20",
    hoverText: "group-hover:text-[#fafafa]",
  },
  {
    id: "x",
    name: "X (Twitter)",
    description: "Latest announcements & insights",
    href: "https://x.com/awsrimt",
    icon: (
      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    colorClass: "text-[#ffffff] bg-[#ffffff]/10 border-[#ffffff]/20",
    hoverBorder: "hover:border-[#ffffff]/45",
    hoverBg: "group-hover:bg-[#ffffff]/15",
    hoverText: "group-hover:text-[#ffffff]",
  },
  {
    id: "youtube",
    name: "YouTube",
    description: "Watch our talks & sessions",
    href: "#",
    icon: (
      <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    colorClass: "text-[#ff0000] bg-[#ff0000]/10 border-[#ff0000]/20",
    hoverBorder: "hover:border-[#ff0000]/40",
    hoverBg: "group-hover:bg-[#ff0000]/20",
    hoverText: "group-hover:text-[#ff0000]",
  },
  {
    id: "email",
    name: "Email",
    description: "Reach us directly anytime",
    href: "mailto:awsbuild@rimt.ac.in",
    icon: <Mail className="h-5 w-5" />,
    colorClass: "text-[#ff9900] bg-[#ff9900]/10 border-[#ff9900]/20",
    hoverBorder: "hover:border-[#ff9900]/40",
    hoverBg: "group-hover:bg-[#ff9900]/20",
    hoverText: "group-hover:text-[#ff9900]",
  },
];

export function SocialHub({ variants }: { variants?: Variants }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const panel = panelRef.current;
    if (!panel) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const rect = panel.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      panel.style.setProperty("--x", `${x}px`);
      panel.style.setProperty("--y", `${y}px`);
    });
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      variants={variants}
      ref={panelRef}
      onMouseMove={handleMouseMove}
      style={{
        transform: "translate3d(0,0,0)",
        backfaceVisibility: "hidden",
      }}
      className="relative rounded-3xl border border-slate-800/80 bg-slate-950/75 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-between w-full shadow-[inset_0_0_12px_rgba(255,140,0,0.02)] border-t-white/10 border-x-white/5 border-b-white/0"
    >
      {/* Dynamic follow cursor lighting */}
      <div 
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none md:block hidden z-0"
        style={{
          background: "radial-gradient(800px circle at var(--x, 0px) var(--y, 0px), rgba(255,140,0,0.06), transparent 45%)",
        }}
      />

      {/* Connection Header */}
      <div className="relative z-10 flex items-start justify-between mb-5">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Connect With Us</h3>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Follow our journey and stay updated.
          </p>
        </div>
        
        {/* Network Box Icon */}
        <div className="p-3.5 rounded-2xl bg-orange-500/[0.03] border border-orange-500/15 text-orange-400 shadow-[inset_0_0_12px_rgba(255,140,0,0.05)]">
          <Users className="h-5 w-5" />
        </div>
      </div>

      {/* Stacked platform links */}
      <div className="relative z-10 space-y-2">
        {SOCIAL_ITEMS.map((item) => (
          <a
            key={item.id}
            href={item.href}
            {...(item.href !== "#" && !item.href.startsWith("mailto:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={`group flex items-center justify-between p-3.5 rounded-xl border border-slate-900 bg-slate-950/60 transition-all duration-300 ease-out hover:-translate-y-0.5 ${item.hoverBorder} hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500/50`}
          >
            <div className="flex items-center gap-4">
              {/* Branding Icon */}
              <div className={`p-2.5 rounded-lg border transition-all duration-300 ${item.colorClass} ${item.hoverBg} group-hover:scale-105`}>
                {item.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                  {item.name}
                </h4>
                <p className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                  {item.description}
                </p>
              </div>
            </div>

            {/* External link indicator */}
            {item.href !== "#" && (
              <div className="text-slate-700 group-hover:text-orange-400/80 transition-colors pl-4">
                <ArrowUpRight className="h-4.5 w-4.5 transform translate-x-0 translate-y-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </div>
            )}
          </a>
        ))}
      </div>
    </motion.div>
  );
}
