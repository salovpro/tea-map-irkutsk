import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const BUCKET = "venue_images";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export type UploadVenueImageResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

function extensionFor(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

async function uploadToSupabase(
  bytes: Buffer,
  contentType: string,
  fileName: string,
): Promise<UploadVenueImageResult | null> {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) return null;

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const objectPath = `${fileName}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, bytes, {
        contentType,
        upsert: true,
      });

    if (error) {
      return { ok: false, error: error.message || "Не удалось загрузить в Storage" };
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
    return { ok: true, url: data.publicUrl };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ошибка Supabase Storage";
    return { ok: false, error: message };
  }
}

async function uploadLocally(
  bytes: Buffer,
  fileName: string,
): Promise<UploadVenueImageResult> {
  const dir = path.join(process.cwd(), "public", "uploads", "venues");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), bytes);
  return { ok: true, url: `/uploads/venues/${fileName}` };
}

/** Upload venue logo/photo to Supabase Storage (or local public/ fallback). */
export async function uploadVenueImage(
  file: File | null | undefined,
): Promise<UploadVenueImageResult | { ok: true; url: null }> {
  if (!file || file.size === 0) {
    return { ok: true, url: null };
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return {
      ok: false,
      error: "Допустимы только изображения JPEG, PNG, WebP или GIF",
    };
  }

  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Размер файла не должен превышать 5 МБ" };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}.${extensionFor(file.type)}`;

  const remote = await uploadToSupabase(bytes, file.type, fileName);
  if (remote) return remote;

  return uploadLocally(bytes, fileName);
}
