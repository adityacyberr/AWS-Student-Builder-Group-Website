"use client";

import React, { useState } from "react";
import { Upload, Link as LinkIcon, Image as ImageIcon, CheckCircle, Loader } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface MediaPickerProps {
  value: string;
  onChange: (url: string) => void;
  folder: "team" | "gallery" | "events";
  placeholder?: string;
  label?: string;
}

export function MediaPicker({
  value,
  onChange,
  folder,
  placeholder = "https://example.com/image.jpg",
  label = "Upload Image or Paste URL",
}: MediaPickerProps) {
  const [uploading, setUploading] = useState(false);
  const [inputMode, setInputMode] = useState<"upload" | "url">(value.startsWith("http") && !value.includes("builder-assets") ? "url" : "upload");
  const [dragActive, setDragActive] = useState(false);

  const handleImageUpload = async (file: File): Promise<string | null> => {
    if (!isSupabaseConfigured || !supabase) {
      alert("Supabase is not configured. Falling back to local URL entry.");
      return null;
    }
    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("builder-assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("builder-assets")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      alert(`Error uploading image: ${error?.message || "Unknown error"}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const processFile = async (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Only JPG, PNG, GIF, and WEBP images are allowed.");
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeBytes) {
      alert("File size exceeds 5MB limit. Please upload a smaller image.");
      return;
    }

    const url = await handleImageUpload(file);
    if (url) {
      onChange(url);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
          {label}
        </label>
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-[10px] font-bold select-none">
          <button
            type="button"
            onClick={() => setInputMode("upload")}
            className={`px-2 py-1 rounded-md transition-all ${
              inputMode === "upload" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-350"
            }`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setInputMode("url")}
            className={`px-2 py-1 rounded-md transition-all ${
              inputMode === "url" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-350"
            }`}
          >
            Direct URL
          </button>
        </div>
      </div>

      {inputMode === "upload" ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-6 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
            dragActive
              ? "border-amber-500 bg-amber-500/5"
              : value
              ? "border-zinc-800 bg-zinc-900/10 hover:border-zinc-700"
              : "border-zinc-800 bg-zinc-900/20 hover:border-zinc-800/80 hover:bg-zinc-900/40"
          }`}
        >
          {uploading ? (
            <div className="space-y-2 py-4 flex flex-col items-center">
              <Loader className="h-6 w-6 text-amber-500 animate-spin" />
              <p className="text-xs text-zinc-400">Uploading to storage...</p>
            </div>
          ) : value ? (
            <div className="flex flex-col items-center gap-2">
              <div className="relative group w-20 h-20 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={value} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[10px] text-zinc-350">Replace</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold">
                <CheckCircle className="h-3 w-3" />
                <span>Upload complete</span>
              </div>
              <p className="text-[10px] text-zinc-500 max-w-[200px] truncate">{value}</p>
            </div>
          ) : (
            <div className="relative space-y-1.5 py-4 w-full">
              <Upload className="h-6 w-6 text-zinc-500 mx-auto" />
              <p className="text-xs text-zinc-300 font-medium">
                Drag & drop image here, or <span className="text-amber-400">browse</span>
              </p>
              <p className="text-[10px] text-zinc-500">Supports JPG, PNG, WEBP, GIF up to 5MB</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <input
              type="url"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-amber-500/50"
            />
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          </div>
          {value.startsWith("http") && (
            <div className="w-9 h-9 border border-zinc-800 bg-zinc-900 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="URL Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
