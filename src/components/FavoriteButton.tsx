"use client";

import { useFavorites } from "@/hooks/useFavorites";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import type { MouseEvent } from "react";

type FavoriteButtonProps = {
  placeId: string;
  className?: string;
  /** Stop parent card / row navigation when clicked. */
  stopPropagation?: boolean;
};

export function FavoriteButton({
  placeId,
  className = "",
  stopPropagation = false,
}: FavoriteButtonProps) {
  const t = useTranslations("Favorites");
  const { isFavorite, toggleFavorite, ready } = useFavorites();
  const active = ready && isFavorite(placeId);

  function onClick(event: MouseEvent<HTMLButtonElement>) {
    if (stopPropagation) {
      event.preventDefault();
      event.stopPropagation();
    }
    toggleFavorite(placeId);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? t("remove") : t("add")}
      title={active ? t("remove") : t("add")}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-slate-100 ${className}`}
    >
      <Heart
        className={`h-5 w-5 ${
          active ? "fill-red-500 text-red-500" : "text-slate-400"
        }`}
        strokeWidth={active ? 0 : 1.9}
        aria-hidden
      />
    </button>
  );
}
