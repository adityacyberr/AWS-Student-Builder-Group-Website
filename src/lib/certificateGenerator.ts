import { jsPDF } from "jspdf";

export interface CertificateConfig {
  nameX: number;       // percentage 0-100
  nameY: number;       // percentage 0-100
  fontFamily: string;
  fontSize: number;    // pt / px relative
  fontWeight: string;
  textColor: string;   // hex e.g. #ffffff or #111827
  textAlign: "left" | "center" | "right";
}

// In-memory cache for template images
const templateCache = new Map<string, HTMLImageElement>();

/**
 * Pre-load and cache a template image.
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  const cached = templateCache.get(url);
  if (cached && cached.complete && cached.naturalWidth > 0) {
    return Promise.resolve(cached);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      templateCache.set(url, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error("Failed to load certificate template image."));
    img.src = url;
  });
}

/**
 * Generate a high-DPI image Data URL for live preview.
 */
export async function generateWatermarkedPreviewDataUrl(
  templateUrl: string,
  participantName: string,
  config: CertificateConfig
): Promise<string> {
  const img = await loadImage(templateUrl);
  const canvas = document.createElement("canvas");

  const previewWidth = 1264;
  canvas.width = previewWidth;
  canvas.height = Math.round((img.naturalHeight / img.naturalWidth) * previewWidth);
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // 1. Draw background template image (ORIGINAL UNTOUCHED)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  if (typeof document !== "undefined" && document.fonts) {
    try {
      await document.fonts.ready;
    } catch (e) {}
  }

  // 2. Overlay participant name in Student Name position
  const nameX = (config.nameX / 100) * canvas.width;
  const nameY = (config.nameY / 100) * canvas.height;
  const fontSizePx = Math.round((config.fontSize / 650) * canvas.height);

  ctx.fillStyle = config.textColor || "#ffffff";
  ctx.font = `${config.fontWeight || "bold"} ${fontSizePx}px "${config.fontFamily || "Amazon Ember Display"}", "Amazon Ember", "Inter", -apple-system, sans-serif`;
  ctx.textAlign = config.textAlign || "center";
  ctx.textBaseline = "middle";
  ctx.fillText(participantName, nameX, nameY);

  return canvas.toDataURL("image/png");
}

/**
 * Generate a 300 DPI high-definition PDF certificate document.
 * Draws the background template and student name on a high-res canvas
 * then inserts into an A4 PDF document matching the exact official template.
 */
export async function generateCertificatePDF(
  templateUrl: string,
  participantName: string,
  config: CertificateConfig
): Promise<Blob> {
  const img = await loadImage(templateUrl);

  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;
  const isLandscape = imgWidth >= imgHeight;

  // Create A4 PDF document matching orientation
  const orientation = isLandscape ? "landscape" : "portrait";
  const pdf = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // High-Resolution Canvas (2.5x natural template size for razor sharp text)
  const canvas = document.createElement("canvas");
  const scale = 2.5;
  canvas.width = Math.round(imgWidth * scale);
  canvas.height = Math.round(imgHeight * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // 1. Draw original template background image
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  if (typeof document !== "undefined" && document.fonts) {
    try {
      await document.fonts.ready;
    } catch (e) {}
  }

  // 2. Draw student's name on canvas
  const nameX = (config.nameX / 100) * canvas.width;
  const nameY = (config.nameY / 100) * canvas.height;
  const fontSizePx = Math.round((config.fontSize / 650) * canvas.height);

  ctx.fillStyle = config.textColor || "#ffffff";
  ctx.font = `${config.fontWeight || "bold"} ${fontSizePx}px "${config.fontFamily || "Amazon Ember Display"}", "Amazon Ember", "Inter", -apple-system, sans-serif`;
  ctx.textAlign = config.textAlign || "center";
  ctx.textBaseline = "middle";
  ctx.fillText(participantName, nameX, nameY);

  // 3. Export high-res canvas as PNG image into PDF
  const dataUrl = canvas.toDataURL("image/png");
  pdf.addImage(dataUrl, "PNG", 0, 0, pageWidth, pageHeight);

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
