"use client";

import L from "leaflet";
import { useLocale, useTranslations } from "next-intl";
import { Globe, LocateFixed, Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LOCALE_LABELS: Record<string, string> = {
  ru: "RU",
  en: "EN",
  zh: "ZH",
};

const controlButtonClass =
  "pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-amber-950 shadow-lg backdrop-blur-md ring-1 ring-slate-200/70 transition-transform hover:bg-white active:scale-95 disabled:opacity-60";

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
  const langMenuRef = useRef<HTMLDivElement>(null);
  const bottomControlsRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      <div className="pointer-events-none absolute top-6 right-4 z-[1000]">
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
        className="pointer-events-none absolute right-4 z-[1000] flex flex-col items-end gap-3"
        style={{
          bottom:
            "calc(var(--app-nav-height) + env(safe-area-inset-bottom, 0px) + 1rem)",
        }}
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
            onClick={() => map.zoomIn()}
            aria-label="Zoom in"
            className={controlButtonClass}
          >
            <Plus className="h-5 w-5" strokeWidth={2.2} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => map.zoomOut()}
            aria-label="Zoom out"
            className={controlButtonClass}
          >
            <Minus className="h-5 w-5" strokeWidth={2.2} aria-hidden />
          </button>
        </div>
      </div>
    </>
  );
}
