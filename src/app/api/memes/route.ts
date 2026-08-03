import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const memesDir = path.join(process.cwd(), "public", "memes");

    if (!fs.existsSync(memesDir)) {
      return NextResponse.json({ memes: [] });
    }

    const files = fs.readdirSync(memesDir);
    const validExtensions = [".webp", ".png", ".jpg", ".jpeg"];

    const memes = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return validExtensions.includes(ext) && !file.startsWith(".");
      })
      .map((file) => `/memes/${file}`);

    return NextResponse.json({ memes });
  } catch (err) {
    console.error("Error reading memes directory:", err);
    return NextResponse.json({ memes: [] });
  }
}
