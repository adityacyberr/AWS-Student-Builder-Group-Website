"use client";

import React, { useState, useEffect } from "react";
import { Upload, Link as LinkIcon, Image as ImageIcon, CheckCircle, Loader, AlertCircle } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface MediaPickerProps {
  value: string;
  onChange: (url: string) => void;
  folder: "team" | "gallery" | "events";
  placeholder?: string;
  label?: string;
  onUploadingStateChange?: (uploading: boolean) => void;
  onUploadSuccess?: () => void;
  onUploadError?: (error: string) => void;
}

export function MediaPicker({
  value,
  onChange,
  folder,
  placeholder = "https://example.com/image.jpg",
  label = "Upload Image or Paste URL",
  onUploadingStateChange,
  onUploadSuccess,
  onUploadError,
}: MediaPickerProps) {
  const [uploading, setUploading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const setUploadingState = (val: boolean) => {
    setUploading(val);
    onUploadingStateChange?.(val);
  };
  
  // Input mode toggle between uploading a file and entering a direct URL
  const [inputMode, setInputMode] = useState<"upload" | "url">(
    value.startsWith("http") && !value.includes("builder-assets") && !value.includes("/uploads/") ? "url" : "upload"
  );
  
  // Drag and drop state
  const [dragActive, setDragActive] = useState(false);

  // Selected file and local preview URL
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Validates file selection
  const processFile = (file: File) => {
    setErrorMsg("");
    setStatusText("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      const err = "Unsupported format. Only JPG, PNG, and WEBP images are allowed.";
      console.error(err);
      setErrorMsg(err);
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeBytes) {
      const err = "File too large. Please upload a smaller image (max 5MB).";
      console.error(err);
      setErrorMsg(err);
      return;
    }

    console.log("Selected file:", file);
    setSelectedFile(file);
    
    // Revoke previous local preview if existed
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Perform direct client-side upload to Supabase Storage or Base64 fallback in sandbox mode
  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMsg("No file selected");
      return;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        setUploadingState(true);
        setErrorMsg("");
        setUploadProgress(0);
        setStatusText("Initializing upload session...");

        const sessionResponse = await supabase.auth.getSession();
        const session = sessionResponse.data.session;
        if (!session) {
          throw new Error("No active admin session found. Please log in again.");
        }

        const fileExt = selectedFile.name.split(".").pop() || "png";
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const supabaseUrl = (supabase as any).supabaseUrl;
        if (!supabaseUrl) {
          throw new Error("Supabase URL is not configured.");
        }

        const uploadUrl = `${supabaseUrl}/storage/v1/object/builder-assets/${filePath}`;
        const anonKey = (supabase as any).supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
            if (percent < 100) {
              setStatusText(`Uploading... ${percent}%`);
            } else {
              setStatusText("Finalizing upload...");
            }
          }
        });

        xhr.addEventListener("load", () => {
          try {
            if (xhr.status >= 200 && xhr.status < 300) {
              const publicUrl = `${supabaseUrl}/storage/v1/object/public/builder-assets/${filePath}`;
              setStatusText("Published successfully ✓");
              onChange(publicUrl);
              onUploadSuccess?.();

              setTimeout(() => {
                setSelectedFile(null);
                setPreviewUrl(null);
                setStatusText("");
                setUploadProgress(0);
                setUploadingState(false);
              }, 1200);
            } else {
              let serverError = "";
              try {
                const errData = JSON.parse(xhr.responseText);
                serverError = errData.message || errData.error || "";
              } catch {
                serverError = xhr.responseText;
              }
              throw new Error(serverError || `HTTP ${xhr.status} upload failed`);
            }
          } catch (err: any) {
            console.error("Upload failed:", err);
            setErrorMsg(err.message || "Upload failed. Please try again.");
            setStatusText("");
            setUploadProgress(0);
            setUploadingState(false);
            onUploadError?.(err.message || "Upload failed");
          }
        });

        xhr.addEventListener("error", () => {
          const err = "Network error. Failed to reach the upload server.";
          setErrorMsg(err);
          setStatusText("");
          setUploadProgress(0);
          setUploadingState(false);
          onUploadError?.(err);
        });

        xhr.open("POST", uploadUrl);
        xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
        if (anonKey) {
          xhr.setRequestHeader("apikey", anonKey);
        }
        xhr.setRequestHeader("x-upsert", "true");
        xhr.setRequestHeader("Content-Type", selectedFile.type);
        xhr.send(selectedFile);
      } catch (err: any) {
        console.error("Initiation failed:", err);
        setErrorMsg(err.message || "Initiation failed.");
        setStatusText("");
        setUploadProgress(0);
        setUploadingState(false);
        onUploadError?.(err.message || "Upload failed");
      }
    } else {
      // Local fallback (Base64 data URL) in Sandbox Mode
      try {
        setUploadingState(true);
        setErrorMsg("");
        setUploadProgress(0);
        setStatusText("Processing image...");

        let progress = 0;
        const interval = setInterval(() => {
          progress += 25;
          setUploadProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            
            try {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64Data = reader.result as string;
                setStatusText("Published successfully ✓");
                onChange(base64Data);
                onUploadSuccess?.();

                setTimeout(() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setStatusText("");
                  setUploadProgress(0);
                  setUploadingState(false);
                }, 1200);
              };
              reader.onerror = () => {
                throw new Error("FileReader conversion error");
              };
              reader.readAsDataURL(selectedFile);
            } catch (err: any) {
              setErrorMsg(err.message || "Failed to process sandbox image.");
              setStatusText("");
              setUploadProgress(0);
              setUploadingState(false);
              onUploadError?.(err.message || "Upload failed");
            }
          } else {
            setStatusText(`Processing... ${progress}%`);
          }
        }, 150);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to process sandbox image.");
        setStatusText("");
        setUploadProgress(0);
        setUploadingState(false);
        onUploadError?.(err.message || "Upload failed");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (uploading) return;
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (uploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMsg("");
    setStatusText("");
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
            disabled={uploading}
            onClick={() => { setInputMode("upload"); setErrorMsg(""); }}
            className={`px-2 py-1 rounded-md transition-all ${
              inputMode === "upload" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-350"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Upload
          </button>
          <button
            type="button"
            disabled={uploading}
            onClick={() => { setInputMode("url"); setErrorMsg(""); }}
            className={`px-2 py-1 rounded-md transition-all ${
              inputMode === "url" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-350"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Direct URL
          </button>
        </div>
      </div>

      {inputMode === "upload" ? (
        <div className="space-y-2">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-6 transition-all flex flex-col items-center justify-center text-center ${
              dragActive
                ? "border-amber-500 bg-amber-500/5"
                : previewUrl || value
                ? "border-zinc-850 bg-zinc-900/10"
                : "border-zinc-800 bg-zinc-900/20 hover:border-zinc-800/80 hover:bg-zinc-900/40"
            }`}
          >
            {uploading ? (
              <div className="space-y-3 py-4 flex flex-col items-center w-full max-w-[240px] mx-auto">
                <Loader className="h-6 w-6 text-amber-500 animate-spin" />
                <p className="text-xs font-bold text-amber-400 animate-pulse">{statusText}</p>
                <div className="w-full bg-zinc-850 rounded-full h-1 overflow-hidden">
                  <div 
                    className="bg-amber-500 h-1 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : previewUrl ? (
              // Selected file preview (before upload)
              <div className="flex flex-col items-center gap-3">
                <div className="relative group w-20 h-20 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Selection Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[10px] text-zinc-350">Replace</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-3 py-1.5 text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-lg transition-colors flex items-center gap-1 shadow-md shadow-amber-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="h-3 w-3" />
                    Start Upload
                  </button>
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    disabled={uploading}
                    className="px-3 py-1.5 text-[10px] font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-[9px] text-zinc-450 max-w-[200px] truncate">
                  Ready to upload: {selectedFile?.name}
                </p>
              </div>
            ) : value ? (
              // Already saved image URL state
              <div className="flex flex-col items-center gap-2">
                <div className="relative group w-20 h-20 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={value} alt="Current Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[10px] text-zinc-350">Replace</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
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
              // Empty state dropzone
              <div className="relative space-y-1.5 py-4 w-full cursor-pointer">
                <Upload className="h-6 w-6 text-zinc-500 mx-auto" />
                <p className="text-xs text-zinc-300 font-medium">
                  Drag & drop image here, or <span className="text-amber-400 font-bold">browse</span>
                </p>
                <p className="text-[10px] text-zinc-500">Supports JPG, PNG, WEBP up to 5MB</p>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Error Message display */}
          {errorMsg && (
            <div className="flex items-center gap-2 bg-red-950/40 border border-red-900/50 text-red-400 p-2.5 rounded-lg text-[10px] leading-relaxed">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      ) : (
        // Direct URL Input Mode
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <input
                type="url"
                placeholder={placeholder}
                value={value}
                disabled={uploading}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
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
          {errorMsg && (
            <div className="flex items-center gap-2 bg-red-950/40 border border-red-900/50 text-red-400 p-2.5 rounded-lg text-[10px] leading-relaxed">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
