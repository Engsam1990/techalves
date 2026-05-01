"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveUploadsDir = resolveUploadsDir;
exports.saveBase64Upload = saveBase64Upload;
exports.deleteUploadedFileByUrl = deleteUploadedFileByUrl;
// @ts-nocheck
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
function ensureDir(dir) {
    fs_1.default.mkdirSync(dir, { recursive: true });
    return dir;
}
function resolveUploadsDir() {
    const candidates = [
        process.env.UPLOADS_DIR,
        path_1.default.resolve(process.cwd(), "uploads"),
        path_1.default.resolve(process.cwd(), "server/uploads"),
        path_1.default.resolve(__dirname, "../../uploads"),
        path_1.default.resolve(__dirname, "../../../uploads"),
    ].filter(Boolean);
    return ensureDir(String(candidates[0]));
}
function sanitizeFilename(filename) {
    const ext = path_1.default.extname(filename || "").toLowerCase();
    const base = path_1.default.basename(filename || "upload", ext).toLowerCase().replace(/[^a-z0-9-_]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "upload";
    return `${base}${ext || ".bin"}`;
}
function extensionFromContentType(contentType) {
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
function saveBase64Upload({ filename, contentType, data }) {
    if (!data)
        throw new Error("Upload data is required");
    const uploadsDir = resolveUploadsDir();
    const cleanContentType = String(contentType || "").toLowerCase();
    if (!cleanContentType.startsWith("image/")) {
        throw new Error("Only image uploads are supported");
    }
    const dataPart = String(data).includes(",") ? String(data).split(",").pop() : String(data);
    const buffer = Buffer.from(String(dataPart), "base64");
    if (!buffer.length)
        throw new Error("Invalid upload data");
    if (buffer.length > 6 * 1024 * 1024)
        throw new Error("Image must be 6MB or smaller");
    const ext = path_1.default.extname(filename || "") || extensionFromContentType(cleanContentType);
    const safeName = sanitizeFilename(`${filename || "image"}${ext && !(filename || "").endsWith(ext) ? ext : ""}`);
    const finalName = `${Date.now()}-${crypto_1.default.randomBytes(4).toString("hex")}-${safeName}`;
    const filePath = path_1.default.join(uploadsDir, finalName);
    fs_1.default.writeFileSync(filePath, buffer);
    return { filePath, url: `/uploads/${finalName}` };
}
function deleteUploadedFileByUrl(url) {
    const value = String(url || "").trim();
    if (!value.startsWith("/uploads/"))
        return false;
    const filename = path_1.default.basename(value);
    if (!filename || filename === "." || filename === "..")
        return false;
    const uploadsDir = resolveUploadsDir();
    const filePath = path_1.default.join(uploadsDir, filename);
    const relative = path_1.default.relative(uploadsDir, filePath);
    if (relative.startsWith("..") || path_1.default.isAbsolute(relative))
        return false;
    try {
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
            return true;
        }
    }
    catch {
        return false;
    }
    return false;
}
//# sourceMappingURL=uploads.js.map