import { jsPDF } from "jspdf";

export interface CertificateConfig {
  nameX: number;       // percentage 0-100 (e.g. 73.3)
  nameY: number;       // percentage 0-100 (e.g. 61.8)
  fontFamily: string;
  fontSize: number;    // base font size relative to template height scale
  fontWeight: string;
  textColor: string;   // hex e.g. #ffffff or #111827
  textAlign: "left" | "center" | "right";
  maxNameWidthPct?: number; // max percentage of template width for name (default 38 for AWS Basics)
}

// In-memory cache for template images
const templateCache = new Map<string, HTMLImageElement>();

/**
 * Pre-load and cache a template image with cache-busting query parameter (?v=3).
 */
export function loadImage(url: string): Promise<HTMLImageElement> {
  const cacheBustUrl = url.includes("?") ? `${url}&v=3` : `${url}?v=3`;
  const cached = templateCache.get(cacheBustUrl);
  if (cached && cached.complete && cached.naturalWidth > 0) {
    return Promise.resolve(cached);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      templateCache.set(cacheBustUrl, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error("Failed to load certificate template image."));
    img.src = cacheBustUrl;
  });
}

/**
 * Single core rendering function used by BOTH preview and PDF download.
 * Draws the original template onto a canvas matching img.naturalWidth and img.naturalHeight,
 * then overlays ONLY the participant name centered at (nameX, nameY) with transparent background.
 */
export async function renderCertificateCanvas(
  templateUrl: string,
  participantName: string,
  config: CertificateConfig
): Promise<HTMLCanvasElement> {
  const img = await loadImage(templateUrl);

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Step 2b: Draw original untouched background image at natural width and height
  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

  if (typeof document !== "undefined" && document.fonts) {
    try {
      await document.fonts.ready;
    } catch (e) {}
  }

  // Coordinates relative to natural image dimensions
  const nameX = (config.nameX / 100) * canvas.width;
  const nameY = (config.nameY / 100) * canvas.height;

  // Base font size relative to natural image height (~3.2% of height if fontSize is 21)
  let fontSizePx = Math.round((config.fontSize / 650) * canvas.height);

  // Set initial font styling (transparent text background, no fillRect, no shadow, no stroke)
  ctx.fillStyle = config.textColor || "#ffffff";
  ctx.textAlign = config.textAlign || "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  const fontFamily = config.fontFamily || '"JetBrains Mono", "Fira Code", monospace';
  const fontWeight = config.fontWeight || "bold";
  ctx.font = `${fontWeight} ${fontSizePx}px ${fontFamily}`;

  // Shrink font only if name is wider than maxNameWidthPct (default 38 for AWS Basics)
  const maxWidthPct = config.maxNameWidthPct ?? 38;
  const maxAvailableWidth = (maxWidthPct / 100) * canvas.width;
  let textWidth = ctx.measureText(participantName).width;

  if (textWidth > maxAvailableWidth && textWidth > 0) {
    const scaleFactor = maxAvailableWidth / textWidth;
    fontSizePx = Math.max(14, Math.floor(fontSizePx * scaleFactor));
    ctx.font = `${fontWeight} ${fontSizePx}px ${fontFamily}`;
  }

  // Draw ONLY participant name
  ctx.fillText(participantName, nameX, nameY);

  return canvas;
}

/**
 * Generate a high-DPI image Data URL for live preview using the single core render function.
 */
export async function generateWatermarkedPreviewDataUrl(
  templateUrl: string,
  participantName: string,
  config: CertificateConfig
): Promise<string> {
  const canvas = await renderCertificateCanvas(templateUrl, participantName, config);
  return canvas.toDataURL("image/png");
}

/**
 * Generate PDF matching exact natural image dimensions without A4 stretching or cropping.
 */
export async function generateCertificatePDF(
  templateUrl: string,
  participantName: string,
  config: CertificateConfig
): Promise<Blob> {
  const canvas = await renderCertificateCanvas(templateUrl, participantName, config);
  const width = canvas.width;
  const height = canvas.height;
  const isLandscape = width >= height;

  // Create PDF with page size exactly equal to natural image width & height in px
  const pdf = new jsPDF({
    orientation: isLandscape ? "landscape" : "portrait",
    unit: "px",
    format: [width, height],
    hotfixes: ["pxScaling"],
  });

  const dataUrl = canvas.toDataURL("image/png");
  pdf.addImage(dataUrl, "PNG", 0, 0, width, height);

  return pdf.output("blob");
}

/**
 * Trigger a file download from a Blob.
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
