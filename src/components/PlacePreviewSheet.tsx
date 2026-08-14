"use client";

import { fetchPlaceSheetDetail } from "@/app/actions/places";
import { PlaceCard } from "@/components/PlaceCard";
import { ReviewForm } from "@/components/ReviewForm";
import type { PlaceSheetDetail, PlaceSheetSeed } from "@/lib/places";
import {
  AnimatePresence,
  motion,
  useDragControls,
  type PanInfo,
} from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  place: PlaceSheetSeed | null;
  onClose: () => void;
};

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function averageFromReviews(reviews: { rating: number }[]): number | null {
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

const COLLAPSED_HEIGHT = "42vh";
const EXPANDED_HEIGHT = "90vh";
const EXPAND_OFFSET = -48;
const COLLAPSE_OFFSET = 56;
const CLOSE_OFFSET = 110;
const CLOSE_VELOCITY = 700;

export function PlacePreviewSheet({ place, onClose }: Props) {
  const tMap = useTranslations("Map");
  const tDetail = useTranslations("PlaceDetail");
  const locale = useLocale();
  const dragControls = useDragControls();

  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<PlaceSheetDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const view = detail ?? place;
  const ratingAvg = useMemo(() => {
    if (!view) return null;
    if (detail?.reviews && detail.reviews.length > 0) {
      return averageFromReviews(detail.reviews);
    }
    return view.ratingAvg ?? null;
  }, [detail?.reviews, view]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setExpanded(false);
    setDetail(null);

    if (!place) return;

    let cancelled = false;
    setLoading(true);

    void fetchPlaceSheetDetail(place.id, locale).then((result) => {
      if (cancelled) return;
      setDetail(result);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [place, locale]);

  function reloadDetail() {
    if (!place) return;
    void fetchPlaceSheetDetail(place.id, locale).then((result) => {
      setDetail(result);
    });
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    const { offset, velocity } = info;

    if (offset.y > CLOSE_OFFSET || velocity.y > CLOSE_VELOCITY) {
      onClose();
      return;
    }

    if (expanded && offset.y > COLLAPSE_OFFSET) {
      setExpanded(false);
      return;
    }

    if (!expanded && (offset.y < EXPAND_OFFSET || velocity.y < -400)) {
      setExpanded(true);
    }
  }

  if (!mounted) return null;

  const menu = detail?.teaMenu ?? [];
  const reviews = detail?.reviews ?? [];

  return createPortal(
    <AnimatePresence>
      {place && view ? (
        <>
          {expanded ? (
            <motion.button
              key={`backdrop-${place.id}`}
              type="button"
              aria-label={tMap("close")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] bg-black/35 backdrop-blur-[2px]"
              onClick={onClose}
            />
          ) : null}

          <motion.div
            key={place.id}
            role="dialog"
            aria-modal="true"
            aria-labelledby="place-preview-sheet-title"
            drag="y"
            dragControls={dragControls}
            dragListener={!expanded}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.12, bottom: 0.45 }}
            onDragEnd={onDragEnd}
            initial={{ y: "100%" }}
            animate={{
              y: 0,
              height: expanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
            }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className={`fixed inset-x-0 z-[60] mx-auto flex w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-white/70 bg-white shadow-[0_-8px_40px_rgba(15,23,42,0.18)] ${
              expanded
                ? "bottom-0"
                : "bottom-16 sm:bottom-24"
            }`}
          >
            <div
              className="flex shrink-0 cursor-grab touch-none flex-col items-center px-4 pt-3 pb-2 active:cursor-grabbing"
              onPointerDown={(event) => dragControls.start(event)}
            >
              <div className="h-1.5 w-10 rounded-full bg-slate-300" />
            </div>

            <div
              className={`flex min-h-0 flex-1 flex-col gap-4 px-4 pb-5 sm:px-5 ${
                expanded ? "overflow-y-auto overscroll-contain" : "overflow-hidden"
              }`}
            >
              <PlaceCard
                id={view.id}
                name={view.name}
                phone={view.phone}
                website={view.website}
                coordinates={view.coordinates}
                ratingAvg={ratingAvg}
                embedded
                titleId="place-preview-sheet-title"
                onOpen={() => setExpanded(true)}
              />

              {!expanded ? (
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="shrink-0 py-1 text-center text-xs font-medium tracking-wide text-slate-400 transition-colors hover:text-slate-700"
                >
                  {tMap("swipeUpHint")}
                </button>
              ) : (
                <div className="flex flex-col gap-8 pb-8 pt-2">
                  {loading && !detail ? (
                    <p className="text-sm text-slate-400">{tMap("loadingDetails")}</p>
                  ) : null}

                  <section className="flex flex-col gap-3">
                    <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                      {view.description || tMap("noDescription")}
                    </p>
                  </section>

                  <section className="flex flex-col gap-4">
                    <h3 className="font-serif text-lg font-semibold tracking-tight text-slate-900">
                      {tDetail("teaMenuTitle")}
                    </h3>
                    {menu.length > 0 ? (
                      <ul className="flex flex-col gap-3">
                        {menu.map((item, index) => (
                          <li
                            key={`${item.title}-${index}`}
                            className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3.5"
                          >
                            <div className="min-w-0 flex flex-col gap-1">
                              {item.category ? (
                                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                                  {item.category}
                                </span>
                              ) : null}
                              <span className="text-sm font-medium text-slate-900">
                                {item.title}
                              </span>
                              {item.volume ? (
                                <span className="text-xs text-slate-400">
                                  {item.volume}
                                </span>
                              ) : null}
                            </div>
                            {item.price != null ? (
                              <span className="shrink-0 text-sm font-medium text-slate-900">
                                {item.price} ₽
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">
                        {tDetail("teaMenuEmpty")}
                      </p>
                    )}
                  </section>

                  <section className="flex flex-col gap-5">
                    <h3 className="font-serif text-lg font-semibold tracking-tight text-slate-900">
                      {tDetail("reviewsTitle")}
                    </h3>
                    {reviews.length > 0 ? (
                      <ul className="flex flex-col gap-3">
                        {reviews.map((review) => (
                          <li
                            key={review.id}
                            className="flex flex-col gap-2 rounded-2xl bg-slate-50 px-4 py-3.5"
                          >
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                              <p className="text-sm font-medium text-slate-900">
                                {review.authorName}
                              </p>
                              <p className="text-xs text-amber-900">
                                {"★".repeat(review.rating)}
                                <span className="text-slate-200">
                                  {"★".repeat(5 - review.rating)}
                                </span>
                              </p>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-600">
                              {review.text}
                            </p>
                            <p className="text-xs text-slate-400">
                              {formatDate(review.createdAt, locale)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">
                        {tDetail("reviewsEmpty")}
                      </p>
                    )}

                    <ReviewForm
                      placeId={place.id}
                      onSuccess={reloadDetail}
                    />
                  </section>
                </div>
              )}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
