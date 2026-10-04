import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface PublicCertEvent {
  id: string;
  title: string;
  slug: string;
  event_date: string;
  event_type: string;
  description: string;
  location: string;
  template_url: string | null;
  name_x: number;
  name_y: number;
  font_family: string;
  font_size: number;
  font_weight: string;
  text_color: string;
  text_align: "left" | "center" | "right";
  is_published: boolean;
  created_at: string;
  participant_count: number;
}

export const DEFAULT_CERT_EVENTS: PublicCertEvent[] = [
  {
    id: "default-aws-basics",
    title: "AWS Basics",
    slug: "aws-basics",
    event_date: "02 October 2026",
    event_type: "Online Session",
    description: "Mastering AWS Cloud fundamentals, IAM security, S3 storage, and EC2 computing instances.",
    location: "Online • 1 Hour Session",
    template_url: "/certificates/aws-basics-template.png",
    name_x: 73.3,
    name_y: 61.8,
    font_family: '"JetBrains Mono", "Fira Code", monospace',
    font_size: 21,
    font_weight: "bold",
    text_color: "#ffffff",
    text_align: "center",
    is_published: true,
    created_at: "2026-10-02T10:00:00Z",
    participant_count: 37,
  },
  {
    id: "default-kiroverse",
    title: "KIROverse — AWS Student Builder Group",
    slug: "kiroverse",
    event_date: "31 July 2026",
    event_type: "Workshop",
    description: "Build Smarter. Ship Faster. Hands-on AI-powered IDE workshop by AWS Student Builder Group at RIMT University.",
    location: "Workshop • RIMT University",
    template_url: "/certificates/default-template.png",
    name_x: 73.8,
    name_y: 61.5,
    font_family: "Amazon Ember Display",
    font_size: 26,
    font_weight: "bold",
    text_color: "#111827",
    text_align: "center",
    is_published: true,
    created_at: "2026-07-31T10:00:00Z",
    participant_count: 105,
  },
];

export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      try {
        const { data, error } = await client
          .from("certificate_events")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const eventsWithCounts = await Promise.all(
            data.map(async (ev: any) => {
              let count = ev.slug === "aws-basics" ? 37 : 105;
              try {
                const { count: pCount } = await client
                  .from("certificate_participants")
                  .select("*", { count: "exact", head: true })
                  .eq("event_id", ev.id);
                if (typeof pCount === "number" && pCount > 0) {
                  count = pCount;
                }
              } catch (e) {
                // fallback count
              }
              const isAWSBasics = ev.slug === "aws-basics";
              return {
                id: ev.id,
                title: ev.title,
                slug: ev.slug,
                event_date: ev.event_date || "02 October 2026",
                event_type: ev.event_type || "Workshop",
                description: ev.description || "",
                location: ev.location || "RIMT University",
                template_url: isAWSBasics ? "/certificates/aws-basics-template.png" : (ev.template_url || "/certificates/default-template.png"),
                name_x: isAWSBasics ? 73.3 : (ev.name_x ?? 73.8),
                name_y: isAWSBasics ? 61.8 : (ev.name_y ?? 61.5),
                font_family: isAWSBasics ? '"JetBrains Mono", "Fira Code", monospace' : (ev.font_family || "Amazon Ember Display"),
                font_size: isAWSBasics ? 21 : (ev.font_size ?? 26),
                font_weight: ev.font_weight || "bold",
                text_color: isAWSBasics ? "#ffffff" : (ev.text_color || "#111827"),
                text_align: ev.text_align || "center",
                is_published: ev.is_published,
                created_at: ev.created_at || new Date().toISOString(),
                participant_count: count,
              };
            })
          );
          return NextResponse.json({ events: eventsWithCounts });
        }
      } catch (dbErr) {
        console.warn("Failed to fetch published cert events from DB:", dbErr);
      }
    }

    return NextResponse.json({ events: DEFAULT_CERT_EVENTS });
  } catch (err: any) {
    console.error("Cert events API error:", err);
    return NextResponse.json({ events: DEFAULT_CERT_EVENTS });
  }
}
