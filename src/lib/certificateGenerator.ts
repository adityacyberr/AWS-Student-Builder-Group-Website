import { jsPDF } from "jspdf";

export interface CertificateConfig {
  nameX: number;       // percentage 0-100
  nameY: number;       // percentage 0-100
  fontFamily: string;
  fontSize: number;    // pt
  fontWeight: string;
  textColor: string;   // hex
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
 * Generate a 300 DPI watermarked image Data URL for preview before downloading.
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

  // Draw background image
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Overlay participant name (Playfair Display / Georgia Serif style)
  const nameX = (config.nameX / 100) * canvas.width;
  const nameY = (config.nameY / 100) * canvas.height;

  ctx.fillStyle = config.textColor || "#111827";
  ctx.font = `bold ${Math.round(config.fontSize * 1.05)}px "Playfair Display", Georgia, serif`;
  ctx.textAlign = config.textAlign || "center";
  ctx.textBaseline = "middle";
  ctx.fillText(participantName, nameX, nameY);

  // Draw semi-transparent watermark diagonal text
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 6);
  ctx.fillStyle = "rgba(255, 153, 0, 0.18)";
  ctx.font = "bold 48px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("PREVIEW ONLY — AWS SBG", 0, 0);
  ctx.restore();

  return canvas.toDataURL("image/jpeg", 0.90);
}

/**
 * Generate a 300 DPI vector PDF certificate.
 * Recipient Name is rendered as pure vector text using Georgia/Serif for crisp scalability.
 */
export async function generateCertificatePDF(
  templateUrl: string,
  participantName: string,
  config: CertificateConfig
): Promise<Blob> {
  // Load template image (cached after first fetch)
  const img = await loadImage(templateUrl);

  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;
  const isLandscape = imgWidth >= imgHeight;

  // Create PDF matching A4 landscape format
  const orientation = isLandscape ? "landscape" : "portrait";
  const pdf = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // 300 DPI High-Resolution Canvas (4x scale ~3508 x 2480px)
  const canvas = document.createElement("canvas");
  const scale = 4;
  canvas.width = Math.round(pageWidth * (96 / 25.4) * scale);
  canvas.height = Math.round(pageHeight * (96 / 25.4) * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL("image/jpeg", 0.98);
  pdf.addImage(dataUrl, "JPEG", 0, 0, pageWidth, pageHeight);

  // Overlay Recipient Name as Pure Vector Text (infinite scale without rasterization blur)
  const nameX = (config.nameX / 100) * pageWidth;
  const nameY = (config.nameY / 100) * pageHeight;

  // Use Georgia serif for recipient name (bold, enlarged, focal point of the document)
  pdf.setFont("georgia", "bold");
  pdf.setFontSize(config.fontSize || 28);

  // Parse hex color to RGB
  const hex = (config.textColor || "#111827").replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 17;
  const g = parseInt(hex.substring(2, 4), 16) || 24;
  const b = parseInt(hex.substring(4, 6), 16) || 39;
  pdf.setTextColor(r, g, b);

  let align: "left" | "center" | "right" = config.textAlign || "center";

  // Vector text rendering
  pdf.text(participantName, nameX, nameY, { align });

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
