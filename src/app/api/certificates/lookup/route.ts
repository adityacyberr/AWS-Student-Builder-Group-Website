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
function createDownloadToken(queryKey: string, eventId: string): string {
  const expiresAt = Date.now() + 5 * 60 * 1000;
  const payload = `${queryKey}:${eventId}:${expiresAt}`;
  const hmac = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(JSON.stringify({ payload, hmac })).toString("base64url");
}

/**
 * Mobile Number Roster Map (from PDF table)
 */
const mobileToNameMap: Record<string, string> = {
  "9463086537": "Rohan Verma",
  "9878565612": "Abhishek Singh",
  "9914929615": "Aditi Kumari",
  "9517960225": "Aditya",
  "8847450218": "Amber Prasher",
  "7973586431": "Amisha",
  "9529512911": "Ankush Vidhate",
  "9357250557": "Ayush Kumar",
  "6239258870": "Deep Shikha",
  "9876038304": "Dheeraj Garg",
  "6284657009": "Ekamjot Kaur",
  "7973701509": "Girish Dhawan",
  "9914308821": "Gurkamal Ghuman",
  "6283631847": "Himanshi",
  "8146820038": "Himanshi Goyal",
  "7719433912": "Jasleen Khanna",
  "8341977280": "Kusumsuhas V",
  "7340961491": "Nagma Kumari",
  "9780150301": "Pooja Rani",
  "6283882949": "Prabhdeep Kaur",
  "9416773013": "Pranav Bansal",
  "7861821093": "Rinku",
  "9877434746": "Rishav Raj",
  "797360157": "Ritika",
  "7973360157": "Ritika",
  "8837505394": "Riya Singh",
  "7087575841": "Sakshi",
  "8082837273": "Saqib Hussain Shah",
  "7875789732": "Shubham",
  "6280056452": "Simranjit Kaur",
  "8699168863": "Sagar",
  "9815976540": "Sneha Pandey",
  "8146852279": "Tejinder Kaur",
  "8437334886": "Ramanadeep Kaur",
  "6283217445": "Swastik",
  "6280459292": "Arshpreet Singh",
  "8865966009": "Vishvadeep Singh Chauhan",
  "9914797854": "Simranjeet Kaur",
  "9465935141": "Alok",
  "9115749663": "Jaswinder Sharma",
};

/**
 * Roll Number Roster Map
 */
const knownRollMap: Record<string, string> = {
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
  "24BCSEAIML056": "SIMARPREET KAUR",
  "RIMT261160": "SAGAR",
  "26BCSEAIML004": "ALOK",
};

