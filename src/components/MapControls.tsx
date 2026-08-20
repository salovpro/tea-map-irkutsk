"use client";

import L from "leaflet";
import { useLocale, useTranslations } from "next-intl";
import { Globe, LocateFixed, Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMap, useMapEvents } from "react-leaflet";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LOCALE_LABELS: Record<string, string> = {
  ru: "RU",
  en: "EN",
  zh: "ZH",
};

const controlButtonClass =
  "pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-amber-950 shadow-lg backdrop-blur-md ring-1 ring-slate-200/70 transition-transform hover:bg-white active:scale-95 disabled:pointer-events-none disabled:opacity-40 disabled:active:scale-100";

type MapControlsProps = {
  locating: boolean;
  locationErrorText: string | null;
  onLocate: () => void;
};

export function MapControls({
  locating,
  locationErrorText,
  onLocate,
}: MapControlsProps) {
  const map = useMap();
  const t = useTranslations("Map");
  const tLang = useTranslations("LanguageSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [langOpen, setLangOpen] = useState(false);
  const [zoom, setZoom] = useState(() => map.getZoom());
  const langMenuRef = useRef<HTMLDivElement>(null);
  const bottomControlsRef = useRef<HTMLDivElement>(null);

  const minZoom = map.getMinZoom();
  const maxZoom = map.getMaxZoom();
  const atMinZoom = zoom <= minZoom;
  const atMaxZoom = zoom >= maxZoom;

  useMapEvents({
    zoom: () => setZoom(map.getZoom()),
    zoomend: () => setZoom(map.getZoom()),
  });

  useEffect(() => {
    const nodes = [langMenuRef.current, bottomControlsRef.current];
    for (const node of nodes) {
      if (!node) continue;
      L.DomEvent.disableClickPropagation(node);
      L.DomEvent.disableScrollPropagation(node);
    }
  }, []);

  useEffect(() => {
    if (!langOpen) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (
        langMenuRef.current &&
        target &&
        !langMenuRef.current.contains(target)
      ) {
        setLangOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [langOpen]);

  function selectLocale(nextLocale: string) {
    setLangOpen(false);
    if (nextLocale === locale) return;
    router.replace(pathname, { locale: nextLocale });
  }

  function zoomIn() {
    const nextZoom = Math.min(map.getZoom() + 1, map.getMaxZoom());
    if (nextZoom <= map.getZoom()) return;
    map.setZoom(nextZoom);
  }

  function zoomOut() {
    const nextZoom = Math.max(map.getZoom() - 1, map.getMinZoom());
    if (nextZoom >= map.getZoom()) return;
    map.setZoom(nextZoom);
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <div className="tea-map-top-controls pointer-events-none">
        <div ref={langMenuRef} className="relative pointer-events-auto">
          <button
            type="button"
            onClick={() => setLangOpen((open) => !open)}
            aria-label={tLang("ariaLabel")}
            aria-expanded={langOpen}
            aria-haspopup="listbox"
            className={controlButtonClass}
          >
            <Globe className="h-5 w-5" strokeWidth={2.1} aria-hidden />
          </button>

          {langOpen ? (
            <div
              role="listbox"
              aria-label={tLang("ariaLabel")}
              className="absolute top-14 right-0 flex min-w-[4.5rem] flex-col overflow-hidden rounded-2xl bg-white/95 py-1 shadow-lg ring-1 ring-slate-200/80 backdrop-blur-md"
            >
              {routing.locales.map((code) => {
                const active = code === locale;
                return (
                  <button
                    key={code}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => selectLocale(code)}
                    className={`px-4 py-2.5 text-left text-sm font-semibold tracking-wide transition-colors ${
                      active
                        ? "bg-amber-950 text-white"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {LOCALE_LABELS[code] ?? code.toUpperCase()}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      <div
        ref={bottomControlsRef}
        className="tea-map-bottom-controls pointer-events-none flex flex-col items-end gap-3"
      >
        {locationErrorText ? (
          <p className="max-w-[14rem] rounded-2xl bg-white/95 px-3 py-2 text-right text-[11px] leading-snug text-slate-600 shadow-sm ring-1 ring-slate-200/90">
            {locationErrorText}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onLocate}
          disabled={locating}
          aria-label={t("locateMe")}
          title={t("locateMe")}
          className={controlButtonClass}
        >
          <LocateFixed
            className={`h-5 w-5 ${locating ? "animate-pulse" : ""}`}
            strokeWidth={2.1}
            aria-hidden
          />
          <span className="sr-only">
            {locating ? t("locating") : t("locateMe")}
          </span>
        </button>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={zoomIn}
            disabled={atMaxZoom}
            aria-label="Zoom in"
            aria-disabled={atMaxZoom}
            className={controlButtonClass}
          >
            <Plus className="h-5 w-5" strokeWidth={2.2} aria-hidden />
          </button>
          <button
            type="button"
            onClick={zoomOut}
            disabled={atMinZoom}
            aria-label="Zoom out"
            aria-disabled={atMinZoom}
            className={controlButtonClass}
          >
            <Minus className="h-5 w-5" strokeWidth={2.2} aria-hidden />
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
