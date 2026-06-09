import { SUPABASE_BUCKET } from "@/lib/supabase";

export function getSupabaseStoragePath(src?: string | null) {
  if (!src || src.startsWith("/api/media")) return null;
  if (!src.startsWith("http")) return null;

  try {
    const url = new URL(src);
    const marker = `/storage/v1/object/public/${SUPABASE_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) return null;
    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

export function getDisplayMediaUrl(src?: string | null) {
  const path = getSupabaseStoragePath(src);
  return path ? `/api/media?path=${encodeURIComponent(path)}` : src || "/logo.png";
}