function toTitleCase(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatInputToName(query: string): string | null {
  const cleanInput = query.trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const digitsOnly = query.trim().replace(/\D/g, "");

  if (digitsOnly && mobileToNameMap[digitsOnly]) {
    return toTitleCase(mobileToNameMap[digitsOnly]);
  }

  if (knownRollMap[cleanInput]) {
    return toTitleCase(knownRollMap[cleanInput]);
  }

  return null;
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

  if (now < rateEntry.lockoutUntil) {
    const remainingSecs = Math.ceil((rateEntry.lockoutUntil - now) / 1000);
    return NextResponse.json(
      { found: false, error: `Too many requests. Please try again in ${remainingSecs} seconds.` },
      { status: 429, headers: { "Retry-After": String(remainingSecs) } }
    );
  }

  if (now > rateEntry.resetTime) {
    rateEntry.count = 0;
    rateEntry.resetTime = now + 60 * 1000;
    rateEntry.distinctRolls.clear();
  }

  rateEntry.count += 1;

  if (rateEntry.count > 10) {
    rateEntry.lockoutUntil = now + 60 * 1000;
    return NextResponse.json(
      { found: false, error: "Too many requests. Please slow down and try again in 60 seconds." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const body = await request.json();
    const { eventId, rollNumber, hp } = body;
    const rawInput = rollNumber || body.mobileNumber || "";

    if (hp && typeof hp === "string" && hp.trim().length > 0) {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    if (!eventId || typeof eventId !== "string" || !rawInput || typeof rawInput !== "string") {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    const cleanInput = rawInput.trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const digitsOnly = rawInput.trim().replace(/\D/g, "");

    rateEntry.distinctRolls.add(cleanInput);

    if (rateEntry.distinctRolls.size > 12) {
      console.warn(`[SECURITY ANOMALY] IP ${ip} queried ${rateEntry.distinctRolls.size} distinct inputs in 1 minute.`);
    }

    // ── 2. DATABASE QUERY (SUPABASE) ──
    if (isSupabaseConfigured && supabase) {
      const client = supabase;

      if (eventId === "default-kiroverse" || eventId === "default-aws-basics" || eventId.includes("aws-basics")) {
        const mappedName = formatInputToName(rawInput);
        if (!mappedName) {
          return NextResponse.json({ found: false }, { status: 200 });
        }

        const downloadToken = createDownloadToken(cleanInput, eventId);
        const isAWSBasics = eventId.includes("aws-basics") || eventId === "default-aws-basics";

        return NextResponse.json({
          found: true,
          participantName: mappedName,
          templateUrl: isAWSBasics ? "/certificates/aws-basics-template.png" : "/certificates/default-template.png",
          downloadToken,
          config: {
            nameX: isAWSBasics ? 73.3 : 73.8,
            nameY: isAWSBasics ? 61.8 : 61.5,
            fontFamily: isAWSBasics ? '"JetBrains Mono", "Fira Code", monospace' : "Amazon Ember Display",
            fontSize: isAWSBasics ? 21 : 26,
            fontWeight: "bold",
            textColor: isAWSBasics ? "#ffffff" : "#111827",
            textAlign: "center",
          },
        });
      }

      // Query DB for published event
      const { data: eventData, error: eventError } = await client
        .from("certificate_events")
        .select("id, title, slug, template_url, name_x, name_y, font_family, font_size, font_weight, text_color, text_align, is_published")
        .eq("id", eventId)
        .eq("is_published", true)
        .single();

      if (!eventError && eventData) {
        // Query participant by roll number OR mobile number
        let query = client
          .from("certificate_participants")
          .select("id, participant_name, roll_number")
          .eq("event_id", eventId);

        if (digitsOnly && digitsOnly.length >= 8) {
          query = query.or(`roll_number.ilike.${cleanInput},roll_number.ilike.${digitsOnly}`);
        } else {
          query = query.ilike("roll_number", cleanInput);
        }

        const { data: participant, error: participantError } = await query.maybeSingle();

        if (participant && !participantError) {
          await client.from("certificate_downloads").insert({
            participant_id: participant.id,
            event_id: eventId,
            ip_address: ip,
          });

          const downloadToken = createDownloadToken(cleanInput, eventId);
          const isAWSBasics = eventData.slug === "aws-basics" || eventData.title.toLowerCase().includes("aws basics");

          return NextResponse.json({
            found: true,
            participantName: toTitleCase(participant.participant_name),
            templateUrl: isAWSBasics ? "/certificates/aws-basics-template.png" : (eventData.template_url || "/certificates/default-template.png"),
            downloadToken,
            config: {
              nameX: isAWSBasics ? 73.3 : (eventData.name_x ?? 73.8),
              nameY: isAWSBasics ? 61.8 : (eventData.name_y ?? 61.5),
              fontFamily: isAWSBasics ? '"JetBrains Mono", "Fira Code", monospace' : (eventData.font_family || "Amazon Ember Display"),
              fontSize: isAWSBasics ? 21 : (eventData.font_size ?? 26),
              fontWeight: eventData.font_weight || "bold",
              textColor: isAWSBasics ? "#ffffff" : (eventData.text_color || "#111827"),
              textAlign: eventData.text_align || "center",
            },
          });
        } else {
          return NextResponse.json({ found: false }, { status: 200 });
        }
      }
    }

    // ── 3. LOCAL DATASET FALLBACK ──
    const fallbackName = formatInputToName(rawInput);
    if (!fallbackName) {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    const downloadToken = createDownloadToken(cleanInput, eventId);
    const isAWSBasics = eventId.includes("aws-basics") || eventId === "default-aws-basics";

    return NextResponse.json({
      found: true,
      participantName: fallbackName,
      templateUrl: isAWSBasics ? "/certificates/aws-basics-template.png" : "/certificates/default-template.png",
      downloadToken,
      config: {
        nameX: isAWSBasics ? 73.3 : 73.8,
        nameY: isAWSBasics ? 61.8 : 61.5,
        fontFamily: isAWSBasics ? '"JetBrains Mono", "Fira Code", monospace' : "Amazon Ember Display",
        fontSize: isAWSBasics ? 21 : 26,
        fontWeight: "bold",
        textColor: isAWSBasics ? "#ffffff" : "#111827",
        textAlign: "center",
      },
    });
  } catch (err: any) {
    console.error("Certificate lookup error:", err);
    return NextResponse.json({ found: false }, { status: 200 });
  }
}
