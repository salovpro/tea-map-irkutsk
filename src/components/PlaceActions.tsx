"use client";

import { FavoriteButton } from "@/components/FavoriteButton";
import { useRouter } from "@/i18n/navigation";
import { CupSoda, Globe, Navigation2, Phone, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";

/** Fixed 48×48 icon actions — never grow/shrink with sibling count. */
export const placeActionIconClass =
  "flex h-12 w-12 flex-none items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:border-amber-900/30 hover:text-amber-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-950";

export const placeHeaderIconClass =
  "flex h-9 w-9 flex-none items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-950";

/** Fixed CTA width — book / tea-map primary actions. */
export const placeActionPrimaryClass =
  "flex h-12 w-auto min-w-40 max-w-full flex-none items-center justify-center gap-2 rounded-xl bg-amber-950 px-4 text-sm font-medium tracking-wide text-slate-50 transition-colors hover:bg-amber-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-950";

type PlaceActionsProps = {
  placeId: string;
  name: string;
  phone?: string | null;
  website?: string | null;
  coordinates: [number, number];
  showPrimary?: boolean;
  /** Detail page: book CTA first, no tea-map button. */
  variant?: "card" | "detail";
};

/** Keep card click from firing; do not block default link navigation. */
function stopCardNavigation(event: MouseEvent) {
  event.stopPropagation();
}

function buildRouteUrl(coordinates: [number, number]) {
  const [latitude, longitude] = coordinates;
  return `https://yandex.ru/maps/?rtext=~${latitude},${longitude}`;
}

function normalizeWebsiteHref(website: string) {
  const trimmed = website.trim();
  if (!trimmed) return null;
  return trimmed.startsWith("http://") || trimmed.startsWith("https://")
    ? trimmed
    : `https://${trimmed}`;
}

/** Split phone field into display numbers (comma / semicolon / slash). */
export function parsePhoneNumbers(phone: string): string[] {
  return phone
    .split(/[,;/]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function toTelHref(phone: string) {
  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : null;
}

function resolvePlaceShareUrl(placeId: string) {
  if (typeof window === "undefined") return `/places/${placeId}`;
  const { origin, pathname } = window.location;
  const localeMatch = pathname.match(/^\/(en|zh)(?=\/|$)/);
  const prefix = localeMatch ? `/${localeMatch[1]}` : "";
  return `${origin}${prefix}/places/${placeId}`;
}

type PlaceShareButtonProps = {
  placeId: string;
  name: string;
  className?: string;
};

export function PlaceShareButton({
  placeId,
  name,
  className = placeHeaderIconClass,
}: PlaceShareButtonProps) {
  const t = useTranslations("PlaceCard");
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (!toastVisible) return;
    const timer = window.setTimeout(() => setToastVisible(false), 2500);
    return () => window.clearTimeout(timer);
  }, [toastVisible]);

  const handleShare = useCallback(
    async (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const url = resolvePlaceShareUrl(placeId);

      if (typeof navigator.share === "function") {
        try {
          await navigator.share({
            title: name,
            text: name,
            url,
          });
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
        }
      }

      try {
        await navigator.clipboard.writeText(url);
      } catch {
        const input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setToastVisible(true);
    },
    [name, placeId],
  );

  return (
    <>
      <button
        type="button"
        onClick={handleShare}
        aria-label={t("share")}
        title={t("share")}
        className={className}
      >
        <Share2 className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} aria-hidden />
      </button>

      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-28 left-1/2 z-[70] -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm text-slate-50 shadow-lg transition-all duration-300 ${
          toastVisible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        {t("linkCopied")}
      </div>
    </>
  );
}

function PhoneActionButton({
  phones,
  appearance = "icon",
}: {
  phones: string[];
  appearance?: "icon" | "book";
}) {
  const t = useTranslations("PlaceCard");
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const triggerClass =
    appearance === "book" ? placeActionPrimaryClass : placeActionIconClass;
  const label = appearance === "book" ? t("bookTable") : t("call");

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (phones.length === 0) return null;

  const content =
    appearance === "book" ? (
      <>
        <Phone className="h-5 w-5 flex-none" strokeWidth={2} aria-hidden />
        <span className="truncate">{label}</span>
      </>
    ) : (
      <Phone className="h-5 w-5" strokeWidth={2} aria-hidden />
    );

  if (phones.length === 1) {
    const href = toTelHref(phones[0]);
    if (!href) return null;

    return (
      <a
        href={href}
        onClick={stopCardNavigation}
        aria-label={label}
        title={phones[0]}
        className={triggerClass}
      >
        {content}
      </a>
    );
  }

  return (
    <div ref={rootRef} className="relative flex-none">
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        title={label}
        className={triggerClass}
      >
        {content}
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          className="absolute bottom-full left-0 z-[80] mb-2 min-w-[12.5rem] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {phones.map((number) => {
            const href = toTelHref(number);
            if (!href) return null;

            return (
              <a
                key={number}
                href={href}
                role="menuitem"
                onClick={(event) => {
                  stopCardNavigation(event);
                  setOpen(false);
                }}
                className="block px-3.5 py-2.5 text-left text-sm font-medium tracking-wide text-slate-800 transition-colors hover:bg-slate-50"
              >
                {number}
              </a>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function PlaceActions({
  placeId,
  phone,
  website,
  coordinates,
  showPrimary = true,
  variant = "card",
}: PlaceActionsProps) {
  const t = useTranslations("PlaceCard");
  const router = useRouter();

  const phones = useMemo(
    () => (phone?.trim() ? parsePhoneNumbers(phone) : []),
    [phone],
  );
  const siteHref = website ? normalizeWebsiteHref(website) : null;
  const routeUrl = buildRouteUrl(coordinates);
  const isDetail = variant === "detail";

  function openTeaMap(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    router.push(`/places/${placeId}`);
  }

  return (
    <div
      className="flex flex-nowrap items-center justify-start gap-2 overflow-x-auto overscroll-x-contain pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onClick={stopCardNavigation}
    >
      {isDetail ? (
        <PhoneActionButton phones={phones} appearance="book" />
      ) : null}

      {!isDetail && showPrimary ? (
        <button type="button" onClick={openTeaMap} className={placeActionPrimaryClass}>
          <CupSoda className="h-5 w-5 flex-none" strokeWidth={2} aria-hidden />
          <span className="truncate">{t("teaMapCta")}</span>
        </button>
      ) : null}

      <a
        href={routeUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={stopCardNavigation}
        aria-label={t("buildRoute")}
        title={t("buildRoute")}
        className={placeActionIconClass}
      >
        <Navigation2 className="h-5 w-5" strokeWidth={2} aria-hidden />
      </a>

      {!isDetail ? <PhoneActionButton phones={phones} appearance="icon" /> : null}

      {siteHref ? (
        <a
          href={siteHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={stopCardNavigation}
          aria-label={t("openWebsite")}
          title={t("openWebsite")}
          className={placeActionIconClass}
        >
          <Globe className="h-5 w-5" strokeWidth={2} aria-hidden />
        </a>
      ) : null}
    </div>
  );
}

/** Compact header toolbar: favorite + share (+ optional close via parent). */
export function PlaceCardHeaderActions({
  placeId,
  name,
}: {
  placeId: string;
  name: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <FavoriteButton
        placeId={placeId}
        stopPropagation
        className={placeHeaderIconClass}
      />
      <PlaceShareButton placeId={placeId} name={name} />
    </div>
  );
}
