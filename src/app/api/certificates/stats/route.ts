import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  try {
    let count = 78; // Base count from PDF student roster

    if (isSupabaseConfigured && supabase) {
      try {
        const { count: dbCount, error } = await supabase
          .from("certificate_participants")
          .select("*", { count: "exact", head: true });

        if (!error && typeof dbCount === "number" && dbCount > 0) {
          count = dbCount;
        }
      } catch (err) {
        console.warn("Failed to fetch cert count from DB, using fallback count:", err);
      }
    }

    // Round down to nearest 50 (if >= 50) or 10
    let rounded = 50;
    if (count >= 100) {
      rounded = Math.floor(count / 50) * 50;
    } else if (count >= 50) {
      rounded = 50;
    } else {
      rounded = Math.floor(count / 10) * 10;
    }

    return NextResponse.json({
      totalIssued: count,
      displayStat: `${rounded}+`,
    });
  } catch (err: any) {
    return NextResponse.json({
      totalIssued: 78,
      displayStat: "50+",
    });
  }
}
