import L from "leaflet";
import { logoNeedsDarkBackdrop } from "@/lib/place-logo-data";

const NAV_BROWN = "#78350f";
const NAV_BROWN_DARK = "#451a03";
const LOGO_DARK_PLATE = "#1c1917";
const LOGO_LIGHT_PLATE = "#ffffff";

const TEA_CUP_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d="M13.5 17.2h10.2c.55 0 1 .45 1 1v5.1c0 2.85-2.35 5.15-5.2 5.15h-1.8c-2.85 0-5.2-2.3-5.2-5.15v-5.1c0-.55.45-1 1-1Z" fill="#ffffff"/>
    <path d="M24.7 19.2h1.55c1.25 0 2.25 1 2.25 2.25v.85c0 1.25-1 2.25-2.25 2.25H24.7" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" fill="none"/>
    <path d="M13.2 17.2h10.8" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.85"/>
    <path d="M16.2 12.2c0-1.1-.4-1.95-.95-2.5M19.5 11.8c0-1.4-.55-2.5-1.35-3.15M22.8 12.2c0-1.1.35-2 .9-2.55" stroke="#ffffff" stroke-width="1.35" stroke-linecap="round"/>
  </svg>
`;

const HEART_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d="M20 28.2c-.35 0-.7-.12-.97-.36C14.7 23.9 12 21.45 12 18.35 12 16.1 13.75 14.4 16 14.4c1.2 0 2.3.55 3 1.42.7-.87 1.8-1.42 3-1.42 2.25 0 4 1.7 4 3.95 0 3.1-2.7 5.55-7.03 9.49-.27.24-.62.36-.97.36Z" fill="#ffffff"/>
  </svg>
`;

const pinIconCache = new Map<string, L.DivIcon>();
const failedLogoUrls = new Set<string>();

export type PinIconOptions = {
  label: string;
  logoUrl?: string | null;
  favorite: boolean;
  selected: boolean;
  showLabel: boolean;
};

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Allow only http(s) and same-origin root-relative image URLs for marker HTML. */
export function sanitizeMarkerImageUrl(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    if (/[\s<>"'`]/.test(trimmed)) return null;
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

function rememberFailedLogoUrl(url: string) {
  failedLogoUrls.add(url);
}

function resolveLogoUrl(value: string | null | undefined): string | null {
  const safe = sanitizeMarkerImageUrl(value);
  if (!safe || failedLogoUrls.has(safe)) return null;
  return safe;
}

function fallbackDotColor(favorite: boolean, selected: boolean) {
  if (favorite) return selected ? "#b91c1c" : "#ef4444";
  return selected ? NAV_BROWN_DARK : NAV_BROWN;
}

function pinIconCacheKey(options: PinIconOptions, logoUrl: string | null) {
  return [
    logoUrl ?? "",
    options.favorite ? "f" : "t",
    options.selected ? "s" : "n",
    options.showLabel ? "l" : "b",
    options.label,
  ].join("\u001f");
}

function fallbackCircleHtml(favorite: boolean, selected: boolean) {
  const iconSvg = favorite ? HEART_SVG : TEA_CUP_SVG;
  const dotColor = fallbackDotColor(favorite, selected);
  return `<div style="width:40px;height:40px;border-radius:999px;background:${dotColor};display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 10px rgba(15,23,42,0.18);border:2px solid rgba(255,255,255,0.92);pointer-events:none;">${iconSvg}</div>`;
}

function logoCircleHtml(safeUrl: string, selected: boolean) {
  const borderWidth = selected ? 3 : 2;
  const shadow = selected
    ? "0 0 0 1px rgba(15,23,42,0.28), 0 6px 18px rgba(15,23,42,0.32)"
    : "0 0 0 1px rgba(15,23,42,0.16), 0 2px 10px rgba(15,23,42,0.2)";
  const plate = logoNeedsDarkBackdrop(safeUrl)
    ? LOGO_DARK_PLATE
    : LOGO_LIGHT_PLATE;

  return `<div style="width:44px;height:44px;border-radius:999px;background:${plate};overflow:hidden;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:${shadow};border:${borderWidth}px solid #ffffff;pointer-events:none;"><img class="tea-map-pin-logo-img" src="${safeUrl}" alt="" draggable="false" decoding="async" style="width:100%;height:100%;object-fit:cover;display:block;" /></div>`;
}

function createPinIcon(options: PinIconOptions) {
  const { label, favorite, selected, showLabel } = options;
  const logoUrl = resolveLogoUrl(options.logoUrl);
  const scale = selected ? 1.12 : 1;
  const withLabel = showLabel || selected;
  const safeLabel = escapeHtml(label);
  const pinSize = logoUrl ? 44 : 40;
  const origin = pinSize / 2;
  const pinHtml = logoUrl
    ? logoCircleHtml(escapeHtml(logoUrl), selected)
    : fallbackCircleHtml(favorite, selected);

  const html = withLabel
    ? `
      <div style="display:flex;align-items:center;gap:8px;transform:translate(-${origin}px,-${origin}px) scale(${scale});transform-origin:${origin}px ${origin}px;cursor:pointer;pointer-events:auto;position:relative;z-index:10;">
        ${pinHtml}
        <div style="max-width:180px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,0.96);color:#0f172a;font-size:12px;font-weight:600;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 2px 10px rgba(15,23,42,0.12);border:1px solid rgba(226,232,240,0.95);pointer-events:none;">${safeLabel}</div>
      </div>
    `
    : `
      <div style="width:${pinSize}px;height:${pinSize}px;transform:translate(-${origin}px,-${origin}px) scale(${scale});transform-origin:${origin}px ${origin}px;cursor:pointer;pointer-events:auto;position:relative;z-index:10;">
        ${pinHtml}
      </div>
    `;

  return L.divIcon({
    className: "tea-map-pin-icon",
    html,
    iconSize: withLabel ? [220, pinSize + 4] : [pinSize, pinSize],
    iconAnchor: [origin, origin],
  });
}

export function getPinIcon(options: PinIconOptions) {
  const logoUrl = resolveLogoUrl(options.logoUrl);
  const key = pinIconCacheKey(options, logoUrl);
  const cached = pinIconCache.get(key);
  if (cached) return cached;
  const icon = createPinIcon(options);
  pinIconCache.set(key, icon);
  return icon;
}

export function bindLogoImageFallback(
  marker: L.Marker,
  options: PinIconOptions,
) {
  const logoUrl = resolveLogoUrl(options.logoUrl);
  if (!logoUrl) return;

  const img = marker
    .getElement()
    ?.querySelector<HTMLImageElement>("img.tea-map-pin-logo-img");
  if (!img) return;

  const applyFallback = () => {
    rememberFailedLogoUrl(logoUrl);
    marker.setIcon(getPinIcon({ ...options, logoUrl: null }));
  };

  if (img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0)) {
    applyFallback();
    return;
  }

  img.addEventListener("error", applyFallback, { once: true });
}

export function createUserLocationIcon() {
  return L.divIcon({
    className: "tea-map-user-icon",
    html: `
      <div style="width:48px;height:48px;transform:translate(-24px,-24px);pointer-events:none;">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="18" fill="#2563eb" fill-opacity="0.18"/>
          <circle cx="24" cy="24" r="9" fill="#ffffff"/>
          <circle cx="24" cy="24" r="6.5" fill="#2563eb"/>
        </svg>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}
