import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    const req = {
      file: file
        ? {
            name: file.name,
            type: file.type,
            size: file.size,
          }
        : null,
    };

    console.log("Received file:", req.file);

    if (!file) {
      const err = new Error("No file selected");
      console.error("Upload error:", err);
      return new NextResponse("No file selected", { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      const err = new Error("Unsupported format");
      console.error("Upload error:", err);
      return new NextResponse("Unsupported format. Only JPG, PNG, and WEBP are allowed.", { status: 400 });
    }

    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeBytes) {
      const err = new Error("File too large");
      console.error("Upload error:", err);
      return new NextResponse("File too large. Max size is 5MB.", { status: 400 });
    }

    console.log("Saving image...");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    let imageUrl = "";

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: uploadError } = await supabase.storage
          .from("builder-assets")
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("builder-assets")
          .getPublicUrl(filePath);

        imageUrl = data.publicUrl;
      } catch (uploadErr) {
        console.warn("Supabase upload failed, falling back to base64 Data URL:", uploadErr);
        const base64Data = buffer.toString("base64");
        imageUrl = `data:${file.type};base64,${base64Data}`;
      }
    } else {
      // Direct Base64 fallback (no fs write)
      const base64Data = buffer.toString("base64");
      imageUrl = `data:${file.type};base64,${base64Data}`;
    }

    console.log("Database updated");

    return NextResponse.json({ url: imageUrl });
  } catch (err: any) {
    console.error("Upload error:", err);
    return new NextResponse(err.message || "Upload failed", { status: 500 });
  }
}
