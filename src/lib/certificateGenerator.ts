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
 * Generate a certificate PDF with the participant name overlaid.
 * Returns a Blob ready for download.
 */
export async function generateCertificatePDF(
  templateUrl: string,
  participantName: string,
  config: CertificateConfig
): Promise<Blob> {
  // Load template image (cached after first fetch)
  const img = await loadImage(templateUrl);

  // Determine dimensions from template image aspect ratio
  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;
  const isLandscape = imgWidth >= imgHeight;

  // Create PDF matching the template aspect ratio
  const orientation = isLandscape ? "landscape" : "portrait";
  const pdf = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Draw template as full-page background using a canvas for high quality
  const canvas = document.createElement("canvas");
  // Use higher resolution for crisp output
  const scale = 2;
  canvas.width = Math.round(pageWidth * (96 / 25.4) * scale);
  canvas.height = Math.round(pageHeight * (96 / 25.4) * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
  pdf.addImage(dataUrl, "JPEG", 0, 0, pageWidth, pageHeight);

  // Overlay participant name
  const nameX = (config.nameX / 100) * pageWidth;
  const nameY = (config.nameY / 100) * pageHeight;

  // Map font weight to jsPDF style
  let fontStyle: string = "normal";
  if (config.fontWeight === "bold" || config.fontWeight === "700" || config.fontWeight === "900") {
    fontStyle = "bold";
  }

  pdf.setFont("helvetica", fontStyle);
  pdf.setFontSize(config.fontSize);

  // Parse hex color to RGB
  const hex = config.textColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  pdf.setTextColor(r, g, b);

  // Determine text alignment
  let align: "left" | "center" | "right" = config.textAlign || "center";

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
