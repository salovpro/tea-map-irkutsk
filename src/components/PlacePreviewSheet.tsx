"use client";

import { PlaceCard } from "@/components/PlaceCard";
import type { PlaceSheetSeed } from "@/lib/places";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type Props = {
  place: PlaceSheetSeed | null;
  onClose: () => void;
};

export function PlacePreviewSheet({ place, onClose }: Props) {
  const tMap = useTranslations("Map");
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      document.documentElement.style.setProperty("--place-sheet-height", "0px");
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (!place) {
      root.style.setProperty("--place-sheet-height", "0px");
      return;
    }

    const node = sheetRef.current;
    if (!node) return;

    function applyHeight() {
      const height = sheetRef.current?.offsetHeight ?? 0;
      root.style.setProperty("--place-sheet-height", `${height}px`);
    }

    applyHeight();
    const observer = new ResizeObserver(applyHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, [place]);

  useEffect(() => {
    if (!place) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [place, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {place ? (
        <motion.div
          key={place.id}
          role="dialog"
          aria-modal="true"
          aria-labelledby="place-preview-sheet-title"
          initial={{ y: "100%", opacity: 0.85 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 38 }}
          className="pointer-events-none fixed inset-x-0 z-40 w-full"
          style={{
            bottom:
              "calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px))",
          }}
        >
          {/*
            Same white plane as the nav: under the nav (z-40 < z-50), no bottom
            radius/shadow so the card and menu read as one continuous slab.
            Upward-only shadow casts onto the map, not onto the menu.
          */}
          <div
            ref={sheetRef}
            className="pointer-events-auto rounded-t-2xl rounded-b-none bg-[#ffffff] px-4 pt-4 pb-6 shadow-[0_-12px_32px_rgba(15,23,42,0.14)] sm:px-5 sm:pt-5 sm:pb-8"
          >
            <PlaceCard
              id={place.id}
              name={place.name}
              address={place.address}
              phone={place.phone}
              website={place.website}
              coordinates={place.coordinates}
              embedded
              teaItemsCount={place.teaItemsCount}
              averageCheck={place.averageCheck}
              titleId="place-preview-sheet-title"
              onClose={onClose}
              closeLabel={tMap("close")}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
