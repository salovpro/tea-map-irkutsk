export const GEO_PERMISSION_STORAGE_KEY = "tea_geo_permission";

export type StoredGeoPermission = "granted" | "denied";

export function readStoredGeoPermission(): StoredGeoPermission | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(GEO_PERMISSION_STORAGE_KEY);
    if (value === "granted" || value === "denied") return value;
  } catch {
    // private mode / blocked storage
  }
  return null;
}

export function storeGeoPermission(value: StoredGeoPermission) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GEO_PERMISSION_STORAGE_KEY, value);
  } catch {
    // private mode / blocked storage
  }
}

export async function queryDeviceGeoPermission(): Promise<
  "granted" | "denied" | "prompt"
> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return "denied";
  }

  try {
    const status = await navigator.permissions.query({ name: "geolocation" });
    if (status.state === "granted" || status.state === "denied") {
      storeGeoPermission(status.state);
      return status.state;
    }
    return "prompt";
  } catch {
    return readStoredGeoPermission() ?? "prompt";
  }
}
