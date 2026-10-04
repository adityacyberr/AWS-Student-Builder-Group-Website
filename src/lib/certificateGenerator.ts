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
 * Write participant name onto a canvas context at the configured position.
 * Resets all state before drawing to guarantee no rectangle / box artifact.
 */
function drawNameOnCanvas(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  participantName: string,
  config: CertificateConfig
) {
  // ── Reset any inherited state that could produce rectangle artifacts ──
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = "transparent";
  ctx.lineWidth = 0;

  const nameX = (config.nameX / 100) * canvasWidth;
  const nameY = (config.nameY / 100) * canvasHeight;

  // Normalize font size to canvas height:
  // If config.fontSize <= 10, treat as percentage of height (e.g. 3.4 = 3.4% of height).
  // If config.fontSize > 10, treat as pt/px relative to 1000px reference height (e.g. 34 = 3.4% of height).
  const fontPercent = config.fontSize <= 10 ? config.fontSize : config.fontSize / 10;
  const fontSizePx = Math.round((fontPercent / 100) * canvasHeight);

  ctx.fillStyle = config.textColor || "#ffffff";
  ctx.font = `${config.fontWeight || "bold"} ${fontSizePx}px "${config.fontFamily || "Courier New"}", "Courier New", monospace`;
  ctx.textAlign = config.textAlign || "center";
  ctx.textBaseline = "middle";

  ctx.fillText(participantName, nameX, nameY);

  ctx.restore();
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

  // High-DPI canvas matching template aspect ratio
  const previewWidth = 1400;
  canvas.width = previewWidth;
  canvas.height = Math.round((img.naturalHeight / img.naturalWidth) * previewWidth);
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // 1. Draw background template — fills 100% of canvas, no transparent areas
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Wait for web fonts
  if (typeof document !== "undefined" && document.fonts) {
    try { await document.fonts.ready; } catch (e) { /* ignore */ }
  }

  // 2. Overlay participant name — no box, no background, just text
  drawNameOnCanvas(ctx, canvas.width, canvas.height, participantName, config);

  return canvas.toDataURL("image/jpeg", 0.97);
}

/**
 * Generate a high-resolution PDF certificate.
 *
 * Uses JPEG (not PNG) for the embedded image so that jsPDF never encounters
 * a transparent layer and therefore never renders a white/black rectangle
 * artifact behind the participant name.
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

  // Create PDF matching template orientation
  const orientation = isLandscape ? "landscape" : "portrait";
  const pdf = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // High-resolution canvas (3× native resolution for sharp output)
  const canvas = document.createElement("canvas");
  const scale = 3;
  canvas.width = Math.round(imgWidth * scale);
  canvas.height = Math.round(imgHeight * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // 1. Fill white so there are absolutely NO transparent pixels —
  //    this is what prevents the "rectangle box" artifact in jsPDF.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Draw the certificate template at full resolution
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Wait for web fonts
  if (typeof document !== "undefined" && document.fonts) {
    try { await document.fonts.ready; } catch (e) { /* ignore */ }
  }

  // 3. Overlay the participant name — text only, no background, no border
  drawNameOnCanvas(ctx, canvas.width, canvas.height, participantName, config);

  // 4. Export as JPEG (fully opaque) then embed into PDF
  //    JPEG has no alpha channel → jsPDF cannot produce a transparency rectangle
  const dataUrl = canvas.toDataURL("image/jpeg", 0.97);
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
