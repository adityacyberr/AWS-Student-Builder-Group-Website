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
  if (cached) return Promise.resolve(cached);

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
 * Generate a high-DPI watermarked image Data URL for live preview.
 */
export async function generateWatermarkedPreviewDataUrl(
  templateUrl: string,
  participantName: string,
  config: CertificateConfig
): Promise<string> {
  const img = await loadImage(templateUrl);
  const canvas = document.createElement("canvas");

  // High-DPI canvas for preview (1200px width)
  canvas.width = 1200;
  canvas.height = Math.round((img.naturalHeight / img.naturalWidth) * 1200);
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // 1. Draw background template image
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // 2. Overlay participant name
  const nameX = (config.nameX / 100) * canvas.width;
  const nameY = (config.nameY / 100) * canvas.height;
  const fontSizePx = Math.round((config.fontSize / 650) * canvas.height);

  ctx.fillStyle = config.textColor || "#ffffff";
  ctx.font = `${config.fontWeight || "bold"} ${fontSizePx}px "Amazon Ember Display", "Inter", "Roboto", sans-serif`;
  ctx.textAlign = config.textAlign || "center";
  ctx.textBaseline = "middle";
  ctx.fillText(participantName, nameX, nameY);

  // 3. Draw semi-transparent preview watermark overlay
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 6);
  ctx.fillStyle = "rgba(255, 153, 0, 0.16)";
  ctx.font = "bold 44px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("PREVIEW ONLY — AWS SBG", 0, 0);
  ctx.restore();

  return canvas.toDataURL("image/jpeg", 0.92);
}

/**
 * Generate a 300 DPI high-definition PDF certificate document.
 * Draws the background template and student name on a high-res 300 DPI canvas
 * then inserts into an A4 PDF document.
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

  // Create A4 PDF document
  const orientation = isLandscape ? "landscape" : "portrait";
  const pdf = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // 300 DPI High-Resolution Canvas (~3508 x 2480px for A4)
  const canvas = document.createElement("canvas");
  const scale = 4;
  canvas.width = Math.round(pageWidth * (96 / 25.4) * scale);
  canvas.height = Math.round(pageHeight * (96 / 25.4) * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // 1. Draw background template image at full high-resolution
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // 2. Draw student's name on canvas
  const nameX = (config.nameX / 100) * canvas.width;
  const nameY = (config.nameY / 100) * canvas.height;
  const fontSizePx = Math.round((config.fontSize / 650) * canvas.height);

  ctx.fillStyle = config.textColor || "#ffffff";
  ctx.font = `${config.fontWeight || "bold"} ${fontSizePx}px "Amazon Ember Display", "Inter", "Roboto", sans-serif`;
  ctx.textAlign = config.textAlign || "center";
  ctx.textBaseline = "middle";
  ctx.fillText(participantName, nameX, nameY);

  // 3. Export high-res canvas as JPEG image into PDF
  const dataUrl = canvas.toDataURL("image/jpeg", 0.98);
  pdf.addImage(dataUrl, "JPEG", 0, 0, pageWidth, pageHeight);

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
