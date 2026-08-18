import { randomUUID } from "crypto";
import { mkdir, readFile, stat, unlink, writeFile } from "fs/promises";
import path from "path";

export const VENUE_MEDIA_PREFIX = "/media/venues";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const SAFE_FILENAME =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpe?g|png|webp|gif)$/i;

const EXT_TO_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export type UploadVenueImageResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

function extensionFor(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

export function sniffImageMime(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return "image/gif";
  }
  const riff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  const webp = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
  if (riff === "RIFF" && webp === "WEBP") return "image/webp";
  return null;
}

export function getVenueStorageRoot() {
  const configured = process.env.VENUE_STORAGE_PATH?.trim();
  if (configured) return path.resolve(configured);
  if (process.env.NODE_ENV === "production") {
    return path.resolve("/data/venue-images");
  }
  return path.resolve(process.cwd(), ".local-storage", "venue-images");
}

export function isSafeVenueFilename(filename: string) {
  return SAFE_FILENAME.test(filename);
}

export function contentTypeForFilename(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TO_TYPE[ext] ?? "application/octet-stream";
}

export function publicUrlForFilename(filename: string) {
  return `${VENUE_MEDIA_PREFIX}/${filename}`;
}

export function isManagedVenueImageUrl(url: string | null | undefined) {
  if (!url) return false;
  return url.startsWith(`${VENUE_MEDIA_PREFIX}/`);
}

export function filenameFromManagedUrl(url: string) {
  if (!isManagedVenueImageUrl(url)) return null;
  const filename = url.slice(`${VENUE_MEDIA_PREFIX}/`.length);
  return isSafeVenueFilename(filename) ? filename : null;
}

/** Resolve a public filename to an absolute path inside the storage root. */
export function resolveVenueImagePath(filename: string) {
  if (!isSafeVenueFilename(filename)) return null;
  const root = path.resolve(getVenueStorageRoot());
  const resolved = path.resolve(root, filename);
  const rootWithSep = root.endsWith(path.sep) ? root : `${root}${path.sep}`;
  if (resolved !== root && !resolved.startsWith(rootWithSep)) return null;
  return resolved;
}

async function ensureStorageRoot() {
  const root = getVenueStorageRoot();
  await mkdir(root, { recursive: true });
  return root;
}

export async function saveVenueImageBytes(
  bytes: Uint8Array,
  declaredMime?: string,
): Promise<UploadVenueImageResult> {
  if (bytes.byteLength === 0) {
    return { ok: false, error: "Пустой файл" };
  }
  if (bytes.byteLength > MAX_BYTES) {
    return { ok: false, error: "Размер файла не должен превышать 5 МБ" };
  }

  const sniffed = sniffImageMime(bytes);
  if (!sniffed || !ALLOWED_TYPES.has(sniffed)) {
    return {
      ok: false,
      error: "Допустимы только изображения JPEG, PNG, WebP или GIF",
    };
  }

  const declared =
    declaredMime === "image/jpg" ? "image/jpeg" : declaredMime;
  if (
    declared &&
    declared !== "application/octet-stream" &&
    declared !== sniffed
  ) {
    return { ok: false, error: "Тип файла не совпадает с содержимым" };
  }

  const filename = `${randomUUID()}.${extensionFor(sniffed)}`;
  const filePath = resolveVenueImagePath(filename);
  if (!filePath) {
    return { ok: false, error: "Некорректное имя файла" };
  }

  await ensureStorageRoot();
  await writeFile(filePath, bytes);

  const written = await stat(filePath).catch(() => null);
  console.info("[venue-storage]", {
    storageRoot: getVenueStorageRoot(),
    filename,
    absolutePath: filePath,
    exists: Boolean(written),
    fileSize: written?.size ?? 0,
  });

  if (!written || written.size <= 0) {
    return { ok: false, error: "Файл не записан на диск" };
  }

  return { ok: true, url: publicUrlForFilename(filename) };
}

export async function uploadVenueImage(
  file: File | null | undefined,
): Promise<UploadVenueImageResult | { ok: true; url: null }> {
  if (!file || file.size === 0) {
    return { ok: true, url: null };
  }

  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Размер файла не должен превышать 5 МБ" };
  }

  const declaredType = file.type === "image/jpg" ? "image/jpeg" : file.type;
  if (declaredType && !ALLOWED_TYPES.has(declaredType)) {
    return {
      ok: false,
      error: "Допустимы только изображения JPEG, PNG, WebP или GIF",
    };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  return saveVenueImageBytes(bytes, declaredType || undefined);
}

export async function deleteManagedVenueImage(url: string | null | undefined) {
  const filename = url ? filenameFromManagedUrl(url) : null;
  if (!filename) return;
  const filePath = resolveVenueImagePath(filename);
  if (!filePath) return;
  await unlink(filePath).catch(() => undefined);
}

export async function readVenueImage(filename: string) {
  const filePath = resolveVenueImagePath(filename);
  if (!filePath) {
    console.info("[venue-media]", {
      filename,
      storageRoot: getVenueStorageRoot(),
      exists: false,
      size: 0,
      reason: "rejected_filename_or_path",
    });
    return null;
  }
  try {
    const file = await readFile(filePath);
    console.info("[venue-media]", {
      filename,
      storageRoot: getVenueStorageRoot(),
      absolutePath: filePath,
      exists: true,
      size: file.byteLength,
    });
    return file;
  } catch {
    console.info("[venue-media]", {
      filename,
      storageRoot: getVenueStorageRoot(),
      absolutePath: filePath,
      exists: false,
      size: 0,
    });
    return null;
  }
}
