import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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
    "25BCSE009": "MANJOT KAUR",
  };
  return knownMap[cleanKey] || null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, rollNumber } = body;

    // Input validation
    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json(
        { found: false, error: "A valid event is required." },
        { status: 400 }
      );
    }

    if (!rollNumber || typeof rollNumber !== "string") {
      return NextResponse.json(
        { found: false, error: "A valid roll number is required." },
        { status: 400 }
      );
    }

    const cleanRoll = rollNumber.trim().toUpperCase();

    if (cleanRoll.length < 3 || cleanRoll.length > 30) {
      return NextResponse.json(
        { found: false, error: "Roll number format is invalid." },
        { status: 400 }
      );
    }

    // ── Supabase Mode ──
    if (isSupabaseConfigured && supabase) {
      // Check if querying default-kiroverse or database event
      if (eventId === "default-kiroverse") {
        const mappedName = formatRollNumberToName(cleanRoll);
        if (!mappedName) {
          return NextResponse.json({ found: false }, { status: 200 });
        }

        return NextResponse.json({
          found: true,
          participantName: mappedName,
          templateUrl: "/certificates/default-template.png",
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

      // First verify the event exists and is published
      const { data: eventData, error: eventError } = await supabase
        .from("certificate_events")
        .select("id, title, template_url, name_x, name_y, font_family, font_size, font_weight, text_color, text_align, is_published")
        .eq("id", eventId)
        .eq("is_published", true)
        .single();

      if (!eventError && eventData) {
        // Case-insensitive lookup using .ilike
        const { data: participant, error: participantError } = await supabase
          .from("certificate_participants")
          .select("id, participant_name, roll_number")
          .eq("event_id", eventId)
          .ilike("roll_number", cleanRoll)
          .single();

        if (participant && !participantError) {
          // Log the download
          const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
          await supabase.from("certificate_downloads").insert({
            participant_id: participant.id,
            event_id: eventId,
            ip_address: ip.split(",")[0].trim(),
          });

          return NextResponse.json({
            found: true,
            participantName: participant.participant_name,
            templateUrl: eventData.template_url || "/certificates/default-template.png",
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

    // ── Sandbox / Default Event Fallback ──
    const fallbackName = formatRollNumberToName(cleanRoll);
    if (!fallbackName) {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    return NextResponse.json({
      found: true,
      participantName: fallbackName,
      templateUrl: "/certificates/default-template.png",
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
    return NextResponse.json(
      { found: false, error: "An internal error occurred. Please try again." },
      { status: 500 }
    );
  }
}
