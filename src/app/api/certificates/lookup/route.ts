import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import crypto from "crypto";

// In-memory sliding window rate limiter
interface RateLimitEntry {
  count: number;
  resetTime: number;
  lockoutUntil: number;
  distinctRolls: Set<string>;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up expired rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime && now > entry.lockoutUntil) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || "aws-sbg-cert-secret-token-key-2026";

/**
 * Generate a short-lived signed download token valid for 5 minutes.
 */
function createDownloadToken(rollNumber: string, eventId: string): string {
  const expiresAt = Date.now() + 5 * 60 * 1000;
  const payload = `${rollNumber}:${eventId}:${expiresAt}`;
  const hmac = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(JSON.stringify({ payload, hmac })).toString("base64url");
}

/**
 * PDF Student Roster Map (case-insensitive keys)
 */
function formatRollNumberToName(roll: string): string | null {
  const cleanKey = roll.trim().toUpperCase();
  const knownMap: Record<string, string> = {
    "25BCSE014": "PRABHDEEP KAUR",
    "25BCSE019": "SIMRANJIT KAUR",
    "25BMEAIML001": "ARSHPREET SINGH",
    "25CEAIML001": "RISHAV RAJ",
    "25BCSE023": "VAIBHAV BANSAL",
    "25BCSE004": "AMANDEEP SINGH",
    "25BCSE013": "NIKHIL BHARDWAJ",
    "25BCSEAIML130": "AMANPREET KAUR",
    "25BCSEAIML046": "JASLEEN KHANNA",
    "25BCSEAIML032": "EKTA RANA",
    "25BCSEAIML041": "HIMANI",
    "25BCSEAIML015": "ANSHU",
    "25BCSEAIML004": "ADITYA",
    "25BCSEAIML036": "GOURAV PAL",
    "25BCSEAIML137": "DEEPAK KUMAR",
    "25BCSEAIML028": "ASHUTOSH KUMAR",
    "25BCSEAIML001": "AARYAN TRIPATHI",
    "25BCSEAIML012": "ANKIT KUMAR YADAV",
    "25BCSEAIML029": "AVINASH KUMAR",
    "25BCSEAIML018": "ANUSHKA KUMARI",
    "25BCSEAIML045": "JASHANPREET KAUR",
    "25BCSEAIML101": "ROSHNI",
    "25BCSEAIML104": "SANJANA",
    "25BCSEAIML049": "JIGYASA KUMARI",
    "25BCSEAIML074": "NEHA",
    "24BCSEAIML007": "ANJALI",
    "24BCSEAIML039": "NAGMA",
    "25BCSEAIML073": "NEERAJ",
    "25BCSEAIML107": "SHAINA",
    "25BCSEAIML082": "PAYAL",
    "25BCSEAIML070": "MUKUL",
    "25BCSEAIML030": "AYUSH",
    "25BCSEAIML116": "SUJIT",
    "25BCSEDS009": "PRATEEK",
    "25BCSEAIML091": "PRIYANSHU",
    "25BCSEAIML086": "PRANAV SHARMA",
    "25BCSEAIML051": "KAMALPREET SINGH",
    "25BCSEDS008": "SUKHJEET",
    "25BCSEAIML119": "YUVRAJ",
    "25BCSEAIML112": "SHUBHAM",
    "25BCSEAIML135": "HARSAJAN",
    "25BCSE007": "HARSHIT BANSAL",
    "25BCSEAIML035": "GOURAV",
    "25BCSE024": "YUVRAJ SINGH",
    "25BCSEAIML088": "PREETI",
    "25BCSEAIML077": "NIKHIL",
    "25BCSEAIML075": "NIDHI",
    "24BCSEAIML036": "MEHAKPREET KAUR",
    "24BCSEAIML057": "SIMRANJIT KAUR",
    "24BCSEAIML049": "RESHAM KAUR",
    "25BCSEAIML044": "PARVEENJOT KAUR",
    "25BCSEAIML038": "GURWINDER",
    "25BCSEAIML002": "AASTHA PRASHAR",
    "24BCSEAIML054": "SANYAM",
    "24BCSE010": "FALAK MASOOM",
    "24BCSEAIML035": "MEGHNA VERMA",
    "24BCSEAIML028": "JASPREET KAUR",
    "24BCSEAIML002": "AASHIA",
    "24BCSEAIML01": "SHIVANI YADAV",
    "24BCSEAIML001": "SHIVANI YADAV",
    "25BEE005": "MUSKAN",
    "25BECEAIML002": "RIYA GUPTA",
    "25BCSEAIML076": "NIHAR",
    "25BCSEAIML059": "KUNAL",
    "25BCSE001": "ABDUL REHMAN",
    "25BCSEAIML124": "TASHPREET KAUR",
    "25BCSEAIML103": "SAKSHI",
    "25BCSECBRS004": "RAMANDEEP KAUR",
    "25BCSEAIML139": "SNEHA",
    "25BCSEAIML083": "POOJA DEVI",
    "25BCSEDS003": "MANMEET KAUR",
    "25BCSEAIML140": "KULWINDER SINGH",
    "25BCSEAIML125": "TARANPREET SINGH",
    "25BCSEAIML061": "LOVEPREET KAUR",
    "25BCSEAIML066": "MEHAK",
    "25BCSEAIML078": "NIKKI",
    "25BCSE017": "SAPNA KUMARI",
    "24BCSEAIML014": "DHEERAJ GARG",
    "24BCSEAIML009": "ANURAG KUMAR",
    "24BCSEAIM010": "DEEP SHIKHA",
    "25BCSE009": "MANJOT KAUR",
    "25BECEAIML001": "PRANAV BANSAL",
    "25BCSE015": "RINKU BHALOTIYA",
    "25CEAIML002": "ROHAN VERMA",
    "25BCSEAIML009": "AMISHA",
    "25BCSEAIML008": "AMBER PRASHAR",
    "25BCSECBRS001": "ADITYA KUMAR",
    "25BCSEAIML010": "AMRINDER SINGH",
    "25BCSEAIML021": "ARJAN SINGH",
    "25BCSEAIML019": "ARASHVIR GILL",
    "25BCSEAIML003": "ADITYA JASWAL",
    "25BCSEAIML047": "JASNEET SINGH",
    "RIMT261100": "SAGAR",
    "25BCSEAIML089": "PRATIKSHA",
    "25BCSEAIML111": "SHIVANI",
    "25BCSEAIML136": "APURVA SHARMA",
    "25BCSEAIML121": "TANIA SHARMA",
    "25BCSEAIML106": "SEJAL",
    "25BCSEAIML096": "RAVINDER KAUR",
    "25BCSEDS006": "SIMRANPREET KAUR",
    "25BCSECBRS008": "AKSHARA SHARMA",
    "25BCSECBRS007": "YATI SINGLA",
    "25BCSEAIML052": "KARAN",
    "25BCSEAIML134": "SHEM",
    "25BCSEAIML081": "PARVEEN KAUR",
    "25BCSEAIML085": "PRABHNOOR KAUR",
    "25BCSEAIML025": "ARVIND KUMAR",
    "25BCSEAIML048": "JASPREET SINGH",
    "25BCSEAIML055": "KHUSHI KUMARI",
    "25BCSEAIML056": "KHUSHI SHUKLA",
    "25BCE002": "RITIKA",
    "24BCSEAIML055": "SHIVANI YADAV",
    "25BCSEAIML098": "ROHIT",
    "25BCSEAIML123": "TARANPREET SINGH",
  };
  return knownMap[cleanKey] || null;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
             request.headers.get("x-real-ip") || "127.0.0.1";
  const now = Date.now();

  // ── 1. RATE LIMITER CHECK ──
  let rateEntry = rateLimitMap.get(ip);
  if (!rateEntry) {
    rateEntry = { count: 0, resetTime: now + 60 * 1000, lockoutUntil: 0, distinctRolls: new Set() };
    rateLimitMap.set(ip, rateEntry);
  }

  // Check lockout
  if (now < rateEntry.lockoutUntil) {
    const remainingSecs = Math.ceil((rateEntry.lockoutUntil - now) / 1000);
    return NextResponse.json(
      { found: false, error: `Too many requests. Please try again in ${remainingSecs} seconds.` },
      { status: 429, headers: { "Retry-After": String(remainingSecs) } }
    );
  }

  // Reset window if expired
  if (now > rateEntry.resetTime) {
    rateEntry.count = 0;
    rateEntry.resetTime = now + 60 * 1000;
    rateEntry.distinctRolls.clear();
  }

  rateEntry.count += 1;

  // Rate limit trigger: max 5 requests per minute
  if (rateEntry.count > 5) {
    rateEntry.lockoutUntil = now + 60 * 1000; // 1 min lockout
    return NextResponse.json(
      { found: false, error: "Too many requests. Please slow down and try again in 60 seconds." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const body = await request.json();
    const { eventId, rollNumber, hp } = body;

    // ── 2. BOT CHECK / HONEYPOT ──
    if (hp && typeof hp === "string" && hp.trim().length > 0) {
      // Honeypot filled by bot -> return generic not found silently
      return NextResponse.json({ found: false }, { status: 200 });
    }

    // ── 3. STRICT INPUT VALIDATION ──
    if (!eventId || typeof eventId !== "string" || !rollNumber || typeof rollNumber !== "string") {
      return NextResponse.json({ found: false }, { status: 200 }); // Anti-enumeration: identical response
    }

    const cleanRoll = rollNumber.trim().toUpperCase();

    // Regex check: letters and numbers only, 3 to 25 chars
    if (!/^[A-Z0-9]{3,25}$/.test(cleanRoll)) {
      return NextResponse.json({ found: false }, { status: 200 }); // Anti-enumeration
    }

    rateEntry.distinctRolls.add(cleanRoll);

    // ── 4. ANOMALY LOGGING ──
    if (rateEntry.distinctRolls.size > 8) {
      console.warn(`[SECURITY ANOMALY] IP ${ip} queried ${rateEntry.distinctRolls.size} distinct roll numbers in 1 minute.`);
    }

    // ── 5. DATABASE QUERY (SUPABASE) ──
    if (isSupabaseConfigured && supabase) {
      if (eventId === "default-kiroverse") {
        const mappedName = formatRollNumberToName(cleanRoll);
        if (!mappedName) {
          return NextResponse.json({ found: false }, { status: 200 });
        }

        const downloadToken = createDownloadToken(cleanRoll, eventId);

        return NextResponse.json({
          found: true,
          participantName: mappedName,
          templateUrl: "/certificates/default-template.png",
          downloadToken,
          config: {
            nameX: 73.8,
            nameY: 61.5,
            fontFamily: "Amazon Ember Display",
            fontSize: 26,
            fontWeight: "bold",
            textColor: "#111827",
            textAlign: "center",
          },
        });
      }

      // Parameterized query using Supabase client
      const { data: eventData, error: eventError } = await supabase
        .from("certificate_events")
        .select("id, title, template_url, name_x, name_y, font_family, font_size, font_weight, text_color, text_align, is_published")
        .eq("id", eventId)
        .eq("is_published", true)
        .single();

      if (!eventError && eventData) {
        const { data: participant, error: participantError } = await supabase
          .from("certificate_participants")
          .select("id, participant_name, roll_number")
          .eq("event_id", eventId)
          .ilike("roll_number", cleanRoll)
          .single();

        if (participant && !participantError) {
          // Log download audit
          await supabase.from("certificate_downloads").insert({
            participant_id: participant.id,
            event_id: eventId,
            ip_address: ip,
          });

          const downloadToken = createDownloadToken(cleanRoll, eventId);

          return NextResponse.json({
            found: true,
            participantName: participant.participant_name,
            templateUrl: eventData.template_url || "/certificates/default-template.png",
            downloadToken,
            config: {
              nameX: eventData.name_x,
              nameY: eventData.name_y,
              fontFamily: eventData.font_family,
              fontSize: eventData.font_size,
              fontWeight: eventData.font_weight,
              textColor: eventData.text_color,
              textAlign: eventData.text_align,
            },
          });
        }
      }
    }

    // ── 6. LOCAL DATASET FALLBACK ──
    const fallbackName = formatRollNumberToName(cleanRoll);
    if (!fallbackName) {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    const downloadToken = createDownloadToken(cleanRoll, eventId);

    return NextResponse.json({
      found: true,
      participantName: fallbackName,
      templateUrl: "/certificates/default-template.png",
      downloadToken,
      config: {
        nameX: 73.8,
        nameY: 61.5,
        fontFamily: "Amazon Ember Display",
        fontSize: 26,
        fontWeight: "bold",
        textColor: "#111827",
        textAlign: "center",
      },
    });
  } catch (err: any) {
    console.error("Certificate lookup error:", err);
    // Anti-enumeration: return identical generic response on internal error
    return NextResponse.json({ found: false }, { status: 200 });
  }
}
