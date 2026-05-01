// @ts-nocheck
import fs from "fs";
import path from "path";
import crypto from "crypto";

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function resolveUploadsDir() {
  const candidates = [
    process.env.UPLOADS_DIR,
    path.resolve(process.cwd(), "uploads"),
    path.resolve(process.cwd(), "server/uploads"),
    path.resolve(__dirname, "../../uploads"),
    path.resolve(__dirname, "../../../uploads"),
  ].filter(Boolean);

  return ensureDir(String(candidates[0]));
}

function sanitizeFilename(filename: string) {
  const ext = path.extname(filename || "").toLowerCase();
  const base = path.basename(filename || "upload", ext).toLowerCase().replace(/[^a-z0-9-_]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "upload";
  return `${base}${ext || ".bin"}`;
}

function extensionFromContentType(contentType: string) {
  switch (String(contentType || "").toLowerCase()) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return ".bin";
  }
}

export function saveBase64Upload({ filename, contentType, data }: { filename?: string; contentType?: string; data?: string }) {
  if (!data) throw new Error("Upload data is required");

  const uploadsDir = resolveUploadsDir();
  const cleanContentType = String(contentType || "").toLowerCase();
  if (!cleanContentType.startsWith("image/")) {
    throw new Error("Only image uploads are supported");
  }

  const dataPart = String(data).includes(",") ? String(data).split(",").pop() : String(data);
  const buffer = Buffer.from(String(dataPart), "base64");
  if (!buffer.length) throw new Error("Invalid upload data");
  if (buffer.length > 6 * 1024 * 1024) throw new Error("Image must be 6MB or smaller");

  const ext = path.extname(filename || "") || extensionFromContentType(cleanContentType);
  const safeName = sanitizeFilename(`${filename || "image"}${ext && !(filename || "").endsWith(ext) ? ext : ""}`);
  const finalName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${safeName}`;
  const filePath = path.join(uploadsDir, finalName);
  fs.writeFileSync(filePath, buffer);
  return { filePath, url: `/uploads/${finalName}` };
}

export function deleteUploadedFileByUrl(url: string) {
  const value = String(url || "").trim();
  if (!value.startsWith("/uploads/")) return false;

  const filename = path.basename(value);
  if (!filename || filename === "." || filename === "..") return false;

  const uploadsDir = resolveUploadsDir();
  const filePath = path.join(uploadsDir, filename);
  const relative = path.relative(uploadsDir, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return false;

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch {
    return false;
  }

  return false;
}
